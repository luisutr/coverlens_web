const STORAGE_KEY = 'coverlens_admin_token';

export function getAdminToken(): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  const token = sessionStorage.getItem(STORAGE_KEY);
  return token?.trim() ? token.trim() : null;
}

export function setAdminToken(token: string): void {
  sessionStorage.setItem(STORAGE_KEY, token.trim());
}

export function clearAdminToken(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function hasAdminToken(): boolean {
  return getAdminToken() !== null;
}

/** En dev local la API suele ir sin token (sin config.php). En build de prod se exige login. */
export function adminGateRequired(): boolean {
  return !import.meta.env.DEV;
}
