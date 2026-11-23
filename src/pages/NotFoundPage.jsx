import { Link } from 'react-router';
import { IconArrowLeft } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <main className="relative z-10 flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center text-foreground">
      <span className="rounded-md border border-season-border bg-season-surface px-3 py-1 font-mono text-xs font-semibold text-season-foreground">
        ERROR 404
      </span>
      <h1 className="mt-4 font-display text-4xl sm:text-5xl font-bold tracking-tight">
        Oops!
      </h1>
      <p className="mt-3 max-w-md text-sm sm:text-base text-muted-foreground">
        Halaman yang Anda cari tidak ditemukan.
      </p>
      <Button asChild size="lg" className="mt-7 min-h-11">
        <Link to="/">
          <IconArrowLeft data-icon="inline-start" aria-hidden="true" />
          Back to Portfolio
        </Link>
      </Button>
    </main>
  );
}
