import GameCard from './GameCard';
import type { BrowseGame } from '../types/catalog';
import styles from './GameGrid.module.css';

type GameGridProps = {
  items: BrowseGame[];
  loading: boolean;
};

export default function GameGrid({ items, loading }: GameGridProps) {
  if (loading && items.length === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.grid}>
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
        <p className={styles.loadingHint}>Cargando catálogo…</p>
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
        <GameCard key={`${game.platformSlug}-${game.slug}`} game={game} />
      ))}
    </div>
  );
}
