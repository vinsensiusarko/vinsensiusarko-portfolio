# Spec 6: Hybrid Editorial-Cinematic Parallax Scrolling

**Date:** 2026-11-28  
**Status:** Draft for User Review  
**Scope Classification:** Architectural  
**Depends On:** Spec 1 (Editorial Craft & shadcn/ui), Spec 3 (`motion/react` + `<MotionConfig reducedMotion="user">` + `<LazyMotion features={domMax} strict>`), Spec 4 (`JourneySection`), Spec 5 (`ContactSection`)  
**Target Audiences:** Recruiters / Hiring Managers, Freelance Clients, Personal Brand Showcase  
**Antislop Mode:** Mode 2 (`after`) with mandatory Delivery Gate

---

## 1. Goal & Principles

Introduce an elegant, 60fps **Hybrid Editorial-Cinematic Parallax Scrolling** layer across the public portfolio landing page combining **Subtle Editorial Depth** (calm, legible text & interactive controls) with **Expressive Cinematic Depth** (layered portraits, inner-crop image parallax, scroll-driven timeline spine, floating editorial index watermarks, and scroll-reactive seasonal particles):

1. **Zero Extra Dependencies:** Built 100% on the existing `motion/react` (`m.*`, `useScroll`, `useTransform`, `useSpring`, `useReducedMotion`) and HTML5 Canvas (`SeasonalCanvas`) stack.
2. **GPU-Composited Only:** Animate strictly `transform` (`translateY`, `scale`, `scaleY`). Never animate layout properties (`top`, `margin`, `height`, `padding`) and never use `background-attachment: fixed`.
3. **Accessibility & Mobile Safety First:**
   - Automatically neutralizes all scroll-linked offsets (`y = 0`, `scale = 1`, `scaleY = 1`) when `prefers-reduced-motion` is enabled.
   - Automatically dampens or zeroes column offsets on compact mobile viewports (`< 768px`) via `mobileFactor` so stacked cards never collide or jitter.
   - Uses `overflow-x-clip` strictly on individual sections (never `overflow: hidden` on `html`/`body`, preserving `position: sticky` on `Navbar`).
4. **Zero LCP & Admin Regression:** Hero starts at exact natural position (`y = 0`, `opacity = 1`) at `scrollY = 0`. `/admin` remains 100% untouched Neutral Studio Ink.

---

## 2. Section 1: Reusable Motion Primitives

### 2.1 `src/lib/motion.js`
Add `PARALLAX_SPRING`:
```js
export const PARALLAX_SPRING = {
  stiffness: 180,
  damping: 28,
  mass: 0.45
};
```
Provides silky editorial inertia without rubbery bounce.

### 2.2 `src/components/common/ParallaxLayer.jsx`
Export two focused, testable components:

- **`ParallaxLayer({ targetRef, offset = 32, range, scrollOffset = ['start end', 'end start'], scaleRange, smooth = true, mobileFactor = 0.4, className, style, children })`:**
  - Tracks viewport scroll progress via `useScroll({ target: targetRef, offset: scrollOffset })` against a non-sticky `<section>` ref (avoiding scroll-position feedback loops).
  - Detects compact mobile viewports (`(max-width: 767px)`) via a resilient `useIsCompactViewport()` hook (gracefully returns `false` when `window.matchMedia` is unavailable in JSDOM).
  - Computes effective amplitude: `0` when `useReducedMotion()` is `true`; otherwise scaled by `mobileFactor` on compact viewports (`< 768px`).
  - Supports either symmetric `offset` (`[-effectiveOffset, effectiveOffset]`) or explicit asymmetric `range: [startPx, endPx]` (scaled by `mobileFactor` and zeroed under reduced motion, ideal for Hero starting at `0`).
  - Optional `scaleRange: [startScale, endScale]` (locked to `[1, 1]` under reduced motion).
  - Applies `useSpring(rawProgress, PARALLAX_SPRING)` when `smooth && !prefersReducedMotion`, and renders `<m.div style={{ y, ...(scaleRange ? { scale } : {}), ...style }} className={className}>`.

- **`SectionWatermark({ targetRef, label, align = 'right', offset = -52, className })`:**
  - Purely decorative editorial index watermark (`01`, `02`, `03`, `04`, `05`) rendered with `aria-hidden="true"`, `pointer-events-none`, `select-none`.
  - Uses ultra-subtle ink opacity (`text-foreground/[0.035] dark:text-foreground/[0.045]`) and large display typography (`font-display text-[7rem] sm:text-[10rem] lg:text-[13rem] font-bold leading-none tracking-tighter`) drifting gently behind section content inside `overflow-x-clip`.

---

## 3. Section 2: Landing Page Parallax Choreography

1. **Hero (`src/components/sections/HeroSection.jsx`, `#profile`):**
   - Attach `sectionRef` to `<section id="profile" className="... overflow-x-clip">`.
   - Use `scrollOffset={['start start', 'end start']}` so everything rests at `y = 0` at `scrollY = 0` (zero LCP or above-the-fold shift).
   - Left editorial text column: `ParallaxLayer` with `range={[0, 18]}` (`mobileFactor={0.35}`).
   - Right portrait card wrapper: `ParallaxLayer` with `range={[0, -36]}`, `scaleRange={[1, 1.035]}` (`mobileFactor={0.4}`).
   - Seasonal corner bracket (`border-season-accent`): `ParallaxLayer` with `range={[0, -54]}` (`mobileFactor={0.4}`) creating distinct foreground depth.

