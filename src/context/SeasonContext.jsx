import { createContext, useContext, useState, useEffect } from 'react';
import {
  SEASONS,
  VALID_SEASON_IDS,
  detectSeasonByMonth
} from '../features/season/seasonConfig';

const SeasonContext = createContext(null);

function getInitialSeasonState() {
  try {
    const saved = localStorage.getItem('season');
    if (saved && VALID_SEASON_IDS.includes(saved)) {
      return { season: saved, isAutoSeason: false };
    }
    if (saved && !VALID_SEASON_IDS.includes(saved)) {
      localStorage.removeItem('season');
    }
  } catch (e) {}

  return { season: detectSeasonByMonth(), isAutoSeason: true };
}

function getInitialParticlesEnabled() {
  try {
    const saved = localStorage.getItem('season_particles');
    if (saved === 'true') return true;
    if (saved === 'false') return false;
  } catch (e) {}

  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return false;
  }
  return true;
}

export function SeasonProvider({ children }) {
  const [seasonState, setSeasonState] = useState(getInitialSeasonState);
  const [particlesEnabled, setParticlesEnabled] = useState(
    getInitialParticlesEnabled
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-season', seasonState.season);
  }, [seasonState.season]);

  const setSeason = (nextSeason) => {
    if (!VALID_SEASON_IDS.includes(nextSeason)) return;
    try {
      localStorage.setItem('season', nextSeason);
    } catch (e) {}
    setSeasonState({ season: nextSeason, isAutoSeason: false });
  };

  const resetToAutoSeason = () => {
    try {
      localStorage.removeItem('season');
    } catch (e) {}
    setSeasonState({ season: detectSeasonByMonth(), isAutoSeason: true });
  };

  const toggleParticles = () => {
    setParticlesEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('season_particles', String(next));
      } catch (e) {}
      return next;
    });
  };

  const seasonMeta = SEASONS[seasonState.season] || SEASONS.spring;

  return (
    <SeasonContext.Provider
      value={{
        season: seasonState.season,
        setSeason,
        isAutoSeason: seasonState.isAutoSeason,
        resetToAutoSeason,
        particlesEnabled,
        toggleParticles,
        seasonMeta,
        seasons: SEASONS
      }}
    >
      {children}
    </SeasonContext.Provider>
  );
}

export function useSeason() {
  const ctx = useContext(SeasonContext);
  if (!ctx) {
    throw new Error('useSeason must be used within a SeasonProvider');
  }
  return ctx;
}
