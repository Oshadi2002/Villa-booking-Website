import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
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
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      let savedUrl = '';

      if (canWriteFs) {
        try {
          const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filename = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}-${cleanName}`;
          const filePath = path.join(uploadsDir, filename);
          fs.writeFileSync(filePath, buffer);
          savedUrl = `/uploads/${filename}`;
        } catch {
          canWriteFs = false;
        }
      }

      // If FS is unavailable or failed (e.g. read-only on Vercel), create data URL
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
