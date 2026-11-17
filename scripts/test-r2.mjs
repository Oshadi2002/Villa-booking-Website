import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to manually load .env.local
function loadEnv() {
  const fullPath = path.join(rootDir, '.env.local');
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

loadEnv();

async function runTest() {
  console.log('Testing Cloudflare R2 Connection...');
  console.log('R2_ENDPOINT:', process.env.R2_ENDPOINT);
  console.log('R2_BUCKET_NAME:', process.env.R2_BUCKET_NAME);
  console.log('R2_PUBLIC_URL:', process.env.R2_PUBLIC_URL);

  const s3 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
  });

  const bucket = process.env.R2_BUCKET_NAME;

  try {
    // 1. List objects test
    console.log('\n--- 1. Testing ListObjectsV2 ---');
    const listRes = await s3.send(new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: 5,
    }));
    console.log('ListObjectsV2 Success! Objects found in bucket:', listRes.KeyCount ?? 0);
    if (listRes.Contents && listRes.Contents.length > 0) {
      console.log('Sample existing objects:', listRes.Contents.map(c => c.Key));
    }

    // 2. PutObject test (a tiny test image/svg)
    console.log('\n--- 2. Testing PutObject (Upload) ---');
    const testKey = `general/test-connection-${Date.now()}.txt`;
    const testBody = 'Cloudflare R2 integration test for LankaGama Villa';
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: testKey,
      Body: testBody,
      ContentType: 'text/plain',
    }));
    console.log('PutObject Success! Uploaded key:', testKey);

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${testKey}`;
    console.log('Public URL:', publicUrl);

    // 3. Test HTTP fetch of the public URL
    console.log('\n--- 3. Testing Public URL Reachability ---');
    try {
      const fetchRes = await fetch(publicUrl);
      console.log('Public URL HTTP Status:', fetchRes.status, fetchRes.statusText);
      const text = await fetchRes.text();
      console.log('Public URL Content match:', text === testBody ? 'MATCHED PERFECTLY' : 'Content mismatch');
    } catch (fetchErr) {
      console.log('Public URL Fetch note (DNS might take a few moments or direct curl):', fetchErr.message);
    }

    // 4. Clean up test key
    console.log('\n--- 4. Cleaning up test object ---');
    await s3.send(new DeleteObjectCommand({
      Bucket: bucket,
      Key: testKey,
    }));
    console.log('Cleaned up test object successfully.');

    console.log('\nALL R2 S3-API TESTS PASSED!');
  } catch (err) {
    console.error('R2 Test failed:', err?.name || 'Error', ':', err?.message || 'Unknown error');
  }
}

runTest();
