/**
 * Compress an image file in the browser using HTML5 Canvas and return a Base64 data URL.
 * Prefers WebP output if supported by the browser, falling back to JPEG.
 *
 * @param {File} file
 * @param {number} maxWidth
 * @param {number} quality
 * @returns {Promise<{ dataUrl: string, sizeKB: string }>}
 */
export function compressImageToBase64(file, maxWidth = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        const sizeKB = ((dataUrl.length * 3) / 4 / 1024).toFixed(1);
        resolve({ dataUrl, sizeKB });
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
}
