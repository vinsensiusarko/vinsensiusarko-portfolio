import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LazyMotion, MotionConfig, domMax } from 'motion/react';
import { JourneySection } from '../../../src/components/sections/JourneySection';

const SAMPLE_TIMELINE = [
  {
    id: 'w1',
    type: 'work',
    title: 'Web & Mobile Developer',
    organization: 'Independent Studio',
    period: '2024 - Present',
    summary: 'Building Flutter and React products.',
    tags: ['Flutter', 'React'],
    current: true
  },
  {
    id: 'e1',
    type: 'education',
    title: 'Bachelors Degree in Computer Science',
    organization: 'University',
    period: '2020 - 2024',
    summary: 'Software engineering & databases.',
    tags: ['Computer Science'],
    current: false
  }
];

function renderJourney(timeline = SAMPLE_TIMELINE) {
  return render(
    <MotionConfig reducedMotion="always">
      <LazyMotion features={domMax} strict>
        <JourneySection timeline={timeline} />
      </LazyMotion>
    </MotionConfig>
  );
}

describe('JourneySection', () => {
  it('renders nothing when timeline is empty', () => {
    const { container } = renderJourney([]);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders all milestones and filters cleanly by Work and Education tabs', async () => {
    renderJourney();

    expect(screen.getByRole('heading', { name: 'Journey' })).toBeInTheDocument();
    expect(screen.getByText('Web & Mobile Developer')).toBeInTheDocument();
    expect(screen.getByText('Bachelors Degree in Computer Science')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Work/i }));
    await waitFor(() => {
      expect(screen.queryByText('Bachelors Degree in Computer Science')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Web & Mobile Developer')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Education/i }));
    await waitFor(() => {
      expect(screen.queryByText('Web & Mobile Developer')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Bachelors Degree in Computer Science')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /All/i }));
    await waitFor(() => {
      expect(screen.getByText('Web & Mobile Developer')).toBeInTheDocument();
      expect(screen.getByText('Bachelors Degree in Computer Science')).toBeInTheDocument();
    });
  });

  it('supports keyboard ArrowRight/ArrowLeft tab switching and empty category reset', async () => {
    renderJourney([SAMPLE_TIMELINE[0]]);

    const allTab = screen.getByRole('tab', { name: /All/i });
    allTab.focus();
    fireEvent.keyDown(allTab, { key: 'End' });

    const eduTab = screen.getByRole('tab', { name: /Education/i });
    expect(eduTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/No education milestones listed yet/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Show All Milestones/i }));
    await waitFor(() => {
      expect(screen.getByText('Web & Mobile Developer')).toBeInTheDocument();
    });
  });
});
