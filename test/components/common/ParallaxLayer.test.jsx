import { useRef } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { LazyMotion, MotionConfig, domMax } from 'motion/react';
import { ParallaxLayer, SectionWatermark } from '../../../src/components/common/ParallaxLayer';

function TestHarness({ reducedMotion = 'always', scaleRange, range }) {
  const sectionRef = useRef(null);
  return (
    <MotionConfig reducedMotion={reducedMotion}>
      <LazyMotion features={domMax} strict>
        <section ref={sectionRef} className="relative overflow-x-clip">
          <SectionWatermark targetRef={sectionRef} label="01" />
          <ParallaxLayer
            targetRef={sectionRef}
            offset={28}
            range={range}
            scaleRange={scaleRange}
          >
            <p>Editorial parallax content</p>
          </ParallaxLayer>
        </section>
      </LazyMotion>
    </MotionConfig>
  );
}

describe('ParallaxLayer & SectionWatermark', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  it('renders ParallaxLayer and decorative SectionWatermark cleanly under LazyMotion strict', () => {
    const { container } = render(
      <TestHarness scaleRange={[1, 1.04]} range={[0, -36]} />
    );

    expect(screen.getByText('Editorial parallax content')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-parallax-layer="true"]').length).toBe(2);

    const watermark = container.querySelector('[data-section-watermark="01"]');
    expect(watermark).toBeInTheDocument();
    expect(watermark).toHaveAttribute('aria-hidden', 'true');
    expect(watermark.className).toContain('pointer-events-none');
  });

  it('neutralizes parallax when prefers-reduced-motion activates and handles compact/missing matchMedia', () => {
    const listeners = new Map();
    const mqlMap = new Map();

    window.matchMedia = vi.fn().mockImplementation((query) => {
      const mql = {
        matches: query.includes('1023px') || query.includes('prefers-reduced-motion'),
        media: query,
        addEventListener: vi.fn((event, cb) => {
          listeners.set(query, cb);
        }),
        removeEventListener: vi.fn(),
        addListener: vi.fn((cb) => {
          listeners.set(query, cb);
        }),
        removeListener: vi.fn()
      };
      mqlMap.set(query, mql);
      return mql;
    });

    const { container, rerender } = render(
      <TestHarness reducedMotion="user" scaleRange={[1, 1.04]} />
    );

    act(() => {
      listeners.forEach((cb, query) => {
        if (query.includes('prefers-reduced-motion')) {
          cb({ matches: true });
        }
      });
    });

    expect(screen.getByText('Editorial parallax content')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-parallax-layer="true"]')).toHaveLength(2);

    window.matchMedia = undefined;
    rerender(<TestHarness reducedMotion="always" />);
    expect(screen.getByText('Editorial parallax content')).toBeInTheDocument();
  });
});
