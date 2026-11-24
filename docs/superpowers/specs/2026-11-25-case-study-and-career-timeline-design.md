# Spec 4: Interactive Project Case Study & Career Timeline

**Date:** 2026-11-25  
**Status:** Draft for User Review  
**Scope Classification:** Architectural  
**Depends On:** Spec 1 (Landing Page shadcn/ui), Spec 2 (Admin Panel shadcn/ui), Spec 3 (Motion Craft & Performance Boost)  
**Target Audiences:** Recruiters / Hiring Managers, Freelance Clients, Personal Brand Showcase  
**Antislop Mode:** Mode 2 (`after`) with mandatory Delivery Gate

---

## 1. Goal & Principles

Deepen proof-of-work storytelling and recruiter/client conversion on top of the Editorial Craft design system (`DESIGN.md`) and `motion/react` foundation without adding extra npm dependencies or requiring Firestore Security Rules changes:

1. **Interactive Studio Case Study Modal:** Upgrade `ProjectModal` into a studio showcase with pure-CSS adaptive Device Frame mockups (`mobile`, `web`, `desktop`), Frame/Full preview toggle, optional case-study metadata (`role`, `period`, `highlights`), and one-click shareable deep-links (`/?project=<id>`).
2. **Chronological Career & Education Timeline (`JourneySection`):** Add a clean, filterable (`All` / `Work` / `Education`) Editorial Craft timeline between `AboutSection` and `ExperienceSection`, backed by `settings/site_settings.timeline` so it automatically integrates with existing JSON Backup/Restore.
3. **Honest, Opt-In Availability Status:** Add an Admin-controlled availability status (`hidden`, `available`, `freelance`, `busy` + custom label) stored in `settings/site_settings` and defaulting to `'hidden'`, ensuring the portfolio never displays hardcoded fake availability claims.
4. **Zero Breaking Changes:** All new project and site-settings fields are optional and backward-compatible with existing Firestore documents, static fallbacks, and all 28 existing test suites.

---

## 2. Section 1: Interactive Case Study Modal & Shareable Deep-Link

### 2.1 `src/components/common/DeviceFrame.jsx`
- Pure CSS/Tailwind Editorial Craft device chrome (zero heavy PNG frame assets; adapts cleanly to Light & Dark themes via semantic tokens `bg-card`, `bg-muted`, `border-border`):
  - `getDeviceVariant(category)`: maps `'Mobile Application'` -> `'mobile'`, `'Web Application' | 'Web Portal' | 'Enterprise System'` -> `'web'`, `'Desktop Application' | 'Backend API'` -> `'desktop'`.
  - **`mobile`:** Rounded phone bezel (`rounded-[1.75rem] border-2 border-border bg-card p-1.5 shadow-sm`), subtle top speaker notch bar, centered aspect-friendly screenshot container.
  - **`web`:** Minimal browser header (`h-7 border-b border-border bg-muted/70 px-3`) with 3 monochrome dots and a compact monospace address pill derived from `demoUrl` hostname (or sanitized title fallback).
  - **`desktop`:** Compact window header (`h-7 border-b border-border bg-muted/70 px-3`) with subtle window indicator and monospace title/category label.

### 2.2 Enhanced `src/components/sections/ProjectModal.jsx`
- **Frame / Full Toggle:** Compact accessible button (`aria-pressed={showFrame}`) in the preview header bar switching between `DeviceFrame` mockup view and unframed full-bleed screenshot preview.
- **Case Study Metadata Strip:** Rendered cleanly only when `project.role` or `project.period` is non-empty (no empty placeholder pills).
- **Key Highlights / Outcomes:** When `Array.isArray(project.highlights) && project.highlights.length > 0`, render a crisp editorial list (`Key Highlights`) with `IconCircleCheck` bullets beneath the formatted description.
- **Copy Share Link Button:** Action button (`Copy Link` with `IconLink` -> temporary `Copied` with `IconCheck` + `toast.success('Project link copied!')`) copying `${window.location.origin}/?project=${encodeURIComponent(project.id)}` with safe Clipboard API error handling.

### 2.3 Shareable Deep-Link Sync in `src/components/sections/ProjectsSection.jsx`
- On mount / when `projects` populates: inspect `new URLSearchParams(window.location.search).get('project')`. If a matching project (`p.id === targetId`) exists, open `ProjectModal` automatically once for that parameter value (preventing reopen loops when the user closes the modal).
- Opening a project updates the URL query via `window.history.replaceState(null, '', nextUrl)` (`?project=<id>`); closing removes the `project` query parameter cleanly while preserving any unrelated query params or hash. Works seamlessly both inside React Router and in standalone unit tests.

### 2.4 Admin Case Study Editor (`src/pages/admin/tabs/AdminProjectsTab.jsx`)
- Add an optional **Case Study Details** block inside the Add/Edit Project `Dialog` (separated by `Separator`):
  - `Role / Contribution` (`Input`, optional, e.g., `Full-Stack Developer`)
  - `Year / Period` (`Input`, optional, e.g., `2025`)
  - `Key Highlights / Outcomes (One per line)` (`Textarea`, optional, persisted as trimmed non-empty string array `highlights` in Firestore).

