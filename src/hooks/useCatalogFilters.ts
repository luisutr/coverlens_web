import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { CatalogFilters, CatalogSort } from '../types/catalog';

const SORTS: CatalogSort[] = ['rating_desc', 'title', 'value_desc', 'platform'];

const DEFAULT_SORT: CatalogSort = 'rating_desc';

function parseSort(value: string | null): CatalogSort {
  if (value && SORTS.includes(value as CatalogSort)) {
    return value as CatalogSort;
  }
  return DEFAULT_SORT;
}

function parsePage(value: string | null): number {
  const n = parseInt(value ?? '1', 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function useCatalogFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo<CatalogFilters>(
    () => ({
      q: params.get('q') ?? '',
      platform: params.get('platform') || null,
      sort: parseSort(params.get('sort')),
      castilianText: params.get('castilianText') === '1',
      castilianVoice: params.get('castilianVoice') === '1',
    }),
    [params],
  );

  const page = useMemo(() => parsePage(params.get('page')), [params]);

  const setFilters = (patch: Partial<CatalogFilters>) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      const merged = { ...filters, ...patch };

      if (merged.q.trim()) next.set('q', merged.q.trim());
      else next.delete('q');

      if (merged.platform) next.set('platform', merged.platform);
      else next.delete('platform');

      if (merged.sort === DEFAULT_SORT) next.delete('sort');
      else next.set('sort', merged.sort);

      if (merged.castilianText) next.set('castilianText', '1');
      else next.delete('castilianText');

      if (merged.castilianVoice) next.set('castilianVoice', '1');
      else next.delete('castilianVoice');

      next.delete('page');
      return next;
    });
  };

  const setPage = (nextPage: number) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextPage <= 1) next.delete('page');
      else next.set('page', String(nextPage));
      return next;
    });
  };

  const catalogUrl = `/catalogo?${params.toString()}`;

  return { filters, page, setFilters, setPage, catalogUrl };
}

export const SORT_OPTIONS: { key: CatalogSort; label: string }[] = [
  { key: 'rating_desc', label: 'Puntuación' },
  { key: 'title', label: 'Título' },
  { key: 'value_desc', label: 'Valor' },
  { key: 'platform', label: 'Plataforma' },
];
