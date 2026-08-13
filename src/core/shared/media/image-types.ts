export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
export const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'] as const;

export const IMAGE_UPLOAD_ERROR_MESSAGE =
  'Only image files (JPG, PNG, WEBP, GIF) are allowed. Videos and other file types are not supported.';

export function normalizeMimeType(mimeType: string): string {
  const mime = mimeType.toLowerCase();
  return mime === 'image/jpg' || mime === 'image/pjpeg' ? 'image/jpeg' : mime;
}

export function isAllowedImage(input: { mimeType: string; originalName: string }): boolean {
  const mime = normalizeMimeType(input.mimeType);
  if ((ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mime)) {
    return true;
  }
  if (mime.startsWith('video/') || mime.startsWith('audio/')) {
    return false;
  }
  const name = input.originalName.toLowerCase().split('?')[0];
  return ALLOWED_IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext));
}