---

## 3. Section 2: Career & Education Timeline, Availability Status & Admin Editor

### 3.1 `src/components/sections/JourneySection.jsx`
- Mounted in `HomePage.jsx` between `AboutSection` and `ExperienceSection` (`id="journey"`).
- Wired into `Navbar.jsx` (`HOME_NAV_ITEMS` & scroll-spy sections list) and `CommandPalette.jsx` (`Go to Career & Education Timeline`).
- **Filter Tabs (`All`, `Work`, `Education`):** Built with `motion/react` `m.span` shared-element `layoutId={`${journeyId}-tab-pill`}` (`useId()` scoped) and `<AnimatePresence mode="popLayout" initial={false}>` on the timeline list.
- **Editorial Vertical Timeline:** Hairline `border-l border-border` spine with seasonal accent node for current/active milestones and neutral node for past entries, displaying `period` (`font-mono tabular-nums`), `type` badge (`Work` / `Education`), `title`, `organization`, `summary`, and optional `tags`.
- **Honest Fallback Data (`src/data/fallbackData.js`):** Seed `FALLBACK_SITE_SETTINGS.timeline` strictly with verifiable baseline items derived from existing profile facts (`Web & Mobile Developer` + `Bachelors Degree, Computer Science`, no fabricated employers or fake metrics). If `timeline` is emptied in Admin, `JourneySection` returns `null` cleanly.

### 3.2 Opt-In Admin-Controlled Availability Status
- Stored inside `settings/site_settings` (`usePortfolioData.js` normalizes with `FALLBACK_SITE_SETTINGS`):
  - `availabilityStatus`: `'hidden'` (default) | `'available'` | `'freelance'` | `'busy'`
  - `availabilityText`: optional custom label (falls back to concise preset copy per status).
- Rendered via a shared tiny helper component `src/components/common/AvailabilityBadge.jsx` inside `HeroSection.jsx` and `ContactSection.jsx` ONLY when `availabilityStatus !== 'hidden'`.
- Uses WCAG AA checked semantic tokens (`status-success-*`, `status-warn-*`, or neutral `muted`). Preserves existing `ScrollRevealIntegration.test.jsx` behavior when status is `'hidden'`.

### 3.3 Admin Timeline & Availability Editor (`src/pages/admin/tabs/AdminProfileTab.jsx`)
- **Availability Status Section:** `Select` (`Hidden`, `Available for Work & Freelance`, `Open to Select Projects`, `Currently Booked`) + `Input` for custom status text.
- **Career & Education Timeline Section:** Dynamic list editor allowing the admin to:
  - Add new entry (`+ Add Entry`)
  - Edit `type` (`Work` / `Education`), `title`, `organization`, `period`, `summary`, `tags` (comma-separated), and `current` (`Switch`)
  - Reorder entries via Move Up / Move Down buttons (`size-11 sm:size-8`)
  - Delete entries
- Persisted inside `settings/site_settings` on form submit (`timeline`, `availabilityStatus`, `availabilityText`), requiring zero Firestore Security Rules changes and automatically included in `AdminDatabaseTab` JSON Export/Restore.

---

## 4. Testing, Verification & Antislop Delivery Gate

### 4.1 Automated Tests
- **New `test/components/common/DeviceFrame.test.jsx`:** Verify `getDeviceVariant` mapping and rendering of `mobile`, `web` (including hostname pill), and `desktop` frames.
- **New `test/components/sections/JourneySection.test.jsx`:** Verify timeline rendering, `All` / `Work` / `Education` filtering under `<MotionConfig reducedMotion="always"><LazyMotion features={domMax} strict>`, and clean hidden state when `timeline` is empty.
- **Update `test/components/sections/ProjectModal.test.jsx`:** Verify Frame/Full toggle (`aria-pressed`), Case Study Role/Period/Highlights rendering, and Copy Share Link action.
- **Update `test/components/sections/ProjectsSection.test.jsx`:** Verify `?project=<id>` deep-link auto-opens the matching project modal and clears the query param on close.
- **Update `test/pages/admin/AdminSettingsTabs.test.jsx`:** Verify Availability Status controls and Timeline Add/Reorder/Delete actions in `AdminProfileTab`.
- **Update `test/components/sections/ContactSection.test.jsx` / `ScrollRevealIntegration.test.jsx`:** Verify AvailabilityBadge stays hidden by default and renders cleanly when enabled via `siteSettings`.

### 4.2 Quality Gates
1. Full `npx vitest run` (all 30+ test suites green, zero warnings).
2. Full `npm run build` (exit 0, zero Vite `> 500 KB` warnings, `AdminPage` & `firebase-auth` still excluded from `/` preloads).
3. Whole-Branch Senior Code Review via `research` subagent; resolve all Critical/Important findings via TDD.
4. Antislop Mode 2 (`after`) Audit saved to `anti-slop/audit-004-2026-11-25.md`, await user selection of findings, apply chosen fixes, re-verify, and deliver the 4-block Delivery Gate PASS/FAIL report.