2. **About (`src/components/sections/AboutSection.jsx`, `#about`):**
   - Attach `sectionRef` to `<section id="about" className="... overflow-x-clip">`.
   - Render `<SectionWatermark targetRef={sectionRef} label="01" align="right" />`.
   - **Inner-Crop Image Parallax:** Wrap `<ResponsivePicture id="about-img" />` inside a `ParallaxLayer` (`offset={22}`, `scaleRange={[1.1, 1.1]}`, `mobileFactor={0.5}`) inside the existing `overflow-hidden rounded-lg` photo container so the portrait glides smoothly within its editorial frame without exposing borders.
   - Right biography column: subtle counter-drift `ParallaxLayer` (`offset={-14}`, `mobileFactor={0}`).

3. **Journey (`src/components/sections/JourneySection.jsx`, `#journey`):**
   - Attach `sectionRef` to `<section id="journey" className="... overflow-x-clip">` and `timelineRef` to the `<ol>` spine container.
   - Render `<SectionWatermark targetRef={sectionRef} label="02" align="right" />`.
   - **Scroll-Driven Timeline Spine:** Overlay a `2px` hairline `<m.span data-testid="journey-scroll-spine" aria-hidden="true" />` (`bg-season-accent origin-top`) aligned along the left border of `<ol>`, driven by `useScroll({ target: timelineRef, offset: ['start 75%', 'end 65%'] })` smoothed with `PARALLAX_SPRING` (`scaleY: 1` immediately under `useReducedMotion()`).

4. **Experience (`src/components/sections/ExperienceSection.jsx`, `#experience`):**
   - Attach `sectionRef` to `<section id="experience" className="... overflow-x-clip">`.
   - Render `<SectionWatermark targetRef={sectionRef} label="03" align="right" />`.
   - Desktop asymmetric column depth: wrap `Programming Languages` card in `ParallaxLayer` (`offset={-16}`, `mobileFactor={0}`) and `Frameworks & Tools` card in `ParallaxLayer` (`offset={16}`, `mobileFactor={0}`).

5. **Projects (`src/components/sections/ProjectsSection.jsx`, `#projects`):**
   - Attach `sectionRef` to `<section id="projects" className="... overflow-x-clip">`.
   - Render `<SectionWatermark targetRef={sectionRef} label="04" align="right" />`.
   - Subtle header drift (`offset={-12}`, `mobileFactor={0}`). Project cards inside `<AnimatePresence mode="popLayout">` remain untouched to avoid any transform conflict during category/search reflow.

6. **Contact (`src/components/sections/ContactSection.jsx`, `#contact`):**
   - Attach `sectionRef` to `<section id="contact" className="... overflow-x-clip">`.
   - Render `<SectionWatermark targetRef={sectionRef} label="05" align="right" />`.
   - Wrap the right-column Direct Contact Form card in `ParallaxLayer` (`offset={-18}`, `mobileFactor={0}`) for subtle depth against the left email/social column.

7. **Seasonal Particles (`src/features/season/SeasonalCanvas.jsx`):**
   - Add a passive `window` `scroll` listener inside the active canvas effect (only mounted when `particlesEnabled && !prefersReducedMotion`).
   - Compute scroll delta (`deltaY = clamp(nextScrollY - lastScrollY, -80, 80)`) and smoothly decay a `scrollImpulse` ref inside `requestAnimationFrame`, shifting each particle vertically by `-scrollImpulse * (0.12 + particleDepth * 0.24)` with clean viewport wrap-around. Zero React re-renders.

---

## 4. Testing, Verification & Antislop Delivery Gate

### 4.1 Automated Tests
- **New `test/components/common/ParallaxLayer.test.jsx`:**
  - Renders `ParallaxLayer` and `SectionWatermark` cleanly inside `<MotionConfig reducedMotion="always"><LazyMotion features={domMax} strict>`.
  - Verifies `SectionWatermark` carries `aria-hidden="true"` and `pointer-events-none`.
  - Verifies graceful fallback when `window.matchMedia` is absent or matches compact mobile viewport.
- **Update `test/components/sections/JourneySection.test.jsx`:**
  - Verify `data-testid="journey-scroll-spine"` renders cleanly on the timeline.
- **Update `test/components/sections/ContactSection.test.jsx` / `ExperienceSection.test.jsx`:**
  - Wrap tests in `<MotionConfig reducedMotion="always"><LazyMotion features={domMax} strict>` where `m.*` is rendered so `strict` mode is verified end-to-end.

### 4.2 Quality Gates
1. Full `npx vitest run` (all 33+ test suites green, zero errors).
2. Full `npm run build` (exit 0, zero Vite `> 500 KB` warnings, `AdminPage` & `firebase-auth` still excluded from `/` preloads).
3. Whole-Branch Senior Code Review via `research` subagent; resolve all Critical/Important findings via TDD.
4. Antislop Mode 2 (`after`) Audit saved to `anti-slop/audit-006-2026-11-28.md`, await user selection of findings, apply chosen fixes, re-verify, and deliver the 4-block Delivery Gate PASS/FAIL report.
