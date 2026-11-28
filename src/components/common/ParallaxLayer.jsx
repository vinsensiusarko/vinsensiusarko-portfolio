import { useState, useEffect } from 'react';
import { m, useScroll, useTransform, useSpring, useReducedMotion } from 'motion/react';
import { PARALLAX_SPRING } from '@/lib/motion';
import { cn } from '@/lib/utils';

const COMPACT_MEDIA_QUERY = '(max-width: 1023px)';

export function useIsCompactViewport() {
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia(COMPACT_MEDIA_QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mql = window.matchMedia(COMPACT_MEDIA_QUERY);
    const onChange = (event) => setIsCompact(Boolean(event.matches));
    setIsCompact(Boolean(mql.matches));

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    if (typeof mql.addListener === 'function') {
      mql.addListener(onChange);
      return () => mql.removeListener(onChange);
    }
  }, []);

  return isCompact;
}

export function ParallaxLayer({
  targetRef,
  offset = 32,
  range,
  scrollOffset = ['start end', 'end start'],
  scaleRange,
  smooth = true,
  mobileFactor = 0.4,
  className,
  style,
  children
}) {
  const prefersReducedMotion = useReducedMotion();
  const isCompact = useIsCompactViewport();

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: scrollOffset
  });

  const effectiveFactor = prefersReducedMotion ? 0 : isCompact ? mobileFactor : 1;
  const smoothProgress = useSpring(scrollYProgress, PARALLAX_SPRING);
  const progress =
    smooth && !prefersReducedMotion && effectiveFactor !== 0 ? smoothProgress : scrollYProgress;

  const yRange =
    Array.isArray(range) && range.length === 2
      ? [range[0] * effectiveFactor, range[1] * effectiveFactor]
      : [-offset * effectiveFactor, offset * effectiveFactor];

  const hasScaleRange = Array.isArray(scaleRange) && scaleRange.length === 2;
  const activeScaleRange =
    hasScaleRange && !prefersReducedMotion ? scaleRange : [1, 1];

  const y = useTransform(progress, [0, 1], yRange);
  const scale = useTransform(progress, [0, 1], activeScaleRange);

  return (
    <m.div
      data-parallax-layer="true"
      data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
      className={className}
      style={{
        y,
        ...(hasScaleRange ? { scale } : {}),
        ...style
      }}
    >
      {children}
    </m.div>
  );
}

export function SectionWatermark({
  targetRef,
  label,
  align = 'right',
  offset = -40,
  className
}) {
  if (!label) return null;

  return (
    <div
      aria-hidden="true"
      data-section-watermark={label}
      className={cn(
        'pointer-events-none select-none absolute top-10 sm:top-14 z-0',
        align === 'left' ? 'left-4 sm:left-6 lg:left-8' : 'right-4 sm:right-6 lg:right-8',
        className
      )}
    >
      <ParallaxLayer targetRef={targetRef} offset={offset} mobileFactor={0.35}>
        <span className="block font-display text-[6.5rem] sm:text-[9.5rem] lg:text-[12.5rem] font-bold leading-none tracking-tighter text-foreground/[0.035] dark:text-foreground/[0.045]">
          {label}
        </span>
      </ParallaxLayer>
    </div>
  );
}
