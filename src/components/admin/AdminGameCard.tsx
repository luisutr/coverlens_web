import { useEffect, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { uploadAdminCover } from '../../api/adminApi';
import { coverDisplayUrl } from '../../api/config';
import { openGoogleImageSearch, readImageFileFromClipboard } from '../../utils/coverClipboard';
import { applyAdminCoverBump, bumpAdminCoverCache } from '../../utils/adminCoverBump';
import { formatMoneyEur } from '../../utils/format';
import type { AdminBrowseGame } from '../../types/admin';
import styles from './AdminGameCard.module.css';

type AdminGameCardProps = {
  game: AdminBrowseGame;
  index?: number;
  quickCoverMode?: boolean;
  bulkDeleteMode?: boolean;
  bulkSelectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (index: number, shiftKey: boolean) => void;
  onCoverUpdated?: (game: AdminBrowseGame, coverUrl: string) => void;
  onQuickCoverMessage?: (message: string, isError?: boolean) => void;
};

function missingTags(game: AdminBrowseGame): string[] {
  const tags: string[] = [];
  if (game.missingCover) tags.push('Sin carátula');
  if (game.missingDescription) tags.push('Sin descripción');
  if (game.missingBarcode) tags.push('Sin barcode');
  if (game.missingPublisher) tags.push('Sin editor');
  if (game.physicalRelease === false) tags.push('Digital');
  return tags;
}

function GameMeta({
  game,
  valueLabel,
  tags,
}: {
  game: AdminBrowseGame;
  valueLabel: string | null;
  tags: string[];
}) {
  return (
    <>
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
    </>
  );
}

function CoverVisual({ coverUrl, uploading }: { coverUrl: string | null; uploading: boolean }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [coverUrl]);

  return (
    <>
      {coverUrl && !imgError ? (
        <img
          key={coverUrl}
          src={coverUrl}
          alt=""
          className={styles.cover}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={styles.placeholder}>
          <span className={styles.placeholderIcon} aria-hidden>
            🎮
          </span>
          <span className={styles.placeholderText}>SIN CARÁTULA</span>
        </div>
      )}
      {uploading ? <div className={styles.uploadOverlay}>Subiendo…</div> : null}
    </>
  );
}

export default function AdminGameCard({
  game,
  index = 0,
  quickCoverMode = false,
  bulkDeleteMode = false,
  bulkSelectMode = false,
  selected = false,
  onToggleSelect,
  onCoverUpdated,
  onQuickCoverMessage,
}: AdminGameCardProps) {
  const [uploading, setUploading] = useState(false);
  const [localCoverUrl, setLocalCoverUrl] = useState<string | null>(game.coverUrl);

  useEffect(() => {
    setLocalCoverUrl(game.coverUrl);
  }, [game.coverUrl, game.platformSlug, game.slug]);

  const valueLabel = formatMoneyEur(game.marketValueEUR);
  const tags = missingTags(game);
  const editUrl = `/admin/juego/${game.platformSlug}/${game.slug}`;
  const coverUrl = applyAdminCoverBump(
    localCoverUrl ?? game.coverUrl,
    game.platformSlug,
    game.slug,
  );

  const handleSearch = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    openGoogleImageSearch(game.title, game.platform);
    onQuickCoverMessage?.(
      `Google Imágenes abierto para «${game.title}». Copia una imagen y pulsa la carátula para pegarla.`,
    );
  };

  const handlePasteCover = async (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (uploading) return;

    setUploading(true);
    try {
      const file = await readImageFileFromClipboard();
      if (!file) {
        onQuickCoverMessage?.(
          'No hay imagen en el portapapeles. En Google: clic derecho → Copiar imagen, luego pulsa aquí.',
          true,
        );
        return;
      }

      const result = await uploadAdminCover(game.platformSlug, game.slug, file, true);
      const bump = result.coverVersion ?? Date.now();
      bumpAdminCoverCache(game.platformSlug, game.slug, bump);
      const nextCover = coverDisplayUrl(result.record?.coverPath ?? null, bump);

      if (nextCover) {
        setLocalCoverUrl(nextCover);
      }

      const updated: AdminBrowseGame = {
        ...game,
        coverUrl: nextCover ?? game.coverUrl,
        missingCover: false,
      };
      if (nextCover) {
        onCoverUpdated?.(updated, nextCover);
      }

      const rebuildFailed = result.rebuild?.ok === false;
      onQuickCoverMessage?.(
        rebuildFailed
          ? 'Portada guardada. Regenera índices si no aparece en el catálogo público.'
          : `Portada actualizada: ${game.title}`,
      );
    } catch (err) {
      onQuickCoverMessage?.(
        err instanceof Error ? err.message : 'No se pudo guardar la portada',
        true,
      );
    } finally {
      setUploading(false);
    }
  };

  const handleBulkClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onToggleSelect?.(index, event.shiftKey);
  };

  if (bulkSelectMode || bulkDeleteMode) {
    return (
      <button
        type="button"
        className={`${styles.card} ${styles.cardBulk} ${selected ? styles.cardSelected : ''}`}
        data-testid="admin-game-card"
        aria-pressed={selected}
        aria-label={`${selected ? 'Deseleccionar' : 'Seleccionar'} ${game.title}`}
        onClick={handleBulkClick}
      >
        <div className={styles.coverWrap}>
          <span className={styles.selectMark} aria-hidden>
            {selected ? '✓' : ''}
          </span>
          <CoverVisual coverUrl={coverUrl} uploading={false} />
        </div>
        <GameMeta game={game} valueLabel={valueLabel} tags={tags} />
      </button>
    );
  }

  if (!quickCoverMode) {
    return (
      <Link
        to={editUrl}
        className={styles.card}
        data-testid="admin-game-card"
        aria-label={`Editar ${game.title}`}
      >
        <div className={styles.coverWrap}>
          <CoverVisual coverUrl={coverUrl} uploading={false} />
        </div>
        <GameMeta game={game} valueLabel={valueLabel} tags={tags} />
      </Link>
    );
  }

  return (
    <article
      className={`${styles.card} ${styles.cardQuick}`}
      data-testid="admin-game-card"
      aria-label={`${game.title} — modo portada rápida`}
    >
      <div className={styles.coverWrap}>
        <button
          type="button"
          className={styles.searchBtn}
          onClick={handleSearch}
          title="Buscar en Google Imágenes"
          aria-label={`Buscar carátula de ${game.title}`}
        >
          🔍
        </button>
        <button
          type="button"
          className={styles.coverPasteBtn}
          onClick={(e) => void handlePasteCover(e)}
          disabled={uploading}
          title="Pegar portada copiada (Copiar imagen en Google y pulsar aquí)"
          aria-label={`Pegar portada para ${game.title}`}
        >
          <CoverVisual coverUrl={coverUrl} uploading={uploading} />
          <span className={styles.pasteHint}>Pulsa para pegar portada</span>
        </button>
      </div>
      <Link to={editUrl} className={styles.metaLink}>
        <GameMeta game={game} valueLabel={valueLabel} tags={tags} />
      </Link>
    </article>
  );
}