# Spec 3 Implementation Plan: Motion Craft & Performance Boost

> **For agentic workers:** Always import from `motion/react` (never `framer-motion`), use `<MotionConfig reducedMotion="user">` + `<LazyMotion features={domMax}>` with `m.*` elements, keep animations hardware-accelerated (`transform`, `opacity`) and calibrated to Editorial Craft (`DESIGN.md` `MOTION 2`), preserve all existing test contracts (`.reveal-on-scroll`, `--stagger-idx`, keyboard navigation, Firestore/OG static paths), and keep zero em dashes (`—`).

**Goal:** Add Editorial Craft spring motion (`motion/react`), lazy-load secondary routes (`AdminPage`, `PrivacyPolicyPage`, `NotFoundPage`) to eliminate Vite's > 500 KB chunk warning, and optimize static portfolio images into dual-format WebP + optimized originals served via `<picture>`.

**Spec:** `docs/superpowers/specs/2026-11-25-motion-craft-and-performance-design.md`

**Tech Stack:** React 19 (JSX), Vite 6, React Router 7, Tailwind CSS v4, shadcn/ui, `motion` (`motion/react`), Python Pillow 12.3 (build-time asset optimization), Vitest 3 + React Testing Library.

---

## Task 1: Install `motion`, Create `src/lib/motion.js`, Wire Root Motion & Route Code-Splitting

**Files:**
- Modify: `package.json` (add `motion`)
- Create: `src/lib/motion.js`
- Modify: `src/App.jsx`
- Modify: `vite.config.js`
- Modify: `test/App.test.jsx`

**Steps:**
1. Install `motion` directly via `npm install motion`.
2. Create `src/lib/motion.js` exporting `EDITORIAL_SPRING`, `TACTILE_SPRING`, `EDITORIAL_EASE`, `HERO_CONTAINER_VARIANTS`, `HERO_ITEM_VARIANTS`, and `GALLERY_SLIDE_VARIANTS`.
3. Update `src/App.jsx`:
   - Lazy-load `AdminPage`, `PrivacyPolicyPage`, and `NotFoundPage` via `React.lazy(...)`.
   - Wrap `<Routes>` inside `<Suspense fallback={<RouteLoadingFallback />}>` with a clean neutral studio loading shell.
   - Wrap app root in `<MotionConfig reducedMotion="user">` and `<LazyMotion features={domMax}>` from `motion/react`.
4. Update `vite.config.js` `manualChunks` with `vendor`, `firebase`, `motion`, and `ui` (`radix-ui`, `@tabler/icons-react`, `sonner`).
5. Update `test/App.test.jsx` to wrap test routes in `<MotionConfig reducedMotion="user"><LazyMotion features={domMax}>` and `await` lazy routes via `findByRole` / `waitFor`.
6. Run `npx vitest run test/App.test.jsx; npm run build`, confirm zero Vite `> 500 KB` chunk warnings, and commit:
   `git commit -m "feat(perf): add motion/react root config, route code-splitting, and Vite chunking"`

---

## Task 2: Dual-Format Static Image Optimization + `getWebpSource` Helper

**Files:**
- Create: `src/utils/getWebpSource.js`
- Create: `test/utils/getWebpSource.test.js`
- Modify: `public/assets/images/arko-pic.jpg`, `public/assets/images/arko-about.jpg`, `public/assets/images/portfolio-1.png`..`portfolio-9.png`
- Create: `public/assets/images/arko-pic.webp`, `public/assets/images/arko-about.webp`, `public/assets/images/portfolio-1.webp`..`portfolio-9.webp`

**Steps:**
1. Write `test/utils/getWebpSource.test.js` (TDD RED) asserting:
   - `/assets/images/arko-pic.jpg` -> `/assets/images/arko-pic.webp`
   - `/assets/images/portfolio-1.png` -> `/assets/images/portfolio-1.webp`
   - `data:image/png;base64,...` -> `null`
   - `https://example.com/photo.png` -> `null`
   - `/assets/images/unknown-file.png` -> `null`
2. Implement `src/utils/getWebpSource.js` using an explicit `WEBP_ALLOWLIST` set (`arko-pic`, `arko-about`, `portfolio-1`..`portfolio-9`).
3. Run a local Python Pillow 12.3 optimization pass over `public/assets/images/` (portrait max 1200px progressive JPEG q=84 + WebP q=82; portfolio previews max 1280px optimized PNG + WebP q=82), logging exact before/after file sizes.
4. Verify `npx vitest run test/utils/getWebpSource.test.js` passes GREEN and commit:
   `git commit -m "perf(assets): optimize static images with dual-format WebP twins and getWebpSource helper"`

---

## Task 3: Navbar Motion Craft (Scroll Progress Hairline & Gliding `layoutId` Active Underline)

**Files:**
- Modify: `src/components/layout/Navbar.jsx`
- Modify: `test/components/layout/Layout.test.jsx`

