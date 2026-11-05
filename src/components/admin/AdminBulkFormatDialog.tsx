import type { BulkPhysicalFormat } from '../../api/adminBulkFormat';
import styles from './AdminBulkFormatDialog.module.css';

type AdminBulkFormatDialogProps = {
  open: boolean;
  count: number;
  sampleTitles: string[];
  loading?: boolean;
  onClose: () => void;
  onConfirm: (format: BulkPhysicalFormat) => void | Promise<void>;
};

const OPTIONS: { value: BulkPhysicalFormat; label: string; hint: string }[] = [
  {
    value: 'physical',
    label: 'Edición física',
    hint: 'Cartucho, disco u otro soporte físico en retail',
  },
  {
    value: 'digital',
    label: 'Solo digital',
    hint: 'Sin edición física (eShop, PSN, Steam, etc.)',
  },
  {
    value: 'unknown',
    label: 'Sin clasificar',
    hint: 'Quitar la marca hasta revisar la ficha',
  },
];

export default function AdminBulkFormatDialog({
  open,
  count,
  sampleTitles,
  loading = false,
  onClose,
  onConfirm,
}: AdminBulkFormatDialogProps) {
  if (!open) return null;

  const preview = sampleTitles.slice(0, 5);
  const more = count - preview.length;

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-format-batch-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="admin-format-batch-title" className={styles.title}>
          Formato en {count} ficha{count === 1 ? '' : 's'}
        </h2>
        <ul className={styles.list}>
          {preview.map((title) => (
            <li key={title}>{title}</li>
          ))}
          {more > 0 ? <li className={styles.more}>… y {more} más</li> : null}
        </ul>
        <div className={styles.options}>
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={styles.optionBtn}
              disabled={loading}
              onClick={() => void onConfirm(opt.value)}
            >
              <span className={styles.optionLabel}>{opt.label}</span>
              <span className={styles.optionHint}>{opt.hint}</span>
            </button>
          ))}
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
            {loading ? 'Guardando…' : 'Cancelar'}
          </button>
        </div>
      </div>
    </div>
  );
}
