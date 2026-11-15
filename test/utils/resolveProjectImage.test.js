import { describe, it, expect } from 'vitest';
import { resolveProjectImage } from '../../src/utils/resolveProjectImage';

describe('resolveProjectImage', () => {
  it('returns placeholder when project has no image fields', () => {
    expect(resolveProjectImage(null)).toBe('/assets/images/portfolio-1.png');
    expect(resolveProjectImage({})).toBe('/assets/images/portfolio-1.png');
    expect(resolveProjectImage({ image: '', imageBase64: '' })).toBe('/assets/images/portfolio-1.png');
  });

  it('prioritizes imageBase64 when present', () => {
    const base64Data = 'data:image/webp;base64,UklGRnoAAABXRUJQVlA4...';
    expect(resolveProjectImage({ imageBase64: base64Data, image: 'assets/images/portfolio-1.png' })).toBe(base64Data);
  });

  it('normalizes relative asset paths with leading slash', () => {
    expect(resolveProjectImage({ image: 'assets/images/portfolio-1.png' })).toBe('/assets/images/portfolio-1.png');
    expect(resolveProjectImage({ image: '../assets/images/portfolio-2.png' })).toBe('/assets/images/portfolio-2.png');
    expect(resolveProjectImage({ image: './assets/images/portfolio-3.png' })).toBe('/assets/images/portfolio-3.png');
  });

  it('preserves absolute URLs and http/https strings', () => {
    const external = 'https://images.unsplash.com/photo-123456';
    expect(resolveProjectImage({ image: external })).toBe(external);
  });
});
