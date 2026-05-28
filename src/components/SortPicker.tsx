import { SORT_OPTIONS } from '../hooks/useCatalogFilters';
import type { CatalogSort } from '../types/catalog';
import styles from './SortPicker.module.css';

type SortPickerProps = {
  open: boolean;
  selected: CatalogSort;
  onSelect: (sort: CatalogSort) => void;
  onClose: () => void;
};

export default function SortPicker({ open, selected, onSelect, onClose }: SortPickerProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Ordenar catálogo"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Ordenar por</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <ul className={styles.list}>
          {SORT_OPTIONS.map((opt) => (
            <li key={opt.key}>
              <button
                type="button"
                className={`${styles.item} ${selected === opt.key ? styles.itemActive : ''}`}
                onClick={() => {
                  onSelect(opt.key);
                  onClose();
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
