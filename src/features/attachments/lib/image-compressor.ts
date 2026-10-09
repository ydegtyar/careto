export interface CompressedImage {
  blob: Blob;
  sha256: string;
  byteSize: number;
  width: number;
  height: number;
  lqip: string; // Base64 data URL blur placeholder
}

export async function computeSha256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function compressAndPrepareImage(
  file: File,
  maxDim = 2048,
  quality = 0.82,
): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = async () => {
        let { width, height } = img;

        // Downscale while preserving aspect ratio
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        // Draw main compressed image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas 2D context unavailable'));

        ctx.drawImage(img, 0, 0, width, height);

        // Generate LQIP (tiny 24px placeholder)
        const lqipCanvas = document.createElement('canvas');
        const lqipRatio = 24 / Math.max(width, height);
        lqipCanvas.width = Math.max(1, Math.round(width * lqipRatio));
        lqipCanvas.height = Math.max(1, Math.round(height * lqipRatio));
        const lqipCtx = lqipCanvas.getContext('2d');
        if (lqipCtx) {
          lqipCtx.drawImage(img, 0, 0, lqipCanvas.width, lqipCanvas.height);
        }
        const lqip = lqipCanvas.toDataURL('image/webp', 0.4);

        canvas.toBlob(
          async (blob) => {
            if (!blob) return reject(new Error('Image compression failed'));
            const arrayBuffer = await blob.arrayBuffer();
            const sha256 = await computeSha256(arrayBuffer);

            resolve({
              blob,
              sha256,
              byteSize: blob.size,
              width,
              height,
              lqip,
            });
          },
          'image/webp',
          quality,
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
