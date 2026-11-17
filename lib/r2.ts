import { 
  S3Client, 
  PutObjectCommand, 
  HeadObjectCommand, 
  DeleteObjectCommand,
  ListObjectsV2Command 
} from '@aws-sdk/client-s3';
import crypto from 'crypto';
import path from 'path';

export const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif'
]);

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB limit

export type R2Folder = 
  | 'villa-images' 
  | 'gallery' 
  | 'rooms' 
  | 'amenities' 
  | 'general' 
  | 'attractions' 
  | 'camping' 
  | 'kithul' 
  | 'guides' 
  | 'blogs';

export interface UploadOptions {
  folder?: R2Folder | string;
  contentType?: string;
  filename?: string;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
  size: number;
  contentType: string;
}

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_ENDPOINT &&
    process.env.R2_BUCKET_NAME
  );
}

let s3ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!isR2Configured()) {
    throw new Error('Cloudflare R2 is not configured. Check R2 environment variables.');
  }

  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
      // Cloudflare R2 standard requirement
      forcePathStyle: true,
    });
  }

  return s3ClientInstance;
}

export function getR2BucketName(): string {
  const bucket = process.env.R2_BUCKET_NAME || 'lankagama-media';
  return bucket;
}

export function getR2PublicUrl(key: string): string {
  const baseUrl = (process.env.R2_PUBLIC_URL || 'https://media.lankagama.com').replace(/\/+$/, '');
  const cleanKey = key.replace(/^\/+/, '');
  return `${baseUrl}/${cleanKey}`;
}

export function getExtensionFromMime(mimeType: string): string {
  switch (mimeType.toLowerCase()) {
    case 'image/png': return '.png';
    case 'image/webp': return '.webp';
    case 'image/gif': return '.gif';
    case 'image/svg+xml': return '.svg';
    case 'image/avif': return '.avif';
    case 'image/jpeg':
    case 'image/jpg':
    default:
      return '.jpg';
  }
}

export function generateR2Key(folder: string = 'general', originalName?: string, mimeType?: string): string {
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '') || 'general';
  const timestamp = Date.now();
  const randomSuffix = crypto.randomBytes(4).toString('hex');

  let ext = '';
  if (originalName) {
    ext = path.extname(originalName).toLowerCase();
  }
  if (!ext && mimeType) {
    ext = getExtensionFromMime(mimeType);
  }
  if (!ext) {
    ext = '.jpg';
  }

  let baseName = 'img';
  if (originalName) {
    const rawBase = path.basename(originalName, path.extname(originalName))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    if (rawBase) {
      baseName = rawBase;
    }
  }

  return `${cleanFolder}/${baseName}-${timestamp}-${randomSuffix}${ext}`;
}

/**
 * Upload a binary buffer to Cloudflare R2
 */
export async function uploadBufferToR2(
  buffer: Buffer | Uint8Array,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const s3 = getR2Client();
  const bucket = getR2BucketName();
  const folder = options.folder || 'general';
  const contentType = options.contentType || 'image/jpeg';
  const key = generateR2Key(folder, options.filename, contentType);

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: options.metadata,
      CacheControl: 'public, max-age=31536000, immutable', // 1 year CDN cache
    })
  );

  const url = getR2PublicUrl(key);

  return {
    key,
    url,
    bucket,
    size: buffer.byteLength,
    contentType,
  };
}

/**
 * Upload a Base64 string (data URI or raw base64) to Cloudflare R2
 */
export async function uploadBase64ToR2(
  base64Data: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  let mimeType = options.contentType || 'image/jpeg';
  let pureBase64 = base64Data;

  const dataUriMatch = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  if (dataUriMatch) {
    mimeType = dataUriMatch[1];
    pureBase64 = dataUriMatch[2];
  }

  const buffer = Buffer.from(pureBase64, 'base64');

  if (buffer.length > MAX_IMAGE_SIZE) {
    throw new Error(`File size (${(buffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 10MB`);
  }

  return uploadBufferToR2(buffer, {
    ...options,
    contentType: mimeType,
  });
}

/**
 * Test R2 connection by performing a lightweight bucket operation
 */
export async function testR2Connection(): Promise<{
  success: boolean;
  message: string;
  bucket?: string;
  endpoint?: string;
  publicUrl?: string;
  error?: string;
}> {
  try {
    if (!isR2Configured()) {
      return {
        success: false,
        message: 'R2 environment variables are missing',
        error: 'Missing credentials'
      };
    }

    const s3 = getR2Client();
    const bucket = getR2BucketName();

    // Verify bucket access by listing up to 1 object
    await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        MaxKeys: 1,
      })
    );

    return {
      success: true,
      message: 'Successfully connected to Cloudflare R2 bucket',
      bucket,
      endpoint: process.env.R2_ENDPOINT,
      publicUrl: process.env.R2_PUBLIC_URL,
    };
  } catch (err: unknown) {
    const error = err as Error;
    return {
      success: false,
      message: `Failed to connect to Cloudflare R2: ${error.message}`,
      error: error.message,
    };
  }
}

/**
 * Automatically normalize any image string (if base64 data URI) by uploading to R2
 */
export async function normalizeImageToR2(
  imageStr: string | undefined | null,
  folder: R2Folder | string = 'general'
): Promise<string> {
  if (!imageStr || typeof imageStr !== 'string') return imageStr || '';
  if (imageStr.startsWith('data:image/') && isR2Configured()) {
    try {
      const result = await uploadBase64ToR2(imageStr, { folder });
      return result.url;
    } catch (err) {
      console.error('Failed to normalize base64 image to R2:', err);
      return imageStr;
    }
  }
  return imageStr;
}

/**
 * Automatically normalize an array of image strings by uploading any base64 data URIs to R2
 */
export async function normalizeImageArrayToR2(
  images: (string | undefined | null)[] | undefined | null,
  folder: R2Folder | string = 'general'
): Promise<string[]> {
  if (!images || !Array.isArray(images)) return [];
  return Promise.all(
    images.map(img => (img ? normalizeImageToR2(img, folder) : Promise.resolve('')))
  ).then(arr => arr.filter(Boolean) as string[]);
}
