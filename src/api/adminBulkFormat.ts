const STORAGE_KEY = 'coverlens_admin_bulk_format';

export function getBulkFormatMode(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(STORAGE_KEY) === '1';
}

export function setBulkFormatMode(enabled: boolean): void {
  sessionStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
}

export const MAX_BULK_FORMAT = 200;

export type BulkPhysicalFormat = 'physical' | 'digital' | 'unknown';
