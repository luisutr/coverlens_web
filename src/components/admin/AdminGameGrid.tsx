import AdminGameCard from './AdminGameCard';
import type { AdminBrowseGame } from '../../types/admin';
import styles from './AdminGameGrid.module.css';

type AdminGameGridProps = {
  items: AdminBrowseGame[];
  loading: boolean;
};

export default function AdminGameGrid({ items, loading }: AdminGameGridProps) {
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
      {items.map((game) => (
        <AdminGameCard key={`${game.platformSlug}-${game.slug}`} game={game} />
      ))}
    </div>
  );
}
