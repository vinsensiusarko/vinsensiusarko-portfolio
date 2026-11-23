import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { cn } from 'cn';
import {
  IconSearch,
  IconSun,
  IconMoon,
  IconMenu2,
  IconArrowLeft
} from '@tabler/icons-react';
import { useTheme } from '@/context/ThemeContext';
import { SeasonSwitcher } from '@/features/season/SeasonSwitcher';
import { CommandPalette } from '@/components/common/CommandPalette';
import { BrandLogo } from '@/components/common/BrandLogo';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';

const HOME_NAV_ITEMS = [
  { id: 'about', label: 'About', href: '#about' },
  { id: 'experience', label: 'Experience', href: '#experience' },
  { id: 'projects', label: 'Projects', href: '#projects' },
  { id: 'contact', label: 'Contact', href: '#contact' }
];

export function Navbar({ variant = 'home', siteName = 'Vinsensius Arka' }) {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      if (variant !== 'home') return;
      const sections = ['profile', 'about', 'experience', 'projects', 'contact'];
      const scrollPos = window.scrollY + 180;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [variant]);

  const closeMenu = () => setMenuOpen(false);
  const isDark = theme === 'dark';

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-200',
          scrolled
            ? 'border-b border-border bg-background/85 backdrop-blur-md'
            : 'border-b border-transparent bg-transparent'
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            {variant === 'policy' ? (
              <Link
                to="/"
                className="flex items-center gap-2.5 font-display text-base sm:text-lg font-semibold tracking-tight text-foreground"
              >
                <BrandLogo size={26} />
                <span>{siteName}</span>
              </Link>
            ) : (
              <a
                href="#profile"
                className="flex items-center gap-2.5 font-display text-base sm:text-lg font-semibold tracking-tight text-foreground"
              >
                <BrandLogo size={26} />
                <span>{siteName}</span>
              </a>
            )}
          </div>

          <nav aria-label="Primary navigation" className="hidden lg:flex items-center">
            {variant === 'policy' ? (
              <ul className="nav-links flex items-center gap-6 text-sm font-medium text-muted-foreground">
                <li>
                  <Link to="/" className="transition-colors hover:text-foreground">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/#projects" className="transition-colors hover:text-foreground">
                    Projects
                  </Link>
                </li>
                <li>
                  <Link to="/#contact" className="transition-colors hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            ) : (
              <ul className="nav-links flex items-center gap-6 text-sm font-medium text-muted-foreground">
                {HOME_NAV_ITEMS.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        className={cn(
                          'relative py-1 transition-colors hover:text-foreground',
                          isActive && 'text-foreground font-semibold'
                        )}
                      >
                        {item.label}
                        {isActive && (
                          <span
                            className="absolute right-0 -bottom-0.5 left-0 h-0.5 rounded-full bg-season-accent"
                            aria-hidden="true"
                          />
                        )}
                      </a>
                    </li>
                  );
                })}
                <li>
                  <Link
                    to="/privacy-policy"
                    className="transition-colors hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {variant === 'policy' && (
              <Button asChild size="sm" className="hidden lg:inline-flex">
                <Link to="/">
                  <IconArrowLeft data-icon="inline-start" aria-hidden="true" />
                  Back to Portfolio
                </Link>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPaletteOpen(true)}
              title="Search / Command Palette (Ctrl + K)"
              aria-label="Open Command Palette"
              className="h-9 gap-2 text-muted-foreground hover:text-foreground"
            >
              <IconSearch data-icon="inline-start" aria-hidden="true" />
              <kbd className="hidden sm:inline font-mono text-[11px] text-muted-foreground">
                Ctrl K
              </kbd>
            </Button>

            <SeasonSwitcher />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              className="size-9"
            >
              {isDark ? (
                <IconSun className="size-4" aria-hidden="true" />
              ) : (
                <IconMoon className="size-4" aria-hidden="true" />
              )}
            </Button>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Toggle navigation menu"
                  className="lg:hidden size-11"
                >
                  <IconMenu2 className="size-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 sm:max-w-sm">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 font-display">
                    <BrandLogo size={22} />
                    <span>{siteName}</span>
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Site navigation menu
                  </SheetDescription>
                </SheetHeader>

                <Separator className="my-2" />

                <ul className="menu-links flex flex-col gap-1 px-4" id="mobile-menu">
                  {variant === 'policy' ? (
                    <>
                      <li>
                        <Link
                          to="/"
                          onClick={closeMenu}
                          className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          Home
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/#about"
                          onClick={closeMenu}
                          className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          About
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/#projects"
                          onClick={closeMenu}
                          className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          Projects
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/#contact"
                          onClick={closeMenu}
                          className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          Contact
                        </Link>
                      </li>
                      <li className="pt-3">
                        <Button asChild className="w-full" onClick={closeMenu}>
                          <Link to="/">
                            <IconArrowLeft data-icon="inline-start" aria-hidden="true" />
                            Back to Portfolio
                          </Link>
                        </Button>
                      </li>
                    </>
                  ) : (
                    <>
                      {HOME_NAV_ITEMS.map((item) => (
                        <li key={item.id}>
                          <a
                            href={item.href}
                            onClick={closeMenu}
                            className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                          >
                            {item.label}
                          </a>
                        </li>
                      ))}
                      <li>
                        <Link
                          to="/privacy-policy"
                          onClick={closeMenu}
                          className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                        >
                          Privacy Policy
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <CommandPalette
        isOpen={paletteOpen}
        onOpen={() => setPaletteOpen(true)}
        onClose={() => setPaletteOpen(false)}
      />
    </>
  );
}
