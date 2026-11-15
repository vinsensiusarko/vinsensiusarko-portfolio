import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrandLogo } from '../../../src/components/common/BrandLogo';

describe('BrandLogo component', () => {
  it('renders SVG element with monogram V paths and title', () => {
    render(<BrandLogo size={32} />);
    const svg = screen.getByRole('img', { name: /Vinsensius Arko Logo/i });
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });

  it('renders with theme class and transparent favicon image href', () => {
    render(<BrandLogo size={24} className="custom-logo-class" />);
    const svg = screen.getByRole('img', { name: /Vinsensius Arko Logo/i });
    expect(svg).toHaveClass('brand-logo-svg');
    expect(svg).toHaveClass('custom-logo-class');
    const image = svg.querySelector('image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('href', '/assets/favicon.png');
  });
});
