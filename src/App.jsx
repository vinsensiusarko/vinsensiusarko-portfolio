import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router';
import { LazyMotion, MotionConfig, domMax } from 'motion/react';
import { ThemeProvider } from './context/ThemeContext';
import { SeasonProvider } from './context/SeasonContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { SeasonalCanvas } from './features/season/SeasonalCanvas';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { HomePage } from './pages/HomePage';

const PrivacyPolicyPage = lazy(() =>
  import('./pages/PrivacyPolicyPage').then((mod) => ({ default: mod.PrivacyPolicyPage }))
);
const AdminPage = lazy(() =>
  import('./pages/admin/AdminPage').then((mod) => ({ default: mod.AdminPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((mod) => ({ default: mod.NotFoundPage }))
);

function RouteLoadingFallback() {
  return (
    <div
      className="flex min-h-dvh w-full items-center justify-center bg-background text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2.5 text-sm font-medium">
        <span className="size-2.5 animate-pulse rounded-full bg-foreground" aria-hidden="true" />
        <span>Loading page...</span>
      </div>
    </div>
  );
}

export function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <SeasonalCanvas />}
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/privacy-policy.html" element={<PrivacyPolicyPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domMax}>
        <ThemeProvider>
          <SeasonProvider>
            <ConfirmProvider>
              <TooltipProvider delayDuration={200}>
                <BrowserRouter>
                  <AppRoutes />
                </BrowserRouter>
                <Toaster position="bottom-right" closeButton />
              </TooltipProvider>
            </ConfirmProvider>
          </SeasonProvider>
        </ThemeProvider>
      </LazyMotion>
    </MotionConfig>
  );
}
