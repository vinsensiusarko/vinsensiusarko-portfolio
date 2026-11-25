import { Link } from 'react-router';
import { IconArrowLeft } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export function BackToPortfolioButton({
  to = '/',
  label = 'Back to Portfolio',
  size = 'default',
  emphasis = 'subtle',
  onClick,
  className
}) {
  const isNavbar = size === 'navbar';
  const isFeatured = emphasis === 'featured';

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'group inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border font-medium whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-season-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        isNavbar
          ? 'h-9 pl-2 pr-3.5 text-sm'
          : 'min-h-11 pl-2.5 pr-4 text-sm',
        isFeatured
          ? 'border-season-border bg-season-surface text-season-foreground shadow-xs hover:border-primary hover:bg-primary hover:text-primary-foreground'
          : 'border-border bg-card/90 text-foreground shadow-xs hover:border-season-border hover:bg-season-surface hover:text-season-foreground',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex shrink-0 items-center justify-center rounded-md transition-colors duration-200',
          isNavbar ? 'size-5.5' : 'size-6',
          isFeatured
            ? 'bg-background/70 text-season-foreground group-hover:bg-primary-foreground/15 group-hover:text-primary-foreground'
            : 'bg-muted text-muted-foreground group-hover:bg-background/80 group-hover:text-season-foreground'
        )}
      >
        <IconArrowLeft
          className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
          stroke={2}
        />
      </span>
      <span>{label}</span>
    </Link>
  );
}
