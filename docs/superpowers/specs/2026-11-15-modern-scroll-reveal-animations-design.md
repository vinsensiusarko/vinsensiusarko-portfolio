# Sub-Project 3: Modern Scroll-Reveal Animations & Micro-Interactions Specification

## 1. Overview & Objectives

Provide a modern, premium 2026-era portfolio aesthetic using lightweight, hardware-accelerated CSS animations and a zero-dependency React Intersection Observer hook (`useScrollReveal`).

Key outcomes:
1. **Viewport Scroll-Reveal Animation Engine**: As sections, cards, and headings scroll into the viewport, they smoothly glide up and fade in with an organic cubic-bezier curve (`cubic-bezier(0.16, 1, 0.3, 1)`).
2. **Staggered Child Reveal**: Multi-item grids (Project Cards, Skills badges, Timeline items) reveal sequentially with cascading delays (`calc(var(--stagger-idx, 0) * 75ms)`).
3. **Interactive Mouse Spotlight / Glow & Lift**: Subtle cursor-tracking spotlight and 3D card elevation on project and experience cards.
4. **Hero Micro-Interactions**: Live pulsing availability indicator badge ("Open for opportunities / hire") and floating badge physics.
5. **Accessibility & Performance First**: Strictly respects `@media (prefers-reduced-motion: reduce)`, zero layout thrashing, uses `transform` and `opacity` exclusively for 60-120fps smoothness.

---

## 2. Architecture & Data Flow

```
[Window / Scroll Container]
        │
        ▼
[useScrollReveal Hook] ──(IntersectionObserver, threshold: 0.12, unobserve after reveal)
        │
        ├── Adds '.revealed' to observed elements
        │
        ▼
[CSS GPU-Accelerated Animations]
  ├─ .reveal-fade-up
  ├─ .reveal-stagger-item (calc(var(--stagger-idx) * 75ms))
  └─ prefers-reduced-motion override (instant display)
```

---

## 3. Component Details & Technical Specifications

### 3.1 Hook: `useScrollReveal(selector, deps)`
Located at: `src/hooks/useScrollReveal.js`
- Observes all elements matching `selector` (default: `'.reveal-on-scroll'`).
- Configuration:
  - `threshold: 0.12`
  - `rootMargin: '0px 0px -40px 0px'`
- When `entry.isIntersecting`:
  - Adds class `revealed`.
  - Calls `observer.unobserve(entry.target)` so animation triggers only once without overhead.
- Clean cleanup on unmount.

### 3.2 CSS Animation Tokens & Classes
Located at: `src/styles/global.css`
- `.reveal-on-scroll`: `opacity: 0; transform: translateY(28px); transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1); will-change: opacity, transform;`
- `.reveal-on-scroll.revealed`: `opacity: 1; transform: translate3d(0, 0, 0); will-change: auto;`
- `.reveal-stagger`: Container assigning transition delays to children via CSS custom property `--stagger-idx`.
- `.availability-badge`: Live indicator with a glowing pulsing green dot:
  - `@keyframes pulse-dot { 0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); } 50% { transform: scale(1.15); opacity: 0.85; box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); } }`
- `.project-card-interactive`: Card elevation with mouse tracking border glow.

---

## 4. Verification Criteria
1. Full test coverage in `test/hooks/useScrollReveal.test.jsx`.
2. Responsive and smooth across desktop, tablet, and mobile browsers.
3. Completely disabled when `prefers-reduced-motion: reduce` is active.
4. Zero performance regressions on 4-season canvas animation.
