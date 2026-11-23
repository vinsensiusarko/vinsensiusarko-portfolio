import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectsSection } from '../../../src/components/sections/ProjectsSection';
import { FALLBACK_PROJECTS } from '../../../src/data/fallbackData';

describe('ProjectsSection & ProjectModal', () => {
  it('filters projects by category (including technology-inferred matches) and resets empty search results', () => {
    render(<ProjectsSection projects={FALLBACK_PROJECTS} />);

    // Initially capped at 6 projects (Show More present)
    expect(screen.getAllByRole('article')).toHaveLength(6);

    // Filter by Mobile App -> Mozaic POS App (Flutter)
    fireEvent.click(screen.getByRole('tab', { name: /Mobile App/i }));
    const mobileCards = screen.getAllByRole('article');
    expect(mobileCards).toHaveLength(1);
    expect(screen.getByText('Mozaic POS App')).toBeInTheDocument();

    // Search for a non-existent keyword in uppercase
    const searchInput = screen.getByPlaceholderText(/Search projects/i);
    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT_TECH_XYZ' } });

    expect(screen.queryAllByRole('article')).toHaveLength(0);
    expect(screen.getByText(/No matching projects found/i)).toBeInTheDocument();

    // Click Reset Filters button
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(screen.getAllByRole('article')).toHaveLength(6);
  });

  it('limits initial display to 6 projects and toggles show more/less (Review Focus #2)', () => {
    render(<ProjectsSection projects={FALLBACK_PROJECTS} />);

    // Details button in card action container should NOT exist
    expect(screen.queryByRole('button', { name: /Details/i })).not.toBeInTheDocument();

    // Initial display: only 6 project articles
    expect(screen.getAllByRole('article')).toHaveLength(6);

    // Click Show More Projects
    const toggleBtn = screen.getByRole('button', { name: /Show More Projects/i });
    expect(toggleBtn).toBeInTheDocument();
    fireEvent.click(toggleBtn);

    // All 9 projects now displayed
    expect(screen.getAllByRole('article')).toHaveLength(9);
    expect(screen.getByRole('button', { name: /Show Less/i })).toBeInTheDocument();

    // Click Show Less -> collapses back to 6
    fireEvent.click(screen.getByRole('button', { name: /Show Less/i }));
    expect(screen.getAllByRole('article')).toHaveLength(6);
  });

  it('resets expansion state to 6 when category tab or search query changes', () => {
    render(<ProjectsSection projects={FALLBACK_PROJECTS} />);

    // Expand to 9
    fireEvent.click(screen.getByRole('button', { name: /Show More Projects/i }));
    expect(screen.getAllByRole('article')).toHaveLength(9);

    // Switch category to Mobile App
    fireEvent.click(screen.getByRole('tab', { name: /Mobile App/i }));
    expect(screen.getAllByRole('article')).toHaveLength(1);

    // Switch category back to All -> resets to 6
    fireEvent.click(screen.getByRole('tab', { name: /All/i }));
    expect(screen.getAllByRole('article')).toHaveLength(6);
  });

  it('opens Quick View modal on card click, closes on Escape, and does NOT open modal when clicking external GitHub/Live Demo links', () => {
    render(<ProjectsSection projects={FALLBACK_PROJECTS} />);

    // Clicking external GitHub link inside card must NOT open modal
    const githubLinks = screen.getAllByRole('link', { name: /GitHub/i });
    fireEvent.click(githubLinks[0]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Clicking card title/body opens Quick View modal
    fireEvent.click(screen.getByText('Kanisius High School'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Technologies Used')).toBeInTheDocument();

    // Pressing Escape closes modal
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens Quick View modal via keyboard Enter and Space on a focused project card', () => {
    render(<ProjectsSection projects={FALLBACK_PROJECTS} />);

    const cards = screen.getAllByRole('article');
    expect(cards[0]).toHaveAttribute('tabindex', '0');

    cards[0].focus();
    fireEvent.keyDown(cards[0], { key: 'Enter' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.keyDown(cards[1], { key: ' ' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
