import { useState, useEffect } from 'react';
import { cn } from 'cn';
import {
  IconVolume,
  IconVolumeOff,
  IconArrowUp,
  IconBrandWhatsapp
} from '@tabler/icons-react';
import { useSound } from '@/context/SoundContext';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

export function FloatingActions({ whatsapp = '6285179793167' }) {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { isMuted, toggleMute, playClick } = useSound();

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cleanWa = String(whatsapp || '6285179793167').replace(/\D/g, '');

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className="fixed right-4 bottom-5 z-30 flex flex-col items-center gap-2.5 pointer-events-auto sm:right-6 sm:bottom-6"
        aria-label="Quick action buttons"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              id="sound-toggle-btn"
              variant={isMuted ? 'outline' : 'default'}
              size="icon"
              onClick={() => {
                if (isMuted) {
                  playClick({ force: true });
                }
                toggleMute();
              }}
              aria-label={isMuted ? 'Enable Sound Effects' : 'Mute Sound Effects'}
              className="size-11 rounded-full shadow-md"
            >
              {isMuted ? (
                <IconVolumeOff className="size-5" aria-hidden="true" />
              ) : (
                <IconVolume className="size-5" aria-hidden="true" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {isMuted ? 'Sound Effects: Muted' : 'Sound Effects: Active'}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              id="back-to-top-btn"
              variant="outline"
              size="icon"
              tabIndex={showBackToTop ? 0 : -1}
              aria-hidden={!showBackToTop}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              className={cn(
                'size-11 rounded-full bg-card shadow-md transition-all duration-200',
                showBackToTop
                  ? 'translate-y-0 opacity-100'
                  : 'pointer-events-none translate-y-2 opacity-0'
              )}
            >
              <IconArrowUp className="size-5" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Back to top</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              size="icon"
              className="size-11 rounded-full shadow-md"
              style={{ backgroundColor: '#15803d', color: '#ffffff' }}
            >
              <a
                href={`https://api.whatsapp.com/send?phone=${cleanWa}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
              >
                <IconBrandWhatsapp className="size-5" aria-hidden="true" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Chat on WhatsApp</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
