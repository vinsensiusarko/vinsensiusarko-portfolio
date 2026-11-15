import { doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Detect client device category from userAgent and screen width.
 * @param {string} [ua]
 * @param {number} [width]
 * @returns {'Mobile' | 'Tablet' | 'Desktop'}
 */
export function detectDeviceType(
  ua = typeof navigator !== 'undefined' ? navigator.userAgent : '',
  width = typeof window !== 'undefined' ? window.innerWidth : 1200
) {
  const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTabletUA = /iPad|Tablet|PlayBook|Silk/i.test(ua) || (isMobileUA && width >= 768);

  if (isTabletUA || (width >= 600 && width <= 900)) return 'Tablet';
  if (isMobileUA || width < 600) return 'Mobile';
  return 'Desktop';
}

/**
 * Detect browser engine name from userAgent.
 * @param {string} [ua]
 * @returns {'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Other'}
 */
export function detectBrowser(ua = typeof navigator !== 'undefined' ? navigator.userAgent : '') {
  if (/Edg\//i.test(ua)) return 'Edge';
  if (/Firefox\//i.test(ua)) return 'Firefox';
  if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return 'Chrome';
  if (/Version\/.*Safari\//i.test(ua) || /Safari\//i.test(ua)) return 'Safari';
  return 'Other';
}

/**
 * Detect client Operating System from userAgent.
 * @param {string} [ua]
 * @returns {'Windows' | 'macOS' | 'Android' | 'iOS' | 'Linux' | 'Other'}
 */
export function detectOS(ua = typeof navigator !== 'undefined' ? navigator.userAgent : '') {
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/Win/i.test(ua)) return 'Windows';
  if (/Mac/i.test(ua)) return 'macOS';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Other';
}

const SESSION_LOGGED_KEY = 'ark_session_logged';
const SESSION_ID_KEY = 'ark_session_id';

/**
 * Get or create an anonymous session token in sessionStorage (no personal data/IP stored).
 * @returns {string}
 */
export function getOrCreateSessionId() {
  if (typeof sessionStorage === 'undefined') return 'anonymous_session';
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = `ark_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

/**
 * Record an anonymous portfolio page view in Firestore.
 * Increments totalViews always, and uniqueVisitors only once per session.
 *
 * @returns {Promise<{ isNewSession: boolean }>}
 */
export async function recordPageView() {
  try {
    getOrCreateSessionId();
    const isLogged = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_LOGGED_KEY) === 'true';
    const isNewSession = !isLogged;

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(SESSION_LOGGED_KEY, 'true');
    }

    if (!db) {
      return { isNewSession };
    }

    const device = detectDeviceType();
    const browser = detectBrowser();
    const os = detectOS();
    const today = new Date().toISOString().split('T')[0];

    const summaryRef = doc(db, 'analytics_summary', 'overview');
    const summaryUpdates = {
      totalViews: increment(1),
      lastUpdated: serverTimestamp()
    };

    if (isNewSession) {
      summaryUpdates.uniqueVisitors = increment(1);
      summaryUpdates[`devices.${device}`] = increment(1);
      summaryUpdates[`browsers.${browser}`] = increment(1);
      summaryUpdates[`os.${os}`] = increment(1);
    }

    const dailyRef = doc(db, 'analytics_daily', today);
    const dailyUpdates = {
      date: today,
      views: increment(1),
      uniques: isNewSession ? increment(1) : increment(0)
    };

    // Fire and forget Firestore promises
    await Promise.allSettled([
      setDoc(summaryRef, summaryUpdates, { merge: true }),
      setDoc(dailyRef, dailyUpdates, { merge: true })
    ]);

    return { isNewSession };
  } catch (err) {
    console.warn('Anonymous analytics record skipped:', err);
    return { isNewSession: false };
  }
}

/**
 * Record a CV Resume download event.
 * @returns {Promise<void>}
 */
export async function trackCvDownload() {
  try {
    if (!db) return;
    const summaryRef = doc(db, 'analytics_summary', 'overview');
    await setDoc(summaryRef, { cvDownloads: increment(1) }, { merge: true });
  } catch (err) {
    console.warn('CV download tracking skipped:', err);
  }
}

/**
 * Record a project quick view opening event.
 * @param {string} projectId
 * @returns {Promise<void>}
 */
export async function trackProjectView(projectId) {
  if (!projectId) return;
  try {
    if (!db) return;
    const summaryRef = doc(db, 'analytics_summary', 'overview');
    await setDoc(summaryRef, { [`projectViews.${projectId}`]: increment(1) }, { merge: true });
  } catch (err) {
    console.warn('Project view tracking skipped:', err);
  }
}
