import React from 'react';
import { cn } from '../../lib/utils';

export const AVAILABILITY_PRESETS = {
  available: {
    label: 'Available for Work & Freelance',
    pillClass:
      'border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-fg)]',
    dotClass: 'bg-[var(--status-success-fg)]'
  },
  freelance: {
    label: 'Open to Select Projects',
    pillClass:
      'border-[var(--status-warn-border)] bg-[var(--status-warn-bg)] text-[var(--status-warn-fg)]',
    dotClass: 'bg-[var(--status-warn-fg)]'
  },
  busy: {
    label: 'Currently Booked',
    pillClass: 'border-border bg-muted text-muted-foreground',
    dotClass: 'bg-muted-foreground'
  }
};

export function AvailabilityBadge({ status = 'hidden', text = '', className }) {
  if (!status || status === 'hidden') return null;

  const preset = AVAILABILITY_PRESETS[status];
  if (!preset) return null;

  const displayLabel = text?.trim() || preset.label;

  return (
    <span
      role="status"
      aria-label={displayLabel}
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
