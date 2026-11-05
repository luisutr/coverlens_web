import { useEffect, useState } from 'react';
import styles from './AdminDeleteConfirmDialog.module.css';

const CONFIRM_WORD = 'ELIMINAR';

type AdminDeleteConfirmDialogProps = {
  open: boolean;
  count: number;
  sampleTitles: string[];
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export default function AdminDeleteConfirmDialog({
  open,
  count,
  sampleTitles,
  loading = false,
  onClose,
  onConfirm,
}: AdminDeleteConfirmDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (!open) {
      setStep(1);
      setTyped('');
    }
  }, [open]);

  if (!open) return null;

  const canConfirm = typed.trim().toUpperCase() === CONFIRM_WORD;
  const preview = sampleTitles.slice(0, 5);
  const more = count - preview.length;

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-delete-title"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 1 ? (
          <>
            <h2 id="admin-delete-title" className={styles.title}>
              ¿Eliminar {count} ficha{count === 1 ? '' : 's'}?
            </h2>
            <p className={styles.warning}>
              Esta acción es irreversible. Se borrarán el JSON y la portada en disco.
            </p>
            <ul className={styles.list}>
              {preview.map((title) => (
                <li key={title}>{title}</li>
              ))}
              {more > 0 ? <li className={styles.more}>… y {more} más</li> : null}
            </ul>
            <div className={styles.actions}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>
                Cancelar
              </button>
              <button
                type="button"
                className={styles.dangerBtn}
                onClick={() => setStep(2)}
              >
                Continuar
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className={styles.title}>Confirmación final</h2>
            <p className={styles.warning}>
              Escribe <strong>{CONFIRM_WORD}</strong> para borrar definitivamente.
            </p>
            <input
              className={styles.input}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={CONFIRM_WORD}
              autoFocus
              disabled={loading}
              aria-label={`Escribe ${CONFIRM_WORD} para confirmar`}
            />
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Atrás
              </button>
              <button
                type="button"
                className={styles.dangerBtn}
                disabled={!canConfirm || loading}
                onClick={() => void onConfirm()}
              >
                {loading ? 'Eliminando…' : `Eliminar ${count} ficha${count === 1 ? '' : 's'}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
