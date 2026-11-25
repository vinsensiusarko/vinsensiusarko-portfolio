import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addDoc } from 'firebase/firestore';
import {
  validateContactForm,
  submitContactMessage,
  getCooldownRemainingMs,
  recordSubmissionTimestamp,
  buildMailtoFallbackUrl
} from '../../src/services/contactMessages';

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    addDoc: vi.fn().mockResolvedValue({ id: 'msg-123' }),
    serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP')
  };
});

describe('contactMessages service & firestore.rules hardening', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('validates required fields, email format, topic allowlist, and length bounds', () => {
    const invalid = validateContactForm({
      name: 'A',
      email: 'not-an-email',
      topic: 'spam',
      message: 'too short'
    });
    expect(invalid.valid).toBe(false);
    expect(invalid.errors.name).toBeTruthy();
    expect(invalid.errors.email).toBeTruthy();
    expect(invalid.errors.topic).toBeTruthy();
    expect(invalid.errors.message).toBeTruthy();

    const valid = validateContactForm({
      name: '  Jane Doe ',
      email: ' jane@example.com ',
      topic: 'freelance',
      message: '  Looking to build a Flutter POS application for our retail outlets.  '
    });
    expect(valid.valid).toBe(true);
    expect(valid.sanitized.name).toBe('Jane Doe');
    expect(valid.sanitized.email).toBe('jane@example.com');
  });

  it('silently ignores bot submissions when honeypot website field is filled', async () => {
    const res = await submitContactMessage({
      name: 'Bot Name',
      email: 'bot@spam.test',
      topic: 'general',
      message: 'Buy crypto now spam message content!',
      website: 'https://spam.example'
    });

    expect(res).toEqual({ ok: true, honeypot: true });
    expect(addDoc).not.toHaveBeenCalled();
  });

  it('persists sanitized unread message payload to Firestore messages collection and sets cooldown', async () => {
    const res = await submitContactMessage({
      name: 'Alex Rivera',
      email: 'alex@studio.dev',
      topic: 'hiring',
      message: 'We have an opening for a Flutter & React engineer and loved your work.'
    });

    expect(res).toEqual({ ok: true, id: 'msg-123' });
    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        name: 'Alex Rivera',
        email: 'alex@studio.dev',
        topic: 'hiring',
        status: 'unread',
        source: 'portfolio_contact_form',
        createdAt: 'SERVER_TIMESTAMP'
      })
    );
    expect(getCooldownRemainingMs()).toBeGreaterThan(0);

    // Second immediate attempt is blocked by cooldown
    const blocked = await submitContactMessage({
      name: 'Alex Rivera',
      email: 'alex@studio.dev',
      topic: 'hiring',
      message: 'Sending another message immediately after the first one.'
    });
    expect(blocked.ok).toBe(false);
    expect(blocked.code).toBe('cooldown');
  });

  it('handles Firestore permission-denied gracefully and builds prefilled mailto fallback URL', async () => {
    addDoc.mockRejectedValueOnce({ code: 'permission-denied', message: 'Missing permissions' });
    recordSubmissionTimestamp(Date.now() - 120_000);

    const res = await submitContactMessage({
      name: 'Sam Lee',
      email: 'sam@company.io',
      topic: 'collaboration',
      message: 'Interested in collaborating on an open-source React tool.'
    });

    expect(res.ok).toBe(false);
    expect(res.code).toBe('permission-denied');

    const mailto = buildMailtoFallbackUrl({
      toEmail: 'me@vinsensiusarka.id',
      name: 'Sam Lee',
      email: 'sam@company.io',
      topic: 'collaboration',
      message: 'Hello there'
    });
    expect(mailto).toContain('mailto:me@vinsensiusarka.id?subject=');
    expect(mailto).toContain(encodeURIComponent('Collaboration'));
    expect(mailto).toContain(encodeURIComponent('Hello there'));
  });

  it('enforces explicit per-collection firestore.rules without blanket public read on messages', () => {
    const rules = fs.readFileSync(path.resolve('firestore.rules'), 'utf8');
    expect(rules).not.toMatch(/match\s+\/\{document=\*\*\}/);
    expect(rules).toMatch(/match\s+\/messages\/\{messageId\}/);
    expect(rules).toMatch(/allow\s+read,\s*update,\s*delete:\s*if\s+request\.auth\s*!=\s*null;/);
    expect(rules).toMatch(/request\.resource\.data\.status\s*==\s*'unread'/);
  });
});
