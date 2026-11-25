import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LazyMotion, MotionConfig, domMax } from 'motion/react';
import { ProjectModal } from '../../../src/components/sections/ProjectModal';

function renderModal(project, onClose = vi.fn()) {
  return render(
    <MotionConfig reducedMotion="always">
      <LazyMotion features={domMax} strict>
        <ProjectModal project={project} onClose={onClose} />
      </LazyMotion>
    </MotionConfig>
  );
}

describe('ProjectModal Gallery', () => {
  const singleImageProject = {
    id: 'proj-1',
    title: 'Single Image App',
    image: '/assets/images/portfolio-1.png'
  };

  const galleryProject = {
    id: 'proj-2',
    title: 'Multi Image App',
    image: '/assets/images/portfolio-1.png',
    gallery: [
      '/assets/images/portfolio-1.png',
      '/assets/images/portfolio-2.png',
      '/assets/images/portfolio-3.png'
    ]
  };

  it('renders single image without gallery strip when gallery is absent (Review Focus #1)', () => {
    renderModal(singleImageProject);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /Image Gallery Thumbnails/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Previous image/i)).not.toBeInTheDocument();
  });

  it('renders gallery with counter, prev/next arrows, and thumbnail strip (Review Focus #2)', () => {
    renderModal(galleryProject);
    
    // Counter badge
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    // Prev and Next buttons
    const nextBtn = screen.getByLabelText(/Next image/i);
    const prevBtn = screen.getByLabelText(/Previous image/i);
    expect(nextBtn).toBeInTheDocument();
    expect(prevBtn).toBeInTheDocument();

    // Click Next -> counter becomes 2 / 3
    fireEvent.click(nextBtn);
    expect(screen.getByText('2 / 3')).toBeInTheDocument();

    // Click Prev -> counter returns to 1 / 3
    fireEvent.click(prevBtn);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    // Click Prev again -> wraps around to 3 / 3
    fireEvent.click(prevBtn);
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('supports keyboard ArrowLeft and ArrowRight navigation and Escape dismissal', () => {
    const onCloseMock = vi.fn();
    renderModal(galleryProject, onCloseMock);

    // ArrowRight -> 2 / 3
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(screen.getByText('2 / 3')).toBeInTheDocument();

    // ArrowLeft -> 1 / 3
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    // Escape -> triggers onClose
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('ignores arrow keys when focused inside an input or textarea element (Review Focus #3)', () => {
    renderModal(galleryProject);

    // Create an input in the document and focus it
    const testInput = document.createElement('input');
    document.body.appendChild(testInput);
    testInput.focus();

    fireEvent.keyDown(testInput, { key: 'ArrowRight' });
    // Still 1 / 3 because input event was ignored
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    document.body.removeChild(testInput);
  });

  it('toggles between DeviceFrame and Full preview modes with aria-pressed', () => {
    renderModal({
      ...singleImageProject,
      category: 'Mobile Application'
    });

    const toggleBtn = screen.getByRole('button', { name: /Switch to full preview/i });
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');
    expect(document.querySelector('[data-device-frame="mobile"]')).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByRole('button', { name: /Switch to device frame preview/i })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(document.querySelector('[data-device-frame="mobile"]')).not.toBeInTheDocument();
  });

  it('renders optional Case Study role, period, and highlights only when present', () => {
    renderModal({
      ...singleImageProject,
      role: 'Full-Stack Developer',
      period: '2025',
      highlights: ['Shipped real-time inventory sync', 'Reduced query latency']
    });

    expect(screen.getByText('Full-Stack Developer')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
    expect(screen.getByText('Key Highlights')).toBeInTheDocument();
    expect(screen.getByText('Shipped real-time inventory sync')).toBeInTheDocument();
  });

  it('copies shareable project deep-link to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true
    });

    renderModal(singleImageProject);
    fireEvent.click(screen.getByRole('button', { name: /Copy Link/i }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining('/?project=proj-1')
      );
    });
    expect(screen.getByRole('button', { name: /Copied/i })).toBeInTheDocument();
  });
});
