import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPlatforms } from '../../api/catalogApi';
import { createAdminGame, deleteAdminGames, enrichAdminGame, rebuildAdminIndexes, setPhysicalFormatBatch } from '../../api/adminApi';
import { getBulkDeleteMode, setBulkDeleteMode } from '../../api/adminBulkDelete';
import { getBulkEnrichMode, MAX_BULK_ENRICH, setBulkEnrichMode } from '../../api/adminBulkEnrich';
import { getBulkFormatMode, MAX_BULK_FORMAT, setBulkFormatMode } from '../../api/adminBulkFormat';
import type { BulkPhysicalFormat } from '../../api/adminBulkFormat';
import { adminGateRequired, clearAdminToken } from '../../api/adminAuth';
import { getQuickCoverMode, setQuickCoverMode } from '../../api/adminQuickCover';
import AdminBulkEnrichConfirmDialog from '../../components/admin/AdminBulkEnrichConfirmDialog';
import AdminBulkFormatDialog from '../../components/admin/AdminBulkFormatDialog';
import AdminCreateGameDialog from '../../components/admin/AdminCreateGameDialog';
import AdminDeleteConfirmDialog from '../../components/admin/AdminDeleteConfirmDialog';
import AdminFilterBar from '../../components/admin/AdminFilterBar';
import AdminGameGrid from '../../components/admin/AdminGameGrid';
import CatalogHeader from '../../components/CatalogHeader';
import CatalogPagination from '../../components/CatalogPagination';
import PlatformPicker from '../../components/PlatformPicker';
import SortPicker from '../../components/SortPicker';
import { useAdminBrowse } from '../../hooks/useAdminBrowse';
import { useAdminFilters } from '../../hooks/useAdminFilters';
import { adminGameKey, parseAdminGameKey } from '../../utils/adminGameKey';
import type { AdminBrowseGame } from '../../types/admin';
import { enrichedRecordToBrowsePatch } from '../../types/admin';
import type { PlatformInfo } from '../../types/catalog';
import styles from './AdminCatalogPage.module.css';

