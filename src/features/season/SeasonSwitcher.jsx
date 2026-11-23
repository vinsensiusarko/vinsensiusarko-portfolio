import { useState } from 'react';
import { cn } from 'cn';
import {
  IconChevronDown,
  IconCheck,
  IconRotateClockwise,
  IconSparkles,
  IconSeeding,
  IconSun,
  IconLeaf,
  IconSnowflake
} from '@tabler/icons-react';
import { useSeason } from '@/context/SeasonContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

const SEASON_ICONS = {
  spring: IconSeeding,
  summer: IconSun,
  autumn: IconLeaf,
  winter: IconSnowflake
};

export function SeasonSwitcher() {
  const {
    season,
    setSeason,
    isAutoSeason,
    resetToAutoSeason,
    particlesEnabled,
    toggleParticles,
    seasonMeta,
    seasons
  } = useSeason();

  const [open, setOpen] = useState(false);
  const ActiveSeasonIcon = SEASON_ICONS[season] || IconSeeding;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={`Select season (current: ${seasonMeta.labelEn})`}
          title={`Season Theme: ${seasonMeta.labelEn} (${seasonMeta.description})`}
          className="h-11 sm:h-9 min-w-11 sm:min-w-0 gap-1.5 border-season-border bg-season-surface text-season-foreground hover:bg-season-surface/80"
        >
          <ActiveSeasonIcon data-icon="inline-start" aria-hidden="true" />
          <span className="hidden sm:inline text-xs font-medium">{seasonMeta.labelEn}</span>
          <IconChevronDown
            data-icon="inline-end"
            className={cn('transition-transform duration-200', open && 'rotate-180')}
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 p-3" role="menu" aria-label="Season Selector">
        <div className="flex items-center justify-between px-1 pb-2">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Season Theme
          </span>
          {isAutoSeason && (
            <Badge variant="secondary" className="text-[11px]">
              Auto
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {Object.values(seasons).map((item) => {
            const isActive = item.id === season;
            const SeasonItemIcon = SEASON_ICONS[item.id] || IconSeeding;
            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  setSeason(item.id);
                  setOpen(false);
                }}
                className={cn(
                  'flex items-start gap-2 rounded-lg border p-2.5 text-left transition-colors min-h-11',
                  isActive
                    ? 'border-season-border bg-season-surface text-season-foreground'
                    : 'border-border bg-card hover:bg-muted/60 text-foreground'
                )}
              >
                <SeasonItemIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold truncate">{item.labelEn}</span>
                    {isActive && <IconCheck className="size-3.5 shrink-0" aria-hidden="true" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <Separator className="my-2.5" />

        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={toggleParticles}
            className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted min-h-11"
          >
            <span className="flex items-center gap-2">
              <IconSparkles className="size-4 text-season-accent" aria-hidden="true" />
              Particle Effects
            </span>
            <Badge variant={particlesEnabled ? 'default' : 'secondary'} className="font-mono text-[10px]">
              {particlesEnabled ? 'ON' : 'OFF'}
            </Badge>
          </button>

          {!isAutoSeason && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full min-h-11 justify-start text-xs text-muted-foreground"
              onClick={() => {
                resetToAutoSeason();
                setOpen(false);
              }}
            >
              <IconRotateClockwise data-icon="inline-start" aria-hidden="true" />
              Auto by Calendar
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
