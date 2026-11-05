import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAdminBrowse } from '../api/adminApi';
import type { AdminBrowseGame, AdminDeleteGameRef, AdminFilters } from '../types/admin';

export const ADMIN_PAGE_SIZE = 48;

type BrowseState = {
  items: AdminBrowseGame[];
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

export function useAdminBrowse(filters: AdminFilters, page: number) {
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
        const data = await fetchAdminBrowse(filters, targetPage, ADMIN_PAGE_SIZE);
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
          error: err instanceof Error ? err.message : 'Error al cargar el catálogo admin',
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

  const patchGame = useCallback(
    (platformSlug: string, slug: string, patch: Partial<AdminBrowseGame>) => {
      setState((prev) => ({
        ...prev,
        items: prev.items.map((game) =>
          game.platformSlug === platformSlug && game.slug === slug
            ? { ...game, ...patch }
            : game,
        ),
      }));
    },
    [],
  );

  const removeGames = useCallback((refs: AdminDeleteGameRef[]) => {
    const keys = new Set(refs.map((g) => `${g.platformSlug}/${g.slug}`));
    setState((prev) => {
      const items = prev.items.filter(
        (game) => !keys.has(`${game.platformSlug}/${game.slug}`),
      );
      const removed = prev.items.length - items.length;
      return {
        ...prev,
        items,
        total: Math.max(0, prev.total - removed),
      };
    });
  }, []);

  return { ...state, retry, patchGame, removeGames };
}
