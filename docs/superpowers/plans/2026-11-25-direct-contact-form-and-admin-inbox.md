# Spec 5 Implementation Plan: Direct Contact Form, Hardened Firestore Rules & Admin Inbox

> **For agentic workers:** Follow TDD, keep public UI aligned with `DESIGN.md` Editorial Craft and Admin strictly Neutral Studio Ink (zero `season-*` tokens in Admin), enforce `>= 44px` mobile touch targets, zero new npm dependencies, zero `framer-motion` imports, and zero em dashes.

**Goal:** Harden `firestore.rules` to eliminate blanket public reads before adding a write-only public `messages` collection, build an accessible spam-resistant Direct Contact Form in `ContactSection.jsx` with `mailto:` fallback, and ship a full `AdminMessagesTab` Inbox with unread counter in `AdminPage.jsx`.

**Spec:** `docs/superpowers/specs/2026-11-25-direct-contact-form-and-admin-inbox-design.md`

---

## Task 1: Hardened `firestore.rules`, `src/services/contactMessages.js` & Unit Tests

**Files:**
- Modify: `firestore.rules`
- Create: `src/services/contactMessages.js`
- Create: `test/services/contactMessages.test.js`

**Steps:**
1. Replace blanket `match /{document=**}` in `firestore.rules` with explicit per-collection rules for `projects`, `skills`, `settings`, `analytics_summary`, `analytics_daily`, and `messages` (strict `create` validation for public, `request.auth != null` for `read`/`update`/`delete`).
2. Create `src/services/contactMessages.js` exporting `MESSAGE_TOPICS`, `MESSAGE_STATUSES`, `COOLDOWN_MS`, `validateContactForm`, `getCooldownRemainingMs`, `recordSubmissionTimestamp`, `buildMailtoFallbackUrl`, and `submitContactMessage`.
3. Create `test/services/contactMessages.test.js` covering form validation, honeypot bypass, Firestore `addDoc` payload, cooldown enforcement, error handling, and static `firestore.rules` security assertions.
4. Run `npx vitest run test/services/contactMessages.test.js` and commit.

---

## Task 2: Direct Contact Form in `ContactSection.jsx` & Tests

**Files:**
- Modify: `src/components/sections/ContactSection.jsx`
- Modify: `test/components/sections/ContactSection.test.jsx`

**Steps:**
1. Upgrade `ContactSection.jsx` 12-col layout: Left (`lg:col-span-5`) header, `AvailabilityBadge`, Direct Email card, and compact Social Channels; Right (`lg:col-span-7`) **Send a Direct Message** Card with `role="radiogroup"` topic pills (arrow-key navigation), Name, Email, Message + live counter, hidden honeypot, inline errors (`aria-invalid`, `aria-describedby`), confirmation panel, and error alert with 1-click prefilled `mailto:` fallback.
2. Extend `test/components/sections/ContactSection.test.jsx` to test validation errors, topic radio switching, happy-path submit confirmation, and error `mailto:` fallback.
3. Run `npx vitest run test/components/sections/ContactSection.test.jsx test/App.test.jsx` and commit.

---

## Task 3: `AdminMessagesTab.jsx` & `AdminPage.jsx` Inbox Integration

**Files:**
- Create: `src/pages/admin/tabs/AdminMessagesTab.jsx`
- Modify: `src/pages/admin/AdminPage.jsx`
- Create: `test/pages/admin/AdminMessagesTab.test.jsx`
- Modify: `test/pages/admin/AdminPage.test.jsx`

**Steps:**
1. Create `src/pages/admin/tabs/AdminMessagesTab.jsx` using Neutral Studio Ink tokens, WAI-ARIA `role="tablist"` (`All`, `Unread`, `Read`, `Archived`), search filter, `Reply via Email` mailto link, Mark Read/Unread, Archive/Unarchive, and `useConfirm()` Delete.
2. Add `messages` tab under `Insights` in `AdminPage.jsx`, fetch `messages` in `reloadAll()`, and display unread badge count in sidebar.
3. Create `test/pages/admin/AdminMessagesTab.test.jsx` and update `test/pages/admin/AdminPage.test.jsx`.
4. Run `npx vitest run test/pages/admin/AdminMessagesTab.test.jsx test/pages/admin/AdminPage.test.jsx` and commit.

---

## Task 4: Full Verification & Whole-Branch Senior Code Review

**Steps:**
1. Run `npx vitest run` & `npm run build` (verify 0 Vite `> 500 KB` warnings and clean `/` preloads).
2. Spawn Whole-Branch Senior Code Reviewer (`research`) across `34a3465..HEAD`; fix all Critical/Important findings via TDD and re-verify.

---

## Task 5: Antislop Mode 2 (`after`) Audit & Delivery Gate

**Steps:**
1. Run Antislop Mode 2 (`after`) Audit and write `anti-slop/audit-005-2026-11-25.md`.
2. Present numbered findings to user, apply selected fixes, re-verify, and deliver the 4-block Delivery Gate PASS/FAIL report.
