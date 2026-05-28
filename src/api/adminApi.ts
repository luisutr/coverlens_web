import { apiUrl } from './config';
import type {
  AdminBrowseResponse,
  AdminFilters,
  AdminGameResponse,
  AdminRebuildResponse,
  AdminSavePayload,
  AdminSaveResponse,
} from '../types/admin';

async function adminFetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `HTTP ${res.status}: ${url}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchAdminBrowse(
  filters: AdminFilters,
  page: number,
  limit = 48,
): Promise<AdminBrowseResponse> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  params.set('sort', filters.sort);
  if (filters.q.trim()) params.set('q', filters.q.trim());
  if (filters.platform) params.set('platform', filters.platform);
  if (filters.missingCover) params.set('missingCover', '1');
  if (filters.missingDescription) params.set('missingDescription', '1');
  if (filters.missingBarcode) params.set('missingBarcode', '1');
  if (filters.missingPublisher) params.set('missingPublisher', '1');
  return adminFetchJson<AdminBrowseResponse>(apiUrl(`/api/admin/browse.php?${params}`));
}

export async function fetchAdminGame(
  platformSlug: string,
  slug: string,
): Promise<AdminGameResponse> {
  const params = new URLSearchParams({ platform: platformSlug, slug });
  return adminFetchJson<AdminGameResponse>(apiUrl(`/api/admin/game.php?${params}`));
}

export async function saveAdminGame(payload: AdminSavePayload): Promise<AdminSaveResponse> {
  return adminFetchJson<AdminSaveResponse>(apiUrl('/api/admin/save.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function uploadAdminCover(
  platformSlug: string,
  slug: string,
  file: File,
  rebuildIndexes = true,
): Promise<AdminSaveResponse> {
  const form = new FormData();
  form.set('platformSlug', platformSlug);
  form.set('slug', slug);
  form.set('cover', file);
  if (rebuildIndexes) form.set('rebuildIndexes', '1');
  return adminFetchJson<AdminSaveResponse>(apiUrl('/api/admin/upload-cover.php'), {
    method: 'POST',
    body: form,
  });
}

export async function rebuildAdminIndexes(): Promise<AdminRebuildResponse> {
  return adminFetchJson<AdminRebuildResponse>(apiUrl('/api/admin/rebuild.php'), {
    method: 'POST',
  });
}
