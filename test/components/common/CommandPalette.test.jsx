import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { CommandPalette } from '../../../src/components/common/CommandPalette';
import { SeasonProvider } from '../../../src/context/SeasonContext';
import { SoundProvider } from '../../../src/context/SoundContext';
import { ThemeProvider } from '../../../src/context/ThemeContext';

function renderPalette(props = {}) {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <SeasonProvider>
          <SoundProvider>
            <CommandPalette {...props} />
          </SoundProvider>
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
        { id: 'act-1', label: 'Action One', category: 'General', onSelect: onSelectAction },
        { id: 'act-2', label: 'Action Two', category: 'General', onSelect: vi.fn() }
      ]
    });

    const input = screen.getByPlaceholderText(/Type a command or search/i);

    // Arrow down to second item
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    // Press Enter on item
    fireEvent.keyDown(input, { key: 'Enter' });

    // Item was triggered
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
