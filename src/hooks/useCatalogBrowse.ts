import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchBrowse } from '../api/catalogApi';
import type { BrowseGame, CatalogFilters } from '../types/catalog';

export const PAGE_SIZE = 48;

type BrowseState = {
  items: BrowseGame[];
  total: number;
  page: number;
  pages: number;
  loading: boolean;
  error: string | null;
};

const emptyState: BrowseState = {
  items: [],
  total: 0,
  page: 1,
  pages: 0,
  loading: true,
  error: null,
};

export function useCatalogBrowse(filters: CatalogFilters, page: number) {
  const [state, setState] = useState<BrowseState>(emptyState);
  const filtersKey = JSON.stringify(filters);
  const requestId = useRef(0);
  const safePage = Math.max(1, page);

  const loadPage = useCallback(
    async (targetPage: number) => {
      const id = ++requestId.current;
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const data = await fetchBrowse(filters, targetPage, PAGE_SIZE);
        if (id !== requestId.current) return;

        setState({
          items: data.results,
          total: data.total,
          page: data.page,
          pages: data.pages,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (id !== requestId.current) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Error al cargar el catálogo',
        }));
      }
    },
    [filters],
  );

  useEffect(() => {
    void loadPage(safePage);
  }, [filtersKey, safePage, loadPage]);

  const retry = useCallback(() => {
    void loadPage(safePage);
  }, [loadPage, safePage]);

  return { ...state, retry };
}
