# Spec 6 Implementation Plan: Hybrid Editorial-Cinematic Parallax Scrolling

> **For agentic workers:** Follow TDD, keep all motion strictly on `motion/react` (`m.*` inside `<LazyMotion features={domMax} strict>`), animate GPU-composited `transform` only (`y`, `scale`, `scaleY`), respect `useReducedMotion()`, use `overflow-x-clip` strictly on individual sections (never `overflow: hidden` on `html`/`body`), zero new npm dependencies, zero `/admin` changes, and zero em dashes.

**Goal:** Build reusable `ParallaxLayer` and `SectionWatermark` primitives powered by `motion/react`, wire Hybrid Editorial-Cinematic parallax choreography across all 6 landing sections (`HeroSection`, `AboutSection`, `JourneySection`, `ExperienceSection`, `ProjectsSection`, `ContactSection`) and `SeasonalCanvas`, and verify with full tests, Senior Code Review, and Antislop Mode 2 (`after`) Delivery Gate.

**Spec:** `docs/superpowers/specs/2026-11-28-editorial-cinematic-parallax-design.md`

---

## Task 1: `PARALLAX_SPRING`, `ParallaxLayer`, `SectionWatermark` & Unit Tests

**Files:**
- Modify: `src/lib/motion.js`
- Create: `src/components/common/ParallaxLayer.jsx`
- Create: `test/components/common/ParallaxLayer.test.jsx`

**Steps:**
1. Export `PARALLAX_SPRING` (`{ stiffness: 180, damping: 28, mass: 0.45 }`) from `src/lib/motion.js`.
2. Create `src/components/common/ParallaxLayer.jsx`:
   - `useIsCompactViewport()` resilient hook checking `window.matchMedia('(max-width: 767px)')` safely.
   - `ParallaxLayer({ targetRef, offset, range, scrollOffset, scaleRange, smooth, mobileFactor, className, style, children })` using `useScroll`, `useTransform`, `useSpring`, `useReducedMotion`, and `m.div`.
   - `SectionWatermark({ targetRef, label, align, offset, className })` rendering an `aria-hidden="true"` `pointer-events-none select-none` drifting editorial index watermark.
3. Create `test/components/common/ParallaxLayer.test.jsx` verifying `ParallaxLayer` and `SectionWatermark` inside `<MotionConfig reducedMotion="always"><LazyMotion features={domMax} strict>`, `aria-hidden` + `pointer-events-none`, and resilience when `matchMedia` is absent or matches compact mobile.
4. Run `npx vitest run test/components/common/ParallaxLayer.test.jsx` and commit.

---

## Task 2: Hero, About & Journey Parallax Choreography

**Files:**
- Modify: `src/components/sections/HeroSection.jsx`
- Modify: `src/components/sections/AboutSection.jsx`
- Modify: `src/components/sections/JourneySection.jsx`
- Modify: `test/components/sections/JourneySection.test.jsx`

**Steps:**
1. `HeroSection.jsx`: add `sectionRef` + `overflow-x-clip`; wire `ParallaxLayer` (`scrollOffset={['start start', 'end start']}`) on left text (`range={[0, 18]}`), right portrait frame (`range={[0, -36]}`, `scaleRange={[1, 1.035]}`), and seasonal corner bracket (`range={[0, -54]}`). Keep `<h1>` and `#hero-img` at `y = 0`, `opacity = 1` on initial load.
2. `AboutSection.jsx`: add `sectionRef` + `overflow-x-clip`, `<SectionWatermark label="01" />`, inner-crop image parallax inside the `overflow-hidden rounded-lg` photo container (`offset={22}`, `scaleRange={[1.1, 1.1]}`), and subtle counter-drift on the bio column (`offset={-14}`, `mobileFactor={0}`).
3. `JourneySection.jsx`: add `sectionRef` + `timelineRef` + `overflow-x-clip`, `<SectionWatermark label="02" />`, and scroll-driven `<m.span data-testid="journey-scroll-spine" aria-hidden="true" />` (`scaleY` via `useScroll` + `useSpring`, locked to `1` under `useReducedMotion()`).
4. Update `test/components/sections/JourneySection.test.jsx` to verify `journey-scroll-spine` renders cleanly, run affected tests (`JourneySection`, `ScrollRevealIntegration`, `App`), and commit.

---

## Task 3: Experience, Projects, Contact & `SeasonalCanvas` Scroll Depth

**Files:**
- Modify: `src/components/sections/ExperienceSection.jsx`
- Modify: `src/components/sections/ProjectsSection.jsx`
- Modify: `src/components/sections/ContactSection.jsx`
- Modify: `src/features/season/SeasonalCanvas.jsx`
- Modify: `test/components/sections/ContactSection.test.jsx`

**Steps:**
1. `ExperienceSection.jsx`: add `sectionRef` + `overflow-x-clip`, `<SectionWatermark label="03" />`, and desktop asymmetric column depth (`-16` / `+16`, `mobileFactor={0}`).
2. `ProjectsSection.jsx`: add `sectionRef` + `overflow-x-clip`, `<SectionWatermark label="04" />`, and subtle header micro-drift (`offset={-12}`, `mobileFactor={0}`) without touching `<AnimatePresence mode="popLayout">` project cards.
3. `ContactSection.jsx`: add `sectionRef` + `overflow-x-clip`, `<SectionWatermark label="05" />`, and subtle form card depth (`offset={-18}`, `mobileFactor={0}`). Wrap `test/components/sections/ContactSection.test.jsx` renders in `<MotionConfig reducedMotion="always"><LazyMotion features={domMax} strict>`.
4. `SeasonalCanvas.jsx`: add passive `window` `scroll` delta tracker inside the active canvas effect (only when `particlesEnabled && !prefersReducedMotion`), decaying `scrollImpulse` in `requestAnimationFrame` to gently drift particles vertically according to particle depth with zero React re-renders.
5. Run affected tests (`ExperienceSection`, `ProjectsSection`, `ContactSection`, `SeasonSwitcher`, `App`) and commit.

---

## Task 4: Full Verification, Whole-Branch Senior Code Review & Antislop Mode 2 (`after`) Audit + Delivery Gate

**Files:**
- Create: `anti-slop/audit-006-2026-11-28.md`

**Steps:**
1. Run full `npx vitest run`, `npm run build` (verify 0 Vite `> 500 KB` warnings and clean `/` preloads), and hygiene scans (`framer-motion`, raw `motion.`, em dashes).
2. Spawn Whole-Branch Senior Code Reviewer (`research`) across `f156221..HEAD`; resolve all Critical/Important findings via TDD.
3. Run Antislop Mode 2 (`after`) Audit -> write `anti-slop/audit-006-2026-11-28.md`, present numbered findings to user, apply chosen fixes, re-verify, and deliver the 4-block Delivery Gate PASS/FAIL report.
