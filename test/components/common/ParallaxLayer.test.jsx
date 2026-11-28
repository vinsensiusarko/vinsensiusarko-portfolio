import { useRef } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  it('handles compact mobile viewport and missing matchMedia without crashing', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }));

    const { rerender } = render(<TestHarness reducedMotion="never" />);
    expect(screen.getByText('Editorial parallax content')).toBeInTheDocument();

    window.matchMedia = undefined;
    rerender(<TestHarness reducedMotion="always" />);
    expect(screen.getByText('Editorial parallax content')).toBeInTheDocument();
  });
});
