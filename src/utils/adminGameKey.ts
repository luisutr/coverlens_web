import type { AdminBrowseGame } from '../types/admin';

export type AdminGameRef = Pick<AdminBrowseGame, 'platformSlug' | 'slug'>;

export function adminGameKey(game: AdminGameRef): string {
  return `${game.platformSlug}/${game.slug}`;
}

export function parseAdminGameKey(key: string): AdminGameRef | null {
  const idx = key.indexOf('/');
  if (idx <= 0) return null;
  return {
    platformSlug: key.slice(0, idx),
    slug: key.slice(idx + 1),
  };
}
