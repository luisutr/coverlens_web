import type { BrowseGame, CatalogSort, GameDetail } from './catalog';

export type AdminIncompleteFilters = {
  missingCover: boolean;
  missingDescription: boolean;
  missingBarcode: boolean;
  missingPublisher: boolean;
};

export type AdminFilters = AdminIncompleteFilters & {
  q: string;
  platform: string | null;
  sort: CatalogSort;
};

export type AdminBrowseGame = BrowseGame & AdminIncompleteFilters;

export type AdminBrowseResponse = {
  query: string | null;
  platform: string | null;
  sort: CatalogSort;
  filters: AdminIncompleteFilters & { incompleteOnly: boolean };
  total: number;
  page: number;
  limit: number;
  pages: number;
  results: AdminBrowseGame[];
};

export type AdminGameResponse = {
  record: GameDetail;
  paths: {
    json: string;
    cover: string | null;
  };
  incomplete: AdminIncompleteFilters;
};

export type AdminSavePayload = {
  platformSlug: string;
  slug: string;
  record: Partial<GameDetail>;
  rebuildIndexes?: boolean;
};

export type AdminSaveResponse = {
  ok: boolean;
  record: GameDetail;
  rebuild?: {
    ok: boolean;
    exitCode?: number;
    output?: string;
    error?: string;
  } | null;
};

export type AdminRebuildResponse = {
  ok: boolean;
  exitCode?: number;
  output?: string;
  error?: string;
};

export type AdminEditableGame = {
  title: string;
  version: string;
  barcode: string;
  genre: string;
  developer: string;
  publisher: string;
  releaseYear: string;
  releaseDate: string;
  description: string;
  rating: string;
  marketValueEur: string;
  castilianText: boolean;
  castilianVoice: boolean;
  sourcesRaw: string;
};

export function gameDetailToEditable(game: GameDetail): AdminEditableGame {
  return {
    title: game.title ?? '',
    version: game.version ?? '',
    barcode: game.barcode ?? '',
    genre: game.genre ?? '',
    developer: game.developer ?? '',
    publisher: game.publisher ?? '',
    releaseYear: game.releaseYear != null ? String(game.releaseYear) : '',
    releaseDate: game.releaseDate ?? '',
    description: game.description ?? '',
    rating: game.rating != null ? String(game.rating) : '',
    marketValueEur:
      game.marketValue?.EUR != null ? String(game.marketValue.EUR) : '',
    castilianText: game.localization?.castilian?.text === true,
    castilianVoice: game.localization?.castilian?.voices === true,
    sourcesRaw: game.sources ? JSON.stringify(game.sources, null, 2) : '',
  };
}

export function editableToSaveRecord(form: AdminEditableGame): Partial<GameDetail> {
  let sources: Record<string, string> | null = null;
  if (form.sourcesRaw.trim()) {
    try {
      const parsed = JSON.parse(form.sourcesRaw) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        sources = parsed as Record<string, string>;
      }
    } catch {
      sources = null;
    }
  }

  const eur = form.marketValueEur.trim() ? Number(form.marketValueEur) : null;

  return {
    title: form.title.trim() || undefined,
    version: form.version.trim() || null,
    barcode: form.barcode.trim() || null,
    genre: form.genre.trim() || null,
    developer: form.developer.trim() || null,
    publisher: form.publisher.trim() || null,
    releaseYear: form.releaseYear.trim() ? Number(form.releaseYear) : null,
    releaseDate: form.releaseDate.trim() || null,
    description: form.description.trim() || null,
    rating: form.rating.trim() ? Number(form.rating) : null,
    marketValue:
      eur != null && !Number.isNaN(eur)
        ? { EUR: eur, source: 'manual', updatedAt: new Date().toISOString().slice(0, 10) }
        : null,
    localization: {
      castilian: {
        text: form.castilianText,
        voices: form.castilianVoice,
      },
    },
    sources: sources ?? undefined,
  };
}
