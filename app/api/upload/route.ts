import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAdmin } from '@/lib/auth';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  // Security Hardening: Only authenticated admin can upload files
  const authError = requireAdmin(req);
  if (authError) return authError;

  try {
    const formData = await req.formData();
    
    // Support either multiple files (files) or single file (file)
    const files = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;
    const uploadFiles = files.length > 0 ? files : (singleFile ? [singleFile] : []);

    if (uploadFiles.length === 0) {
      return NextResponse.json({ success: false, message: 'No image file uploaded' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    let canWriteFs = true;

    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
    } catch {
      canWriteFs = false;
    }

    const uploadedUrls: string[] = [];

    for (const file of uploadFiles) {
      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          { success: false, message: `Invalid file type "${file.type}". Only JPG, PNG, and WebP images are allowed.` },
          { status: 400 }
        );
      }

      // Validate File Size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, message: `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      let savedUrl = '';

      if (canWriteFs) {
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

      // If FS is unavailable or failed (e.g. read-only serverless disk), create optimized data URL
      if (!savedUrl) {
        const mimeType = file.type || 'image/jpeg';
        savedUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
      }

      uploadedUrls.push(savedUrl);
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0],
      urls: uploadedUrls
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
