import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  detectDeviceType,
  detectBrowser,
  detectOS,
  recordPageView,
  trackCvDownload
} from '../../src/services/visitorTracker';

describe('visitorTracker Service', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('Device, Browser & OS Detection', () => {
    it('detects Mobile device based on userAgent or width', () => {
      expect(detectDeviceType('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)', 390)).toBe('Mobile');
      expect(detectDeviceType('Mozilla/5.0 (Android; Mobile)', 412)).toBe('Mobile');
    });

    it('detects Desktop device', () => {
      expect(detectDeviceType('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 1440)).toBe('Desktop');
      expect(detectDeviceType('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 1920)).toBe('Desktop');
    });

    it('detects Browser engines accurately', () => {
      expect(detectBrowser('Mozilla/5.0 ... Chrome/120.0.0.0 Safari/537.36')).toBe('Chrome');
      expect(detectBrowser('Mozilla/5.0 ... Version/16.0 Safari/605.1.15')).toBe('Safari');
      expect(detectBrowser('Mozilla/5.0 ... Firefox/115.0')).toBe('Firefox');
      expect(detectBrowser('Mozilla/5.0 ... Edg/120.0.0.0')).toBe('Edge');
    });

    it('detects Operating Systems', () => {
      expect(detectOS('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('Windows');
      expect(detectOS('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toBe('macOS');
      expect(detectOS('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)')).toBe('iOS');
      expect(detectOS('Mozilla/5.0 (Linux; Android 13)')).toBe('Android');
      expect(detectOS('Mozilla/5.0 (X11; Linux x86_64)')).toBe('Linux');
    });
  });

  describe('Session Deduplication (Review Focus #2)', () => {
    it('records first visit as unique session and subsequent views as non-unique in same session', async () => {
      expect(sessionStorage.getItem('ark_session_logged')).toBeNull();

      const firstResult = await recordPageView();
      expect(firstResult.isNewSession).toBe(true);
      expect(sessionStorage.getItem('ark_session_logged')).toBe('true');

      // Subsequent page refresh in same session
      const secondResult = await recordPageView();
      expect(secondResult.isNewSession).toBe(false);
    });

    it('tracks CV download without throwing errors (Review Focus #1)', async () => {
      await expect(trackCvDownload()).resolves.not.toThrow();
    });
  });
});
