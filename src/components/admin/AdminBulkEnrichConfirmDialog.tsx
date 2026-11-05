import styles from './AdminBulkEnrichConfirmDialog.module.css';

type AdminBulkEnrichConfirmDialogProps = {
  open: boolean;
  count: number;
  sampleTitles: string[];
  loading?: boolean;
  progress?: { current: number; total: number; title: string } | null;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export default function AdminBulkEnrichConfirmDialog({
  open,
  count,
  sampleTitles,
  loading = false,
  progress,
  onClose,
  onConfirm,
}: AdminBulkEnrichConfirmDialogProps) {
  if (!open) return null;

  const preview = sampleTitles.slice(0, 5);
  const more = count - preview.length;
  const estMinutes = Math.max(1, Math.ceil((count * 30) / 60));

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-enrich-batch-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="admin-enrich-batch-title" className={styles.title}>
          Autocompletar {count} ficha{count === 1 ? '' : 's'}
        </h2>
        <p className={styles.note}>
          Se buscarán metadatos (IGDB, PriceCharting, etc.) y se guardarán en disco. Tiempo
          estimado: ~{estMinutes} min ({count} × ~30 s).
        </p>
        <ul className={styles.list}>
          {preview.map((title) => (
            <li key={title}>{title}</li>
          ))}
          {more > 0 ? <li className={styles.more}>… y {more} más</li> : null}
        </ul>
        {progress ? (
          <p className={styles.progress} aria-live="polite">
            {progress.current}/{progress.total}: {progress.title}
          </p>
        ) : null}
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={loading}
            onClick={() => void onConfirm()}
          >
            {loading
              ? progress
                ? `Procesando ${progress.current}/${progress.total}…`
                : 'Iniciando…'
              : `Autocompletar y guardar`}
          </button>
        </div>
      </div>
    </div>
  );
}
