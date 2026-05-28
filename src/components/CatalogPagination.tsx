import { PAGE_SIZE } from '../hooks/useCatalogBrowse';
import { formatPageRange } from '../utils/pagination';
import styles from './CatalogPagination.module.css';

type CatalogPaginationProps = {
  page: number;
  pages: number;
  total: number;
  loading: boolean;
  onPageChange: (page: number) => void;
};

export default function CatalogPagination({
  page,
  pages,
  total,
  loading,
  onPageChange,
}: CatalogPaginationProps) {
  if (pages <= 1 && total === 0) return null;

  const canPrev = page > 1 && !loading;
  const canNext = page < pages && !loading;

  return (
    <nav className={styles.bar} aria-label="Paginación del catálogo">
      <p className={styles.range}>
        {total > 0 ? (
          <>
            Mostrando <strong>{formatPageRange(page, total, PAGE_SIZE)}</strong> de{' '}
            <strong>{total.toLocaleString('es-ES')}</strong>
          </>
        ) : (
          'Sin resultados'
        )}
      </p>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.btn}
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
        >
          ← Anterior
        </button>
        <span className={styles.pageLabel}>
          Página {page.toLocaleString('es-ES')} de {Math.max(pages, 1).toLocaleString('es-ES')}
        </span>
        <button
          type="button"
          className={styles.btn}
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
          aria-label="Página siguiente"
        >
          Siguiente →
        </button>
      </div>
    </nav>
  );
}
