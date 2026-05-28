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
};

export type BrowseResponse = {
  query: string | null;
  platform: string | null;
  sort: CatalogSort;
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
  marketValue?: {
    EUR?: number;
    source?: string;
    updatedAt?: string;
  } | null;
  textLanguages?: string[] | string | null;
  voiceLanguages?: string[] | string | null;
  localization?: {
    castilian?: { text?: boolean; voices?: boolean };
  } | null;
  sources?: Record<string, string>;
  updatedAt?: string;
};

export type CatalogFilters = {
  q: string;
  platform: string | null;
  sort: CatalogSort;
  castilianText: boolean;
  castilianVoice: boolean;
};
