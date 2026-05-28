import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPlatforms } from '../../api/catalogApi';
import { rebuildAdminIndexes } from '../../api/adminApi';
import AdminFilterBar from '../../components/admin/AdminFilterBar';
import AdminGameGrid from '../../components/admin/AdminGameGrid';
import CatalogHeader from '../../components/CatalogHeader';
import CatalogPagination from '../../components/CatalogPagination';
import PlatformPicker from '../../components/PlatformPicker';
import SortPicker from '../../components/SortPicker';
import { useAdminBrowse } from '../../hooks/useAdminBrowse';
import { useAdminFilters } from '../../hooks/useAdminFilters';
import type { PlatformInfo } from '../../types/catalog';
import styles from './AdminCatalogPage.module.css';

export default function AdminCatalogPage() {
  const { filters, page, setFilters, setPage } = useAdminFilters();
  const [searchInput, setSearchInput] = useState(filters.q);
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
  const [platformModalOpen, setPlatformModalOpen] = useState(false);
  const [sortModalOpen, setSortModalOpen] = useState(false);
  const [rebuildStatus, setRebuildStatus] = useState<string | null>(null);
  const [rebuilding, setRebuilding] = useState(false);

  const browseFilters = useMemo(
    () => ({ ...filters, q: searchInput }),
    [filters, searchInput],
  );

  const { items, total, pages, loading, error, retry } = useAdminBrowse(
    browseFilters,
    page,
  );

  useEffect(() => {
    document.title = 'Admin catálogo — CoverLens';
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [
    page,
    filters.q,
    filters.platform,
    filters.sort,
    filters.missingCover,
    filters.missingDescription,
    filters.missingBarcode,
    filters.missingPublisher,
  ]);

  const platformLabel = useMemo(() => {
    if (!filters.platform) return 'Todas las plataformas';
    return platforms.find((p) => p.slug === filters.platform)?.name ?? filters.platform;
  }, [filters.platform, platforms]);

  const handleRebuild = async () => {
    setRebuilding(true);
    setRebuildStatus(null);
    try {
      const result = await rebuildAdminIndexes();
      setRebuildStatus(result.ok ? 'Indices regenerados correctamente.' : result.error ?? 'Error al regenerar indices.');
      if (result.ok) retry();
    } catch (err) {
      setRebuildStatus(err instanceof Error ? err.message : 'Error al regenerar indices.');
    } finally {
      setRebuilding(false);
    }
  };

  const hasIncompleteFilter =
    filters.missingCover ||
    filters.missingDescription ||
    filters.missingBarcode ||
    filters.missingPublisher;

  return (
    <div className={styles.page}>
      <div className={styles.adminBar}>
        <Link to="/" className={styles.adminLink}>
          ← Inicio
        </Link>
        <span className={styles.adminBadge}>Editor local</span>
        <button
          type="button"
          className={styles.rebuildBtn}
          onClick={() => void handleRebuild()}
          disabled={rebuilding}
        >
          {rebuilding ? 'Regenerando…' : 'Regenerar indices'}
        </button>
      </div>

      <CatalogHeader
        total={total || platforms.reduce((sum, p) => sum + p.count, 0)}
        search={searchInput}
        onSearchChange={setSearchInput}
        sticky={false}
        compact
      />

      {!hasIncompleteFilter ? (
        <p className={styles.hint}>
          Activa filtros como "Sin caratula" o "Sin descripcion" para localizar fichas incompletas.
        </p>
      ) : null}

      {rebuildStatus ? <p className={styles.status}>{rebuildStatus}</p> : null}

      <AdminFilterBar
        filters={filters}
        platformLabel={platformLabel}
        onPlatformClick={() => setPlatformModalOpen(true)}
        onSortClick={() => setSortModalOpen(true)}
        onToggle={(key) => setFilters({ [key]: !filters[key] })}
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
          <AdminGameGrid items={items} loading={loading} />
          <CatalogPagination
            page={page}
            pages={pages}
            total={total}
            loading={loading}
            onPageChange={setPage}
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