export default function AdminCatalogPage() {
  const navigate = useNavigate();
  const { filters, page, setFilters, setPage } = useAdminFilters();
  const [searchInput, setSearchInput] = useState(filters.q);
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
  const [platformModalOpen, setPlatformModalOpen] = useState(false);
  const [sortModalOpen, setSortModalOpen] = useState(false);
  const [rebuildStatus, setRebuildStatus] = useState<string | null>(null);
  const [rebuilding, setRebuilding] = useState(false);
  const [quickCoverMode, setQuickCoverModeState] = useState(getQuickCoverMode);
  const [bulkDeleteMode, setBulkDeleteModeState] = useState(getBulkDeleteMode);
  const [bulkEnrichMode, setBulkEnrichModeState] = useState(getBulkEnrichMode);
  const [bulkFormatMode, setBulkFormatModeState] = useState(getBulkFormatMode);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [enrichDialogOpen, setEnrichDialogOpen] = useState(false);
  const [formatDialogOpen, setFormatDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [formatting, setFormatting] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState<{
    current: number;
    total: number;
    title: string;
  } | null>(null);
  const lastSelectedIndexRef = useRef<number | null>(null);
  const [quickCoverMessage, setQuickCoverMessage] = useState<string | null>(null);
  const [quickCoverError, setQuickCoverError] = useState(false);

  const browseFilters = useMemo(
    () => ({ ...filters, q: searchInput }),
    [filters, searchInput],
  );

  const { items, total, pages, loading, error, retry, patchGame, removeGames } = useAdminBrowse(
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
    filters.physicalOnly,
    filters.digitalOnly,
  ]);

  const bulkSelectMode = bulkDeleteMode || bulkEnrichMode || bulkFormatMode;

  const disableOtherBulkModes = (except?: 'delete' | 'enrich' | 'format') => {
    setQuickCoverModeState(false);
    setQuickCoverMode(false);
    setQuickCoverMessage(null);
    if (except !== 'delete') {
      setBulkDeleteModeState(false);
      setBulkDeleteMode(false);
    }
    if (except !== 'enrich') {
      setBulkEnrichModeState(false);
      setBulkEnrichMode(false);
    }
    if (except !== 'format') {
      setBulkFormatModeState(false);
      setBulkFormatMode(false);
    }
  };

  useEffect(() => {
    if (!bulkSelectMode) {
      setSelectedKeys(new Set());
      lastSelectedIndexRef.current = null;
    }
  }, [bulkSelectMode]);

  useEffect(() => {
    setSelectedKeys(new Set());
    lastSelectedIndexRef.current = null;
  }, [page]);

  const platformLabel = useMemo(() => {
    if (!filters.platform) return 'Todas las plataformas';
    return platforms.find((p) => p.slug === filters.platform)?.name ?? filters.platform;
  }, [filters.platform, platforms]);

  const selectedGames = useMemo(() => {
    return items.filter((game) => selectedKeys.has(adminGameKey(game)));
  }, [items, selectedKeys]);

  const handleLogout = () => {
    clearAdminToken();
    navigate('/admin/login', { replace: true });
  };

  const toggleQuickCoverMode = () => {
    const next = !quickCoverMode;
    if (next) {
      disableOtherBulkModes();
    }
    setQuickCoverModeState(next);
    setQuickCoverMode(next);
    setQuickCoverMessage(
      next
        ? 'Modo portada rápida: 🔍 abre Google Imágenes; pulsa la carátula para pegar la imagen copiada.'
        : null,
    );
    setQuickCoverError(false);
  };

  const toggleBulkDeleteMode = () => {
    const next = !bulkDeleteMode;
    if (next) {
      disableOtherBulkModes('delete');
    }
    setBulkDeleteModeState(next);
    setBulkDeleteMode(next);
  };

  const toggleBulkEnrichMode = () => {
    const next = !bulkEnrichMode;
    if (next) {
      disableOtherBulkModes('enrich');
    }
    setBulkEnrichModeState(next);
    setBulkEnrichMode(next);
  };

  const toggleBulkFormatMode = () => {
    const next = !bulkFormatMode;
    if (next) {
      disableOtherBulkModes('format');
    }
    setBulkFormatModeState(next);
    setBulkFormatMode(next);
  };

  const handleToggleSelect = useCallback(
    (index: number, shiftKey: boolean) => {
      const game = items[index];
      if (!game) return;
      const key = adminGameKey(game);

      setSelectedKeys((prev) => {
        const next = new Set(prev);
        if (shiftKey && lastSelectedIndexRef.current !== null) {
          const from = Math.min(lastSelectedIndexRef.current, index);
          const to = Math.max(lastSelectedIndexRef.current, index);
          for (let i = from; i <= to; i++) {
            const item = items[i];
            if (item) next.add(adminGameKey(item));
          }
        } else if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
      lastSelectedIndexRef.current = index;
    },
    [items],
  );

  const handleSelectAllPage = () => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      for (const game of items) {
        next.add(adminGameKey(game));
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedKeys(new Set());
    lastSelectedIndexRef.current = null;
  };

  const handleQuickCoverMessage = (message: string, isError = false) => {
    setQuickCoverMessage(message);
    setQuickCoverError(isError);
  };

  const handleCoverUpdated = (game: AdminBrowseGame, coverUrl: string) => {
    patchGame(game.platformSlug, game.slug, { coverUrl, missingCover: false });
  };

  const handleConfirmBulkFormat = async (format: BulkPhysicalFormat) => {
    if (selectedKeys.size > MAX_BULK_FORMAT) {
      setQuickCoverMessage(`Máximo ${MAX_BULK_FORMAT} fichas por tanda. Reduce la selección.`);
      setQuickCoverError(true);
      setFormatDialogOpen(false);
      return;
    }

    const games = [...selectedKeys]
      .map(parseAdminGameKey)
      .filter((g): g is NonNullable<typeof g> => g !== null);
    if (games.length === 0) return;

    setFormatting(true);
    try {
      const result = await setPhysicalFormatBatch(games, format, true);
      for (const row of result.updated) {
        patchGame(row.platformSlug, row.slug, {
          physicalRelease: row.physicalRelease ?? null,
        });
      }
      setSelectedKeys(new Set());
      setFormatDialogOpen(false);

      const label =
        format === 'physical' ? 'físico' : format === 'digital' ? 'digital' : 'sin clasificar';
      const nf = result.notFound.length;
      const ff = result.failed.length;
      let msg = `Formato ${label}: ${result.updated.length} ficha(s) actualizada(s).`;
      if (nf > 0) msg += ` ${nf} no encontrada(s).`;
      if (ff > 0) msg += ` ${ff} error(es).`;
      setQuickCoverMessage(msg);
      setQuickCoverError(ff > 0);
      if (result.rebuild?.ok === false) {
        setQuickCoverMessage(`${msg} Revisa «Regenerar índices».`);
        setQuickCoverError(true);
      }
      retry();
    } catch (err) {
      setQuickCoverMessage(err instanceof Error ? err.message : 'No se pudo actualizar el formato');
      setQuickCoverError(true);
    } finally {
      setFormatting(false);
    }
  };

  const handleConfirmBulkEnrich = async () => {
    if (selectedKeys.size > MAX_BULK_ENRICH) {
      setQuickCoverMessage(`Máximo ${MAX_BULK_ENRICH} fichas por autocompletar. Reduce la selección.`);
      setQuickCoverError(true);
      setEnrichDialogOpen(false);
      return;
    }

    const games = [...selectedKeys]
      .map(parseAdminGameKey)
      .filter((g): g is NonNullable<typeof g> => g !== null);
    if (games.length === 0) return;

    setEnriching(true);
    setEnrichProgress(null);
    let changed = 0;
    let unchanged = 0;
    let failed = 0;
    const failedTitles: string[] = [];

    try {
      for (let i = 0; i < games.length; i += 1) {
        const game = games[i];
        const sample = selectedGames.find(
          (g) => g.platformSlug === game.platformSlug && g.slug === game.slug,
        );
        const title = sample?.title ?? game.slug;
        setEnrichProgress({ current: i + 1, total: games.length, title });

        try {
          const result = await enrichAdminGame({
            platformSlug: game.platformSlug,
            slug: game.slug,
            apply: true,
            rebuildIndexes: false,
          });
          if (result.changed && result.record) {
            changed += 1;
            patchGame(
              game.platformSlug,
              game.slug,
              enrichedRecordToBrowsePatch(result.record),
            );
          } else {
            unchanged += 1;
          }
        } catch {
          failed += 1;
          failedTitles.push(title);
        }
      }

      const rebuild = await rebuildAdminIndexes();
      setSelectedKeys(new Set());
      setEnrichDialogOpen(false);

      const parts = [`${changed} rellenada(s)`, `${unchanged} sin cambios`];
      if (failed > 0) parts.push(`${failed} error(es)`);
      setQuickCoverMessage(`Autocompletar lote: ${parts.join(', ')}.`);
      setQuickCoverError(failed > 0);
      if (failedTitles.length > 0) {
        setQuickCoverMessage(
          `Autocompletar lote: ${parts.join(', ')}. Fallos: ${failedTitles.slice(0, 3).join(', ')}${failedTitles.length > 3 ? '…' : ''}.`,
        );
      }
      if (rebuild.ok === false) {
        setQuickCoverMessage((prev) => `${prev ?? ''} Índices: revisa «Regenerar índices».`.trim());
        setQuickCoverError(true);
      }
      retry();
    } catch (err) {
      setQuickCoverMessage(err instanceof Error ? err.message : 'Error en autocompletar lote');
      setQuickCoverError(true);
    } finally {
      setEnriching(false);
      setEnrichProgress(null);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedKeys.size > 200) {
      setQuickCoverMessage('Máximo 200 fichas por borrado. Reduce la selección.');
      setQuickCoverError(true);
      setDeleteDialogOpen(false);
      return;
    }

    const games = [...selectedKeys]
      .map(parseAdminGameKey)
      .filter((g): g is NonNullable<typeof g> => g !== null);
    if (games.length === 0) return;

    setDeleting(true);
    try {
      const result = await deleteAdminGames(games, true);
      removeGames(result.deleted);
      setSelectedKeys(new Set());
      setDeleteDialogOpen(false);
      const n = result.deleted.length;
      const nf = result.notFound.length;
      setQuickCoverMessage(
        nf > 0
          ? `Eliminadas ${n} ficha(s). ${nf} ya no existían.`
          : `Eliminadas ${n} ficha(s) correctamente.`,
      );
      setQuickCoverError(false);
      if (result.rebuild?.ok === false) {
        setQuickCoverMessage('Fichas eliminadas, pero falló la regeneración de índices.');
        setQuickCoverError(true);
      }
      retry();
    } catch (err) {
      setQuickCoverMessage(err instanceof Error ? err.message : 'No se pudieron eliminar las fichas');
      setQuickCoverError(true);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateGame = async (platformSlug: string, slug: string, title: string) => {
    setCreating(true);
    setCreateError(null);
    try {
      const result = await createAdminGame({ platformSlug, slug, title, rebuildIndexes: true });
      setCreateDialogOpen(false);
      navigate(`/admin/juego/${platformSlug}/${result.record.slug ?? slug}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'No se pudo crear la ficha');
    } finally {
      setCreating(false);
    }
  };

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
    filters.missingPublisher ||
    filters.physicalOnly ||
    filters.digitalOnly;

  return (
    <div className={styles.page}>
      <div className={styles.adminBar}>
        <Link to="/" className={styles.adminLink}>
          ← Inicio
        </Link>
        <span className={styles.adminBadge}>Editor catálogo</span>
        {adminGateRequired() ? (
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            Cerrar sesión
          </button>
        ) : null}
        <label className={styles.quickToggle}>
          <input type="checkbox" checked={quickCoverMode} onChange={toggleQuickCoverMode} />
          Portada rápida
        </label>
        <label className={styles.bulkToggle}>
          <input type="checkbox" checked={bulkDeleteMode} onChange={toggleBulkDeleteMode} />
          Borrado múltiple
        </label>
        <label className={styles.bulkEnrichToggle}>
          <input type="checkbox" checked={bulkEnrichMode} onChange={toggleBulkEnrichMode} />
          Autocompletar lote
        </label>
        <label className={styles.bulkFormatToggle}>
          <input type="checkbox" checked={bulkFormatMode} onChange={toggleBulkFormatMode} />
          Formato lote
        </label>
        <button
          type="button"
          className={styles.newGameBtn}
          onClick={() => {
            setCreateError(null);
            setCreateDialogOpen(true);
          }}
        >
          + Nueva ficha
        </button>
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

      {bulkDeleteMode ? (
        <p className={styles.bulkHint}>
          Clic para seleccionar · Shift+clic para rango · Máx. 200 por borrado
        </p>
      ) : null}

      {bulkEnrichMode ? (
        <p className={styles.bulkEnrichHint}>
          Selecciona fichas incompletas · Autocompletar guarda en disco · Máx. {MAX_BULK_ENRICH} ·
          ~30 s/ficha
        </p>
      ) : null}

      {bulkFormatMode ? (
        <p className={styles.bulkFormatHint}>
          Marca fichas como físico, digital o sin clasificar · Máx. {MAX_BULK_FORMAT} · Clic ·
          Shift+clic rango
        </p>
      ) : null}

      {selectedKeys.size > 0 && bulkSelectMode ? (
        <div
          className={
            bulkEnrichMode && !bulkDeleteMode && !bulkFormatMode
              ? styles.bulkBarEnrich
              : bulkFormatMode && !bulkDeleteMode && !bulkEnrichMode
                ? styles.bulkBarFormat
                : styles.bulkBar
          }
        >
          <span>{selectedKeys.size} seleccionada(s)</span>
          <button type="button" className={styles.bulkLinkBtn} onClick={handleSelectAllPage}>
            Toda la página
          </button>
          <button type="button" className={styles.bulkLinkBtn} onClick={handleClearSelection}>
            Limpiar
          </button>
          {bulkFormatMode ? (
            <button
              type="button"
              className={styles.bulkFormatBtn}
              onClick={() => setFormatDialogOpen(true)}
              disabled={formatting}
            >
              Establecer formato…
            </button>
          ) : null}
          {bulkEnrichMode ? (
            <button
              type="button"
              className={styles.bulkEnrichBtn}
              onClick={() => setEnrichDialogOpen(true)}
              disabled={enriching}
            >
              Autocompletar selección…
            </button>
          ) : null}
          {bulkDeleteMode ? (
            <button
              type="button"
              className={styles.bulkDeleteBtn}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Eliminar selección…
            </button>
          ) : null}
        </div>
      ) : null}

      {quickCoverMessage ? (
        <p className={quickCoverError ? styles.quickCoverError : styles.quickCoverHint}>
          {quickCoverMessage}
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
          <AdminGameGrid
            items={items}
            loading={loading}
            quickCoverMode={quickCoverMode}
            bulkDeleteMode={bulkDeleteMode}
            bulkSelectMode={bulkSelectMode}
            selectedKeys={selectedKeys}
            onToggleSelect={handleToggleSelect}
            onCoverUpdated={handleCoverUpdated}
            onQuickCoverMessage={handleQuickCoverMessage}
          />
          <CatalogPagination
            page={page}
            pages={pages}
            total={total}
            loading={loading}
            onPageChange={setPage}
          />
        </div>
      )}

      <AdminBulkFormatDialog
        open={formatDialogOpen}
        count={selectedKeys.size}
        sampleTitles={selectedGames.map((g) => g.title)}
        loading={formatting}
        onClose={() => !formatting && setFormatDialogOpen(false)}
        onConfirm={handleConfirmBulkFormat}
      />

      <AdminBulkEnrichConfirmDialog
        open={enrichDialogOpen}
        count={selectedKeys.size}
        sampleTitles={selectedGames.map((g) => g.title)}
        loading={enriching}
        progress={enrichProgress}
        onClose={() => !enriching && setEnrichDialogOpen(false)}
        onConfirm={handleConfirmBulkEnrich}
      />

      <AdminDeleteConfirmDialog
        open={deleteDialogOpen}
        count={selectedKeys.size}
        sampleTitles={selectedGames.map((g) => g.title)}
        loading={deleting}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        onConfirm={handleConfirmBulkDelete}
      />

      <AdminCreateGameDialog
        open={createDialogOpen}
        platforms={platforms}
        defaultPlatformSlug={filters.platform ?? ''}
        loading={creating}
        error={createError}
        onClose={() => !creating && setCreateDialogOpen(false)}
        onConfirm={handleCreateGame}
      />

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
