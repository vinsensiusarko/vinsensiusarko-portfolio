# Sub-Project 3: Modern Scroll-Reveal Animations & Micro-Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Sub-Project 3 to bring modern, 2026-era scroll-reveal animations, staggered card entrances, interactive card spotlight glow effects, and hero micro-interactions with zero third-party animation libraries.

**Architecture:** A lightweight React hook `useScrollReveal` attaches an `IntersectionObserver` to `.reveal-on-scroll` elements. When an element scrolls into view, the `.revealed` class is applied with hardware-accelerated CSS transforms and transitions. Staggered containers use CSS custom properties (`--stagger-idx`) for cascading reveals.

**Tech Stack:** React 19, HTML5 Intersection Observer API, CSS3 Transitions & Transforms, Vitest 3, JSDOM.

**Spec:** `docs/superpowers/specs/2026-11-15-modern-scroll-reveal-animations-design.md`

## Review Focus

1. **Observer cleanup & memory leak prevention**: The observer must disconnect on component unmount and unobserve elements after they are revealed.
2. **Accessibility compliance**: If `prefers-reduced-motion: reduce` is active, elements must be immediately visible without delay or transform animations.
3. **Canvas Season Engine coexistence**: Scroll animations must not drop framerates or conflict with the 4-season canvas particles.
4. **Dynamic content reactivity**: When projects change (e.g. search filter or category toggle), newly rendered items must re-trigger observation properly.

---

## Tasks

### Task 1: Core `useScrollReveal` Hook & Unit Tests

**Files:**
- Create: `src/hooks/useScrollReveal.js`
- Create: `test/hooks/useScrollReveal.test.jsx`

- [x] **Step 1: Write failing test for `useScrollReveal`**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Implement `useScrollReveal` hook**
- [x] **Step 4: Run test to verify it passes**
- [x] **Step 5: Commit**

---

### Task 2: CSS Scroll-Reveal Animation Engine & Micro-Interactions

**Files:**
- Modify: `src/styles/global.css`

- [x] **Step 1: Implement CSS classes and keyframes in `global.css`**
- [x] **Step 2: Verify `prefers-reduced-motion` overrides**
- [x] **Step 3: Commit**

---

### Task 3: Section Integration (Hero, Projects, Experience, About)

**Files:**
- Modify: `src/pages/public/HomePage.jsx`
- Modify: `src/components/sections/HeroSection.jsx`
- Modify: `src/components/sections/ProjectsSection.jsx`
- Create: `test/features/animations/ScrollRevealIntegration.test.jsx`

- [x] **Step 1: Write integration test for scroll reveal attributes**
- [x] **Step 2: Run test to verify it fails**
- [x] **Step 3: Integrate `useScrollReveal` and classes into components**
- [x] **Step 4: Run test to verify it passes**
- [x] **Step 5: Commit**

---

### Task 4: Comprehensive Test Suite, Build Verification & Review

**Files:**
- Test: All files in `test/`
- Build: `dist/`

- [x] **Step 1: Run full unit test suite (`npx vitest run`)**
- [x] **Step 2: Run production build (`npm run build`)**
- [x] **Step 3: Senior Code Reviewer Subagent verification**
- [x] **Step 4: Commit**
