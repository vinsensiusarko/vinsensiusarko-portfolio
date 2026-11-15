import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const SoundContext = createContext({
  isMuted: true,
  toggleMute: () => {},
  playClick: () => {},
  playModalOpen: () => {},
  playModalClose: () => {},
  playChime: () => {}
});

export function SoundProvider({ children }) {
  const [isMuted, setIsMuted] = useState(() => {
    try {
      const stored = localStorage.getItem('portfolio_sound_muted');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  const audioCtxRef = useRef(null);

  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new AudioContextClass();
      } catch (err) {
        console.warn('AudioContext creation failed:', err);
        return null;
      }
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }

    return audioCtxRef.current;
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('portfolio_sound_muted', String(next));
      } catch {
        // Ignore storage write issues
      }
      return next;
    });
  }, []);

  // 1. Subtle click pop (e.g. for button taps & filter chips)
  const playClick = useCallback((options = {}) => {
    if (isMuted && !options.force) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.035);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch {
      // Audio playback fails gracefully
    }
  }, [isMuted, getAudioContext]);

  // 2. Modal open swell
  const playModalOpen = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Graceful fallback
    }
  }, [isMuted, getAudioContext]);

  // 3. Modal close descent
  const playModalClose = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // Graceful fallback
    }
  }, [isMuted, getAudioContext]);

  // 4. Harmonic season / command chime (C5 to E5)
  const playChime = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Tone 1: C5 (523.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.1, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Tone 2: E5 (659.25 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.06);
      gain2.gain.setValueAtTime(0.12, now + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.06);
      osc2.stop(now + 0.22);
    } catch {
      // Graceful fallback
    }
  }, [isMuted, getAudioContext]);

  return (
    <SoundContext.Provider
      value={{
        isMuted,
        toggleMute,
        playClick,
        playModalOpen,
        playModalClose,
        playChime
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}
