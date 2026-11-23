import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { CommandPalette } from '../../../src/components/common/CommandPalette';
import { SeasonProvider } from '../../../src/context/SeasonContext';
import { ThemeProvider } from '../../../src/context/ThemeContext';

function renderPalette(props = {}) {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <SeasonProvider>
          <CommandPalette {...props} />
        </SeasonProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('CommandPalette component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders open dialog when isOpen is true and closes on Escape key', () => {
    const onClose = vi.fn();
    renderPalette({ isOpen: true, onClose });

    const dialog = screen.getByRole('dialog', { name: /Command Palette/i });
    expect(dialog).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Type a command or search/i);
    expect(input).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('filters commands when user types in search input', () => {
    renderPalette({ isOpen: true, onClose: vi.fn() });

    const input = screen.getByPlaceholderText(/Type a command or search/i);
    fireEvent.change(input, { target: { value: 'Privacy' } });

    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
    expect(screen.queryByText(/Experience & Skills/i)).not.toBeInTheDocument();
  });

  it('navigates with ArrowDown, ArrowUp, and triggers action on Enter', () => {
    const onSelectAction = vi.fn();
    renderPalette({
      isOpen: true,
      onClose: vi.fn(),
      customActions: [
        { id: 'act-1', label: 'Action One', category: 'General', onSelect: vi.fn() },
        { id: 'act-2', label: 'Action Two', category: 'General', onSelect: onSelectAction }
      ]
    });

    const input = screen.getByPlaceholderText(/Type a command or search/i);

    // Arrow down to second item
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    // Press Enter on item
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelectAction).toHaveBeenCalled();
  });

  it('triggers onOpen when Ctrl+K is pressed while closed in controlled mode', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    renderPalette({ isOpen: false, onOpen, onClose });

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(onOpen).toHaveBeenCalled();
  });

  it('locks body overflow while open and restores on unmount', () => {
    const { unmount } = renderPalette({ isOpen: true, onClose: vi.fn() });
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('clamps arrow key navigation to bounds without wrapping', () => {
    const onSelectFirst = vi.fn();
    const onSelectLast = vi.fn();
    renderPalette({
      isOpen: true,
      onClose: vi.fn(),
      customActions: [
        { id: 'act-1', label: 'SpecialTest Alpha', category: 'Custom', onSelect: onSelectFirst },
        { id: 'act-2', label: 'SpecialTest Beta', category: 'Custom', onSelect: onSelectLast }
      ]
    });

    const input = screen.getByPlaceholderText(/Type a command or search/i);
    fireEvent.change(input, { target: { value: 'SpecialTest' } });

    // ArrowUp on first item should stay at first item (clamped, not wrap to end)
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelectFirst).toHaveBeenCalled();

    // ArrowDown several times should clamp to last item (SpecialTest Beta)
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelectLast).toHaveBeenCalled();
  });
});
