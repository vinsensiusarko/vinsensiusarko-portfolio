import { useState, useRef, useEffect } from 'react';
import { useSeason } from '../../context/SeasonContext';

export function SeasonSwitcher() {
  const {
    season,
    setSeason,
    isAutoSeason,
    resetToAutoSeason,
    particlesEnabled,
    toggleParticles,
    seasonMeta,
    seasons
  } = useSeason();

  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <div className="season-switcher" ref={containerRef}>
      <button
        type="button"
        className="season-switcher-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Pilih musim (saat ini: ${seasonMeta.labelId})`}
        title={`Tema Musim: ${seasonMeta.labelId} (${seasonMeta.labelEn})`}
      >
        <span className="season-emoji" aria-hidden="true">
          {seasonMeta.emoji}
        </span>
        <span className="season-label">{seasonMeta.labelId}</span>
        <i
          className={`fa-solid fa-chevron-down season-chevron ${open ? 'open' : ''}`}
          aria-hidden="true"
        ></i>
      </button>

      {open && (
        <div className="season-dropdown-menu" role="menu" aria-label="Pilihan Musim">
          <div className="season-dropdown-header">
            <span>Suasana Musim</span>
            {isAutoSeason && <span className="season-auto-tag">Auto</span>}
          </div>

          <div className="season-options-grid">
            {Object.values(seasons).map((item) => {
              const isActive = item.id === season;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  className={`season-option-btn ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setSeason(item.id);
                    setOpen(false);
                  }}
                >
                  <span className="season-option-emoji">{item.emoji}</span>
                  <div className="season-option-text">
                    <strong>{item.labelId}</strong>
                    <small>{item.labelEn}</small>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="season-dropdown-footer">
            <button
              type="button"
              className="season-toggle-particles-btn"
              onClick={toggleParticles}
            >
              <span>
                <i className="fa-solid fa-wand-magic-sparkles"></i> Efek Animasi
              </span>
              <span className={`season-status-pill ${particlesEnabled ? 'on' : 'off'}`}>
                {particlesEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            {!isAutoSeason && (
              <button
                type="button"
                className="season-reset-auto-btn"
                onClick={() => {
                  resetToAutoSeason();
                  setOpen(false);
                }}
              >
                <i className="fa-solid fa-rotate-left"></i> Ikuti Kalender Otomatis
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
