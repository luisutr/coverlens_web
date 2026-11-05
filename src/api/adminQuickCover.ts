const STORAGE_KEY = 'coverlens_admin_quick_cover';

export function getQuickCoverMode(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(STORAGE_KEY) === '1';
}

export function setQuickCoverMode(enabled: boolean): void {
  sessionStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
}
