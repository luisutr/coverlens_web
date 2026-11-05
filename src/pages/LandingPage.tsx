import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <main className={styles.hero}>
        <p className={styles.kicker}>Tu colección, bajo control</p>
        <h1 className={styles.title}>CoverLens</h1>
        <p className={styles.subtitle}>
          Gestiona tu biblioteca de videojuegos con escaneo de códigos de barras, metadatos
          completos, portadas y valor de mercado. Explora el catálogo público con más de 50.000
          títulos.
        </p>
        <div className={styles.actions}>
          <Link to="/catalogo" className={styles.primaryBtn}>
            Explorar catálogo
          </Link>
          <a
            href="#"
            className={styles.secondaryBtn}
            aria-disabled="true"
            onClick={(e) => e.preventDefault()}
          >
            Google Play — próximamente
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <p>
          Catálogo alojado en{' '}
          <a href="https://covers.cholloweb.es/" target="_blank" rel="noreferrer">
            covers.cholloweb.es
          </a>
        </p>
      </footer>
    </div>
  );
}
