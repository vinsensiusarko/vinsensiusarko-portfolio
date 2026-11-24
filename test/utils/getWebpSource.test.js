import { describe, it, expect } from 'vitest';
import { getWebpSource } from '../../src/utils/getWebpSource';

describe('getWebpSource helper', () => {
  it('resolves allowlisted static local images to .webp twins', () => {
    expect(getWebpSource('/assets/images/arko-pic.jpg')).toBe('/assets/images/arko-pic.webp');
    expect(getWebpSource('/assets/images/arko-about.jpg')).toBe('/assets/images/arko-about.webp');
    expect(getWebpSource('/assets/images/portfolio-1.png')).toBe('/assets/images/portfolio-1.webp');
    expect(getWebpSource('assets/images/portfolio-9.png')).toBe('/assets/images/portfolio-9.webp');
    expect(getWebpSource('/assets/images/arko-pic.jpg?v=2')).toBe('/assets/images/arko-pic.webp');
  });

  it('returns null for Base64 data URIs, external URLs, and non-allowlisted paths', () => {
    expect(getWebpSource('data:image/png;base64,abc123')).toBeNull();
    expect(getWebpSource('https://example.com/assets/images/portfolio-1.png')).toBeNull();
    expect(getWebpSource('http://example.com/photo.jpg')).toBeNull();
    expect(getWebpSource('/assets/images/unknown-photo.png')).toBeNull();
    expect(getWebpSource('/assets/images/flutter.png')).toBeNull();
    expect(getWebpSource('')).toBeNull();
    expect(getWebpSource(null)).toBeNull();
  });
});
