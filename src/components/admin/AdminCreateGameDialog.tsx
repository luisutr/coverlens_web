import { useEffect, useRef, useState } from 'react';
import { titleToSlug } from '../../types/admin';
import type { PlatformInfo } from '../../types/catalog';
import styles from './AdminCreateGameDialog.module.css';

type Props = {
  open: boolean;
  platforms: PlatformInfo[];
  defaultPlatformSlug?: string;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (platformSlug: string, slug: string, title: string) => void | Promise<void>;
};

export default function AdminCreateGameDialog({
  open,
  platforms,
  defaultPlatformSlug = '',
  loading = false,
  error = null,
  onClose,
  onConfirm,
}: Props) {
  const [platformSlug, setPlatformSlug] = useState(defaultPlatformSlug);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPlatformSlug(defaultPlatformSlug || platforms[0]?.slug || '');
      setTitle('');
      setSlug('');
      setSlugManual(false);
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [open, defaultPlatformSlug, platforms]);

  // Auto-generar slug desde el título mientras no haya edición manual
  useEffect(() => {
    if (!slugManual) {
      setSlug(titleToSlug(title));
    }
  }, [title, slugManual]);

  if (!open) return null;

  const isValid = platformSlug !== '' && title.trim() !== '' && /^[a-z0-9][a-z0-9-]*$/.test(slug);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;
    void onConfirm(platformSlug, slug, title.trim());
  };

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-game-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="create-game-title" className={styles.title}>Nueva ficha</h2>
        <p className={styles.hint}>
          Crea una ficha vacía. Después podrás rellenar todos los campos y usar el autorellenado.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span>Plataforma</span>
            <select
              value={platformSlug}
              onChange={(e) => setPlatformSlug(e.target.value)}
              disabled={loading}
              required
            >
              {platforms.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Título</span>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nombre del juego"
              disabled={loading}
              required
            />
          </label>

          <label className={styles.field}>
            <span>
              Slug{' '}
              <span className={styles.slugNote}>
                (identificador en URL, auto-generado)
              </span>
            </span>
            <input
              value={slug}
              onChange={(e) => {
                setSlugManual(true);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
              }}
              placeholder="nombre-del-juego"
              disabled={loading}
              required
              pattern="[a-z0-9][a-z0-9-]*"
            />
            {slugManual && (
              <button
                type="button"
                className={styles.resetSlugBtn}
                onClick={() => {
                  setSlugManual(false);
                  setSlug(titleToSlug(title));
                }}
              >
                ↻ regenerar desde título
              </button>
            )}
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.createBtn}
              disabled={!isValid || loading}
            >
              {loading ? 'Creando…' : 'Crear ficha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
