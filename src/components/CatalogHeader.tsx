import { Link } from 'react-router-dom';
import styles from './CatalogHeader.module.css';

type CatalogHeaderProps = {
  total: number;
  search: string;
  onSearchChange: (value: string) => void;
  sticky?: boolean;
  compact?: boolean;
};

export default function CatalogHeader({
  total,
  search,
  onSearchChange,
  sticky = true,
  compact = false,
}: CatalogHeaderProps) {
  const className = [
    styles.header,
    sticky ? styles.sticky : styles.static,
    compact ? styles.compact : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={className}>
      <div className={styles.topRow}>
        <Link to="/" className={styles.brand}>
          CoverLens
        </Link>
        <span className={styles.badge}>{total.toLocaleString('es-ES')} juegos</span>
      </div>
      <label className={styles.searchWrap}>
        <span className="sr-only">Buscar juegos</span>
        <input
          type="search"
          className={styles.search}
          placeholder="Buscar título…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          autoComplete="off"
        />
      </label>
    </header>
  );
}
