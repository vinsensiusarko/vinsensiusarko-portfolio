# Spec 3: Motion Craft & Performance Boost

**Date:** 2026-11-25  
**Status:** Draft for User Review  
**Scope Classification:** Architectural  
**Depends On:** Spec 1 (Landing Page & Public Pages shadcn/ui rework) & Spec 2 (Full Admin Panel shadcn/ui rework)  
**Target Audiences:** Recruiters / Hiring Managers, Freelance Clients, Personal Brand Showcase  
**Antislop Mode:** Mode 2 (`after`) with mandatory Delivery Gate

---

## 1. Goal & Principles

Elevate the portfolio's visual polish, interactive feel, and real-world loading performance without adding bloat or violating the calm Editorial Craft aesthetic defined in `DESIGN.md`:

1. **Purposeful Motion (`motion/react` + CSS hybrid):** Follow official `motion` best practices (`css-or-motion.md` & `react.md`). Use `motion/react` strictly where physics springs, shared-element `layoutId`, layout reflow (`layout` + `AnimatePresence`), or scroll-linked transforms (`useScroll` + `useSpring`) shine. Retain CSS transitions for simple hover color/border changes and Radix overlay transitions (`tw-animate-css`).
2. **Reduced-Motion First:** Wrap the application root in `<MotionConfig reducedMotion="user">` and `<LazyMotion features={domMax}>`, guaranteeing all transform and layout animations automatically step down when `prefers-reduced-motion: reduce` is enabled.
3. **Dramatic Landing Page Speedup:** Eliminate Vite's `> 500 KB` chunk warning by lazy-loading `/admin`, `/privacy-policy`, and `NotFoundPage` via `React.lazy` + `<Suspense>` and splitting chunks cleanly (`vendor`, `firebase`, `motion`, `ui`).
4. **Dual-Format Static Image Optimization (Zero Breaking Changes):** Optimize heavy static assets (`arko-pic.jpg`, `arko-about.jpg`, `portfolio-1..9.png`) in-place and generate lightweight `.webp` twins served via `<picture>` elements, preserving 100% compatibility with existing Firestore paths, OG social meta tags, and static fallbacks.

---

## 2. Motion Architecture & Editorial Choreography

### 2.1 Motion Foundation (`src/lib/motion.js` & `src/App.jsx`)
- Install `motion` (import strictly from `motion/react`, never `framer-motion`).
- Create `src/lib/motion.js` exporting calibrated Editorial Craft motion tokens (`DESIGN.md` `MOTION 2`, no cartoony overshoot, 150ms to 350ms timings):
  - `EDITORIAL_SPRING`: `{ type: 'spring', visualDuration: 0.35, bounce: 0.12 }` (shared-element `layoutId` indicators and grid `layout="position"` reflow).
  - `TACTILE_SPRING`: `{ type: 'spring', visualDuration: 0.22, bounce: 0.15 }` (hover/tap micro-interactions).
  - `EDITORIAL_EASE`: `[0.22, 1, 0.36, 1]` (mount entrances and modal gallery transitions).
  - `GALLERY_SLIDE_VARIANTS`: directional enter/center/exit (`x: ±24`, `opacity: 0 -> 1`, `duration: 0.22`).
- Wrap `App` root in `<MotionConfig reducedMotion="user">` + `<LazyMotion features={domMax}>` so all components use lightweight `m.*` primitives.

### 2.2 Component Choreography
1. **`src/components/layout/Navbar.jsx`:**
   - **Scroll Reading Progress Hairline:** `useScroll()` + `useSpring(scrollYProgress, { stiffness: 260, damping: 32, restDelta: 0.001 })` driving a `2px` `m.div` (`scaleX`, `origin-left`, `bg-season-accent`) fixed cleanly along the bottom border of `<header>`. Hardware-accelerated transform (`scaleX`), zero layout thrash.
   - **Gliding Active Underline:** Replace static active underline in desktop home nav with `<m.span layoutId="navbar-active-indicator" transition={EDITORIAL_SPRING} />` gliding smoothly between `About`, `Experience`, `Projects`, and `Contact`.
2. **`src/components/sections/HeroSection.jsx`:**
   - Calm staggered entrance (`opacity: 0, y: 12 -> opacity: 1, y: 0`, 60ms stagger, total < 450ms) across greeting/season pill, `h1` name, typewriter role line, summary paragraph, CTA buttons, and portrait card (`scale: 0.98 -> 1`).
3. **`src/components/sections/ProjectsSection.jsx`:**
   - **Shared-Element Filter Pill:** Render `<m.span layoutId="projects-filter-pill" transition={EDITORIAL_SPRING} className="absolute inset-0 rounded-lg bg-primary" aria-hidden="true" />` inside the active filter tab behind a `relative z-10` label wrapper.
   - **Grid Reflow & Spring Lift:** Wrap visible cards in `<AnimatePresence mode="popLayout">` on a `relative` grid container (`id="projects-grid"`), rendering each card as `<m.article layout="position" whileHover={{ y: -4 }} transition={TACTILE_SPRING} />` with subtle opacity/scale enter & exit. Preserve `.project-card`, `.reveal-on-scroll`, `--stagger-idx`, and keyboard `Enter`/`Space` handling.
