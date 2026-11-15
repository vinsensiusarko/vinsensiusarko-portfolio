import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '../../../src/components/sections/HeroSection';
import { ProjectsSection } from '../../../src/components/sections/ProjectsSection';
import { SeasonProvider } from '../../../src/context/SeasonContext';

describe('Scroll Reveal & Micro-Interactions Integration', () => {
  it('renders live availability status badge with pulse dot in HeroSection', () => {
    render(
      <SeasonProvider>
        <HeroSection
          siteSettings={{ name: 'Vinsensius Arka' }}
          contactSettings={{}}
        />
      </SeasonProvider>
    );

    const badge = screen.getByRole('status', { name: /Available for work/i });
    expect(badge).toBeInTheDocument();
    expect(badge.querySelector('.availability-pulse-dot')).toBeInTheDocument();
  });

  it('renders projects grid with reveal-stagger and cards with stagger-idx', () => {
    const mockProjects = [
      { id: '1', title: 'App 1', category: 'Mobile Application' },
      { id: '2', title: 'App 2', category: 'Web Application' }
    ];

    const { container } = render(
      <ProjectsSection projects={mockProjects} />
    );

    const grid = container.querySelector('#projects-grid');
    expect(grid).toHaveClass('reveal-stagger');

    const cards = screen.getAllByRole('article');
    expect(cards[0]).toHaveClass('reveal-on-scroll');
    expect(cards[0].style.getPropertyValue('--stagger-idx')).toBe('0');
    expect(cards[1].style.getPropertyValue('--stagger-idx')).toBe('1');
  });
});
