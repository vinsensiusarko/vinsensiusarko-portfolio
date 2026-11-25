import { useState, useMemo, useId, useRef } from 'react';
import { cn } from 'cn';
import { AnimatePresence, m } from 'motion/react';
import { IconBriefcase, IconSchool, IconTimeline } from '@tabler/icons-react';
import { EDITORIAL_EASE, EDITORIAL_SPRING } from '@/lib/motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const JOURNEY_TABS = [
  { value: 'all', label: 'All', Icon: IconTimeline },
  { value: 'work', label: 'Work', Icon: IconBriefcase },
  { value: 'education', label: 'Education', Icon: IconSchool }
];

export function JourneySection({ timeline = [] }) {
  const [filter, setFilter] = useState('all');
  const journeyId = useId();
  const tabRefs = useRef([]);

  const items = useMemo(() => {
    if (!Array.isArray(timeline)) return [];
    return timeline
      .map((entry, idx) => {
        if (!entry || typeof entry !== 'object') return null;
        const title = String(entry.title ?? '').trim();
        const organization = String(entry.organization ?? '').trim();
        if (!title && !organization) return null;
        const type = entry.type === 'education' ? 'education' : 'work';
        return {
          ...entry,
          type,
          title,
          organization,
          period: String(entry.period ?? '').trim(),
          summary: String(entry.summary ?? '').trim(),
          tags: Array.isArray(entry.tags)
            ? entry.tags.map((t) => String(t ?? '').trim()).filter(Boolean)
            : [],
          _key: String(entry.id ?? '').trim() || `${type}-${title || organization}-${idx}`
        };
      })
      .filter(Boolean);
  }, [timeline]);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((entry) => entry.type === filter);
  }, [items, filter]);

  if (items.length === 0) return null;

  const handleTabKeyDown = (e, currentIndex) => {
    let nextIndex = null;
    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % JOURNEY_TABS.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + JOURNEY_TABS.length) % JOURNEY_TABS.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = JOURNEY_TABS.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const nextTab = JOURNEY_TABS[nextIndex];
      setFilter(nextTab.value);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  const panelId = `${journeyId}-panel`;

  return (
    <section
      id="journey"
      className="reveal-on-scroll relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <p className="font-mono text-xs uppercase tracking-wider text-season-foreground">
            Background
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Journey
          </h2>
        </div>

        <div
          className="flex flex-wrap items-center gap-2"
          role="tablist"
          aria-label="Filter career and education timeline"
        >
          {JOURNEY_TABS.map(({ value, label, Icon }, idx) => {
            const isActive = filter === value;
            return (
              <button
                key={value}
                ref={(el) => {
                  tabRefs.current[idx] = el;
                }}
                id={`${journeyId}-tab-${value}`}
                type="button"
                role="tab"
                tabIndex={isActive ? 0 : -1}
                aria-selected={isActive}
                aria-controls={panelId}
                onClick={() => setFilter(value)}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                className={cn(
                  'relative inline-flex min-h-11 sm:min-h-10 items-center gap-2 rounded-lg border px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-season-accent',
                  isActive
                    ? 'border-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                )}
              >
                {isActive && (
                  <m.span
                    layoutId={`${journeyId}-tab-pill`}
                    transition={EDITORIAL_SPRING}
                    className="absolute inset-0 rounded-[7px] bg-primary"
                    aria-hidden="true"
                  />
                )}
                <span className="relative z-10 inline-flex items-center gap-2">
                  <Icon className="size-4" aria-hidden="true" />
                  <span>{label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${journeyId}-tab-${filter}`}
      >
        {filteredItems.length === 0 ? (
          <div className="mt-8 flex flex-col items-start gap-3 rounded-xl border border-dashed border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              No {filter} milestones listed yet.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 sm:min-h-9"
              onClick={() => setFilter('all')}
            >
              Show All Milestones
            </Button>
          </div>
        ) : (
          <ol className="relative mt-10 ml-2 flex flex-col gap-6 border-l border-border pl-6 sm:pl-8">
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredItems.map((entry) => {
                const isEducation = entry.type === 'education';
                const isCurrent = Boolean(entry.current);

                return (
                  <m.li
                    key={entry._key}
                    layout="position"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{
                      layout: EDITORIAL_SPRING,
                      y: { duration: 0.22, ease: EDITORIAL_EASE },
                      opacity: { duration: 0.16, ease: EDITORIAL_EASE }
                    }}
                    className="relative"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute top-6 -left-[31px] sm:-left-[39px] size-3.5 rounded-full border-2',
                        isCurrent
                          ? 'border-season-accent bg-season-accent ring-4 ring-season-surface'
                          : 'border-border bg-card'
                      )}
                    />

                    <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 sm:p-6 transition-colors hover:border-foreground/25">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="gap-1.5 text-[11px] font-medium"
                          >
                            {isEducation ? (
                              <IconSchool className="size-3.5 text-season-accent" aria-hidden="true" />
                            ) : (
                              <IconBriefcase className="size-3.5 text-season-accent" aria-hidden="true" />
                            )}
                            {isEducation ? 'Education' : 'Work'}
                          </Badge>
                          {isCurrent && (
                            <Badge
                              variant="outline"
                              className="border-season-border bg-season-surface text-season-foreground text-[11px]"
                            >
                              Current
                            </Badge>
                          )}
                        </div>

                        {entry.period && (
                          <span className="font-mono text-xs tabular-nums text-muted-foreground">
                            {entry.period}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <h3 className="font-display text-lg sm:text-xl font-semibold tracking-tight text-foreground">
                          {entry.title}
                        </h3>
                        {entry.organization && (
                          <p className="text-sm font-medium text-muted-foreground">
                            {entry.organization}
                          </p>
                        )}
                      </div>

                      {entry.summary && (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {entry.summary}
                        </p>
                      )}

                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {entry.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-[11px] font-normal">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </article>
                  </m.li>
                );
              })}
            </AnimatePresence>
          </ol>
        )}
      </div>
    </section>
  );
}
