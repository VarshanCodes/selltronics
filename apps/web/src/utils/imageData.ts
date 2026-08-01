/**
 * Encodes a local image as a data URL. The value is intentionally stored as a
 * string in Firestore and rendered only through an <img> element; it is never
 * injected as HTML. This keeps the selected image private to the application
 * UI while providing the requested portable "HTML image code" behaviour.
 */
const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const TARGET_BYTES = 90 * 1024;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('The image could not be compressed.')), 'image/webp', quality));
}

/**
 * Produces a small WebP data URL suitable for the Firestore product document.
 * Admins can select normal phone/camera photos; they are resized client-side
 * instead of being rejected by an arbitrary source-file-size limit.
 */
export async function imageFileToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  if (file.size > MAX_SOURCE_BYTES) throw new Error('Please choose an image below 15 MB.');

  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('The image could not be opened.'));
      element.src = sourceUrl;
    });
    let width = Math.min(image.naturalWidth, 1200);
    let height = Math.max(1, Math.round(image.naturalHeight * (width / image.naturalWidth)));
    let quality = 0.82;

    for (let attempt = 0; attempt < 7; attempt += 1) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width));
      canvas.height = Math.max(1, Math.round(height));
      canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await canvasBlob(canvas, quality);
      if (blob.size <= TARGET_BYTES || attempt === 6) return blobToDataUrl(blob);
      if (quality > 0.5) quality -= 0.12;
      else { width *= 0.78; height *= 0.78; quality = 0.72; }
    }
    throw new Error('The image could not be compressed.');
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

export async function imageFilesToDataUrls(files: FileList | null): Promise<string[]> {
  if (!files) return [];
  return Promise.all(Array.from(files).map(imageFileToDataUrl));
}
