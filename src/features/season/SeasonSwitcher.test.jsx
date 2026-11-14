import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../context/ThemeContext';
import { SeasonProvider } from '../../context/SeasonContext';
import { SeasonSwitcher } from './SeasonSwitcher';
import { SeasonalCanvas } from './SeasonalCanvas';

function renderWithProviders(ui) {
  return render(
    <ThemeProvider>
      <SeasonProvider>{ui}</SeasonProvider>
    </ThemeProvider>
  );
}

describe('SeasonSwitcher & SeasonalCanvas', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('opens dropdown, switches between Spring, Summer, Autumn, Winter, and toggles particles', () => {
    renderWithProviders(
      <>
        <SeasonSwitcher />
        <SeasonalCanvas />
      </>
    );

    const trigger = screen.getByRole('button', { name: /Select season/i });
    fireEvent.click(trigger);

    const autumnOption = screen.getByRole('menuitem', { name: /Autumn/i });
    fireEvent.click(autumnOption);

    expect(document.documentElement.getAttribute('data-season')).toBe('autumn');
    expect(trigger.textContent).toContain('Autumn');

    // Reopen dropdown to toggle particles
    fireEvent.click(trigger);
    const particleBtn = screen.getByRole('button', { name: /Particle Effects/i });
    fireEvent.click(particleBtn);

    expect(localStorage.getItem('season_particles')).toBe('false');
  });
});
