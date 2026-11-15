import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useScrollReveal } from '../../src/hooks/useScrollReveal';

describe('useScrollReveal Hook', () => {
  let observeMock;
  let unobserveMock;
  let disconnectMock;
  let observerCallback;

  beforeEach(() => {
    observeMock = vi.fn();
    unobserveMock = vi.fn();
    disconnectMock = vi.fn();

    window.IntersectionObserver = vi.fn(function (cb) {
      observerCallback = cb;
      this.observe = observeMock;
      this.unobserve = unobserveMock;
      this.disconnect = disconnectMock;
    });
  });

  function TestComponent({ selector = '.reveal-on-scroll', deps = [] }) {
    useScrollReveal(selector, deps);
    return (
      <div>
        <div className="reveal-on-scroll" data-testid="target-1">Item 1</div>
        <div className="reveal-on-scroll" data-testid="target-2">Item 2</div>
        <div className="other-class" data-testid="other">Other</div>
      </div>
    );
  }

  it('observes matching elements on mount and unobserves on intersection (Review Focus #1)', () => {
    render(<TestComponent />);

    const item1 = screen.getByTestId('target-1');
    const item2 = screen.getByTestId('target-2');

    expect(observeMock).toHaveBeenCalledWith(item1);
    expect(observeMock).toHaveBeenCalledWith(item2);
    expect(observeMock).toHaveBeenCalledTimes(2);

    // Simulate item 1 scrolling into viewport
    observerCallback([
      { target: item1, isIntersecting: true }
    ]);

    expect(item1.classList.contains('revealed')).toBe(true);
    expect(unobserveMock).toHaveBeenCalledWith(item1);

    // item 2 has not intersected yet
    expect(item2.classList.contains('revealed')).toBe(false);
  });

  it('disconnects observer on unmount (Review Focus #1)', () => {
    const { unmount } = render(<TestComponent />);
    unmount();
    expect(disconnectMock).toHaveBeenCalled();
  });

  it('immediately reveals elements without observer when prefers-reduced-motion is true (Review Focus #2)', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('prefers-reduced-motion: reduce'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));

    render(<TestComponent />);
    const item1 = screen.getByTestId('target-1');
    const item2 = screen.getByTestId('target-2');

    expect(item1.classList.contains('revealed')).toBe(true);
    expect(item2.classList.contains('revealed')).toBe(true);
    expect(observeMock).not.toHaveBeenCalled();
  });
});
