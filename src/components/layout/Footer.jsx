import { Link } from 'react-router';

export function Footer({ variant = 'home', siteName = 'Vinsensius Arka' }) {
  const currentYear = new Date().getFullYear();

  if (variant === 'policy') {
    return (
      <footer className="policy-footer">
        <p>
          Copyright &#169; <span id="current-year">{currentYear}</span> {siteName}. All
          Rights Reserved.
        </p>
      </footer>
    );
  }

  return (
    <footer>
      <nav aria-label="Footer navigation">
        <ul className="nav-links">
          <li>
            <a href="#about">About</a>
          </li>
          <li>
            <a href="#experience">Experience</a>
          </li>
          <li>
            <a href="#projects">Projects</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
          <li>
            <Link to="/privacy-policy">Privacy Policy</Link>
          </li>
        </ul>
      </nav>
      <p>
        Copyright &#169; <span id="current-year">{currentYear}</span> {siteName}. All
        Rights Reserved.
      </p>
    </footer>
  );
}
