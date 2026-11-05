import type { AdminFilters } from '../../types/admin';
import { SORT_OPTIONS } from '../../hooks/useAdminFilters';
import styles from './AdminFilterBar.module.css';

type AdminFilterBarProps = {
  filters: AdminFilters;
  platformLabel: string;
  onPlatformClick: () => void;
  onSortClick: () => void;
  onToggle: (key: keyof Pick<
    AdminFilters,
    'missingCover' | 'missingDescription' | 'missingBarcode' | 'missingPublisher' | 'physicalOnly' | 'digitalOnly'
  >) => void;
};

export default function AdminFilterBar({
  filters,
  platformLabel,
  onPlatformClick,
  onSortClick,
  onToggle,
}: AdminFilterBarProps) {
  const sortLabel = SORT_OPTIONS.find((o) => o.key === filters.sort)?.label ?? 'Título';

  return (
    <div className={styles.bar}>
      <button type="button" className={styles.chip} onClick={onPlatformClick}>
        {platformLabel}
      </button>
      <button
        type="button"
        className={`${styles.chip} ${filters.missingCover ? styles.chipActive : ''}`}
        onClick={() => onToggle('missingCover')}
      >
        Sin carátula
      </button>
      <button
        type="button"
        className={`${styles.chip} ${filters.missingDescription ? styles.chipActive : ''}`}
        onClick={() => onToggle('missingDescription')}
      >
        Sin descripción
      </button>
      <button
        type="button"
        className={`${styles.chip} ${filters.missingBarcode ? styles.chipActive : ''}`}
        onClick={() => onToggle('missingBarcode')}
      >
        Sin barcode
      </button>
      <button
        type="button"
        className={`${styles.chip} ${filters.missingPublisher ? styles.chipActive : ''}`}
        onClick={() => onToggle('missingPublisher')}
      >
        Sin editor
      </button>
      <button
        type="button"
        className={`${styles.chip} ${filters.physicalOnly ? styles.chipActive : ''}`}
        onClick={() => onToggle('physicalOnly')}
      >
        Físico
      </button>
      <button
        type="button"
        className={`${styles.chip} ${filters.digitalOnly ? styles.chipActive : ''}`}
        onClick={() => onToggle('digitalOnly')}
      >
        Digital
      </button>
      <button type="button" className={styles.sortPill} onClick={onSortClick}>
        {sortLabel} ▾
      </button>
    </div>
  );
}
