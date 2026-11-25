import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { cn } from 'cn';
import {
  IconSearch,
  IconCompass,
  IconHome,
  IconUser,
  IconBriefcase,
  IconCode,
  IconDeviceLaptop,
  IconMail,
  IconShieldCheck,
  IconLock,
  IconLayoutGrid,
  IconDeviceMobile,
  IconSun,
  IconMoon,
  IconSeeding,
  IconLeaf,
  IconSnowflake,
  IconArrowRight
} from '@tabler/icons-react';
import { useSeason } from '@/context/SeasonContext';
import { useTheme } from '@/context/ThemeContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export function CommandPalette({
  isOpen: controlledIsOpen,
  onOpen,
  onClose,
  customActions = []
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navigate = useNavigate();
  const { season, setSeason } = useSeason();
  const { theme, toggleTheme } = useTheme();

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalOpen;

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const selectedIndexRef = useRef(0);
  selectedIndexRef.current = selectedIndex;

  // Global Ctrl+K / Cmd+K key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isControlled) {
          if (isOpen) onClose?.();
          else onOpen?.();
        } else {
          setInternalOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isControlled, isOpen, onOpen, onClose]);

  // Prevent background scroll bleed while open and restore on unmount
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
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
      {
        id: 'nav-hero',
        label: 'Go to Home / Hero Section',
        category: 'Navigation',
        Icon: IconHome,
        onSelect: () => scrollToSection('profile')
      },
      {
        id: 'nav-about',
        label: 'Go to About Me',
        category: 'Navigation',
        Icon: IconUser,
        onSelect: () => scrollToSection('about')
      },
      {
        id: 'nav-journey',
        label: 'Go to Career & Education Timeline',
        category: 'Navigation',
        Icon: IconBriefcase,
        onSelect: () => scrollToSection('journey')
      },
      {
        id: 'nav-experience',
        label: 'Go to Experience & Skills',
        category: 'Navigation',
        Icon: IconCode,
        onSelect: () => scrollToSection('experience')
      },
      {
        id: 'nav-projects',
        label: 'Go to Projects Grid',
        category: 'Navigation',
        Icon: IconDeviceLaptop,
        onSelect: () => scrollToSection('projects')
      },
      {
        id: 'nav-contact',
        label: 'Go to Contact Info',
        category: 'Navigation',
        Icon: IconMail,
        onSelect: () => scrollToSection('contact')
      },
      {
        id: 'nav-privacy',
        label: 'Open Privacy Policy',
        category: 'Navigation',
        Icon: IconShieldCheck,
        onSelect: () => {
          handleClose();
          navigate('/privacy-policy');
        }
      },
      {
        id: 'nav-admin',
        label: 'Go to Admin CMS',
        category: 'Navigation',
        Icon: IconLock,
        onSelect: () => {
          handleClose();
          navigate('/admin');
        }
      },
      {
        id: 'filter-all',
        label: 'Filter Projects: All Projects',
        category: 'Projects',
        Icon: IconLayoutGrid,
        onSelect: () => {
          scrollToSection('projects');
          const chip = document.querySelector('.filter-chip[data-filter="all"]');
          chip?.click();
        }
      },
      {
        id: 'filter-mobile',
        label: 'Filter Projects: Mobile App',
        category: 'Projects',
        Icon: IconDeviceMobile,
        onSelect: () => {
          scrollToSection('projects');
          const chip = document.querySelector('.filter-chip[data-filter="Mobile Application"]');
          chip?.click();
        }
      },
      {
        id: 'filter-web',
        label: 'Filter Projects: Web App',
        category: 'Projects',
        Icon: IconDeviceLaptop,
        onSelect: () => {
          scrollToSection('projects');
          const chip = document.querySelector('.filter-chip[data-filter="Web Application"]');
          chip?.click();
        }
      },
      {
        id: 'action-theme',
        label: `Switch Theme to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
        category: 'Preferences',
        Icon: theme === 'dark' ? IconSun : IconMoon,
        onSelect: () => {
          toggleTheme();
          handleClose();
        }
      },
      {
        id: 'season-spring',
        label: 'Set Season: Spring',
        category: 'Seasons',
        Icon: IconSeeding,
        onSelect: () => {
          setSeason('spring');
          handleClose();
        }
      },
      {
        id: 'season-summer',
        label: 'Set Season: Summer',
        category: 'Seasons',
        Icon: IconSun,
        onSelect: () => {
          setSeason('summer');
          handleClose();
        }
      },
      {
        id: 'season-autumn',
        label: 'Set Season: Autumn',
        category: 'Seasons',
        Icon: IconLeaf,
        onSelect: () => {
          setSeason('autumn');
          handleClose();
        }
      },
      {
        id: 'season-winter',
        label: 'Set Season: Winter',
        category: 'Seasons',
        Icon: IconSnowflake,
        onSelect: () => {
          setSeason('winter');
          handleClose();
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme, season]
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

  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector('.command-item.is-selected');
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handleClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      const next = filteredActions.length
        ? Math.min(filteredActions.length - 1, selectedIndexRef.current + 1)
        : 0;
      selectedIndexRef.current = next;
      setSelectedIndex(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      const next = filteredActions.length ? Math.max(0, selectedIndexRef.current - 1) : 0;
      selectedIndexRef.current = next;
      setSelectedIndex(next);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const currentAction = filteredActions[selectedIndexRef.current];
      if (currentAction) {
        currentAction.onSelect();
      }
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
        else onOpen?.();
      }}
    >
      <DialogContent
        showCloseButton={false}
        aria-label="Command Palette"
        onKeyDown={handleKeyDown}
        className="overflow-hidden p-0 gap-0 sm:max-w-xl rounded-xl border-border bg-popover"
      >
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search sections, filter projects, or switch theme and season preferences.
        </DialogDescription>

        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3 transition-shadow focus-within:ring-2 focus-within:ring-season-accent focus-within:ring-inset">
          <IconSearch className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="command-palette-input" className="sr-only">
            Search commands
          </label>
          <input
            id="command-palette-input"
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
            placeholder="Type a command or search sections (Esc to exit)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div
          className="max-h-80 overflow-y-auto p-2 flex flex-col gap-0.5"
          ref={listRef}
          role="listbox"
        >
          {filteredActions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
              <IconCompass className="size-6 opacity-60" aria-hidden="true" />
              <p className="text-sm">No matching commands found for &ldquo;{query}&rdquo;</p>
            </div>
          ) : (
            filteredActions.map((action, idx) => {
              const isSelected = idx === selectedIndex;
              const ActionIcon = action.Icon || IconArrowRight;
              return (
                <button
                  key={action.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => action.onSelect()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'command-item flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                    isSelected
                      ? 'is-selected bg-accent text-accent-foreground'
                      : 'text-foreground hover:bg-muted/60'
                  )}
                >
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-md border',
                      isSelected
                        ? 'border-season-border bg-season-surface text-season-foreground'
                        : 'border-border bg-muted/60 text-muted-foreground'
                    )}
                  >
                    <ActionIcon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="flex-1 truncate font-medium">{action.label}</span>
                  <Badge variant="secondary" className="text-[11px] font-normal">
                    {action.category}
                  </Badge>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-card px-1 font-mono text-[10px]">↑</kbd>
              <kbd className="rounded border border-border bg-card px-1 font-mono text-[10px]">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-card px-1 font-mono text-[10px]">↵</kbd>
              Select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-card px-1 font-mono text-[10px]">Esc</kbd>
            Close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
