export function googleImageSearchUrl(title: string, platform: string): string {
  const query = `${title} ${platform} cover box art`.trim();
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
}

export function openGoogleImageSearch(title: string, platform: string): void {
  window.open(googleImageSearchUrl(title, platform), '_blank', 'noopener,noreferrer');
}

/** Lee una imagen del portapapeles (requiere gesto del usuario + HTTPS). */
export async function readImageFileFromClipboard(): Promise<File | null> {
  if (!navigator.clipboard?.read) {
    throw new Error('Tu navegador no permite leer el portapapeles. Usa Chrome o Edge en HTTPS.');
  }

  const items = await navigator.clipboard.read();
  for (const item of items) {
    const imageType = item.types.find((t) => t.startsWith('image/'));
    if (!imageType) continue;
    const blob = await item.getType(imageType);
    const ext = imageType.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
    return new File([blob], `cover.${ext}`, { type: imageType });
  }
  return null;
}
