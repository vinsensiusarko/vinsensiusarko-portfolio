import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ThemeProvider } from '../../context/ThemeContext';
import { SeasonProvider } from '../../context/SeasonContext';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingActions } from './FloatingActions';

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
  });
});
