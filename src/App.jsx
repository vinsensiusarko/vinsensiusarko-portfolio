import { BrowserRouter, Routes, Route, useLocation } from 'react-router';
import { ThemeProvider } from './context/ThemeContext';
import { SeasonProvider } from './context/SeasonContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { SoundProvider } from './context/SoundContext';
import { SeasonalCanvas } from './features/season/SeasonalCanvas';
import { HomePage } from './pages/HomePage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { AdminPage } from './pages/admin/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <SeasonalCanvas />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/privacy-policy.html" element={<PrivacyPolicyPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SeasonProvider>
        <ConfirmProvider>
          <SoundProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </SoundProvider>
        </ConfirmProvider>
      </SeasonProvider>
    </ThemeProvider>
  );
}
