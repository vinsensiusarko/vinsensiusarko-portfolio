import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LazyMotion, MotionConfig, domMax } from 'motion/react';
import { HeroSection } from '../../../src/components/sections/HeroSection';
import { ProjectsSection } from '../../../src/components/sections/ProjectsSection';
import { SeasonProvider } from '../../../src/context/SeasonContext';
import { TooltipProvider } from '../../../src/components/ui/tooltip';

function renderWithMotion(ui) {
  return render(
    <MotionConfig reducedMotion="always">
      <LazyMotion features={domMax} strict>
        <TooltipProvider>{ui}</TooltipProvider>
      </LazyMotion>
    </MotionConfig>
  );
}

describe('Scroll Reveal & Micro-Interactions Integration', () => {
  it('does not render availability status badge and initializes typewriter cleanly', () => {
    renderWithMotion(
      <SeasonProvider>
        <HeroSection
          siteSettings={{
            name: 'Vinsensius Arka',
            typewriterRoles: ['Web Developer', 'Mobile Developer']
          }}
          contactSettings={{}}
        />
      </SeasonProvider>
    );

    const badge = screen.queryByRole('status', { name: /Available for New Opportunities/i });
    expect(badge).not.toBeInTheDocument();
    expect(screen.getByText('Web Developer')).toBeInTheDocument();
  });

  it('renders projects grid with reveal-stagger and cards with stagger-idx', () => {
    const mockProjects = [
      { id: '1', title: 'App 1', category: 'Mobile Application' },
      { id: '2', title: 'App 2', category: 'Web Application' }
    ];

    const { container } = renderWithMotion(<ProjectsSection projects={mockProjects} />);

    const grid = container.querySelector('#projects-grid');
    expect(grid).toHaveClass('reveal-stagger');

    const cards = screen.getAllByRole('article');
    expect(cards[0]).toHaveClass('reveal-on-scroll');
    expect(cards[0].style.getPropertyValue('--stagger-idx')).toBe('0');
    expect(cards[1].style.getPropertyValue('--stagger-idx')).toBe('1');
  });

  it('re-observes newly rendered cards when search filter or category changes', async () => {
    const mockProjects = [
      { id: '1', title: 'Flutter App', category: 'Mobile Application' },
      { id: '2', title: 'React Web', category: 'Web Application' },
      { id: '3', title: 'Vue Portal', category: 'Web Portal' }
    ];

    const { container } = renderWithMotion(<ProjectsSection projects={mockProjects} />);

    const mobileChip = screen.getByRole('tab', { name: /Mobile App/i });
    fireEvent.click(mobileChip);

    await waitFor(() => {
      const visibleCards = container.querySelectorAll('.project-card.reveal-on-scroll');
      expect(visibleCards).toHaveLength(1);
      expect(visibleCards[0].textContent).toContain('Flutter App');
    });
  });
});
