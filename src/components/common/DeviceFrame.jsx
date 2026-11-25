import { cn } from '../../lib/utils';

export function getDeviceVariant(category = '') {
  const normalized = String(category).toLowerCase();
  if (normalized.includes('mobile')) return 'mobile';
  if (
    normalized.includes('desktop') ||
    normalized.includes('backend') ||
    normalized.includes('api')
  ) {
    return 'desktop';
  }
  return 'web';
}

function getAddressLabel(url, fallbackTitle) {
  if (url) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.hostname.replace(/^www\./, '');
      }
    } catch {
      // Fall back to project title below
    }
  }
  return fallbackTitle || 'Web Preview';
}

export function DeviceFrame({ variant = 'web', title = '', url = '', className, children }) {
  if (variant === 'mobile') {
    return (
      <div
        data-device-frame="mobile"
        className={cn(
          'mx-auto w-full max-w-[260px] rounded-[1.75rem] border-2 border-border bg-card p-2 shadow-sm sm:max-w-[280px]',
          className
        )}
      >
        <div
          aria-hidden="true"
          className="mx-auto mb-2 h-1.5 w-14 rounded-full bg-border"
        />
        <div className="overflow-hidden rounded-[1.2rem] border border-border/60 bg-background">
          {children}
        </div>
      </div>
    );
  }

  if (variant === 'desktop') {
    return (
      <div
        data-device-frame="desktop"
        className={cn(
          'w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm',
          className
        )}
      >
        <div className="flex h-7 items-center justify-between gap-2 border-b border-border bg-muted/70 px-3">
          <div aria-hidden="true" className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-border" />
            <span className="size-2 rounded-full bg-border" />
            <span className="size-2 rounded-full bg-border" />
          </div>
          <span className="truncate font-mono text-[11px] text-muted-foreground">
            {title || 'Desktop Window'}
          </span>
          <span aria-hidden="true" className="w-8" />
        </div>
        <div className="relative bg-background">{children}</div>
      </div>
    );
  }

  const addressLabel = getAddressLabel(url, title);

  return (
    <div
      data-device-frame="web"
      className={cn(
        'w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm',
        className
      )}
    >
      <div className="flex h-7 items-center gap-2 border-b border-border bg-muted/70 px-3">
        <div aria-hidden="true" className="flex shrink-0 items-center gap-1.5">
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
        </div>
        <div className="mx-auto max-w-[75%] truncate rounded bg-background/80 px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
          {addressLabel}
        </div>
      </div>
      <div className="relative bg-background">{children}</div>
    </div>
  );
}
