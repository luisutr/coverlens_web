export type CatalogSort = 'rating_desc' | 'title' | 'value_desc' | 'platform';

export type PlatformInfo = {
  slug: string;
  name: string;
  count: number;
};

export type PlatformsManifest = {
  updatedAt: string;
  totalGames: number;
  platforms: PlatformInfo[];
};

export type PhysicalFormat = 'physical' | 'digital' | 'unknown' | 'all';

export type BrowseGame = {
  slug: string;
  title: string;
  platform: string;
  platformSlug: string;
  coverUrl: string | null;
  marketValueEUR: number | null;
  rating: number | null;
  castilianText: boolean;
  castilianVoice: boolean;
  /** true = físico, false = solo digital, null = sin clasificar */
  physicalRelease?: boolean | null;
};

export type BrowseResponse = {
  query: string | null;
  platform: string | null;
  sort: CatalogSort;
  physicalFormat?: PhysicalFormat;
  total: number;
  page: number;
  limit: number;
  pages: number;
  results: BrowseGame[];
};

export type GameDetail = {
  slug: string;
  title: string;
  platform: string;
  platformSlug: string;
  version?: string | null;
  barcode?: string | null;
  genre?: string | null;
  developer?: string | null;
  publisher?: string | null;
  releaseYear?: number | null;
  releaseDate?: string | null;
  description?: string | null;
  rating?: number | null;
  coverPath?: string | null;
  coverUrl?: string | null;
  coverUpdatedAt?: string | null;
  marketValue?: {
    EUR?: number;
    source?: string;
    updatedAt?: string;
  } | null;
  textLanguages?: string[] | string | null;
  voiceLanguages?: string[] | string | null;
  localization?: {
    castilian?: { text?: boolean; voices?: boolean };
    interfaceLocales?: string[];
    subtitleLocales?: string[];
    audioLocales?: string[];
  } | null;
  sources?: Record<string, string>;
  igdbId?: number | null;
  physicalRelease?: boolean | null;
  physicalCheckedAt?: string | null;
  updatedAt?: string;
};

export type CatalogFilters = {
  q: string;
  platform: string | null;
  sort: CatalogSort;
  castilianText: boolean;
  castilianVoice: boolean;
  /** Si true, incluye juegos exclusivamente digitales (physicalFormat=all). */
  showDigital: boolean;
};
