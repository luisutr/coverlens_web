const STORAGE_KEY = 'coverlens_admin_bulk_delete';

export function getBulkDeleteMode(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(STORAGE_KEY) === '1';
}

export function setBulkDeleteMode(enabled: boolean): void {
  sessionStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
}
