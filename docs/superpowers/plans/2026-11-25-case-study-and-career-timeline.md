# Spec 4 Implementation Plan: Interactive Project Case Study & Career Timeline

> **For agentic workers:** Follow TDD, keep all motion strictly on `motion/react` (`m.*` inside `<LazyMotion features={domMax} strict>`, `useId()` scoped `layoutId`), use semantic tokens from `src/styles/index.css` (Neutral Studio Ink in Admin, Editorial Craft + seasonal accents on public pages), zero new npm dependencies, zero Firestore Security Rules changes, and zero em dashes (`—`).

**Goal:** Upgrade `ProjectModal` with pure-CSS adaptive `DeviceFrame` mockups, optional Case Study details, and shareable `?project=<id>` deep-links; add filterable `JourneySection` Career & Education Timeline and opt-in Admin-controlled `AvailabilityBadge`; and add CMS editors for both in `AdminProjectsTab` and `AdminProfileTab`.

**Spec:** `docs/superpowers/specs/2026-11-25-case-study-and-career-timeline-design.md`

**Tech Stack:** React 19 (JSX), Vite 6, React Router 7, Tailwind CSS v4, shadcn/ui, `motion/react`, `@tabler/icons-react`, `sonner`, Firebase 11, Vitest 3 + React Testing Library.

---

## Task 1: `DeviceFrame`, `AvailabilityBadge`, Schema Extensions & Unit Tests

**Files:**
- Create: `src/components/common/DeviceFrame.jsx`
- Create: `src/components/common/AvailabilityBadge.jsx`
- Modify: `src/data/fallbackData.js`
- Modify: `src/hooks/usePortfolioData.js`
- Create: `test/components/common/DeviceFrame.test.jsx`

**Steps:**
1. Create `src/components/common/DeviceFrame.jsx` exporting `getDeviceVariant(category)` and `DeviceFrame({ variant, title, url, children })` for `mobile`, `web`, and `desktop` pure-CSS studio frames.
2. Create `src/components/common/AvailabilityBadge.jsx` exporting `AVAILABILITY_PRESETS` and `AvailabilityBadge({ status, text, className })`, returning `null` when `!status || status === 'hidden'`.
3. Update `src/data/fallbackData.js`:
   - Add `availabilityStatus: 'hidden'`, `availabilityText: ''`, and honest baseline `timeline` (derived strictly from existing `expSub` & `eduDegree`/`eduMajor` facts, zero fabricated employers) to `FALLBACK_SITE_SETTINGS`.
   - Enrich `FALLBACK_PROJECTS` with concise authentic `role`, `period`, and `highlights` where grounded in existing project descriptions.
4. Update `src/hooks/usePortfolioData.js` `normalizeSiteSettings`:
   - Preserve explicit empty `timeline: []` if cleared in Firestore (`Array.isArray(raw.timeline) ? raw.timeline : FALLBACK_SITE_SETTINGS.timeline`), and default `availabilityStatus` to `'hidden'`.
5. Create `test/components/common/DeviceFrame.test.jsx` testing `getDeviceVariant`, all 3 `DeviceFrame` variants (including hostname pill extraction), and `AvailabilityBadge` (`hidden` returns null; `available`/`freelance`/`busy` render semantic status pill).
6. Run `npx vitest run test/components/common/DeviceFrame.test.jsx test/hooks/usePortfolioData.test.jsx` and commit:
   `git commit -m "feat(ui): add DeviceFrame, AvailabilityBadge, and timeline/case-study schema defaults"`

---

## Task 2: Enhanced `ProjectModal` (Case Study View + Copy Link) & `ProjectsSection` (`?project=<id>` Deep-Link)

**Files:**
- Modify: `src/components/sections/ProjectModal.jsx`
- Modify: `src/components/sections/ProjectsSection.jsx`
- Modify: `test/components/sections/ProjectModal.test.jsx`
- Modify: `test/components/sections/ProjectsSection.test.jsx`

**Steps:**
1. Update `src/components/sections/ProjectModal.jsx`:
   - Add `showFrame` state (defaults to `true`, resets when `project?.id` changes) + accessible Frame/Full toggle button (`aria-pressed={showFrame}`) wrapping the gallery image inside `<DeviceFrame>` when enabled.
   - Render Case Study metadata strip (`Role`, `Period`) only when present, and `Key Highlights` list (`IconCircleCheck`) only when `project.highlights?.length > 0`.
   - Add `Copy Link` button (`IconLink` -> `IconCheck` for 2s + `toast.success('Project link copied!')`) copying `${window.location.origin}/?project=${encodeURIComponent(project.id)}` with safe clipboard fallback.
2. Update `src/components/sections/ProjectsSection.jsx`:
   - On mount / `projects` change, read `new URLSearchParams(window.location.search).get('project')` and auto-open the matching project once per param value.
   - Sync `?project=<id>` via `window.history.replaceState` when opening/closing `ProjectModal` (preserving other query params & hash).
3. Update `test/components/sections/ProjectModal.test.jsx` & `test/components/sections/ProjectsSection.test.jsx` to verify Frame/Full toggle, Case Study fields, Copy Link, and `?project=<id>` deep-link auto-open & close cleanup.
4. Run `npx vitest run test/components/sections/ProjectModal.test.jsx test/components/sections/ProjectsSection.test.jsx` and commit:
   `git commit -m "feat(projects): upgrade ProjectModal with DeviceFrame, case study details, copy link, and deep-link sync"`

