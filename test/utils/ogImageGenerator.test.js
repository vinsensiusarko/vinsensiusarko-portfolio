import { describe, it, expect } from 'vitest';
import { OG_THEMES, renderOgBanner } from '../../src/utils/ogImageGenerator';

describe('OG Image Generator utility', () => {
  it('defines 5 diverse OG themes with valid color schemes', () => {
    const themeKeys = Object.keys(OG_THEMES);
    expect(themeKeys).toEqual(['cyber', 'midnight', 'sunset', 'emerald', 'light']);

    themeKeys.forEach((key) => {
      const theme = OG_THEMES[key];
      expect(theme.name).toBeTruthy();
      expect(theme.bg1).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.bg2).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.titleColor).toBeTruthy();
    });
  });

  it('renders OG banner onto canvas without crashing and returns dataUrl', async () => {
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: () => null,
      toDataURL: () => 'data:image/png;base64,MOCK_OG_DATA_URL'
    };

    const dataUrl = await renderOgBanner(mockCanvas, {
      theme: 'cyber',
      title: 'Vinsensius Arka',
      role: 'Web & Mobile Developer'
    });

    expect(mockCanvas.width).toBe(1200);
    expect(mockCanvas.height).toBe(630);
    expect(dataUrl).toBe('data:image/png;base64,MOCK_OG_DATA_URL');
  });
});
