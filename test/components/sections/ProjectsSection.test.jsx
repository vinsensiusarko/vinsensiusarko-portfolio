import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LazyMotion, MotionConfig, domMax } from 'motion/react';
import { ProjectsSection } from '../../../src/components/sections/ProjectsSection';
import { FALLBACK_PROJECTS } from '../../../src/data/fallbackData';

function renderProjects(projects = FALLBACK_PROJECTS) {
  return render(
    <MotionConfig reducedMotion="always">
      <LazyMotion features={domMax} strict>
        <ProjectsSection projects={projects} />
      </LazyMotion>
    </MotionConfig>
  );
}

describe('ProjectsSection & ProjectModal', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/');
  });
  it('filters projects by category (including technology-inferred matches) and resets empty search results', async () => {
    renderProjects();

    expect(screen.getAllByRole('article')).toHaveLength(6);

    fireEvent.click(screen.getByRole('tab', { name: /Mobile App/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(1);
    });
    expect(screen.getByText('Mozaic POS App')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search projects/i);
    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT_TECH_XYZ' } });

    await waitFor(() => {
      expect(screen.queryAllByRole('article')).toHaveLength(0);
    });
    expect(screen.getByText(/No matching projects found/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(6);
    });
  });

  it('limits initial display to 6 projects and toggles show more/less (Review Focus #2)', async () => {
    renderProjects();

    expect(screen.queryByRole('button', { name: /Details/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(6);

    const toggleBtn = screen.getByRole('button', { name: /Show More Projects/i });
    expect(toggleBtn).toBeInTheDocument();
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(9);
    });
    expect(screen.getByRole('button', { name: /Show Less/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Show Less/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(6);
    });
  });

  it('resets expansion state to 6 when category tab or search query changes', async () => {
    renderProjects();

    fireEvent.click(screen.getByRole('button', { name: /Show More Projects/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(9);
    });

    fireEvent.click(screen.getByRole('tab', { name: /Mobile App/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(1);
    });

    fireEvent.click(screen.getByRole('tab', { name: /All/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('article')).toHaveLength(6);
    });
  });

  it('opens Quick View modal on card click, closes on Escape, and does NOT open modal when clicking external GitHub/Live Demo links', () => {
    renderProjects();

    const githubLinks = screen.getAllByRole('link', { name: /GitHub/i });
    fireEvent.click(githubLinks[0]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Kanisius High School'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Technologies Used')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens Quick View modal via keyboard Enter and Space on a focused project card', () => {
    renderProjects();

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

  it('auto-opens matching project modal from ?project=<id> deep-link and clears param on close', async () => {
    window.history.replaceState(null, '', '/?project=mozaic-pos-app&ref=linkedin');
    renderProjects();

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'Mozaic POS App' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(window.location.search).toBe('?ref=linkedin');
  });

  it('preserves window.history.state during URL sync and hydrates open modal when projects update', async () => {
    const routerState = { idx: 2, key: 'abc123', usr: null };
    window.history.replaceState(routerState, '', '/?project=mozaic-pos-app');
    const { rerender } = renderProjects();

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const updatedProjects = FALLBACK_PROJECTS.map((p) =>
      p.id === 'mozaic-pos-app' ? { ...p, role: 'Lead Mobile Engineer', period: '2026' } : p
    );
    rerender(
      <MotionConfig reducedMotion="always">
        <LazyMotion features={domMax} strict>
          <ProjectsSection projects={updatedProjects} />
        </LazyMotion>
      </MotionConfig>
    );

    expect(screen.getByText('Lead Mobile Engineer')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(window.history.state).toEqual(routerState);
  });
});
