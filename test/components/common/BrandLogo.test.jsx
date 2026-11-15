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
});
