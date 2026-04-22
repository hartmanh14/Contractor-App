// Convert a File object to the { base64, mimeType, caption } shape expected by
// the backend analysis endpoints. Used by both NewProjectWizard and NewDIYWizard.
export function fileToBase64(photo) {
  if (!photo.file) return Promise.resolve(null);
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve({
      base64: reader.result,
      mimeType: photo.file.type,
      caption: photo.caption || "",
    });
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(photo.file);
  });
}

export async function encodePhotos(photos = []) {
  const encoded = await Promise.all(photos.map(fileToBase64));
  return encoded.filter(Boolean);
}
