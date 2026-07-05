export async function loadBitmap(file: File): Promise<ImageBitmap> {
  let blob: Blob = file;
  const isHeic = /heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
  if (isHeic) {
    const heic2any = (await import("heic2any")).default;
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
    blob = Array.isArray(converted) ? converted[0] : converted;
  }
  return createImageBitmap(blob);
}

export function isImageFile(file: File): boolean {
  return (
    /^image\//.test(file.type) ||
    /\.(jpe?g|png|webp|heic|heif|gif|bmp)$/i.test(file.name)
  );
}
