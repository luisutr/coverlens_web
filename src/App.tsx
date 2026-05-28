import { Route, Routes } from 'react-router-dom';
import AdminCatalogPage from './pages/admin/AdminCatalogPage';
import AdminGameEditPage from './pages/admin/AdminGameEditPage';
import CatalogPage from './pages/CatalogPage';
import GameDetailPage from './pages/GameDetailPage';
import LandingPage from './pages/LandingPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/catalogo" element={<CatalogPage />} />
      <Route path="/juego/:platformSlug/:slug" element={<GameDetailPage />} />
      <Route path="/admin" element={<AdminCatalogPage />} />
      <Route path="/admin/juego/:platformSlug/:slug" element={<AdminGameEditPage />} />
    </Routes>
  );
}
