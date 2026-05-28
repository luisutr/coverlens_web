import { SORT_OPTIONS } from '../hooks/useCatalogFilters';
import type { CatalogFilters } from '../types/catalog';
import styles from './FilterBar.module.css';

type FilterBarProps = {
  filters: CatalogFilters;
  platformLabel: string;
  onPlatformClick: () => void;
  onSortClick: () => void;
  onToggleCastilianText: () => void;
  onToggleCastilianVoice: () => void;
};

export default function FilterBar({
  filters,
  platformLabel,
  onPlatformClick,
  onSortClick,
  onToggleCastilianText,
  onToggleCastilianVoice,
}: FilterBarProps) {
  const sortLabel = SORT_OPTIONS.find((o) => o.key === filters.sort)?.label ?? 'Título';

  return (
    <div className={styles.bar}>
      <button type="button" className={styles.chip} onClick={onPlatformClick}>
        {platformLabel}
      </button>
      <button
        type="button"
        className={`${styles.chip} ${filters.castilianText ? styles.chipActive : ''}`}
        onClick={onToggleCastilianText}
      >
        ES texto
      </button>
      <button
        type="button"
        className={`${styles.chip} ${filters.castilianVoice ? styles.chipActive : ''}`}
        onClick={onToggleCastilianVoice}
      >
        ES voz
      </button>
      <button type="button" className={styles.sortPill} onClick={onSortClick}>
        {sortLabel} ▾
      </button>
    </div>
  );
}
