/**
 * Utility to automatically crop and center an image to 9:16 mobile portrait ratio
 */
export async function cropImageToPortrait(
  file: File,
  targetWidth = 1080,
  targetHeight = 1920
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // If it's a GIF or video, keep original blob to preserve animation/audio
    if (file.type === 'image/gif' || file.type.startsWith('video/')) {
      return resolve(file);
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return resolve(file);
      }

      // Calculate 9:16 center crop
      const targetAspect = 9 / 16;
      const sourceAspect = img.width / img.height;

      let srcX = 0;
      let srcY = 0;
      let srcWidth = img.width;
      let srcHeight = img.height;

      if (sourceAspect > targetAspect) {
        // Image is wider than 9:16 - crop left & right
        srcWidth = img.height * targetAspect;
        srcX = (img.width - srcWidth) / 2;
      } else {
        // Image is taller than 9:16 - crop top & bottom
        srcHeight = img.width / targetAspect;
        srcY = (img.height - srcHeight) / 2;
      }

      // Enable smooth image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw the centered 9:16 crop onto the canvas
      ctx.drawImage(
        img,
        srcX,
        srcY,
        srcWidth,
        srcHeight,
        0,
        0,
        targetWidth,
        targetHeight
      );

      // Export as high quality JPEG blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        0.92
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback to raw file
    };

    img.src = objectUrl;
  });
}