---

## Task 3: `JourneySection` Timeline + Navigation & `AvailabilityBadge` Integration

**Files:**
- Create: `src/components/sections/JourneySection.jsx`
- Create: `test/components/sections/JourneySection.test.jsx`
- Modify: `src/pages/HomePage.jsx`
- Modify: `src/components/layout/Navbar.jsx`
- Modify: `src/components/common/CommandPalette.jsx`
- Modify: `src/components/sections/HeroSection.jsx`
- Modify: `src/components/sections/ContactSection.jsx`
- Modify: `test/components/sections/ContactSection.test.jsx`

**Steps:**
1. Create `src/components/sections/JourneySection.jsx` (`id="journey"`):
   - Filter tabs (`All`, `Work`, `Education`) with `motion/react` `m.span` `layoutId={`${journeyId}-tab-pill`}` (`useId()` scoped).
   - Editorial vertical hairline timeline with `<AnimatePresence mode="popLayout" initial={false}>`, `IconBriefcase`/`IconSchool` badges, `font-mono tabular-nums` period, title, organization, summary, and optional tags.
   - Return `null` cleanly when `timeline` is empty.
2. Mount `<JourneySection timeline={siteSettings.timeline} />` in `HomePage.jsx` between `AboutSection` and `ExperienceSection`, and pass `siteSettings={siteSettings}` to `<ContactSection />`.
3. Add `Journey` (`#journey`) to `Navbar.jsx` (`HOME_NAV_ITEMS` and scroll-spy `sections`) and `CommandPalette.jsx`.
4. Render `<AvailabilityBadge status={siteSettings.availabilityStatus} text={siteSettings.availabilityText} />` in `HeroSection.jsx` and `ContactSection.jsx` (stays hidden when `availabilityStatus === 'hidden'`).
5. Write `test/components/sections/JourneySection.test.jsx` (wrapped in `<MotionConfig reducedMotion="always"><LazyMotion features={domMax} strict>`) and add an opt-in availability test in `test/components/sections/ContactSection.test.jsx`.
6. Run `npx vitest run test/components/sections/JourneySection.test.jsx test/components/sections/ContactSection.test.jsx test/components/layout/Layout.test.jsx test/features/animations/ScrollRevealIntegration.test.jsx test/App.test.jsx` and commit:
   `git commit -m "feat(journey): add Career & Education JourneySection and opt-in AvailabilityBadge"`

---

## Task 4: Optional Case Study Fields in `AdminProjectsTab.jsx`

**Files:**
- Modify: `src/pages/admin/tabs/AdminProjectsTab.jsx`
- Modify: `test/pages/admin/AdminProjectsTab.test.jsx`

**Steps:**
1. Add `role`, `period`, and `highlights` (newline-separated string in form state -> trimmed string array in Firestore payload) to `INITIAL_FORM`, `openEditModal`, `handleSubmit`, and the Add/Edit Project `Dialog` in `AdminProjectsTab.jsx`.
2. Add test coverage in `test/pages/admin/AdminProjectsTab.test.jsx` verifying Case Study inputs populate on edit and format cleanly.
3. Run `npx vitest run test/pages/admin/AdminProjectsTab.test.jsx` and commit:
   `git commit -m "feat(admin): add optional Case Study fields to AdminProjectsTab"`

---

## Task 5: Availability Status & Career Timeline CRUD Editor in `AdminProfileTab.jsx`

**Files:**
- Modify: `src/pages/admin/tabs/AdminProfileTab.jsx`
- Modify: `test/pages/admin/AdminSettingsTabs.test.jsx`

**Steps:**
1. Extend `AdminProfileTab.jsx` state and Firestore `settings/site_settings` load/save with `availabilityStatus`, `availabilityText`, and `timeline` (array of `{ id, type, title, organization, period, summary, tags, current }`).
2. Render **Availability Status** section (`Select` + custom text `Input`) and **Career & Education Timeline** CRUD editor (`+ Add Entry`, card fields, `Current` switch, Move Up / Move Down buttons `size-11 sm:size-8`, Delete button) cleanly separated by `Separator`.
3. Update `test/pages/admin/AdminSettingsTabs.test.jsx` to test Availability Status selector and Timeline add/reorder/remove actions in `AdminProfileTab`.
4. Run `npx vitest run test/pages/admin/AdminSettingsTabs.test.jsx` and commit:
   `git commit -m "feat(admin): add Availability Status and Career Timeline editor to AdminProfileTab"`

---

## Task 6: Full Verification, Whole-Branch Senior Code Review & Antislop Mode 2 (`after`) Audit + Delivery Gate

**Files:**
- Create: `anti-slop/audit-004-2026-11-25.md`

**Steps:**
1. Run full `npx vitest run`, `npm run build` (verify 0 Vite > 500 KB warnings and clean `/` preloads), and em-dash / `framer-motion` / hygiene scans.
2. Spawn Whole-Branch Senior Code Reviewer (`research`) across `c88746c..HEAD`; fix all Critical/Important findings via TDD.
3. Run Antislop Mode 2 (`after`) Audit -> write `anti-slop/audit-004-2026-11-25.md`, present numbered findings to user, wait for selection, apply chosen fixes, re-verify, and deliver the 4-block Delivery Gate PASS/FAIL report.
