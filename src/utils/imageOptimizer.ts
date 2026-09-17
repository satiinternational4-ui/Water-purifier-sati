/**
 * Utility for processing and optimizing large high-resolution images (up to 50MB+)
 * directly in the browser using HTML5 Canvas before saving into application state.
 */

export interface ImageOptimizationResult {
  dataUrl: string;
  originalSize: number;
  optimizedSize: number;
  originalSizeFormatted: string;
  optimizedSizeFormatted: string;
  savingsPercentage: number;
  fileName: string;
  width: number;
  height: number;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Optimizes an uploaded image file (supports up to 50MB files from smartphones/cameras)
 * Scales proportionally to maxDimension (default 1920px) and compresses to high-quality JPEG/WebP.
 */
export async function optimizeImageFile(
  file: File,
  options: {
    maxDimension?: number;
    quality?: number;
    maxSizeMB?: number;
  } = {}
): Promise<ImageOptimizationResult> {
  const { maxDimension = 1920, quality = 0.86, maxSizeMB = 50 } = options;

  // Check hard ceiling (default 50MB)
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(
      `File size (${formatBytes(file.size)}) exceeds the maximum allowed limit of ${maxSizeMB} MB.`
    );
  }

  return new Promise((resolve, reject) => {
    // Create object URL for memory-efficient loading of large 30MB+ files
    const blobUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(blobUrl);

      try {
        let { width, height } = img;

        // Calculate target dimensions keeping aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        // Draw to canvas with high smoothing quality
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas 2D context could not be created.');
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high-fidelity JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Calculate approx byte size of resulting base64 dataUrl
        const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const optimizedSize = Math.round((base64Length * 3) / 4);

        const savings = Math.max(
          0,
          Math.round(((file.size - optimizedSize) / file.size) * 100)
        );

        resolve({
          dataUrl,
          originalSize: file.size,
          optimizedSize,
          originalSizeFormatted: formatBytes(file.size),
          optimizedSizeFormatted: formatBytes(optimizedSize),
          savingsPercentage: savings,
          fileName: file.name,
          width,
          height,
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error('Failed to decode the image. Please ensure it is a valid image file.'));
    };

    img.src = blobUrl;
  });
}
