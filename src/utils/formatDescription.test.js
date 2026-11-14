import { describe, it, expect } from 'vitest';
import { formatRichDescription } from './formatDescription';

describe('formatRichDescription', () => {
  it('returns empty string for null, undefined, or empty input', () => {
    expect(formatRichDescription('')).toBe('');
    expect(formatRichDescription(null)).toBe('');
    expect(formatRichDescription(undefined)).toBe('');
  });

  it('formats plain paragraphs with .rich-desc-p', () => {
    const res = formatRichDescription('First paragraph\nSecond paragraph');
    expect(res).toContain('<p class="rich-desc-p">First paragraph</p>');
    expect(res).toContain('<p class="rich-desc-p">Second paragraph</p>');
  });

  it('formats numbered list items into .rich-list-group and .rich-numbered-item', () => {
    const res = formatRichDescription('1. Auth module\n2) Dashboard view');
    expect(res).toContain('<div class="rich-list-group">');
    expect(res).toContain('<span class="rich-number-badge">1</span>');
    expect(res).toContain('<span class="rich-item-text">Auth module</span>');
    expect(res).toContain('<span class="rich-number-badge">2</span>');
    expect(res).toContain('<span class="rich-item-text">Dashboard view</span>');
  });

  it('formats bullet list items (-, *, •) into .rich-bullet-item', () => {
    const res = formatRichDescription('- Offline sync\n• Thermal printer');
    expect(res).toContain('rich-bullet-item');
    expect(res).toContain('<span class="rich-item-text">Offline sync</span>');
    expect(res).toContain('<span class="rich-item-text">Thermal printer</span>');
  });

  it('escapes HTML and XSS payloads in paragraphs and list items (Review Focus #3)', () => {
    const malicious = '<script>alert("xss")</script>\n- <img src=x onerror="hack()">';
    const res = formatRichDescription(malicious);
    expect(res).not.toContain('<script>');
    expect(res).not.toContain('<img');
    expect(res).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    expect(res).toContain('&lt;img src=x onerror=&quot;hack()&quot;&gt;');
  });
});