4. **`src/components/sections/ProjectModal.jsx`:**
   - **Directional Gallery Transitions:** Track navigation `direction` (`+1` next, `-1` prev) across arrow buttons, thumbnail clicks, and `ArrowLeft`/`ArrowRight` keys. Wrap the primary preview image in `<AnimatePresence mode="wait" custom={direction} initial={false}>` using `GALLERY_SLIDE_VARIANTS`.
   - **Active Thumbnail Indicator:** Render a crisp `layoutId="modal-thumb-ring"` seasonal accent border ring on the active gallery thumbnail.
5. **`src/components/sections/ExperienceSection.jsx`:**
   - Subtle GPU-accelerated `whileHover={{ y: -2 }}` (`transition={TACTILE_SPRING}`) on individual skill cards.

---

## 3. Route Code-Splitting & Vite Chunking

### 3.1 `src/App.jsx`
- Keep `HomePage` eagerly loaded for instant first paint on `/`.
- Convert secondary routes to `React.lazy`:
  - `AdminPage` (`/admin`, `/admin/*`)
  - `PrivacyPolicyPage` (`/privacy-policy`, `/privacy-policy.html`)
  - `NotFoundPage` (`*`)
- Wrap `<Routes>` in `<Suspense fallback={<RouteLoadingFallback />}>` displaying a calm, neutral editorial loading state (`min-h-dvh bg-background`) so transitions never flash unstyled white.

### 3.2 `vite.config.js`
- Refine `build.rollupOptions.output.manualChunks`:
  - `vendor`: `['react', 'react-dom', 'react-router']`
  - `firebase`: `['firebase/app', 'firebase/firestore', 'firebase/auth']`
  - `motion`: `['motion']`
  - `ui`: `['radix-ui', '@tabler/icons-react', 'sonner']`
- Success criterion: `npm run build` completes with **zero Vite `> 500 KB` chunk size warnings** and main entry chunk drops dramatically compared to the `687.40 KB` baseline.

---

## 4. Dual-Format Static Image Optimization

### 4.1 Asset Pipeline (Local Pillow 12.3, Zero Extra npm Dependencies)
Optimize heavy images in `public/assets/images/` while preserving exact original filenames for Firestore compatibility, OG social scrapers, and static fallbacks:
- **Portraits:**
  - `arko-pic.jpg` (922 KB baseline): resize max `1200px`, progressive JPEG (`quality=84`) + generate `arko-pic.webp` (`quality=82`).
  - `arko-about.jpg` (153 KB baseline): optimize progressive JPEG (`quality=84`) + generate `arko-about.webp` (`quality=82`).
- **Portfolio Previews (`portfolio-1.png` through `portfolio-9.png`, ~5.5 MB combined):**
  - Resize max `1280px` width/height preserving aspect ratio, optimize PNG in-place + generate `portfolio-1.webp` through `portfolio-9.webp` (`quality=82`).

### 4.2 Safe WebP Helper & `<picture>` Integration
- Create `src/utils/getWebpSource.js`:
  - Maintain an explicit allowlist of static asset basenames that have generated `.webp` twins (`arko-pic`, `arko-about`, `portfolio-1` through `portfolio-9`).
  - Return `/assets/images/<name>.webp` ONLY when input matches a local `/assets/images/<name>.(jpg|jpeg|png)` asset in that allowlist.
  - Return `null` for `data:` Base64 strings, `http://`/`https://` URLs, or unknown filenames (guaranteeing zero 404 requests).
- Update `HeroSection.jsx`, `AboutSection.jsx`, `ProjectsSection.jsx`, and `ProjectModal.jsx` to render `<picture>{webpSrc && <source srcSet={webpSrc} type="image/webp" />}<img ... /></picture>`, keeping `onError` fallback and exact `id`, `alt`, `width`, `height`, and `className` attributes intact.

---

## 5. Testing, Verification & Antislop Delivery Gate

### 5.1 Automated Tests
- **New `test/utils/getWebpSource.test.js`:** Verify static allowlisted `.jpg`/`.png` paths resolve to `.webp`, while Base64 URIs, external URLs, and unknown local filenames return `null`.
- **Update `test/App.test.jsx`:** Use `findByRole` / `waitFor` for lazy-loaded `/privacy-policy`, `/admin`, and `*` routes, and wrap test harness in `<MotionConfig reducedMotion="user"><LazyMotion features={domMax}>`.
- **Update `test/components/layout/Layout.test.jsx`:** Verify the scroll progress bar indicator renders inside `Navbar`.
- **Update `test/components/sections/ProjectModal.test.jsx`:** Verify directional next/prev navigation and thumbnail selection continue updating the preview image cleanly under `AnimatePresence`.
- **Preserve all 27+ existing test suites (105+ tests):** Ensure `ScrollRevealIntegration.test.jsx`, `ProjectsSection.test.jsx`, and all Admin tests remain 100% green.

### 5.2 Verification & Audit
1. Fresh `npx vitest run` (all tests green, zero warnings/unhandled rejections).
2. Fresh `npm run build` (exit 0, zero chunk > 500 KB warnings, record exact JS & image byte reductions).
3. Whole-Branch Senior Code Review via `research` subagent; fix all Critical/Important issues via TDD.
4. Antislop Mode 2 (`after`) Audit saved to `anti-slop/audit-003-2026-11-25.md`, wait for user selection of findings, resolve chosen items, re-verify, and deliver the 4-block Delivery Gate PASS/FAIL report.
