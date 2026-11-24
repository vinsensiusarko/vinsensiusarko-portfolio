import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { getWebpSource } from '../../src/utils/getWebpSource';
import { ResponsivePicture } from '../../src/components/common/ResponsivePicture';

describe('getWebpSource helper & ResponsivePicture', () => {
  it('resolves allowlisted static local images to .webp twins', () => {
    expect(getWebpSource('/assets/images/arko-pic.jpg')).toBe('/assets/images/arko-pic.webp');
    expect(getWebpSource('./assets/images/arko-about.jpg')).toBe('/assets/images/arko-about.webp');
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

  it('drops the webp <source> and switches to fallbackSrc when image loading fails', () => {
    const { container } = render(
      <ResponsivePicture
        src="/assets/images/portfolio-2.png"
        fallbackSrc="/assets/images/portfolio-1.png"
        alt="Preview"
      />
    );

    expect(container.querySelector('source[type="image/webp"]')).toHaveAttribute(
      'srcset',
      '/assets/images/portfolio-2.webp'
    );
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', '/assets/images/portfolio-2.png');

    fireEvent.error(img);

    expect(container.querySelector('source[type="image/webp"]')).not.toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/assets/images/portfolio-1.png');
  });
});
