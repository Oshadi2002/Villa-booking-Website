import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

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
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const connString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!connString) {
  console.error('No database connection string found in .env.local');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: connString,
  ssl: connString.includes('localhost') ? false : { rejectUnauthorized: false }
});

const TABLES = [
  'lankagama_villas',
  'lankagama_camping',
  'lankagama_guides',
  'lankagama_kithul',
  'lankagama_slides',
  'lankagama_attractions',
  'lankagama_bookings',
  'lankagama_comments',
  'lankagama_inquiries',
  'lankagama_blogs',
  'lankagama_settings',
  'lankagama_users'
];

function findBase64Strings(obj, pathPrefix = '') {
  const results = [];
  if (!obj) return results;

  if (typeof obj === 'string') {
    if (obj.startsWith('data:image/') || (obj.length > 500 && /^[A-Za-z0-9+/=]+$/.test(obj.slice(0, 100)))) {
      results.push({
        path: pathPrefix,
        length: obj.length,
        approxBytes: Math.round(obj.length * 0.75),
        mime: obj.startsWith('data:image/') ? obj.slice(5, obj.indexOf(';')) : 'unknown',
        preview: obj.slice(0, 50) + '...'
      });
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, idx) => {
      results.push(...findBase64Strings(item, `${pathPrefix}[${idx}]`));
    });
  } else if (typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      results.push(...findBase64Strings(value, pathPrefix ? `${pathPrefix}.${key}` : key));
    }
  }
  return results;
}

async function audit() {
  const client = await pool.connect();
  console.log('Connected to Database successfully.');
  
  const auditReport = [];
  let totalBase64Count = 0;
  let totalApproxBytes = 0;

  for (const table of TABLES) {
    try {
      const res = await client.query(`SELECT id, data FROM ${table}`);
      const rowCount = res.rows.length;
      const imagesInTable = [];

      for (const row of res.rows) {
        const rowData = row.data;
        const found = findBase64Strings(rowData);
        if (found.length > 0) {
          imagesInTable.push({
            id: row.id,
            matches: found
          });
          totalBase64Count += found.length;
          found.forEach(f => totalApproxBytes += f.approxBytes);
        }
      }

      auditReport.push({
        table,
        rowCount,
        base64ImagesFound: imagesInTable.reduce((acc, r) => acc + r.matches.length, 0),
        recordsWithBase64: imagesInTable
      });
    } catch (err) {
      auditReport.push({
        table,
        error: err.message
      });
    }
  }

  client.release();
  await pool.end();

  console.log('=== AUDIT RESULTS ===');
  console.log(JSON.stringify({
    totalBase64Count,
    totalApproxBytes,
    totalApproxKB: Math.round(totalApproxBytes / 1024),
    totalApproxMB: (totalApproxBytes / (1024 * 1024)).toFixed(2),
    tables: auditReport
  }, null, 2));
}

audit().catch(console.error);
