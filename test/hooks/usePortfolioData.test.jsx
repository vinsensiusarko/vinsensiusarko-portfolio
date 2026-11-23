import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { onSnapshot } from 'firebase/firestore';
import { usePortfolioData } from '../../src/hooks/usePortfolioData';
import { FALLBACK_SITE_SETTINGS } from '../../src/data/fallbackData';

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    onSnapshot: vi.fn(() => vi.fn())
  };
});

describe('usePortfolioData siteSettings cache & heroImage fallback', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('heals legacy /assets/images/arko-pic.png cached in localStorage to fallback heroImage', () => {
    localStorage.setItem(
      'portfolio_site_settings_cache',
      JSON.stringify({ heroImage: '/assets/images/arko-pic.png', name: 'Vinsensius Arka' })
    );

    const { result } = renderHook(() => usePortfolioData());
    expect(result.current.siteSettings.heroImage).toBe(FALLBACK_SITE_SETTINGS.heroImage);
  });

  it('resets stale cached Base64 heroImage back to fallback when Firestore site_settings has no heroImage', async () => {
    localStorage.setItem(
      'portfolio_site_settings_cache',
      JSON.stringify({ heroImage: 'data:image/png;base64,OLD_CACHED_PHOTO' })
    );

    onSnapshot.mockImplementation((target, onNext) => {
      if (target?.path === 'settings/site_settings') {
        onNext({
          exists: () => true,
          data: () => ({ name: 'Vinsensius Arka', expYears: '5+ years' })
        });
      }
      return vi.fn();
    });

    const { result } = renderHook(() => usePortfolioData());

    await waitFor(() => {
      expect(result.current.siteSettings.heroImage).toBe(FALLBACK_SITE_SETTINGS.heroImage);
    });

    const persisted = JSON.parse(localStorage.getItem('portfolio_site_settings_cache'));
    expect(persisted.heroImage).toBe(FALLBACK_SITE_SETTINGS.heroImage);
  });

  it('preserves custom heroImage when Firestore site_settings explicitly provides one', async () => {
    const customHero = 'data:image/webp;base64,CUSTOM_NEW_PHOTO';

    onSnapshot.mockImplementation((target, onNext) => {
      if (target?.path === 'settings/site_settings') {
        onNext({
          exists: () => true,
          data: () => ({ name: 'Vinsensius Arka', heroImage: customHero })
        });
      }
      return vi.fn();
    });

    const { result } = renderHook(() => usePortfolioData());

    await waitFor(() => {
      expect(result.current.siteSettings.heroImage).toBe(customHero);
    });
  });
});
