const STORAGE_KEY = 'coverlens_admin_bulk_enrich';

export function getBulkEnrichMode(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(STORAGE_KEY) === '1';
}

export function setBulkEnrichMode(enabled: boolean): void {
  sessionStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
}

export const MAX_BULK_ENRICH = 25;
