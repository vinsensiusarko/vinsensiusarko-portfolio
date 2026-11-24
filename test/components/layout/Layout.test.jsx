import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { LazyMotion, MotionConfig, domMax } from 'motion/react';
import { ThemeProvider } from '../../../src/context/ThemeContext';
import { SeasonProvider } from '../../../src/context/SeasonContext';
import { TooltipProvider } from '../../../src/components/ui/tooltip';
import { Navbar } from '../../../src/components/layout/Navbar';
import { Footer } from '../../../src/components/layout/Footer';
import { FloatingActions } from '../../../src/components/layout/FloatingActions';

function renderLayout(ui) {
  return render(
    <MotionConfig reducedMotion="always">
      <LazyMotion features={domMax} strict>
        <ThemeProvider>
          <SeasonProvider>
            <TooltipProvider>
              <MemoryRouter>{ui}</MemoryRouter>
            </TooltipProvider>
          </SeasonProvider>
        </ThemeProvider>
      </LazyMotion>
    </MotionConfig>
  );
}

describe('Layout components (Navbar, Footer, FloatingActions)', () => {
  it('renders Navbar with SeasonSwitcher and toggles theme', () => {
    renderLayout(
      <>
        <Navbar variant="home" siteName="Vinsensius Arka" />
        <Footer variant="home" siteName="Vinsensius Arka" />
        <FloatingActions whatsapp="6285179793167" />
      </>
    );

    expect(screen.getAllByText('Vinsensius Arka').length).toBeGreaterThan(0);
    expect(screen.getByTestId('scroll-progress-bar')).toBeInTheDocument();
    const themeBtns = screen.getAllByRole('button', { name: /Switch to (dark|light) theme/i });
    fireEvent.click(themeBtns[0]);
    expect(document.documentElement.getAttribute('data-theme')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Chat on WhatsApp/i })).toHaveAttribute(
      'href',
      'https://api.whatsapp.com/send?phone=6285179793167'
    );
    expect(
      screen.queryByRole('button', { name: /(Enable|Mute) Sound Effects/i })
    ).not.toBeInTheDocument();
  });

  it('renders Privacy Policy link in desktop navigation and opens mobile sheet drawer', () => {
    const { container } = renderLayout(<Navbar variant="home" siteName="Vinsensius Arka" />);

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
    renderLayout(<FloatingActions whatsapp="6285179793167" />);

    const backToTop = document.getElementById('back-to-top-btn');
    expect(backToTop).toHaveAttribute('tabindex', '-1');
    expect(backToTop).toHaveAttribute('aria-hidden', 'true');
  });
});
