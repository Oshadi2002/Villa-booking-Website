import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAdmin } from '@/lib/auth';
import { 
  isR2Configured, 
  uploadBufferToR2, 
  uploadBase64ToR2,
  ALLOWED_IMAGE_TYPES, 
  MAX_IMAGE_SIZE, 
  R2Folder 
} from '@/lib/r2';

export async function POST(req: Request) {
  // Security Hardening: Only authenticated admin can upload files
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const contentType = req.headers.get('content-type') || '';

    // Case 1: JSON body containing base64 data string(s)
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const folder = (body.folder as R2Folder) || 'general';
      const images: string[] = Array.isArray(body.images) 
        ? body.images 
        : (body.image ? [body.image] : (body.base64 ? [body.base64] : []));

      if (images.length === 0) {
        return NextResponse.json({ success: false, message: 'No image data provided' }, { status: 400 });
      }

      const uploadedUrls: string[] = [];

      for (const img of images) {
        if (typeof img !== 'string') continue;

        // If it's already an HTTP URL (e.g. Unsplash or R2), keep it as is
        if (img.startsWith('http://') || img.startsWith('https://')) {
          uploadedUrls.push(img);
          continue;
        }

        if (isR2Configured()) {
          const result = await uploadBase64ToR2(img, { folder, filename: body.filename });
          uploadedUrls.push(result.url);
        } else {
          // Fallback to data URL if R2 not configured
          uploadedUrls.push(img);
        }
      }

      return NextResponse.json({
        success: true,
        url: uploadedUrls[0],
        urls: uploadedUrls,
      });
    }

    // Case 2: FormData containing File object(s)
    const formData = await req.formData();
    const folder = (formData.get('folder') as R2Folder) || 'general';
    
    // Support either multiple files (files) or single file (file)
    const files = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;
    const uploadFiles = files.length > 0 ? files : (singleFile ? [singleFile] : []);

    if (uploadFiles.length === 0) {
      return NextResponse.json({ success: false, message: 'No image file uploaded' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];
    const r2Ready = isR2Configured();

    // Directory for local development fallback if R2 is not configured
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    let canWriteFs = !r2Ready;
    if (canWriteFs) {
      try {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
      } catch {
        canWriteFs = false;
      }
    }

    for (const file of uploadFiles) {
      // Validate MIME type
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        return NextResponse.json(
          { success: false, message: `Invalid file type "${file.type}". Only JPG, PNG, WEBP, GIF, and AVIF are allowed.` },
          { status: 400 }
        );
      }

      // Validate File Size
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { success: false, message: `File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      let savedUrl = '';

      // Primary Storage: Cloudflare R2 via official AWS S3 SDK
      if (r2Ready) {
        try {
          const result = await uploadBufferToR2(buffer, {
            folder,
            contentType: file.type || 'image/jpeg',
            filename: file.name,
          });
          savedUrl = result.url;
        } catch (r2Err: unknown) {
          const err = r2Err as Error;
          console.error('R2 upload failed, falling back:', err.message);
          // If R2 upload fails, we log and fall back
        }
      }

      // Fallback 1: Local filesystem (development mode)
      if (!savedUrl && canWriteFs) {
        try {
          const cleanName = path.basename(file.name).replace(/[^a-zA-Z0-9.-]/g, '_');
          const ext = path.extname(cleanName) || (file.type === 'image/png' ? '.png' : file.type === 'image/webp' ? '.webp' : '.jpg');
          const filename = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}${ext}`;
          const filePath = path.join(uploadsDir, filename);
          fs.writeFileSync(filePath, buffer);
          savedUrl = `/uploads/${filename}`;
        } catch {
          canWriteFs = false;
        }
      }

      // Fallback 2: Data URL if all else fails
      if (!savedUrl) {
        const mimeType = file.type || 'image/jpeg';
        savedUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
      }

      uploadedUrls.push(savedUrl);
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0],
      urls: uploadedUrls,
      storage: r2Ready ? 'cloudflare-r2' : 'local-or-base64',
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('API /api/upload error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
