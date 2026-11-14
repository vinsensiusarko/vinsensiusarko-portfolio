import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectsSection } from './ProjectsSection';
import { FALLBACK_PROJECTS } from '../../data/fallbackData';

describe('ProjectsSection & ProjectModal', () => {
  it('filters projects by category (including technology-inferred matches) and resets empty search results (Review Focus #4)', () => {
    render(<ProjectsSection projects={FALLBACK_PROJECTS} />);

    // Initially all 9 fallback projects are rendered
    expect(screen.getAllByRole('article')).toHaveLength(9);

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
    expect(screen.getAllByRole('article')).toHaveLength(9);
  });

  it('opens Quick View modal on card click, closes on Escape, and does NOT open modal when clicking external GitHub/Live Demo links (Review Focus #5)', () => {
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
});
