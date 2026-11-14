import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { detectSeasonByMonth } from '../features/season/seasonConfig';
import { SeasonProvider, useSeason } from './SeasonContext';

function SeasonTestConsumer() {
  const {
    season,
    setSeason,
    isAutoSeason,
    resetToAutoSeason,
    particlesEnabled,
    toggleParticles,
    seasonMeta
  } = useSeason();

  return (
    <div>
      <span data-testid="season">{season}</span>
      <span data-testid="label">{seasonMeta.labelId}</span>
      <span data-testid="auto">{String(isAutoSeason)}</span>
      <span data-testid="particles">{String(particlesEnabled)}</span>
      <button onClick={() => setSeason('winter')}>Set Winter</button>
      <button onClick={resetToAutoSeason}>Reset Auto</button>
      <button onClick={toggleParticles}>Toggle Particles</button>
    </div>
  );
}

describe('detectSeasonByMonth', () => {
  it('maps months 2, 3, 4 (Mar-May) to spring', () => {
    expect(detectSeasonByMonth(2)).toBe('spring');
    expect(detectSeasonByMonth(3)).toBe('spring');
    expect(detectSeasonByMonth(4)).toBe('spring');
  });

  it('maps months 5, 6, 7 (Jun-Aug) to summer', () => {
    expect(detectSeasonByMonth(5)).toBe('summer');
    expect(detectSeasonByMonth(6)).toBe('summer');
    expect(detectSeasonByMonth(7)).toBe('summer');
  });

  it('maps months 8, 9, 10 (Sep-Nov) to autumn', () => {
    expect(detectSeasonByMonth(8)).toBe('autumn');
    expect(detectSeasonByMonth(9)).toBe('autumn');
    expect(detectSeasonByMonth(10)).toBe('autumn');
  });

  it('maps months 11, 0, 1 (Dec-Feb) to winter', () => {
    expect(detectSeasonByMonth(11)).toBe('winter');
    expect(detectSeasonByMonth(0)).toBe('winter');
    expect(detectSeasonByMonth(1)).toBe('winter');
  });
});

describe('SeasonContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-season');
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }));
  });

  it('syncs data-season on document.documentElement and supports manual override and reset', () => {
    render(
      <SeasonProvider>
        <SeasonTestConsumer />
      </SeasonProvider>
    );

    expect(screen.getByTestId('auto').textContent).toBe('true');
    const initialSeason = screen.getByTestId('season').textContent;
    expect(document.documentElement.getAttribute('data-season')).toBe(initialSeason);

    fireEvent.click(screen.getByText('Set Winter'));
    expect(screen.getByTestId('season').textContent).toBe('winter');
    expect(screen.getByTestId('label').textContent).toBe('Dingin');
    expect(screen.getByTestId('auto').textContent).toBe('false');
    expect(localStorage.getItem('season')).toBe('winter');
    expect(document.documentElement.getAttribute('data-season')).toBe('winter');

    fireEvent.click(screen.getByText('Reset Auto'));
    expect(screen.getByTestId('auto').textContent).toBe('true');
    expect(localStorage.getItem('season')).toBeNull();
  });

  it('ignores corrupted or unrecognized localStorage season values and falls back to auto season (Review Focus #1)', () => {
    localStorage.setItem('season', 'monsoon-invalid');
    render(
      <SeasonProvider>
        <SeasonTestConsumer />
      </SeasonProvider>
    );

    const activeSeason = screen.getByTestId('season').textContent;
    expect(['spring', 'summer', 'autumn', 'winter']).toContain(activeSeason);
    expect(screen.getByTestId('auto').textContent).toBe('true');
  });

  it('defaults particlesEnabled to false when prefers-reduced-motion: reduce is active and localStorage is unset (Review Focus #2)', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }));

    render(
      <SeasonProvider>
        <SeasonTestConsumer />
      </SeasonProvider>
    );

    expect(screen.getByTestId('particles').textContent).toBe('false');

    fireEvent.click(screen.getByText('Toggle Particles'));
    expect(screen.getByTestId('particles').textContent).toBe('true');
    expect(localStorage.getItem('season_particles')).toBe('true');
  });
});
