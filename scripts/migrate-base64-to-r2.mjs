import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to load .env.local
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const envFile of envFiles) {
    const fullPath = path.join(rootDir, envFile);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const isExecute = process.argv.includes('--execute');
const isRollback = process.argv.includes('--rollback');
const backupFileArg = process.argv.find(a => a.startsWith('--backup-file='))?.split('=')[1];

const TABLES_CONFIG = [
  { table: 'lankagama_villas', folder: 'villa-images', galleryFolder: 'gallery' },
  { table: 'lankagama_camping', folder: 'camping' },
  { table: 'lankagama_guides', folder: 'guides' },
  { table: 'lankagama_kithul', folder: 'kithul' },
  { table: 'lankagama_slides', folder: 'general' },
  { table: 'lankagama_attractions', folder: 'attractions' },
  { table: 'lankagama_blogs', folder: 'blogs' }
];

function getConnectionString() {
  return process.env.POSTGRES_URL || 
         process.env.DATABASE_URL || 
         process.env.STORAGE_POSTGRES_URL || 
         process.env.STORAGE_DATABASE_URL || 
         process.env.SUPABASE_DATABASE_URL || 
         null;
}

function getR2Client() {
  if (!process.env.R2_ENDPOINT || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    throw new Error('Cloudflare R2 credentials missing in environment.');
  }
  return new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });
}

function findBase64Entries(obj, currentPath = '') {
  const entries = [];
  if (!obj) return entries;

  if (typeof obj === 'string') {
    if (obj.startsWith('data:image/')) {
      entries.push({
        path: currentPath,
        value: obj,
        length: obj.length,
        approxBytes: Math.round(obj.length * 0.75)
      });
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      entries.push(...findBase64Entries(item, `${currentPath}[${index}]`));
    });
  } else if (typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      entries.push(...findBase64Entries(value, currentPath ? `${currentPath}.${key}` : key));
    }
  }
  return entries;
}

function setNestedValue(obj, pathStr, value) {
  const tokens = pathStr.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '').split('.');
  let current = obj;
  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i];
    if (!(token in current)) current[token] = {};
    current = current[token];
  }
  current[tokens[tokens.length - 1]] = value;
}

