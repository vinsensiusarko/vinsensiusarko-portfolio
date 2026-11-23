import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ThemeProvider } from '../../../src/context/ThemeContext';
import { SeasonProvider } from '../../../src/context/SeasonContext';
import { Navbar } from '../../../src/components/layout/Navbar';
import { Footer } from '../../../src/components/layout/Footer';
import { FloatingActions } from '../../../src/components/layout/FloatingActions';

describe('Layout components (Navbar, Footer, FloatingActions)', () => {
  it('renders Navbar with SeasonSwitcher and toggles theme', () => {
    render(
      <ThemeProvider>
        <SeasonProvider>
          <MemoryRouter>
            <Navbar variant="home" siteName="Vinsensius Arka" />
            <Footer variant="home" siteName="Vinsensius Arka" />
            <FloatingActions whatsapp="6285179793167" />
          </MemoryRouter>
        </SeasonProvider>
      </ThemeProvider>
    );

    expect(screen.getAllByText('Vinsensius Arka').length).toBeGreaterThan(0);
    const themeBtns = screen.getAllByRole('button', { name: /Switch to (dark|light) theme/i });
    fireEvent.click(themeBtns[0]);
    expect(document.documentElement.getAttribute('data-theme')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Chat on WhatsApp/i })).toHaveAttribute(
      'href',
      'https://api.whatsapp.com/send?phone=6285179793167'
    );
    expect(screen.queryByRole('button', { name: /(Enable|Mute) Sound Effects/i })).not.toBeInTheDocument();
  });

  it('renders Privacy Policy link in desktop navigation and opens mobile sheet drawer', () => {
    const { container } = render(
      <ThemeProvider>
        <SeasonProvider>
          <MemoryRouter>
            <Navbar variant="home" siteName="Vinsensius Arka" />
          </MemoryRouter>
        </SeasonProvider>
      </ThemeProvider>
    );

    const desktopPrivacyLink = container.querySelector('.nav-links a[href="/privacy-policy"]');
    expect(desktopPrivacyLink).toBeInTheDocument();

    const menuTrigger = screen.getByRole('button', { name: /Toggle navigation menu/i });
    fireEvent.click(menuTrigger);

    const sheetDialog = screen.getByRole('dialog');
    expect(sheetDialog).toBeInTheDocument();
    expect(sheetDialog.querySelector('a[href="/privacy-policy"]')).toBeInTheDocument();
  });

  it('keeps hidden Back to Top button out of keyboard tab order at top of page', () => {
    window.scrollY = 0;
    render(
      <ThemeProvider>
        <SeasonProvider>
          <MemoryRouter>
            <FloatingActions whatsapp="6285179793167" />
          </MemoryRouter>
        </SeasonProvider>
      </ThemeProvider>
    );

    const backToTop = document.getElementById('back-to-top-btn');
    expect(backToTop).toHaveAttribute('tabindex', '-1');
    expect(backToTop).toHaveAttribute('aria-hidden', 'true');
  });
});
