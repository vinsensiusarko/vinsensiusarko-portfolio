import { describe, it, expect } from 'vitest';

describe('Toolchain smoke test', () => {
  it('runs Vitest with jsdom environment', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });
});
