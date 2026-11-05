import { type FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchAdminBrowse } from '../../api/adminApi';
import { setAdminToken } from '../../api/adminAuth';
import styles from './AdminLoginPage.module.css';

type LoginState = {
  from?: string;
};

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LoginState | null)?.from ?? '/admin';
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Acceso admin — CoverLens';
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) {
      setError('Introduce el token de acceso.');
      return;
    }

    setLoading(true);
    setError(null);
    setAdminToken(trimmed);

    try {
      await fetchAdminBrowse(
        {
          q: '',
          platform: null,
          sort: 'title',
          missingCover: false,
          missingDescription: false,
          missingBarcode: false,
          missingPublisher: false,
          physicalOnly: false,
          digitalOnly: false,
        },
        1,
        1,
      );
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Token inválido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Editor de catálogo</h1>
        <p className={styles.subtitle}>
          Acceso privado. Pega el token admin (desde tu <code>.env</code> local como{' '}
          <code>ADMIN_API_KEY</code>).
        </p>
        <form onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="admin-token">
            Token de acceso
          </label>
          <input
            id="admin-token"
            className={styles.input}
            type="password"
            autoComplete="current-password"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Pega tu token aquí"
          />
          {error ? <p className={styles.error}>{error}</p> : null}
          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? 'Comprobando…' : 'Entrar'}
          </button>
        </form>
        <Link to="/" className={styles.back}>
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
