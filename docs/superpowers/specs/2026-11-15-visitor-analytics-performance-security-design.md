# Sub-Project 4: Visitor Analytics Dashboard, Performance Optimization & Security Hardening Specification

## 1. Overview & Objectives

Provide a comprehensive, privacy-first visitor analytics dashboard in the Admin CMS to track portfolio traffic, visitor engagement, device/OS breakdown, and CV downloads, accompanied by performance optimization and security hardening.

Key outcomes:
1. **Privacy-Preserving Visitor Tracker (`src/services/visitorTracker.js`)**:
   - Zero cookies, zero personal data / IP address storage.
   - Session-based deduplication using `sessionStorage`.
   - Records device type (Desktop, Mobile, Tablet), browser engine (Chrome, Safari, Firefox, Edge), and operating system (Windows, Android, iOS, macOS, Linux).
   - Tracks custom conversion events: CV Resume downloads and project quick-view opens.
   - Fire-and-forget atomic Firestore `increment(1)` updates to avoid read/write latency and keep database operations lightweight.
2. **Admin Analytics Dashboard Tab (`src/pages/admin/tabs/AdminAnalyticsTab.jsx`)**:
   - Real-time KPI Metric Cards: Total Page Views, Unique Visitors, Total CV Downloads, Mobile vs Desktop traffic share.
   - 7-Day Visitor Trend Chart: Dependency-free CSS bar chart showing daily traffic.
   - Device, Browser & OS Distribution Bars with percentage gauges.
   - Demo traffic seeder and reset modal with `useConfirm`.
3. **Security Hardening**:
   - Update `firestore.rules` to allow public anonymous increment on analytics while strictly enforcing `request.auth != null` for CMS collections (`projects`, `skills`, `site_settings`, `privacy_policy`).
   - Content Security Policy and modern security headers in `firebase.json`.
4. **Performance Optimization**:
   - Audit image attributes (`loading="lazy"`, `decoding="async"`, `fetchpriority="high"` for hero image).
   - Ensure clean bundle splitting and zero heavy chart library bloat.

---

## 2. Data Model

### Firestore Documents
- `analytics_summary/overview`:
  ```json
  {
    "totalViews": 1420,
    "uniqueVisitors": 850,
    "cvDownloads": 94,
    "devices": { "Desktop": 520, "Mobile": 310, "Tablet": 20 },
    "browsers": { "Chrome": 480, "Safari": 210, "Firefox": 90, "Edge": 70 },
    "os": { "Windows": 410, "Android": 230, "iOS": 120, "macOS": 90 },
    "updatedAt": "serverTimestamp"
  }
  ```
- `analytics_daily/YYYY-MM-DD`:
  ```json
  {
    "date": "2026-11-15",
    "views": 48,
    "uniques": 29
  }
  ```

---

## 3. Review Focus & Verification Criteria
1. **Atomic & Resilient Tracking**: Visitor tracker must never throw unhandled exceptions or block rendering if Firestore is unavailable or offline.
2. **Session Deduplication**: Refreshing the page during the same browser session must increment `totalViews` but not increment `uniqueVisitors`.
3. **Zero Heavy Dependencies**: All charts and progress bars must use lightweight CSS/SVG without importing large libraries (e.g. Chart.js, Recharts).
4. **Confirmation Guard on Reset**: Resetting analytics must require explicit user approval via `useConfirm`.
5. **Security Rules Isolation**: Anonymous visitors can only write to analytics collections; portfolio content remains write-locked to authenticated admins.