**Steps:**
1. Update `test/components/layout/Layout.test.jsx` to verify `data-testid="scroll-progress-bar"` renders inside `Navbar`.
2. Update `src/components/layout/Navbar.jsx`:
   - Add `useScroll()` + `useSpring(scrollYProgress, { stiffness: 260, damping: 32, restDelta: 0.001 })` driving a `2px` `m.div` (`scaleX`, `origin-left`, `bg-season-accent`) along the bottom edge of `<header>`.
   - Replace the static active section underline with `<m.span layoutId="navbar-active-indicator" transition={EDITORIAL_SPRING} />`.
3. Run `npx vitest run test/components/layout/Layout.test.jsx` to verify GREEN and commit:
   `git commit -m "feat(motion): add scroll progress hairline and layoutId active underline to Navbar"`

---

## Task 4: HeroSection, AboutSection & ExperienceSection Choreography + `<picture>` WebP

**Files:**
- Modify: `src/components/sections/HeroSection.jsx`
- Modify: `src/components/sections/AboutSection.jsx`
- Modify: `src/components/sections/ExperienceSection.jsx`

**Steps:**
1. Update `HeroSection.jsx`:
   - Add calm staggered Editorial Craft mount choreography (`m.div` with `HERO_CONTAINER_VARIANTS` / `HERO_ITEM_VARIANTS`, total < 450ms) and portrait frame subtle scale entrance (`0.98 -> 1`).
   - Wrap `#hero-img` in `<picture>` using `getWebpSource(...)` while keeping exact `id`, `alt`, `width`, `height`, `fetchPriority="high"`, and `onError` fallback.
2. Update `AboutSection.jsx`:
   - Wrap `#about-img` in `<picture>` using `getWebpSource(...)` while keeping exact attributes and `onError` fallback.
3. Update `ExperienceSection.jsx`:
   - Upgrade each skill item row to `<m.div whileHover={{ y: -2 }} transition={TACTILE_SPRING}>` (transform-only, zero layout thrash).
4. Run `npx vitest run test/features/animations/ScrollRevealIntegration.test.jsx test/components/sections/ExperienceSection.test.jsx test/App.test.jsx` and commit:
   `git commit -m "feat(motion): add Hero choreography, Experience hover spring, and WebP picture elements"`

---

## Task 5: ProjectsSection & ProjectModal (Shared-Element Filter Pill, `AnimatePresence` Reflow, Directional Gallery & WebP)

**Files:**
- Modify: `src/components/sections/ProjectsSection.jsx`
- Modify: `src/components/sections/ProjectModal.jsx`
- Modify: `test/components/sections/ProjectModal.test.jsx`

**Steps:**
1. Update `src/components/sections/ProjectsSection.jsx`:
   - Render `<m.span layoutId="projects-filter-pill" transition={EDITORIAL_SPRING} />` inside the active filter chip behind a `relative z-10` label wrapper (make chip `relative overflow-hidden` and keep `.filter-chip` + `active` class + `role="tab"` + `aria-selected`).
   - Make `#projects-grid` `relative` and wrap cards in `<AnimatePresence mode="popLayout">`, upgrading each card to `<m.article layout="position" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} whileHover={{ y: -4 }} transition={TACTILE_SPRING}>`.
   - Wrap card preview `<img>` in `<picture>` with `getWebpSource(imgSrc)`.
   - Preserve `.project-card`, `.reveal-on-scroll`, `--stagger-idx`, and keyboard `Enter`/`Space`.
2. Update `src/components/sections/ProjectModal.jsx`:
   - Track gallery navigation `direction` (`1` next / `-1` prev) when clicking arrows, thumbnails, or pressing `ArrowLeft`/`ArrowRight`.
   - Wrap main preview image in `<AnimatePresence mode="wait" custom={direction} initial={false}>` with `<m.picture key={currentImg} custom={direction} variants={GALLERY_SLIDE_VARIANTS} initial="enter" animate="center" exit="exit" ...>` + `getWebpSource(currentImg)`.
   - Add `<m.span layoutId="modal-thumb-ring" transition={EDITORIAL_SPRING} />` active ring on selected gallery thumbnail.
3. Verify `npx vitest run test/components/sections/ProjectsSection.test.jsx test/components/sections/ProjectModal.test.jsx test/features/animations/ScrollRevealIntegration.test.jsx` passes GREEN and commit:
   `git commit -m "feat(motion): add sliding filter pill, grid AnimatePresence reflow, directional gallery, and WebP"`

---

## Task 6: Full Verification, Senior Code Review & Antislop Mode 2 (`after`) Audit + Delivery Gate

**Files:**
- Create: `anti-slop/audit-003-2026-11-25.md`

**Steps:**
1. Run full verification:
   - `npx vitest run` (all 28+ test files green, zero warnings)
   - `npm run build` (exit 0, zero Vite chunk > 500 KB warnings, record exact JS & asset byte savings)
   - Scan `src/` for any accidental `framer-motion` imports, em dashes, or `.get()` inside render.
2. Spawn Whole-Branch Senior Code Reviewer (`research`) across `59f3129..HEAD`; resolve all Critical/Important findings via TDD.
3. Run Antislop Mode 2 (`after`) Audit, write numbered findings to `anti-slop/audit-003-2026-11-25.md`, present findings to user, wait for selection, apply chosen fixes, re-verify, and deliver the 4-block Delivery Gate PASS/FAIL report.
