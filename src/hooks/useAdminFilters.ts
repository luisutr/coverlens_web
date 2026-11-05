import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { AdminFilters } from '../types/admin';
import type { CatalogSort } from '../types/catalog';
import { SORT_OPTIONS } from './useCatalogFilters';

const SORTS: CatalogSort[] = ['rating_desc', 'title', 'value_desc', 'platform'];
const DEFAULT_SORT: CatalogSort = 'title';

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

function parseBool(value: string | null): boolean {
  return value === '1';
}

export function useAdminFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo<AdminFilters>(
    () => ({
      q: params.get('q') ?? '',
      platform: params.get('platform') || null,
      sort: parseSort(params.get('sort')),
      missingCover: parseBool(params.get('missingCover')),
      missingDescription: parseBool(params.get('missingDescription')),
      missingBarcode: parseBool(params.get('missingBarcode')),
      missingPublisher: parseBool(params.get('missingPublisher')),
      physicalOnly: parseBool(params.get('physicalOnly')),
      digitalOnly: parseBool(params.get('digitalOnly')),
    }),
    [params],
  );

  const page = useMemo(() => parsePage(params.get('page')), [params]);

  const setFilters = (patch: Partial<AdminFilters>) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      const merged = { ...filters, ...patch };

      if (merged.q.trim()) next.set('q', merged.q.trim());
      else next.delete('q');

      if (merged.platform) next.set('platform', merged.platform);
      else next.delete('platform');

      if (merged.sort === DEFAULT_SORT) next.delete('sort');
      else next.set('sort', merged.sort);

      if (merged.missingCover) next.set('missingCover', '1');
      else next.delete('missingCover');

      if (merged.missingDescription) next.set('missingDescription', '1');
      else next.delete('missingDescription');

      if (merged.missingBarcode) next.set('missingBarcode', '1');
      else next.delete('missingBarcode');

      if (merged.missingPublisher) next.set('missingPublisher', '1');
      else next.delete('missingPublisher');

      if (merged.physicalOnly) next.set('physicalOnly', '1');
      else next.delete('physicalOnly');

      if (merged.digitalOnly) next.set('digitalOnly', '1');
      else next.delete('digitalOnly');

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

  const catalogUrl = `/admin?${params.toString()}`;

  return { filters, page, setFilters, setPage, catalogUrl };
}

export { SORT_OPTIONS };
