import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { absoluteCoverUrl } from '../../api/config';
import { fetchAdminGame, saveAdminGame, uploadAdminCover } from '../../api/adminApi';
import { useAdminFilters } from '../../hooks/useAdminFilters';
import {
  editableToSaveRecord,
  gameDetailToEditable,
  type AdminEditableGame,
} from '../../types/admin';
import type { GameDetail } from '../../types/catalog';
import styles from './AdminGameEditPage.module.css';

export default function AdminGameEditPage() {
  const { platformSlug, slug } = useParams<{ platformSlug: string; slug: string }>();
  const { catalogUrl } = useAdminFilters();
  const [game, setGame] = useState<GameDetail | null>(null);
  const [form, setForm] = useState<AdminEditableGame | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!platformSlug || !slug) return;

    setLoading(true);
    setError(null);
    fetchAdminGame(platformSlug, slug)
      .then((data) => {
        setGame(data.record);
        setForm(gameDetailToEditable(data.record));
        const cover =
          absoluteCoverUrl(data.paths.cover ?? data.record.coverPath) ??
          (data.record.coverUrl ? data.record.coverUrl : null);
        setCoverPreview(cover);
        document.title = `Editar: ${data.record.title} — CoverLens Admin`;
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la ficha');
        document.title = 'Editar juego — CoverLens Admin';
      })
      .finally(() => setLoading(false));
  }, [platformSlug, slug]);

  const updateField = <K extends keyof AdminEditableGame>(key: K, value: AdminEditableGame[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleReset = () => {
    if (!game) return;
    setForm(gameDetailToEditable(game));
    setStatus('Cambios descartados.');
  };

  const handleSave = async () => {
    if (!platformSlug || !slug || !form) return;
    setSaving(true);
    setStatus(null);
    setError(null);
    try {
      const result = await saveAdminGame({
        platformSlug,
        slug,
        record: editableToSaveRecord(form),
        rebuildIndexes: true,
      });
      setGame(result.record);
      setForm(gameDetailToEditable(result.record));
      setStatus(
        result.rebuild?.ok === false
          ? 'Ficha guardada, pero falló la regeneración de índices.'
          : 'Ficha guardada e índices actualizados.',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleCoverSelect = async (file: File | null) => {
    if (!file || !platformSlug || !slug) return;
    setUploading(true);
    setStatus(null);
    setError(null);
    try {
      const preview = URL.createObjectURL(file);
      setCoverPreview(preview);
      const result = await uploadAdminCover(platformSlug, slug, file, true);
      setGame(result.record ?? game);
      if (result.record) {
        setForm(gameDetailToEditable(result.record));
        setCoverPreview(absoluteCoverUrl(result.record.coverPath));
      }
      setStatus('Portada subida correctamente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir la portada');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Cargando ficha…</div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className={styles.page}>
        <Link to={catalogUrl} className={styles.back}>
          ← Volver al catálogo admin
        </Link>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  if (!form || !platformSlug || !slug) {
    return null;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to={catalogUrl} className={styles.back}>
          ← Catálogo admin
        </Link>
        <div className={styles.actions}>
          <button type="button" className={styles.secondaryBtn} onClick={handleReset}>
            Descartar
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => void handleSave()}
            disabled={saving || uploading}
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </header>

      {status ? <p className={styles.status}>{status}</p> : null}
      {error ? <p className={styles.errorInline}>{error}</p> : null}

      <div className={styles.layout}>
        <aside className={styles.coverCol}>
          {coverPreview ? (
            <img src={coverPreview} alt="" className={styles.cover} />
          ) : (
            <div className={styles.coverPlaceholder}>SIN CARÁTULA</div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={styles.fileInput}
            onChange={(e) => void handleCoverSelect(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            className={styles.uploadBtn}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Subiendo…' : 'Subir carátula'}
          </button>
          <Link
            to={`/juego/${platformSlug}/${slug}`}
            className={styles.publicLink}
            target="_blank"
            rel="noreferrer"
          >
            Ver ficha pública
          </Link>
        </aside>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <label className={styles.field}>
            <span>Título</span>
            <input
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              required
            />
          </label>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Plataforma</span>
              <input value={game?.platform ?? platformSlug} disabled />
            </label>
            <label className={styles.field}>
              <span>Slug</span>
              <input value={slug} disabled />
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Género</span>
              <input value={form.genre} onChange={(e) => updateField('genre', e.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Año</span>
              <input
                value={form.releaseYear}
                onChange={(e) => updateField('releaseYear', e.target.value)}
                inputMode="numeric"
              />
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Desarrollador</span>
              <input
                value={form.developer}
                onChange={(e) => updateField('developer', e.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span>Editor</span>
              <input
                value={form.publisher}
                onChange={(e) => updateField('publisher', e.target.value)}
              />
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Barcode</span>
              <input value={form.barcode} onChange={(e) => updateField('barcode', e.target.value)} />
            </label>
            <label className={styles.field}>
              <span>Valor EUR</span>
              <input
                value={form.marketValueEur}
                onChange={(e) => updateField('marketValueEur', e.target.value)}
                inputMode="decimal"
              />
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Rating (0-100)</span>
              <input
                value={form.rating}
                onChange={(e) => updateField('rating', e.target.value)}
                inputMode="decimal"
              />
            </label>
            <label className={styles.field}>
              <span>Fecha lanzamiento</span>
              <input
                value={form.releaseDate}
                onChange={(e) => updateField('releaseDate', e.target.value)}
                placeholder="YYYY-MM-DD"
              />
            </label>
          </div>

          <label className={styles.field}>
            <span>Descripción</span>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={8}
            />
          </label>

          <div className={styles.checks}>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={form.castilianText}
                onChange={(e) => updateField('castilianText', e.target.checked)}
              />
              Texto en castellano
            </label>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={form.castilianVoice}
                onChange={(e) => updateField('castilianVoice', e.target.checked)}
              />
              Voz en castellano
            </label>
          </div>

          <label className={styles.field}>
            <span>Fuentes (JSON)</span>
            <textarea
              value={form.sourcesRaw}
              onChange={(e) => updateField('sourcesRaw', e.target.value)}
              rows={4}
              spellCheck={false}
            />
          </label>
        </form>
      </div>
    </div>
  );
}
