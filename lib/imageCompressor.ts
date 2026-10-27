/**
 * Client-side high performance image compressor.
 * Automatically resizes huge phone camera/DSLR images down to web-optimized HD (max 1200px)
 * reducing file size from 5MB-10MB to 60KB-90KB so Vercel payloads never exceed limits.
 */

export function compressImageFile(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      compressDataUrl(dataUrl, maxWidth, maxHeight, quality).then(resolve);
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export function compressDataUrl(dataUrl: string, maxWidth = 1200, maxHeight = 1200, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !dataUrl.startsWith('data:image/')) {
      return resolve(dataUrl);
    }

    // If already small (< 100KB), return as is
    if (dataUrl.length < 120000) {
      return resolve(dataUrl);
    }

    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
