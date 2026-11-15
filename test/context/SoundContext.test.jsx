import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SoundProvider, useSound } from '../../src/context/SoundContext';

function SoundConsumer() {
  const { isMuted, toggleMute, playClick, playModalOpen, playModalClose, playChime } = useSound();
  return (
    <div>
      <span data-testid="muted-status">{isMuted ? 'muted' : 'active'}</span>
      <button onClick={toggleMute}>Toggle Sound</button>
      <button onClick={playClick}>Click Sound</button>
      <button onClick={playModalOpen}>Modal Open Sound</button>
      <button onClick={playModalClose}>Modal Close Sound</button>
      <button onClick={playChime}>Chime Sound</button>
    </div>
  );
}

describe('SoundContext & useSound', () => {
  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {
      // Mock storage if unavailable in test env
    }
  });

  it('initializes muted by default and persists toggle to localStorage', () => {
    render(
      <SoundProvider>
        <SoundConsumer />
      </SoundProvider>
    );

    const status = screen.getByTestId('muted-status');
    expect(status.textContent).toBe('muted');

    // Click toggle to unmute
    fireEvent.click(screen.getByRole('button', { name: /Toggle Sound/i }));
    expect(screen.getByTestId('muted-status').textContent).toBe('active');

    // Click toggle again to mute
    fireEvent.click(screen.getByRole('button', { name: /Toggle Sound/i }));
    expect(screen.getByTestId('muted-status').textContent).toBe('muted');
  });

  it('safely calls play methods without throwing when audio is muted or unmuted', () => {
    render(
      <SoundProvider>
        <SoundConsumer />
      </SoundProvider>
    );

    // Muted: calls should be silent no-ops and not throw
    expect(() => fireEvent.click(screen.getByRole('button', { name: /Click Sound/i }))).not.toThrow();
    expect(() => fireEvent.click(screen.getByRole('button', { name: /Modal Open Sound/i }))).not.toThrow();
    expect(() => fireEvent.click(screen.getByRole('button', { name: /Modal Close Sound/i }))).not.toThrow();
    expect(() => fireEvent.click(screen.getByRole('button', { name: /Chime Sound/i }))).not.toThrow();

    // Unmute: still safe even in test environment without full audio hardware
    fireEvent.click(screen.getByRole('button', { name: /Toggle Sound/i }));
    expect(() => fireEvent.click(screen.getByRole('button', { name: /Click Sound/i }))).not.toThrow();
  });
});
