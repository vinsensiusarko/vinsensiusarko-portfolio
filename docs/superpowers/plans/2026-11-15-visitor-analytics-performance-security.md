# Sub-Project 4: Visitor Analytics Dashboard, Performance Optimization & Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Sub-Project 4 to provide a privacy-preserving visitor analytics tracking service, a comprehensive Analytics Dashboard in the Admin CMS, security rule hardening, and performance optimization.

**Architecture:** Client visits trigger atomic Firestore `increment` updates on `analytics_summary/overview` and daily date documents. Admin CMS renders real-time stats cards, 7-day CSS charts, device/browser breakdowns, and reset/seed tools guarded by `useConfirm`.

**Tech Stack:** React 19, Firebase Firestore, Vitest 3, JSDOM, CSS Custom Properties.

**Spec:** `docs/superpowers/specs/2026-11-15-visitor-analytics-performance-security-design.md`

## Review Focus

1. **Atomic & Resilient Tracking**: Visitor tracker must never throw unhandled exceptions or block rendering if Firestore is unavailable or offline.
2. **Session Deduplication**: Refreshing the page during the same browser session must increment `totalViews` but not increment `uniqueVisitors`.
3. **Zero Heavy Dependencies**: All charts and progress bars must use lightweight CSS/SVG without importing large libraries (e.g. Chart.js, Recharts).
4. **Confirmation Guard on Reset**: Resetting analytics must require explicit user approval via `useConfirm`.
5. **Security Rules Isolation**: Anonymous visitors can only write to analytics collections; portfolio content remains write-locked to authenticated admins.

---

## Tasks

### Task 1: Privacy-Preserving Visitor Tracker & Unit Tests

**Files:**
- Create: `src/services/visitorTracker.js`
- Create: `test/services/visitorTracker.test.js`
- Modify: `src/pages/HomePage.jsx`
- Modify: `src/components/sections/HeroSection.jsx`

- [x] **Step 1: Write unit tests for `visitorTracker.js`**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement `visitorTracker.js`**
- [x] **Step 4: Run test to verify it passes**
- [x] **Step 5: Integrate tracker in `HomePage.jsx` and `HeroSection.jsx`**
- [x] **Step 6: Commit**

---

### Task 2: Admin Analytics Dashboard Tab & Styling

**Files:**
- Create: `src/pages/admin/tabs/AdminAnalyticsTab.jsx`
- Create: `test/pages/admin/AdminAnalyticsTab.test.jsx`
- Modify: `src/pages/admin/AdminPage.jsx`
- Modify: `src/styles/admin.css`

- [x] **Step 1: Write test for `AdminAnalyticsTab.jsx`**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement `AdminAnalyticsTab.jsx` with KPI cards, 7-day chart, and distribution bars**
- [x] **Step 4: Add analytics styles to `src/styles/admin.css`**
- [x] **Step 5: Register analytics tab in `AdminPage.jsx`**
- [x] **Step 6: Run test to verify it passes**
- [x] **Step 7: Commit**

---

### Task 3: Security Hardening & Performance Optimization

**Files:**
- Modify: `firestore.rules`
- Modify: `src/components/sections/HeroSection.jsx`

- [x] **Step 1: Update `firestore.rules` for analytics isolation**
- [x] **Step 2: Add `fetchpriority="high"` to Hero portrait**
- [x] **Step 3: Commit**

---

### Task 4: Comprehensive Test Suite, Build Verification & Review

**Files:**
- Test: All files in `test/`
- Build: `dist/`

- [x] **Step 1: Run full unit test suite (`npx vitest run`)**
- [x] **Step 2: Run production build (`npm run build`)**
- [x] **Step 3: Senior Code Reviewer Subagent verification**
- [x] **Step 4: Commit**
