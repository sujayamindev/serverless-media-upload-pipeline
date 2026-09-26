export const ACCEPTED_FORMATS = 'JPEG, PNG, WebP, MP4, WebM or MOV';
export const MAX_SIZE_LABEL = '50 MB';

export function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}
