import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { coverDisplayUrl } from '../../api/config';
import { fetchPlatforms } from '../../api/catalogApi';
import { deleteAdminGames, enrichAdminGame, fetchAdminGame, saveAdminGame, uploadAdminCover } from '../../api/adminApi';
import { bumpAdminCoverCache } from '../../utils/adminCoverBump';
import AdminDeleteConfirmDialog from '../../components/admin/AdminDeleteConfirmDialog';
import { useAdminFilters } from '../../hooks/useAdminFilters';
import {
  applyEnrichToForm,
  editableToSaveRecord,
  formatAdminRebuildNote,
  formatEnrichFilledFields,
  gameDetailToEditable,
  titleToSlug,
  type AdminEditableGame,
} from '../../types/admin';
import type { GameDetail, PlatformInfo } from '../../types/catalog';
import styles from './AdminGameEditPage.module.css';

export default function AdminGameEditPage() {
  const navigate = useNavigate();
  const { platformSlug, slug } = useParams<{ platformSlug: string; slug: string }>();
  const { catalogUrl } = useAdminFilters();
  const [game, setGame] = useState<GameDetail | null>(null);
  const [form, setForm] = useState<AdminEditableGame | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [downloadCoverOnEnrich, setDownloadCoverOnEnrich] = useState(false);
  const [enrichMeta, setEnrichMeta] = useState<{
    sourcesUsed: string[];
    warnings: string[];
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<PlatformInfo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalPlatformSlug = platformSlug ?? '';
  const originalSlug = slug ?? '';

  useEffect(() => {
    fetchPlatforms()
      .then((data) =>
        setPlatforms([...data.platforms].sort((a, b) => a.name.localeCompare(b.name, 'es'))),
      )
      .catch(() => setPlatforms([]));
  }, []);

  useEffect(() => {
    if (!platformSlug || !slug) return;

    setLoading(true);
    setError(null);
    fetchAdminGame(platformSlug, slug)
      .then((data) => {
        const record = {
          ...data.record,
          platformSlug: data.record.platformSlug ?? platformSlug,
        };
        setGame(record);
        setForm(gameDetailToEditable(record));
        const cover =
          coverDisplayUrl(
            data.paths.cover ?? data.record.coverPath,
            data.paths.coverVersion ?? data.record.coverUpdatedAt ?? data.record.updatedAt,
          ) ?? (data.record.coverUrl ? data.record.coverUrl : null);
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
      const platformChanged = form.platformSlug !== originalPlatformSlug;
      const slugChanged = form.slugOverride.trim() !== '' && form.slugOverride.trim() !== originalSlug;
      const effectiveNewSlug = slugChanged ? form.slugOverride.trim() : undefined;
      const result = await saveAdminGame({
        platformSlug,
        slug,
        newPlatformSlug: platformChanged ? form.platformSlug : undefined,
        newSlug: effectiveNewSlug,
        record: {
          ...editableToSaveRecord(form),
          ...(game?.coverPath ? { coverPath: game.coverPath } : {}),
          ...(game?.igdbId != null ? { igdbId: game.igdbId } : {}),
        },
        rebuildIndexes: true,
      });
      setGame(result.record);
      setForm(gameDetailToEditable(result.record));
      const toSlug = result.moved?.toSlug ?? effectiveNewSlug ?? slug;
      const toPlatform = result.moved?.to ?? platformSlug;
      const movedMsg = result.moved
        ? ` Movida: ${result.moved.from}/${slug} → ${toPlatform}/${toSlug}.`
        : '';
      setStatus(`Ficha guardada.${formatAdminRebuildNote(result.rebuild)}${movedMsg}`);
      if (result.moved || slugChanged) {
        navigate(`/admin/juego/${toPlatform}/${toSlug}`, { replace: true });
      }
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
      const bump = result.coverVersion ?? Date.now();
      bumpAdminCoverCache(platformSlug, slug, bump);
      setGame(result.record ?? game);
      if (result.record) {
        setForm(gameDetailToEditable(result.record));
        setCoverPreview(coverDisplayUrl(result.record.coverPath, bump));
      }
      setStatus(`Portada subida.${formatAdminRebuildNote(result.rebuild)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir la portada');
    } finally {
      setUploading(false);
    }
  };

  const handleEnrich = async () => {
    if (!platformSlug || !slug || !form) return;
    setEnriching(true);
    setStatus(null);
    setError(null);
    setEnrichMeta(null);
    try {
      const result = await enrichAdminGame({
        platformSlug,
        slug,
        downloadCover: downloadCoverOnEnrich,
        apply: false,
      });
      if (!result.changed) {
        setStatus(
          result.warnings.length > 0
            ? `Sin metadatos nuevos. ${result.warnings.join(' ')}`
            : 'No se encontraron metadatos nuevos para esta ficha.',
        );
        setEnrichMeta({ sourcesUsed: result.sourcesUsed, warnings: result.warnings });
        return;
      }

      const mergedRecord = {
        ...game,
        ...result.record,
        platformSlug: game?.platformSlug ?? platformSlug,
        slug,
      };
      setGame(mergedRecord);
      setForm(applyEnrichToForm(form, result.record, result.filledFields));

      if (result.coverDownloaded && result.record.coverPath) {
        const bump = Date.now();
        bumpAdminCoverCache(platformSlug, slug, bump);
        setCoverPreview(coverDisplayUrl(result.record.coverPath, bump));
      }

      const filled = formatEnrichFilledFields(result.filledFields);
      const sources =
        result.sourcesUsed.length > 0 ? ` Fuentes: ${result.sourcesUsed.join(', ')}.` : '';
      const warn =
        result.warnings.length > 0 ? ` Avisos: ${result.warnings.join(' ')}` : '';
      setStatus(
        `Autorellenado (revisa y guarda): ${filled}.${sources}${warn}${
          result.coverDownloaded ? ' Portada descargada en el servidor.' : ''
        }`,
      );
      setEnrichMeta({ sourcesUsed: result.sourcesUsed, warnings: result.warnings });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo autorellenar');
    } finally {
      setEnriching(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!platformSlug || !slug) return;
    setDeleting(true);
    setError(null);
    try {
      const result = await deleteAdminGames([{ platformSlug, slug }], true);
      if (result.deleted.length === 0) {
        throw new Error('No se pudo eliminar la ficha');
      }
      navigate(catalogUrl, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la ficha');
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
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

  const platformChanged = form.platformSlug !== originalPlatformSlug;
  const publicPlatform = platformChanged ? form.platformSlug : platformSlug;

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
            disabled={saving || uploading || enriching}
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
            disabled={uploading || enriching}
          >
            {uploading ? 'Subiendo…' : 'Subir carátula'}
          </button>

          <div className={styles.enrichBox}>
            <button
              type="button"
              className={styles.enrichBtn}
              onClick={() => void handleEnrich()}
              disabled={enriching || saving || uploading}
            >
              {enriching ? 'Buscando metadatos…' : 'Autorellenar metadatos'}
            </button>
            <label className={styles.enrichCheck}>
              <input
                type="checkbox"
                checked={downloadCoverOnEnrich}
                onChange={(e) => setDownloadCoverOnEnrich(e.target.checked)}
                disabled={enriching}
              />
              Descargar portada si falta
            </label>
            {enrichMeta ? (
              <p className={styles.enrichMeta}>
                {enrichMeta.sourcesUsed.length > 0
                  ? `Fuentes: ${enrichMeta.sourcesUsed.join(', ')}`
                  : null}
                {enrichMeta.warnings.length > 0 ? (
                  <span className={styles.enrichWarn}>
                    {enrichMeta.sourcesUsed.length > 0 ? ' · ' : ''}
                    {enrichMeta.warnings.join(' ')}
                  </span>
                ) : null}
              </p>
            ) : (
              <p className={styles.enrichHint}>
                IGDB, PriceCharting y ScreenScraper (credenciales solo en el servidor).
              </p>
            )}
          </div>

          <Link
            to={`/juego/${publicPlatform}/${slug}`}
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
              <select
                value={form.platformSlug}
                onChange={(e) => updateField('platformSlug', e.target.value)}
              >
                {platforms.length > 0 ? (
                  platforms.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name}
                    </option>
                  ))
                ) : (
                  <option value={form.platformSlug}>{game?.platform ?? form.platformSlug}</option>
                )}
              </select>
              {platformChanged ? (
                <span className={styles.fieldHint}>
                  ⚠ Guarda para mover la ficha y la portada a la nueva plataforma.
                </span>
              ) : null}
            </label>
            <label className={styles.field}>
              <span>Slug</span>
              <input
                value={form.slugOverride !== '' ? form.slugOverride : slug}
                onChange={(e) => updateField('slugOverride', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                placeholder={slug}
                title="Identificador único del juego en la URL. Cambia solo si es necesario."
              />
              {(form.slugOverride === '' || form.slugOverride === slug) ? (
                <button
                  type="button"
                  className={styles.slugBtn}
                  onClick={() => updateField('slugOverride', titleToSlug(form.title))}
                  title="Generar slug desde el título"
                >
                  ↻ desde título
                </button>
              ) : (
                <span className={styles.fieldHint}>
                  ⚠ Renombrará el fichero. Actual: <code>{slug}</code>
                </span>
              )}
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
                checked={form.digitalOnly}
                onChange={(e) => updateField('digitalOnly', e.target.checked)}
              />
              Solo digital (sin edición física)
            </label>
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

      <section className={styles.dangerZone}>
        <h2 className={styles.dangerTitle}>Zona peligrosa</h2>
        <p className={styles.dangerText}>
          Elimina esta ficha del catálogo (JSON y portada). Acción irreversible.
        </p>
        <button
          type="button"
          className={styles.dangerBtn}
          onClick={() => setDeleteDialogOpen(true)}
          disabled={saving || uploading || deleting || enriching}
        >
          Eliminar ficha…
        </button>
      </section>

      <AdminDeleteConfirmDialog
        open={deleteDialogOpen}
        count={1}
        sampleTitles={[form.title]}
        loading={deleting}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
