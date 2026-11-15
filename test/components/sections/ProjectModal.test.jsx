import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectModal } from '../../../src/components/sections/ProjectModal';

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
    render(<ProjectModal project={singleImageProject} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /Image Gallery Thumbnails/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Previous image/i)).not.toBeInTheDocument();
  });

  it('renders gallery with counter, prev/next arrows, and thumbnail strip (Review Focus #2)', () => {
    render(<ProjectModal project={galleryProject} onClose={vi.fn()} />);
    
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
    render(<ProjectModal project={galleryProject} onClose={onCloseMock} />);

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
    render(<ProjectModal project={galleryProject} onClose={vi.fn()} />);

    // Create an input in the document and focus it
    const testInput = document.createElement('input');
    document.body.appendChild(testInput);
    testInput.focus();

    fireEvent.keyDown(testInput, { key: 'ArrowRight' });
    // Still 1 / 3 because input event was ignored
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    document.body.removeChild(testInput);
  });
});
