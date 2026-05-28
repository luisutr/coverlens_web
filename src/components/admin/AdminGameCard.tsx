import { Link } from 'react-router-dom';
import { formatMoneyEur } from '../../utils/format';
import type { AdminBrowseGame } from '../../types/admin';
import styles from './AdminGameCard.module.css';

type AdminGameCardProps = {
  game: AdminBrowseGame;
};

function missingTags(game: AdminBrowseGame): string[] {
  const tags: string[] = [];
  if (game.missingCover) tags.push('Sin carátula');
  if (game.missingDescription) tags.push('Sin descripción');
  if (game.missingBarcode) tags.push('Sin barcode');
  if (game.missingPublisher) tags.push('Sin editor');
  return tags;
}

export default function AdminGameCard({ game }: AdminGameCardProps) {
  const valueLabel = formatMoneyEur(game.marketValueEUR);
  const tags = missingTags(game);

  return (
    <Link
      to={`/admin/juego/${game.platformSlug}/${game.slug}`}
      className={styles.card}
      data-testid="admin-game-card"
      aria-label={`Editar ${game.title}`}
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
      {tags.length > 0 ? (
        <div className={styles.tags}>
          {tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  );
}
