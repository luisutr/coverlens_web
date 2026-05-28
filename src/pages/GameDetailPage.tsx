import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { absoluteCoverUrl } from '../api/config';
import { fetchGameDetail } from '../api/catalogApi';
import { useCatalogFilters } from '../hooks/useCatalogFilters';
import { formatLanguages, formatMoneyEur } from '../utils/format';
import type { GameDetail } from '../types/catalog';
import styles from './GameDetailPage.module.css';

export default function GameDetailPage() {
  const { platformSlug, slug } = useParams<{ platformSlug: string; slug: string }>();
  const { catalogUrl } = useCatalogFilters();
  const [game, setGame] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!platformSlug || !slug) return;

    setLoading(true);
    setError(null);
    fetchGameDetail(platformSlug, slug)
      .then((data) => {
        setGame(data);
        document.title = `${data.title} — CoverLens`;
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la ficha');
        document.title = 'Juego — CoverLens';
      })
      .finally(() => setLoading(false));
  }, [platformSlug, slug]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Cargando ficha…</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className={styles.page}>
        <Link to={catalogUrl} className={styles.back}>
          ← Volver al catálogo
        </Link>
        <p className={styles.error}>{error ?? 'Juego no encontrado'}</p>
      </div>
    );
  }

  const coverUrl = absoluteCoverUrl(game.coverPath);
  const valueLabel = formatMoneyEur(game.marketValue?.EUR);
  const textLangs =
    formatLanguages(game.textLanguages) ??
    (game.localization?.castilian?.text ? 'es (texto)' : null);
  const voiceLangs =
    formatLanguages(game.voiceLanguages) ??
    (game.localization?.castilian?.voices ? 'es (voz)' : null);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to={catalogUrl} className={styles.back}>
          ← Catálogo
        </Link>
      </header>

      <article className={styles.content}>
        <div className={styles.coverCol}>
          {coverUrl ? (
            <img src={coverUrl} alt="" className={styles.cover} />
          ) : (
            <div className={styles.coverPlaceholder}>SIN CARÁTULA</div>
          )}
        </div>

        <div className={styles.infoCol}>
          <h1 className={styles.title}>{game.title}</h1>
          <p className={styles.platform}>{game.platform}</p>

          <dl className={styles.meta}>
            {game.releaseYear ? (
              <>
                <dt>Año</dt>
                <dd>{game.releaseYear}</dd>
              </>
            ) : null}
            {game.genre ? (
              <>
                <dt>Género</dt>
                <dd>{game.genre}</dd>
              </>
            ) : null}
            {game.developer ? (
              <>
                <dt>Desarrollador</dt>
                <dd>{game.developer}</dd>
              </>
            ) : null}
            {game.publisher ? (
              <>
                <dt>Editor</dt>
                <dd>{game.publisher}</dd>
              </>
            ) : null}
            {valueLabel ? (
              <>
                <dt>Valor mercado</dt>
                <dd className={styles.value}>{valueLabel}</dd>
              </>
            ) : null}
            {game.barcode ? (
              <>
                <dt>Código de barras</dt>
                <dd>{game.barcode}</dd>
              </>
            ) : null}
            {textLangs ? (
              <>
                <dt>Idiomas texto</dt>
                <dd>{textLangs}</dd>
              </>
            ) : null}
            {voiceLangs ? (
              <>
                <dt>Idiomas voz</dt>
                <dd>{voiceLangs}</dd>
              </>
            ) : null}
          </dl>

          {game.description ? (
            <section className={styles.description}>
              <h2>Descripción</h2>
              <p>{game.description}</p>
            </section>
          ) : null}
        </div>
      </article>
    </div>
  );
}
