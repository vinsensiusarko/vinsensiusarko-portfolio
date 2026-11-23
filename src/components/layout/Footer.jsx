import { Link } from 'react-router';
import { Separator } from '@/components/ui/separator';

export function Footer({ variant = 'home', siteName = 'Vinsensius Arka' }) {
  const currentYear = new Date().getFullYear();

  if (variant === 'policy') {
    return (
      <footer className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 pb-12 pt-4 text-center">
        <Separator className="mb-8" />
        <p className="text-sm text-muted-foreground">
          Copyright &#169; <span id="current-year">{currentYear}</span> {siteName}. All
          Rights Reserved.
        </p>
      </footer>
    );
  }

  return (
    <footer className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-12 pt-4">
      <Separator className="mb-8" />
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          Copyright &#169; <span id="current-year">{currentYear}</span> {siteName}. All
          Rights Reserved.
        </p>

        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <li>
              <a href="#about" className="transition-colors hover:text-foreground">
                About
              </a>
            </li>
            <li>
              <a href="#experience" className="transition-colors hover:text-foreground">
                Experience
              </a>
            </li>
            <li>
              <a href="#projects" className="transition-colors hover:text-foreground">
                Projects
              </a>
            </li>
            <li>
              <a href="#contact" className="transition-colors hover:text-foreground">
                Contact
              </a>
            </li>
            <li>
              <Link to="/privacy-policy" className="transition-colors hover:text-foreground">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
