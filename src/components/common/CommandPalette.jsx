import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useSeason } from '../../context/SeasonContext';
import { useSound } from '../../context/SoundContext';
import { useTheme } from '../../context/ThemeContext';

export function CommandPalette({ isOpen: controlledIsOpen, onClose, customActions = [] }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navigate = useNavigate();
  const { season, setSeason } = useSeason();
  const { playClick, playModalOpen, playModalClose, playChime, isMuted, toggleMute } = useSound();
  const { theme, toggleTheme } = useTheme();

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalOpen;

  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Global Ctrl+K / Cmd+K key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isControlled) {
          if (isOpen) onClose?.();
          else onClose?.(true);
        } else {
          setInternalOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isControlled, isOpen, onClose]);

  // Focus input and sound on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      playModalOpen();
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, playModalOpen]);

  const handleClose = () => {
    playModalClose();
    if (isControlled) {
      onClose?.();
    } else {
      setInternalOpen(false);
    }
  };

  const scrollToSection = (id) => {
    handleClose();
    if (window.location.pathname !== '/') {
      navigate(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const defaultActions = useMemo(
    () => [
      // Sections Navigation
      {
        id: 'nav-hero',
        label: 'Go to Home / Hero Section',
        category: 'Navigation',
        icon: 'fa-solid fa-house',
        onSelect: () => scrollToSection('profile')
      },
      {
        id: 'nav-about',
        label: 'Go to About Me',
        category: 'Navigation',
        icon: 'fa-solid fa-user',
        onSelect: () => scrollToSection('about')
      },
      {
        id: 'nav-experience',
        label: 'Go to Experience & Skills',
        category: 'Navigation',
        icon: 'fa-solid fa-code',
        onSelect: () => scrollToSection('experience')
      },
      {
        id: 'nav-projects',
        label: 'Go to Projects Grid',
        category: 'Navigation',
        icon: 'fa-solid fa-laptop-code',
        onSelect: () => scrollToSection('projects')
      },
      {
        id: 'nav-contact',
        label: 'Go to Contact Info',
        category: 'Navigation',
        icon: 'fa-solid fa-envelope',
        onSelect: () => scrollToSection('contact')
      },
      {
        id: 'nav-privacy',
        label: 'Open Privacy Policy',
        category: 'Navigation',
        icon: 'fa-solid fa-shield-halved',
        onSelect: () => {
          handleClose();
          navigate('/privacy-policy');
        }
      },
      {
        id: 'nav-admin',
        label: 'Go to Admin CMS',
        category: 'Navigation',
        icon: 'fa-solid fa-lock',
        onSelect: () => {
          handleClose();
          navigate('/admin');
        }
      },

      // Quick Actions
      {
        id: 'action-theme',
        label: `Switch Theme to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        category: 'Preferences',
        icon: theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon',
        onSelect: () => {
          toggleTheme();
          playClick();
          handleClose();
        }
      },
      {
        id: 'action-sound',
        label: isMuted ? 'Enable Sound Effects' : 'Mute Sound Effects',
        category: 'Preferences',
        icon: isMuted ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark',
        onSelect: () => {
          toggleMute();
          playClick();
          handleClose();
        }
      },
      {
        id: 'season-spring',
        label: 'Set Season: Spring 🌸',
        category: 'Seasons',
        icon: 'fa-solid fa-seedling',
        onSelect: () => {
          setSeason('spring');
          playChime();
          handleClose();
        }
      },
      {
        id: 'season-summer',
        label: 'Set Season: Summer ☀️',
        category: 'Seasons',
        icon: 'fa-solid fa-sun',
        onSelect: () => {
          setSeason('summer');
          playChime();
          handleClose();
        }
      },
      {
        id: 'season-autumn',
        label: 'Set Season: Autumn 🍂',
        category: 'Seasons',
        icon: 'fa-solid fa-leaf',
        onSelect: () => {
          setSeason('autumn');
          playChime();
          handleClose();
        }
      },
      {
        id: 'season-winter',
        label: 'Set Season: Winter ❄️',
        category: 'Seasons',
        icon: 'fa-solid fa-snowflake',
        onSelect: () => {
          setSeason('winter');
          playChime();
          handleClose();
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme, isMuted, season]
  );

  const allActions = useMemo(
    () => [...customActions, ...defaultActions],
    [customActions, defaultActions]
  );

  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allActions;
    return allActions.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [allActions, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector('.command-item.is-selected');
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredActions.length ? (prev + 1) % filteredActions.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        filteredActions.length ? (prev - 1 + filteredActions.length) % filteredActions.length : 0
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].onSelect();
      }
    }
  };

  return (
    <div
      className="command-palette-backdrop show"
      onClick={(e) => {
        if (e.target.classList.contains('command-palette-backdrop')) {
          handleClose();
        }
      }}
    >
      <div
        className="command-palette-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        onKeyDown={handleKeyDown}
      >
        <div className="command-palette-header">
          <i className="fa-solid fa-magnifying-glass command-search-icon"></i>
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            placeholder="Type a command or search sections (Esc to exit)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="command-palette-kbd">ESC</kbd>
        </div>

        <div className="command-palette-list" ref={listRef} role="listbox">
          {filteredActions.length === 0 ? (
            <div className="command-empty-state">
              <i className="fa-solid fa-compass"></i>
              <p>No matching commands found for &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            filteredActions.map((action, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={action.id}
                  className={`command-item ${isSelected ? 'is-selected' : ''}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => action.onSelect()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="command-item-icon">
                    <i className={action.icon || 'fa-solid fa-arrow-right'}></i>
                  </div>
                  <div className="command-item-label">{action.label}</div>
                  <span className="command-item-category">{action.category}</span>
                </div>
              );
            })
          )}
        </div>

        <div className="command-palette-footer">
          <span className="command-footer-tip">
            <kbd>↑</kbd> <kbd>↓</kbd> Navigate
          </span>
          <span className="command-footer-tip">
            <kbd>↵</kbd> Select
          </span>
          <span className="command-footer-tip">
            <kbd>Esc</kbd> Close
          </span>
        </div>
      </div>
    </div>
  );
}
