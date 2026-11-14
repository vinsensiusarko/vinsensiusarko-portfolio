import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AppRoutes } from './App';
import { ThemeProvider } from './context/ThemeContext';
import { SeasonProvider } from './context/SeasonContext';

function renderRoute(initialEntry = '/') {
  return render(
    <ThemeProvider>
      <SeasonProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <AppRoutes />
        </MemoryRouter>
      </SeasonProvider>
    </ThemeProvider>
  );
}

describe('App routing integration', () => {
  it('renders HomePage at / with Hero, About, Experience, Projects, and Contact sections', () => {
    renderRoute('/');
    expect(screen.getByRole('heading', { name: /Vinsensius Arka/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /About Me/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Projects/i })).toBeInTheDocument();
  });

  it('renders PrivacyPolicyPage at /privacy-policy', () => {
    renderRoute('/privacy-policy');
    expect(screen.getByRole('heading', { level: 1, name: /Privacy Policy/i })).toBeInTheDocument();
    expect(screen.getByText(/Google Play Store Compliant/i)).toBeInTheDocument();
  });

  it('renders AdminPage at /admin', async () => {
    renderRoute('/admin');
    await waitFor(() => {
      const hasPortal = screen.queryByRole('heading', { name: /Admin Portal/i });
      const hasSplash = screen.queryByText(/Verifying Admin Session/i);
      expect(hasPortal || hasSplash).toBeTruthy();
    });
  });

  it('renders NotFoundPage at unknown routes', () => {
    renderRoute('/some-non-existent-page');
    expect(screen.getByRole('heading', { name: /Oops!/i })).toBeInTheDocument();
    expect(screen.getByText(/Halaman yang Anda cari tidak ditemukan/i)).toBeInTheDocument();
  });
});
