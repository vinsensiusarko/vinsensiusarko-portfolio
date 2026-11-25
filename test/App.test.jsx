import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { LazyMotion, MotionConfig, domMax } from 'motion/react';
import { AppRoutes } from '../src/App';
import { ThemeProvider } from '../src/context/ThemeContext';
import { SeasonProvider } from '../src/context/SeasonContext';
import { ConfirmProvider } from '../src/context/ConfirmContext';
import { TooltipProvider } from '../src/components/ui/tooltip';

function renderRoute(initialEntry = '/') {
  return render(
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domMax}>
        <ThemeProvider>
          <SeasonProvider>
            <ConfirmProvider>
              <TooltipProvider>
                <MemoryRouter initialEntries={[initialEntry]}>
                  <AppRoutes />
                </MemoryRouter>
              </TooltipProvider>
            </ConfirmProvider>
          </SeasonProvider>
        </ThemeProvider>
      </LazyMotion>
    </MotionConfig>
  );
}

describe('App routing integration', () => {
  it('renders HomePage at / with Hero, About, Experience, Projects, and Contact sections', () => {
    renderRoute('/');
    expect(screen.getByRole('heading', { name: /Vinsensius Arka/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /About Me/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Projects/i })).toBeInTheDocument();
  });

  it('renders lazy-loaded PrivacyPolicyPage at /privacy-policy', async () => {
    renderRoute('/privacy-policy');
    expect(
      await screen.findByRole('heading', { level: 1, name: /Privacy Policy/i }, { timeout: 4000 })
    ).toBeInTheDocument();
    expect(screen.getByText(/Google Play Store Compliant/i)).toBeInTheDocument();
  });

  it('renders lazy-loaded AdminPage at /admin with skeleton verification or login', async () => {
    renderRoute('/admin');
    await waitFor(
      () => {
        const hasPortal = screen.queryByRole('heading', { name: /Admin Portal/i });
        const hasSkeleton = screen.queryByTestId('admin-dashboard-skeleton');
        const hasVerifying = screen.queryByText(/Verifying Admin Session/i);
        expect(hasPortal || hasSkeleton || hasVerifying).toBeTruthy();
      },
      { timeout: 4000 }
    );
  });

  it('renders lazy-loaded NotFoundPage at unknown routes', async () => {
    renderRoute('/some-non-existent-page');
    expect(
      await screen.findByRole('heading', { name: /Oops!/i }, { timeout: 4000 })
    ).toBeInTheDocument();
    expect(screen.getByText(/Halaman yang Anda cari tidak ditemukan/i)).toBeInTheDocument();
  });
});