async function uploadBase64ToR2(s3, base64Data, folder) {
  let mimeType = 'image/jpeg';
  let pureBase64 = base64Data;

  const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    mimeType = match[1];
    pureBase64 = match[2];
  }

  const extMap = {
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'image/avif': '.avif',
    'image/jpeg': '.jpg'
  };
  const ext = extMap[mimeType.toLowerCase()] || '.jpg';
  const buffer = Buffer.from(pureBase64, 'base64');
  const key = `${folder}/migrated-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
  const bucket = process.env.R2_BUCKET_NAME || 'lankagama-media';

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    CacheControl: 'public, max-age=31536000, immutable'
  }));

  const publicBase = (process.env.R2_PUBLIC_URL || 'https://media.lankagama.com').replace(/\/+$/, '');
  return `${publicBase}/${key}`;
}

async function run() {
  console.log('\x1b[36m============================================================\x1b[0m');
  console.log('\x1b[36m   LankaGama Villa Base64 -> Cloudflare R2 Migration Tool   \x1b[0m');
  console.log('\x1b[36m============================================================\x1b[0m');
  console.log(`Execution Mode: \x1b[1m${isExecute ? '\x1b[31mEXECUTE (LIVE DATABASE & R2 WRITES)' : '\x1b[33mAUDIT / DRY-RUN (READ-ONLY)'}\x1b[0m\n`);

  const connString = getConnectionString();
  if (!connString) {
    console.error('Error: No PostgreSQL/Supabase connection string found in environment.');
    process.exit(1);
  }

  const pool = new pg.Pool({
    connectionString: connString,
    ssl: connString.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  console.log('✓ Successfully connected to PostgreSQL / Supabase.');

  try {
    if (isRollback) {
      if (!backupFileArg) {
        console.error('Error: Please provide --backup-file=path/to/backup.json for rollback.');
        process.exit(1);
      }
      console.log(`Starting rollback from ${backupFileArg}...`);
      const backupData = JSON.parse(fs.readFileSync(backupFileArg, 'utf8'));
      for (const [table, rows] of Object.entries(backupData)) {
        console.log(`Restoring ${rows.length} rows to ${table}...`);
        for (const row of rows) {
          await client.query(
            `UPDATE ${table} SET data = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [row.id, JSON.stringify(row.data)]
          );
        }
      }
      console.log('✓ Rollback completed successfully.');
      return;
    }

    let s3 = null;
    if (isExecute) {
      s3 = getR2Client();
      console.log('✓ Cloudflare R2 S3 Client initialized.');
    }

    const report = {
      timestamp: new Date().toISOString(),
      totalRecordsAudited: 0,
      totalBase64ImagesFound: 0,
      totalApproxBytes: 0,
      tables: []
    };

    const fullBackup = {};

    for (const config of TABLES_CONFIG) {
      const { table, folder } = config;
      console.log(`\nAuditing table: \x1b[32m${table}\x1b[0m...`);

      let rows = [];
      try {
        const res = await client.query(`SELECT id, data FROM ${table}`);
        rows = res.rows;
      } catch (tableErr) {
        console.log(`  Table ${table} query failed: ${tableErr.message}`);
        continue;
      }

      report.totalRecordsAudited += rows.length;
      fullBackup[table] = rows.map(r => ({ id: r.id, data: r.data }));

      let tableBase64Count = 0;
      let tableBytes = 0;
      const modifiedRecords = [];

      for (const row of rows) {
        const base64List = findBase64Entries(row.data);
        if (base64List.length > 0) {
          tableBase64Count += base64List.length;
          const rowBytes = base64List.reduce((acc, e) => acc + e.approxBytes, 0);
          tableBytes += rowBytes;

          console.log(`  Found record [${row.id}]: ${base64List.length} Base64 image(s) (~${(rowBytes / 1024).toFixed(1)} KB)`);

          if (isExecute) {
            const updatedData = JSON.parse(JSON.stringify(row.data));
            for (const entry of base64List) {
              const targetFolder = entry.path.includes('images') && config.galleryFolder ? config.galleryFolder : folder;
              console.log(`    Uploading ${entry.path} to R2 (${targetFolder})...`);
              const r2Url = await uploadBase64ToR2(s3, entry.value, targetFolder);
              console.log(`    -> Uploaded to ${r2Url}`);
              setNestedValue(updatedData, entry.path, r2Url);
            }

            await client.query(
              `UPDATE ${table} SET data = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
              [row.id, JSON.stringify(updatedData)]
            );
            console.log(`    ✓ Updated record ${row.id} in ${table}`);
          }

          modifiedRecords.push({
            id: row.id,
            fields: base64List.map(e => e.path),
            totalBytes: rowBytes
          });
        }
      }

      report.totalBase64ImagesFound += tableBase64Count;
      report.totalApproxBytes += tableBytes;
      report.tables.push({
        table,
        recordsCount: rows.length,
        base64ImagesCount: tableBase64Count,
        approxBytes: tableBytes,
        approxKB: Math.round(tableBytes / 1024),
        modifiedRecords
      });
    }

    // Save backup if Base64 images were found
    if (report.totalBase64ImagesFound > 0) {
      const backupDir = path.join(rootDir, 'data', 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      const backupPath = path.join(backupDir, `db-backup-${Date.now()}.json`);
      fs.writeFileSync(backupPath, JSON.stringify(fullBackup, null, 2));
      console.log(`\n✓ Backup saved to: ${backupPath}`);
      report.backupPath = backupPath;
    }

    console.log('\n============================================================');
    console.log('                    MIGRATION AUDIT SUMMARY                 ');
    console.log('============================================================');
    console.log(`Total Records Audited:      ${report.totalRecordsAudited}`);
    console.log(`Total Base64 Images Found:  ${report.totalBase64ImagesFound}`);
    console.log(`Total Storage Requirement:  ${(report.totalApproxBytes / (1024 * 1024)).toFixed(2)} MB (${Math.round(report.totalApproxBytes / 1024)} KB)`);
    console.log('Tables Status:');
    for (const t of report.tables) {
      console.log(`  - ${t.table}: ${t.recordsCount} rows, ${t.base64ImagesCount} base64 image(s)`);
    }

    // Write audit report to file
    const reportPath = path.join(rootDir, 'migration-audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\nAudit report written to: ${reportPath}`);

  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => {
  console.error('\nMigration Error:', err.message);
  process.exit(1);
});
