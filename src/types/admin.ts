import type { BrowseGame, CatalogSort, GameDetail } from './catalog';

export type AdminIncompleteFilters = {
  missingCover: boolean;
  missingDescription: boolean;
  missingBarcode: boolean;
  missingPublisher: boolean;
  physicalOnly: boolean;
  digitalOnly: boolean;
};

export type AdminFilters = AdminIncompleteFilters & {
  q: string;
  platform: string | null;
  sort: CatalogSort;
};

export type AdminBrowseGame = BrowseGame & AdminIncompleteFilters;

/** Actualiza flags de incompletos tras enrich en lote (grid admin). */
export function enrichedRecordToBrowsePatch(record: GameDetail): Partial<AdminBrowseGame> {
  return {
    title: record.title,
    rating: record.rating ?? null,
    marketValueEUR: record.marketValue?.EUR ?? null,
    castilianText: record.localization?.castilian?.text === true,
    castilianVoice: record.localization?.castilian?.voices === true,
    physicalRelease: record.physicalRelease ?? null,
    missingCover: !record.coverPath && !record.coverUrl,
    missingDescription: !record.description,
    missingBarcode: !record.barcode,
    missingPublisher: !record.publisher,
  };
}

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
    coverVersion?: string | null;
  };
  incomplete: AdminIncompleteFilters;
};

export type AdminSavePayload = {
  platformSlug: string;
  slug: string;
  /** Si difiere de platformSlug, mueve JSON + portada a otra plataforma. */
  newPlatformSlug?: string;
  /** Si difiere de slug, renombra el fichero y actualiza URLs. */
  newSlug?: string;
  record: Partial<GameDetail>;
  rebuildIndexes?: boolean;
};

export type AdminSaveResponse = {
  ok: boolean;
  record: GameDetail;
  coverVersion?: number;
  moved?: { from: string; to: string; fromSlug?: string; toSlug?: string } | null;
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
  queued?: boolean;
};

export type AdminDeleteGameRef = {
  platformSlug: string;
  slug: string;
};

export type AdminDeletePayload = {
  games: AdminDeleteGameRef[];
  rebuildIndexes?: boolean;
};

export type AdminDeleteResponse = {
  ok: boolean;
  deleted: Array<AdminDeleteGameRef & { title?: string | null }>;
  notFound: AdminDeleteGameRef[];
  failed: Array<AdminDeleteGameRef & { error?: string }>;
  rebuild?: AdminSaveResponse['rebuild'];
};

export type BulkPhysicalFormat = 'physical' | 'digital' | 'unknown';

export type AdminSetPhysicalBatchPayload = {
  games: AdminDeleteGameRef[];
  format: BulkPhysicalFormat;
  rebuildIndexes?: boolean;
};

export type AdminSetPhysicalBatchResponse = {
  ok: boolean;
  format: BulkPhysicalFormat;
  updated: Array<
    AdminDeleteGameRef & { title?: string | null; physicalRelease?: boolean | null }
  >;
  notFound: AdminDeleteGameRef[];
  failed: Array<AdminDeleteGameRef & { error?: string }>;
  rebuild?: AdminSaveResponse['rebuild'];
};

export type AdminCreatePayload = {
  platformSlug: string;
  slug: string;
  title: string;
  coverUrl?: string;
  rebuildIndexes?: boolean;
};

export type AdminCreateResponse = {
  ok: boolean;
  record: GameDetail;
  rebuild?: AdminSaveResponse['rebuild'];
};

export type AdminEnrichPayload = {
  platformSlug: string;
  slug: string;
  downloadCover?: boolean;
  apply?: boolean;
  rebuildIndexes?: boolean;
};

export type AdminEnrichResponse = {
  ok: boolean;
  changed: boolean;
  filledFields: string[];
  sourcesUsed: string[];
  warnings: string[];
  coverDownloaded: boolean;
  applied: boolean;
  record: GameDetail;
  rebuild?: AdminSaveResponse['rebuild'];
};

export type AdminEditableGame = {
  platformSlug: string;
  /** Slug editable — vacío significa "mantener el actual". */
  slugOverride: string;
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
  digitalOnly: boolean;
  sourcesRaw: string;
};

/** Genera un slug a partir de un título: minúsculas, guiones, sin acentos. */
export function titleToSlug(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function gameDetailToEditable(game: GameDetail): AdminEditableGame {
  return {
    platformSlug: game.platformSlug ?? '',
    slugOverride: '',
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
    digitalOnly: game.physicalRelease === false,
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
    physicalRelease: form.digitalOnly ? false : null,
    physicalCheckedAt: new Date().toISOString().slice(0, 10),
    sources: sources ?? undefined,
  };
}

const ENRICH_FIELD_LABELS: Record<string, string> = {
  barcode: 'Barcode',
  genre: 'Género',
  developer: 'Desarrollador',
  publisher: 'Editor',
  releaseYear: 'Año',
  releaseDate: 'Fecha',
  description: 'Descripción',
  rating: 'Rating',
  localization: 'Idiomas',
  marketValue: 'Valor EUR',
  coverPath: 'Portada',
  igdbId: 'IGDB ID',
  franchise: 'Franquicia',
};

export function formatEnrichFilledFields(fields: string[]): string {
  if (fields.length === 0) return '';
  return fields.map((f) => ENRICH_FIELD_LABELS[f] ?? f).join(', ');
}

export function formatAdminRebuildNote(
  rebuild: AdminRebuildResponse | null | undefined,
): string {
  if (!rebuild) return '';
  if (rebuild.ok) return ' índices actualizados.';
  if (rebuild.queued) {
    return ' Índices encolados; el cron los regenerará en ~15 min.';
  }
  const tail = rebuild.output?.trim().split('\n').slice(-1)[0];
  return tail
    ? ` pero falló la regeneración de índices: ${tail}`
    : ' pero falló la regeneración de índices.';
}

/** Aplica solo los campos que el servidor rellenó, sin pisar ediciones manuales en otros huecos. */
export function applyEnrichToForm(
  form: AdminEditableGame,
  record: GameDetail,
  filledFields: string[],
): AdminEditableGame {
  const editable = gameDetailToEditable(record);
  const next = { ...form };

  for (const field of filledFields) {
    if (field === 'localization') {
      next.castilianText = editable.castilianText;
      next.castilianVoice = editable.castilianVoice;
    } else if (field === 'marketValue') {
      next.marketValueEur = editable.marketValueEur;
    } else if (field === 'sources' || field.startsWith('sources')) {
      next.sourcesRaw = editable.sourcesRaw;
    } else if (field === 'barcode') {
      next.barcode = editable.barcode;
    } else if (field === 'genre') {
      next.genre = editable.genre;
    } else if (field === 'developer') {
      next.developer = editable.developer;
    } else if (field === 'publisher') {
      next.publisher = editable.publisher;
    } else if (field === 'releaseYear') {
      next.releaseYear = editable.releaseYear;
    } else if (field === 'releaseDate') {
      next.releaseDate = editable.releaseDate;
    } else if (field === 'description') {
      next.description = editable.description;
    } else if (field === 'rating') {
      next.rating = editable.rating;
    }
  }

  if (editable.sourcesRaw && !filledFields.includes('sources')) {
    const hadSources = form.sourcesRaw.trim().length > 0;
    const gotSources = editable.sourcesRaw.trim().length > 0;
    if (!hadSources && gotSources) {
      next.sourcesRaw = editable.sourcesRaw;
    }
  }

  return next;
}
