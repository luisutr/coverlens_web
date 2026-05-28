import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchPlatforms } from '../api/catalogApi';
import CatalogHeader from '../components/CatalogHeader';
import CatalogPagination from '../components/CatalogPagination';
import FilterBar from '../components/FilterBar';
import GameGrid from '../components/GameGrid';
import PlatformPicker from '../components/PlatformPicker';
import SortPicker from '../components/SortPicker';
import { useCatalogBrowse } from '../hooks/useCatalogBrowse';
import { useCatalogFilters } from '../hooks/useCatalogFilters';
import type { PlatformInfo } from '../types/catalog';
import styles from './CatalogPage.module.css';

export default function CatalogPage() {
  const { filters, page, setFilters, setPage } = useCatalogFilters();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchInput, setSearchInput] = useState(filters.q);
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
  const [platformModalOpen, setPlatformModalOpen] = useState(false);
  const [sortModalOpen, setSortModalOpen] = useState(false);

  const browseFilters = useMemo(
    () => ({ ...filters, q: searchInput }),
    [filters, searchInput],
  );

  const { items, total, pages, loading, error, retry } = useCatalogBrowse(
    browseFilters,
    page,
  );

  useEffect(() => {
    document.title = 'Catálogo — CoverLens';
  }, []);

  useEffect(() => {
    fetchPlatforms()
      .then((data) => setPlatforms(data.platforms))
      .catch(() => setPlatforms([]));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput !== filters.q) {
        setFilters({ q: searchInput });
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [filters.q, searchInput, setFilters]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, filters.q, filters.platform, filters.sort, filters.castilianText, filters.castilianVoice]);

  const platformLabel = useMemo(() => {
    if (!filters.platform) return 'Todas las plataformas';
    return platforms.find((p) => p.slug === filters.platform)?.name ?? filters.platform;
  }, [filters.platform, platforms]);

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  return (
    <div className={styles.page}>
      <CatalogHeader
        total={total || platforms.reduce((sum, p) => sum + p.count, 0)}
        search={searchInput}
        onSearchChange={setSearchInput}
      />
      <FilterBar
        filters={filters}
        platformLabel={platformLabel}
        onPlatformClick={() => setPlatformModalOpen(true)}
        onSortClick={() => setSortModalOpen(true)}
        onToggleCastilianText={() =>
          setFilters({ castilianText: !filters.castilianText })
        }
        onToggleCastilianVoice={() =>
          setFilters({ castilianVoice: !filters.castilianVoice })
        }
      />

      {error ? (
        <div className={styles.error}>
          <p>{error}</p>
          <button type="button" onClick={retry}>
            Reintentar
          </button>
        </div>
      ) : (
        <div className={styles.gridArea}>
          <div ref={scrollRef} className={styles.scroller}>
            <GameGrid items={items} loading={loading} />
          </div>
          <CatalogPagination
            page={page}
            pages={pages}
            total={total}
            loading={loading}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <PlatformPicker
        open={platformModalOpen}
        platforms={platforms}
        selected={filters.platform}
        onSelect={(slug) => setFilters({ platform: slug })}
        onClose={() => setPlatformModalOpen(false)}
      />
      <SortPicker
        open={sortModalOpen}
        selected={filters.sort}
        onSelect={(sort) => setFilters({ sort })}
        onClose={() => setSortModalOpen(false)}
      />
    </div>
  );
}
