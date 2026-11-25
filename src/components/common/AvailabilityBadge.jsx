import { cn } from '../../lib/utils';

export const AVAILABILITY_PRESETS = {
  available: {
    label: 'Available for Work & Freelance',
    pillClass: 'border-status-success-border bg-status-success-bg text-status-success-fg',
    dotClass: 'bg-status-success-fg'
  },
  freelance: {
    label: 'Open to Select Projects',
    pillClass: 'border-status-warn-border bg-status-warn-bg text-status-warn-fg',
    dotClass: 'bg-status-warn-fg'
  },
  busy: {
    label: 'Currently Booked',
    pillClass: 'border-border bg-muted text-muted-foreground',
    dotClass: 'bg-muted-foreground'
  }
};

export function AvailabilityBadge({ status = 'hidden', text = '', live = true, className }) {
  if (!status || status === 'hidden') return null;

  const preset = AVAILABILITY_PRESETS[status];
  if (!preset) return null;

  const displayLabel = String(text ?? '').trim() || preset.label;

  return (
    <span
      role={live ? 'status' : undefined}
      aria-label={live ? displayLabel : undefined}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
        preset.pillClass,
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn('size-2 shrink-0 rounded-full', preset.dotClass)}
      />
      <span>{displayLabel}</span>
    </span>
  );
}
