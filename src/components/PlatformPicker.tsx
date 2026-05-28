import type { PlatformInfo } from '../types/catalog';
import styles from './PlatformPicker.module.css';

type PlatformPickerProps = {
  open: boolean;
  platforms: PlatformInfo[];
  selected: string | null;
  onSelect: (slug: string | null) => void;
  onClose: () => void;
};

export default function PlatformPicker({
  open,
  platforms,
  selected,
  onSelect,
  onClose,
}: PlatformPickerProps) {
  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Filtrar por plataforma"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Plataforma</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <ul className={styles.list}>
          <li>
            <button
              type="button"
              className={`${styles.item} ${selected === null ? styles.itemActive : ''}`}
              onClick={() => {
                onSelect(null);
                onClose();
              }}
            >
              Todas las plataformas
            </button>
          </li>
          {platforms.map((p) => (
            <li key={p.slug}>
              <button
                type="button"
                className={`${styles.item} ${selected === p.slug ? styles.itemActive : ''}`}
                onClick={() => {
                  onSelect(p.slug);
                  onClose();
                }}
              >
                <span>{p.name}</span>
                <span className={styles.count}>{p.count.toLocaleString('es-ES')}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
