/**
 * Encodes a local image as a data URL. The value is intentionally stored as a
 * string in Firestore and rendered only through an <img> element; it is never
 * injected as HTML. This keeps the selected image private to the application
 * UI while providing the requested portable "HTML image code" behaviour.
 */
export function imageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Please choose an image file.'));
    if (file.size > 700_000) return reject(new Error('Please use images below 700 KB.'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export async function imageFilesToDataUrls(files: FileList | null): Promise<string[]> {
  if (!files) return [];
  return Promise.all(Array.from(files).map(imageFileToDataUrl));
}
