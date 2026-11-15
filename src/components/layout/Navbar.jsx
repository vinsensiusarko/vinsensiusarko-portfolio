import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useTheme } from '../../context/ThemeContext';
import { SeasonSwitcher } from '../../features/season/SeasonSwitcher';
import { CommandPalette } from '../common/CommandPalette';

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

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const isDark = theme === 'dark';

  return (
    <>
      <nav
        id="desktop-nav"
        className={`${variant === 'policy' ? 'policy-nav' : ''} ${scrolled ? 'scrolled' : ''}`.trim()}
      >
        <div className="logo">
          {variant === 'policy' ? (
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              {siteName}
            </Link>
          ) : (
            <a href="#profile">{siteName}</a>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {variant === 'policy' ? (
            <>
              <ul className="nav-links policy-nav-links">
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/#projects">Projects</Link>
                </li>
                <li>
                  <Link to="/#contact">Contact</Link>
                </li>
              </ul>
              <Link to="/" className="btn btn-color-1 btn-nav-back">
                <i className="fa-solid fa-arrow-left"></i> Back to Portfolio
              </Link>
            </>
          ) : (
            <ul className="nav-links">
              <li>
                <a
                  href="#about"
                  className={activeSection === 'about' ? 'active-nav-link' : ''}
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#experience"
                  className={activeSection === 'experience' ? 'active-nav-link' : ''}
                >
                  Experience
                </a>
              </li>
              <li>
                <a
                  href="#projects"
                  className={activeSection === 'projects' ? 'active-nav-link' : ''}
                >
                  Projects
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className={activeSection === 'contact' ? 'active-nav-link' : ''}
                >
                  Contact
                </a>
              </li>
              <li>
                <Link to="/privacy-policy" className="nav-privacy-link">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          )}

          <button
            type="button"
            className="nav-search-btn"
            onClick={() => setPaletteOpen(true)}
            title="Search / Command Palette (Ctrl + K)"
            aria-label="Open Command Palette"
          >
            <i className="fa-solid fa-magnifying-glass"></i>
            <span className="nav-search-kbd">Ctrl K</span>
          </button>

          <SeasonSwitcher />

          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <i className={isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}></i>
          </button>
        </div>
      </nav>

      <nav id="hamburger-nav" className={scrolled ? 'scrolled' : ''}>
        <div className="logo">
          {variant === 'policy' ? (
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              {siteName}
            </Link>
          ) : (
            <a href="#profile">{siteName}</a>
          )}
        </div>

        <div className="hamburger-menu">
          <button
            type="button"
            className="nav-search-btn"
            onClick={() => setPaletteOpen(true)}
            title="Search / Command Palette (Ctrl + K)"
            aria-label="Open Command Palette"
          >
            <i className="fa-solid fa-magnifying-glass"></i>
            <span className="nav-search-kbd">Ctrl K</span>
          </button>

          <SeasonSwitcher />

          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <i className={isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}></i>
          </button>

          <button
            type="button"
            className={`hamburger-icon ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul className={`menu-links ${menuOpen ? 'open' : ''}`} id="mobile-menu">
            {variant === 'policy' ? (
              <>
                <li>
                  <Link to="/" onClick={closeMenu}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/#about" onClick={closeMenu}>
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/#projects" onClick={closeMenu}>
                    Projects
                  </Link>
                </li>
                <li>
                  <Link to="/#contact" onClick={closeMenu}>
                    Contact
                  </Link>
                </li>
                <li style={{ padding: '0.5rem 1rem' }}>
                  <Link
                    to="/"
                    onClick={closeMenu}
                    className="btn btn-color-1"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      fontSize: '0.88rem',
                      padding: '0.65rem 1rem'
                    }}
                  >
                    <i className="fa-solid fa-arrow-left"></i> Back to Portfolio
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <a href="#about" onClick={closeMenu}>
                    About
                  </a>
                </li>
                <li>
                  <a href="#experience" onClick={closeMenu}>
                    Experience
                  </a>
                </li>
                <li>
                  <a href="#projects" onClick={closeMenu}>
                    Projects
                  </a>
                </li>
                <li>
                  <a href="#contact" onClick={closeMenu}>
                    Contact
                  </a>
                </li>
                <li>
                  <Link to="/privacy-policy" onClick={closeMenu}>
                    Privacy Policy
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
