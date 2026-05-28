import { Link } from 'react-router-dom';
import { formatMoneyEur } from '../utils/format';
import type { BrowseGame } from '../types/catalog';
import styles from './GameCard.module.css';

type GameCardProps = {
  game: BrowseGame;
};

export default function GameCard({ game }: GameCardProps) {
  const valueLabel = formatMoneyEur(game.marketValueEUR);

  return (
    <Link
      to={`/juego/${game.platformSlug}/${game.slug}`}
      className={styles.card}
      data-testid="game-card"
      aria-label={`Abrir ${game.title}`}
    >
      <div className={styles.coverWrap}>
        {game.coverUrl ? (
          <img src={game.coverUrl} alt="" className={styles.cover} loading="lazy" />
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon} aria-hidden>
              🎮
            </span>
            <span className={styles.placeholderText}>SIN CARÁTULA</span>
          </div>
        )}
      </div>
      <h3 className={styles.title}>{game.title}</h3>
      <p className={styles.platform}>{game.platform}</p>
      {valueLabel ? <p className={styles.value}>{valueLabel}</p> : null}
    </Link>
  );
}
