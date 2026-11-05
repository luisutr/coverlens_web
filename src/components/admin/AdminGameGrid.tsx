import AdminGameCard from './AdminGameCard';
import type { AdminBrowseGame } from '../../types/admin';
import styles from './AdminGameGrid.module.css';

type AdminGameGridProps = {
  items: AdminBrowseGame[];
  loading: boolean;
  quickCoverMode?: boolean;
  bulkDeleteMode?: boolean;
  bulkSelectMode?: boolean;
  selectedKeys?: Set<string>;
  onToggleSelect?: (index: number, shiftKey: boolean) => void;
  onCoverUpdated?: (game: AdminBrowseGame, coverUrl: string) => void;
  onQuickCoverMessage?: (message: string, isError?: boolean) => void;
};

export default function AdminGameGrid({
  items,
  loading,
  quickCoverMode = false,
  bulkDeleteMode = false,
  bulkSelectMode = false,
  selectedKeys,
  onToggleSelect,
  onCoverUpdated,
  onQuickCoverMessage,
}: AdminGameGridProps) {
  if (loading && items.length === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.grid}>
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
        <p className={styles.loadingHint}>Cargando catálogo admin…</p>
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No hay juegos que coincidan con los filtros.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid} aria-busy={loading}>
      {items.map((game, index) => {
        const key = `${game.platformSlug}/${game.slug}`;
        return (
          <AdminGameCard
            key={key}
            game={game}
            index={index}
            quickCoverMode={quickCoverMode}
            bulkDeleteMode={bulkDeleteMode}
            bulkSelectMode={bulkSelectMode}
            selected={selectedKeys?.has(key) ?? false}
            onToggleSelect={onToggleSelect}
            onCoverUpdated={onCoverUpdated}
            onQuickCoverMessage={onQuickCoverMessage}
          />
        );
      })}
    </div>
  );
}
