# Foundation (Tailwind v4 + shadcn/ui) & Landing Page Rework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install Tailwind CSS v4 and shadcn/ui (Radix + JSX + Tabler icons), establish the Editorial Craft Design System (`DESIGN.md`), and rework all public-facing pages (`HomePage`, `PrivacyPolicyPage`, `NotFoundPage`, `Navbar`, `Footer`, `CommandPalette`, `ProjectModal`, `FloatingActions`) while keeping `/admin` intact and all tests passing, followed by an antislop `after` audit.

**Architecture:** Tailwind CSS v4 (`@tailwindcss/vite`) drives a single semantic stylesheet (`src/styles/index.css`) synced to existing `html[data-theme="dark"]` and `html[data-season="..."]` attributes via `@custom-variant dark` and `@theme inline`. All public UI controls compose shadcn/ui Radix primitives (`src/components/ui/*.jsx`) with `@tabler/icons-react`, while `admin.css` remains cleanly scoped inside `.admin-shell` until Spec 2.

**Tech Stack:** React 19, Vite 6, React Router 7, Firebase 11, Tailwind CSS v4, `@tailwindcss/vite`, shadcn/ui (Radix + JSX `"tsx": false`), `@tabler/icons-react`, `sonner`, `cmdk`, Vitest 3, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-23-landing-page-shadcn-rework-design.md`

## Global Constraints

- Codebase stays pure JavaScript (`.jsx` / `.js`), `components.json` uses `"tsx": false`, path alias `@/* -> ./src/*`.
- Visual direction is **Editorial Craft / Modern Studio** (`ENERGY 2 / RHYTHM 3 / MOTION 2`), documented in `DESIGN.md`.
- Fonts: `Bricolage Grotesque` (display), `Plus Jakarta Sans` (body/UI), `JetBrains Mono` (compact metadata only).
- Colors: Warm Alabaster light (`#FAF9F6`), Deep Charcoal Ink dark (`#0E1012`), 4 seasonal accent palettes (`spring`, `summer`, `autumn`, `winter`) meeting WCAG AA (>= 4.5:1 text contrast).
- Zero em dashes (`—`) in agent-written UI copy; no fake stats, no fake testimonials, no eyebrow pill duplicating H1, no redundant "Details" button on project cards.
- Glassmorphism capped to 1 element (scrolled sticky `Navbar`); radius hierarchy intentional (not pill-everything).
- All existing hooks/contexts (`usePortfolioData`, `usePrivacyPolicy`, `useScrollReveal`, `ThemeContext`, `SeasonContext`, `SoundContext`, `ConfirmContext`) keep their public APIs unchanged.
- `/admin` and all 8 Admin tabs must remain completely unbroken during Spec 1.
- Antislop mode for this session is **`after`**: complete implementation, tests, and build first, then generate `anti-slop/audit-001-2026-11-23.md` with numbered findings (`HIGH`/`MEDIUM`/`LOW`) for user approval before executing approved fixes and emitting the Delivery Gate report.

## Review Focus

1. **Keyboard & Focus Safety inside Overlays:** Pressing `ArrowLeft`/`ArrowRight` inside an `<input>` while `ProjectModal` is open must not change gallery slides, and `Escape` must cleanly dismiss `ProjectModal`, `CommandPalette`, and mobile `Sheet`. *(Pinned in Task 2 & Task 4)*
2. **Standalone Component Isolation:** Unit tests rendering `HeroSection`, `FloatingActions`, or `ContactSection` directly (without `App.jsx` wrappers) must not throw missing-`TooltipProvider` errors. *(Pinned in Task 3 & Task 5)*
3. **Mobile Sheet Navigation & Tap Targets:** Opening the mobile hamburger button renders the shadcn `Sheet` drawer containing all nav destinations (including `/privacy-policy`) with >= 44px tap targets and closes when a link is clicked. *(Pinned in Task 2)*
4. **Honest Empty States Across Data Views:** Empty skill categories in `ExperienceSection` display a clear empty state message, and zero-match project filtering in `ProjectsSection` shows `Reset Filters` restoring the initial 6-item cap. *(Pinned in Task 3 & Task 4)*
5. **Admin Panel Coexistence Safety:** Replacing `global.css`/`mediaqueries.css`/`variables.css` with Tailwind v4 `src/styles/index.css` in `src/main.jsx` must not break `/admin` layout or any Admin Vitest tests. *(Pinned in Task 1 & Task 6)*

---

## File Structure Map

- **Create:**
  - `DESIGN.md` (Editorial Craft design system direction & tokens)
  - `jsconfig.json` (`@/*` alias for Vite, IDE, and shadcn CLI)
  - `components.json` (shadcn/ui Radix + JSX + Tabler config)
  - `src/lib/utils.js` (`cn()` class merge helper)
  - `src/styles/index.css` (Tailwind v4 + `@custom-variant dark` + `@theme inline` + seasonal/theme CSS variables + scroll-reveal rules)
  - `src/components/ui/*.jsx` (shadcn primitives: `button`, `badge`, `card`, `dialog`, `command`, `popover`, `sheet`, `input`, `separator`, `tooltip`, `switch`, `sonner`, `alert`, `skeleton`)
  - `test/components/sections/ContactSection.test.jsx` (dedicated unit tests for ContactSection email copy & social channels)
  - `anti-slop/audit-001-2026-11-23.md` (antislop Mode 2 `after` audit report in Task 6)
- **Modify:**
  - `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `test/setup.js`
  - `src/features/season/SeasonalCanvas.jsx`, `src/features/season/SeasonSwitcher.jsx`
  - `src/components/common/CommandPalette.jsx`
  - `src/components/layout/Navbar.jsx`, `src/components/layout/Footer.jsx`, `src/components/layout/FloatingActions.jsx`
  - `src/components/sections/HeroSection.jsx`, `src/components/sections/AboutSection.jsx`, `src/components/sections/ExperienceSection.jsx`, `src/components/sections/ProjectsSection.jsx`, `src/components/sections/ProjectModal.jsx`, `src/components/sections/ContactSection.jsx`
  - `src/pages/PrivacyPolicyPage.jsx`, `src/pages/NotFoundPage.jsx`
  - `test/components/layout/Layout.test.jsx`, `test/components/sections/ExperienceSection.test.jsx`

---

### Task 1: Foundation Setup (Tailwind v4, shadcn/ui Primitives, `DESIGN.md`, Fonts, `index.css` & Polyfills)

**Files:**
- Create: `DESIGN.md`
- Create: `jsconfig.json`
- Create: `components.json`
- Create: `src/lib/utils.js`
- Create: `src/styles/index.css`
- Create: `src/components/ui/{button,badge,card,dialog,command,popover,sheet,input,separator,tooltip,switch,sonner,alert,skeleton}.jsx`
- Modify: `package.json`
- Modify: `vite.config.js`
- Modify: `index.html`
- Modify: `src/main.jsx`
- Modify: `test/setup.js`

**Interfaces:**
- Consumes: Existing `ThemeContext` (`html[data-theme="dark"]`) and `SeasonContext` (`html[data-season="..."]`).
- Produces:
  - `@/lib/utils` exporting `cn(...inputs)`
  - `@/components/ui/*` standard shadcn/ui JSX primitives
  - `src/styles/index.css` with Tailwind v4 tokens (`bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `border-border`, `text-season-accent`, `bg-season-surface`, `text-season-foreground`, `border-season-border`, `font-display`, `font-sans`, `font-mono`)

- [ ] **Step 1: Install Tailwind CSS v4, shadcn utilities, and Tabler icons**

Run:
```powershell
npm install tailwindcss @tailwindcss/vite clsx tailwind-merge class-variance-authority @tabler/icons-react sonner cmdk
```
Expected: Packages install cleanly into `package.json` without peer conflicts.

- [ ] **Step 2: Configure `vite.config.js` and create `jsconfig.json` + `src/lib/utils.js`**

Update `vite.config.js`:
```javascript
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth']
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.js',
    css: true
  }
});
```

Create `jsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "test"]
}
```

Create `src/lib/utils.js`:
```javascript
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Create `DESIGN.md` at repo root**

Write `DESIGN.md` with the Editorial Craft brand direction, dials (`ENERGY 2 / RHYTHM 3 / MOTION 2`), typography (`Bricolage Grotesque`, `Plus Jakarta Sans`, `JetBrains Mono`), Light/Dark + 4 Seasonal accent palette (hex + WCAG AA notes), radius/elevation/glass dose rules, and icon policy (`@tabler/icons-react` + `SkillIcon`).

- [ ] **Step 4: Create `src/styles/index.css` and update `index.html` Google Fonts**

In `index.html`, replace the Poppins Google Fonts link with:
```html
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;600;700&family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
    />
```

Create `src/styles/index.css`:
```css
@import "tailwindcss";

@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

:root {
  --radius: 0.625rem;
  --background: #faf9f6;
  --foreground: #141413;
  --card: #ffffff;
  --card-foreground: #141413;
  --popover: #ffffff;
  --popover-foreground: #141413;
  --primary: #141413;
  --primary-foreground: #faf9f6;
  --secondary: #f2f0eb;
  --secondary-foreground: #141413;
  --muted: #f2f0eb;
  --muted-foreground: #57534e;
  --accent: #f2f0eb;
  --accent-foreground: #141413;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #e5e2dc;
  --input: #e5e2dc;
  --ring: #141413;
}

html[data-theme="dark"] {
  --background: #0e1012;
  --foreground: #f4f3ee;
  --card: #16191d;
  --card-foreground: #f4f3ee;
  --popover: #16191d;
  --popover-foreground: #f4f3ee;
  --primary: #f4f3ee;
  --primary-foreground: #0e1012;
  --secondary: #1e2228;
  --secondary-foreground: #f4f3ee;
  --muted: #1e2228;
  --muted-foreground: #9ca3af;
  --accent: #1e2228;
  --accent-foreground: #f4f3ee;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #272c34;
  --input: #272c34;
  --ring: #f4f3ee;
}

/* Seasonal Accent Tokens (WCAG AA checked) */
:root,
html[data-season="spring"] {
  --season-accent: #be185d;
  --season-surface: #fdf2f8;
  --season-foreground: #9d174d;
  --season-border: rgba(190, 24, 93, 0.28);
}

html[data-theme="dark"][data-season="spring"] {
  --season-accent: #f472b6;
  --season-surface: rgba(131, 24, 67, 0.35);
  --season-foreground: #fbcfe8;
  --season-border: rgba(244, 114, 182, 0.35);
}

html[data-season="summer"] {
  --season-accent: #b45309;
  --season-surface: #fffbeb;
  --season-foreground: #92400e;
  --season-border: rgba(180, 83, 9, 0.28);
}

html[data-theme="dark"][data-season="summer"] {
  --season-accent: #fbbf24;
  --season-surface: rgba(120, 53, 15, 0.35);
  --season-foreground: #fde68a;
  --season-border: rgba(251, 191, 36, 0.35);
}

html[data-season="autumn"] {
  --season-accent: #c2410c;
  --season-surface: #fff7ed;
  --season-foreground: #9a3412;
  --season-border: rgba(194, 65, 12, 0.28);
}

html[data-theme="dark"][data-season="autumn"] {
  --season-accent: #fb923c;
  --season-surface: rgba(124, 45, 18, 0.35);
  --season-foreground: #fed7aa;
  --season-border: rgba(251, 146, 60, 0.35);
}

html[data-season="winter"] {
  --season-accent: #0369a1;
  --season-surface: #f0f9ff;
  --season-foreground: #075985;
  --season-border: rgba(3, 105, 161, 0.28);
}

html[data-theme="dark"][data-season="winter"] {
  --season-accent: #38bdf8;
  --season-surface: rgba(12, 74, 110, 0.38);
  --season-foreground: #bae6fd;
  --season-border: rgba(56, 189, 248, 0.35);
}

@theme inline {
  --font-sans: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
  --font-display: "Bricolage Grotesque", "Plus Jakarta Sans", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --color-season-accent: var(--season-accent);
  --color-season-surface: var(--season-surface);
  --color-season-foreground: var(--season-foreground);
  --color-season-border: var(--season-border);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

@layer base {
  html {
    scroll-behavior: smooth;
    font-family: var(--font-sans);
    background-color: var(--background);
    color: var(--foreground);
  }

  body {
    background-color: var(--background);
    color: var(--foreground);
    min-height: 100vh;
    overflow-x: clip;
    -webkit-font-smoothing: antialiased;
  }

  a[href],
  button:not(:disabled),
  summary,
  select:not(:disabled),
  label[for],
  [role="button"]:not([aria-disabled="true"]),
  [role="tab"]:not([aria-disabled="true"]),
  [role="switch"]:not([aria-disabled="true"]) {
    cursor: pointer;
  }

  button:disabled,
  select:disabled,
  input:disabled {
    cursor: not-allowed;
  }

  :focus-visible {
    outline: 2px solid var(--season-accent);
    outline-offset: 2px;
  }
}

/* BrandLogo dark/light filter parity */
.brand-logo-light .brand-logo-img,
.skill-icon-box .brand-logo-img {
  filter: brightness(0.18);
  transition: filter 0.2s ease;
}

html[data-theme="dark"] .brand-logo-dark .brand-logo-img,
html[data-theme="dark"] .skill-icon-box .brand-logo-img {
  filter: brightness(0) invert(1);
}

/* Scroll reveal animation (respects reduced motion) */
.reveal-on-scroll {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--stagger-idx, 0) * 65ms);
}

.reveal-on-scroll.revealed {
  opacity: 1;
  transform: translateY(0);
}

@keyframes cursor-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.typewriter-cursor {
  display: inline-block;
  margin-left: 2px;
  color: var(--season-accent);
  animation: cursor-blink 1s step-end infinite;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  .reveal-on-scroll {
    opacity: 1;
    transform: none;
    transition: none;
  }
  .typewriter-cursor {
    animation: none;
  }
}
```

- [ ] **Step 5: Create `components.json` and install shadcn/ui primitives via CLI**

Create `components.json`:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": false,
  "tailwind": {
    "config": "",
    "css": "src/styles/index.css",
    "baseColor": "stone",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "tabler",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

Run shadcn CLI to add all required primitives:
```powershell
npx shadcn@latest add button badge card dialog command popover sheet input separator tooltip switch sonner alert skeleton --yes
```
Then inspect every generated file in `src/components/ui/` to verify:
1. No `.tsx` files were generated (all `.jsx`); if any file imports `lucide-react`, swap to `@tabler/icons-react`.
2. `sonner.jsx` reads theme from `ThemeContext` (`useTheme()`) instead of `next-themes` (since this is Vite + React, not Next.js!).

- [ ] **Step 6: Update `src/main.jsx` and add Radix/cmdk JSDOM polyfills to `test/setup.js`**

Update `src/main.jsx`:
```javascript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

In `test/setup.js`, append polyfills for Radix UI & `cmdk` in JSDOM:
```javascript
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof window !== 'undefined' && typeof window.HTMLElement !== 'undefined') {
  if (!window.HTMLElement.prototype.hasPointerCapture) {
    window.HTMLElement.prototype.hasPointerCapture = () => false;
  }
  if (!window.HTMLElement.prototype.setPointerCapture) {
    window.HTMLElement.prototype.setPointerCapture = () => {};
  }
  if (!window.HTMLElement.prototype.releasePointerCapture) {
    window.HTMLElement.prototype.releasePointerCapture = () => {};
  }
}
```

- [ ] **Step 7: Verify build and existing test suite (Review Focus #5: Admin coexistence)**

Run:
```powershell
npx vitest run; npm run build
```
Expected: All 25 test files (93 tests) PASS and `vite build` succeeds cleanly.

- [ ] **Step 8: Commit Task 1**

```powershell
git add DESIGN.md jsconfig.json components.json package.json package-lock.json vite.config.js index.html src/lib/utils.js src/styles/index.css src/main.jsx src/components/ui test/setup.js
git commit -m "feat(ui): set up Tailwind v4, shadcn/ui primitives, and Editorial Craft design system"
```

---

### Task 2: App Shell (`App.jsx`), Refined `SeasonalCanvas`, `SeasonSwitcher` (Popover), `CommandPalette` (Dialog + Command) & `Navbar` (Sticky Glass + Mobile Sheet)

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/features/season/SeasonalCanvas.jsx`
- Modify: `src/features/season/SeasonSwitcher.jsx`
- Modify: `src/components/common/CommandPalette.jsx`
- Modify: `src/components/layout/Navbar.jsx`
- Modify: `test/components/layout/Layout.test.jsx`

**Interfaces:**
- Consumes: `@/components/ui/{button,badge,popover,dialog,command,sheet,separator,tooltip,sonner}`, `@tabler/icons-react`, `ThemeContext`, `SeasonContext`, `SoundContext`, `BrandLogo`.
- Produces:
  - `Navbar({ variant = 'home', siteName = 'Vinsensius Arka' })` with desktop nav + mobile `Sheet` drawer
  - `SeasonSwitcher()` with accessible `Popover` menu (`role="menuitem"` options + `Particle Effects` button)
  - `CommandPalette({ isOpen, onOpen, onClose, customActions = [] })` on shadcn `Dialog` + `Command` with full keyboard clamping

- [ ] **Step 1: Update `test/components/layout/Layout.test.jsx` for mobile `Sheet` drawer (Review Focus #3)**

Update the second test in `test/components/layout/Layout.test.jsx` so it clicks the mobile menu trigger (`Toggle navigation menu`) to open the shadcn `Sheet` drawer and asserts the `Privacy Policy` link is rendered inside the drawer, then closes cleanly on click:
```javascript
  it('renders Privacy Policy link in desktop navigation and opens mobile sheet drawer', () => {
    const { container } = render(
      <ThemeProvider>
        <SeasonProvider>
          <MemoryRouter>
            <Navbar variant="home" siteName="Vinsensius Arka" />
          </MemoryRouter>
        </SeasonProvider>
      </ThemeProvider>
    );

    const desktopPrivacyLink = container.querySelector('.nav-links a[href="/privacy-policy"]');
    expect(desktopPrivacyLink).toBeInTheDocument();

    const menuTrigger = screen.getByRole('button', { name: /Toggle navigation menu/i });
    fireEvent.click(menuTrigger);

    const drawerLinks = screen.getAllByRole('link', { name: /Privacy Policy/i });
    expect(drawerLinks.length).toBeGreaterThanOrEqual(2);
    expect(drawerLinks[drawerLinks.length - 1]).toHaveAttribute('href', '/privacy-policy');
  });
```

- [ ] **Step 2: Mount `<TooltipProvider>` and `<Toaster />` in `src/App.jsx`**

Wrap `<AppRoutes />` with `<TooltipProvider delayDuration={200}>` and render `<Toaster position="bottom-right" closeButton />` inside `ThemeProvider` so Sonner syncs automatically with `ThemeContext`.

- [ ] **Step 3: Refine `src/features/season/SeasonalCanvas.jsx` for `prefers-reduced-motion` and calmer opacity**

Add `window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches` early return inside `useEffect` and scale canvas element opacity to `0.55` so particles enhance atmosphere without reducing WCAG AA text contrast.

- [ ] **Step 4: Rework `src/features/season/SeasonSwitcher.jsx` using shadcn `Popover` + `Button` + `Badge` + `Separator`**

Implement `SeasonSwitcher` with:
- `<Popover open={open} onOpenChange={setOpen}>`
- `<PopoverTrigger asChild>` wrapping `<Button variant="outline" size="sm" aria-label={`Select season (current: ${seasonMeta.labelEn})`}>` with seasonal border/surface accents and Tabler `IconChevronDown`.
- `<PopoverContent align="end" className="w-72 p-3">`:
  - Header ("Season Theme" + `Badge` "Auto" when `isAutoSeason`)
  - 2x2 grid of season buttons (`role="menuitem"`, preserving `SeasonSwitcher.test.jsx` selectors & active check indicator)
  - `<Separator className="my-2.5" />`
  - Particle Effects toggle button (`Particle Effects` + ON/OFF `Badge`)
  - Conditional `Auto by Calendar` reset button (`IconRotateClockwise`)

- [ ] **Step 5: Rework `src/components/common/CommandPalette.jsx` using shadcn `Dialog` + styled keyboard-accessible command list**

Implement `CommandPalette` using `<Dialog open={isOpen} onOpenChange={(next) => (!next ? handleClose() : onOpen?.())}>` + `<DialogContent aria-label="Command Palette">` + `<DialogTitle className="sr-only">Command Palette</DialogTitle>` + `<DialogDescription className="sr-only">Quick navigation and preferences</DialogDescription>`.
Preserve every contract verified by `CommandPalette.test.jsx`:
- Global `Ctrl+K` / `Cmd+K` shortcut
- Body `overflow = 'hidden'` lock while open, restored on close/unmount
- Placeholder `"Type a command or search sections (Esc to exit)..."`
- Clamped `ArrowUp`/`ArrowDown` (never wraps), `Enter` executes selected action, `Escape` closes
- Grouped display with category badges, Tabler icons, and honest empty state showing unmatched query.

- [ ] **Step 6: Rework `src/components/layout/Navbar.jsx` with sticky frosted glass bar and mobile shadcn `Sheet`**

Implement single `<header>` (`sticky top-0 z-40 transition-colors duration-200`, applying `bg-background/85 backdrop-blur-md border-b border-border` only when `scrolled` is true):
- Left: `<BrandLogo size={26} />` + site name (`font-display font-semibold tracking-tight`).
- Desktop nav (`hidden md:flex`): `.nav-links` list with real anchors (`#about`, `#experience`, `#projects`, `#contact`) and `<Link to="/privacy-policy">`; active section underlined with `bg-season-accent`.
- Controls: Command Palette button (`Ctrl K` in `font-mono`), `<SeasonSwitcher />`, Theme toggle (`IconSun`/`IconMoon`), and mobile `<Sheet>` trigger (`md:hidden`, `aria-label="Toggle navigation menu"`, `min-h-11 min-w-11`).
- `<SheetContent side="right">`: `<SheetHeader><SheetTitle>Navigation</SheetTitle></SheetHeader>`, vertical list of links (`min-h-11` tap targets) closing sheet on click.

- [ ] **Step 7: Run targeted tests for Task 2**

Run:
```powershell
npx vitest run test/components/layout/Layout.test.jsx test/features/season/SeasonSwitcher.test.jsx test/components/common/CommandPalette.test.jsx test/App.test.jsx
```
Expected: All 4 test files PASS.

- [ ] **Step 8: Commit Task 2**

```powershell
git add src/App.jsx src/features/season/SeasonalCanvas.jsx src/features/season/SeasonSwitcher.jsx src/components/common/CommandPalette.jsx src/components/layout/Navbar.jsx test/components/layout/Layout.test.jsx
git commit -m "feat(ui): rework App shell, Navbar, SeasonSwitcher, and CommandPalette with shadcn/ui"
```

---

### Task 3: Hero (`HeroSection`), About (`AboutSection`) & Experience/Skills (`ExperienceSection`)

**Files:**
- Modify: `src/components/sections/HeroSection.jsx`
- Modify: `src/components/sections/AboutSection.jsx`
- Modify: `src/components/sections/ExperienceSection.jsx`
- Modify: `test/components/sections/ExperienceSection.test.jsx`

**Interfaces:**
- Consumes: `@/components/ui/{button,badge,card,separator,tooltip}`, `@tabler/icons-react`, `SkillIcon`, `SeasonContext`, `trackCvDownload`.
- Produces:
  - `HeroSection({ siteSettings, contactSettings })` (renders cleanly standalone even without outer `TooltipProvider`)
  - `AboutSection({ siteSettings })`
  - `ExperienceSection({ skills })` (stable keys + empty state per category)

- [ ] **Step 1: Add empty-category test to `test/components/sections/ExperienceSection.test.jsx` (Review Focus #4)**

Append test:
```javascript
  it('displays honest empty states when a skill category has no items', () => {
    render(
      <ExperienceSection
        skills={[
          { id: 'html5', name: 'HTML5', category: 'language', level: 'Experienced', iconClass: 'fa-brands fa-html5' }
        ]}
      />
    );
    expect(screen.getByText('HTML5')).toBeInTheDocument();
    expect(screen.getByText(/No frameworks or tools listed yet/i)).toBeInTheDocument();
  });
```

- [ ] **Step 2: Run test to confirm new assertion fails before rework**

Run: `npx vitest run test/components/sections/ExperienceSection.test.jsx`
Expected: FAIL on the new empty-category assertion.

- [ ] **Step 3: Rework `src/components/sections/HeroSection.jsx` (Asymmetric 7/5 Editorial Split, Review Focus #2)**

Implement `HeroSection`:
- Wrap internal tooltip controls in `<TooltipProvider delayDuration={200}>` so standalone renders in tests never fail.
- `<section id="profile" className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 pb-20 lg:pt-20 lg:pb-28">`.
- Asymmetric 12-col grid (`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center`):
  - Left (`lg:col-span-7 flex flex-col gap-5`):
    - Quiet top metadata line: `<span className="size-2 rounded-full bg-season-accent" aria-hidden="true" />` + `seasonMeta.labelEn` + greeting (`siteSettings.heroGreeting || "Hello, I'm"`). (No glowing eyebrow pill duplicating H1, no availability status badge).
    - `<h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.08]">{siteSettings.name || 'Vinsensius Arka'}</h1>`
    - Typewriter role line (`text-xl sm:text-2xl font-medium text-muted-foreground min-h-[2rem]`) preserving the exact bug-free typewriter `useEffect` and `<span className="typewriter-cursor" aria-hidden="true">|</span>`.
    - Action buttons (`flex flex-wrap items-center gap-3 pt-2`):
      - Primary `<Button asChild size="lg">` for `Download CV` (`onClick={() => trackCvDownload()}`, `IconDownload`)
      - Secondary `<Button asChild variant="outline" size="lg">` for `Contact Info` (`href="#contact"`, `IconSend`)
    - Social icon bar (`LinkedIn`, `GitHub`, `Instagram`, `Email`) as `<Tooltip>` + `<Button asChild variant="ghost" size="icon" className="min-h-11 min-w-11">` with Font Awesome / Tabler brand icons and `aria-label`.
  - Right (`lg:col-span-5 flex justify-center lg:justify-end`):
    - Architectural portrait frame (`relative w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[380px] rounded-2xl border border-border bg-card p-2.5 shadow-sm`) with subtle bottom-right seasonal accent hairline corner and `<img id="hero-img" width="380" height="380" fetchPriority="high" decoding="async" className="aspect-square w-full rounded-xl object-cover" ... />`.

- [ ] **Step 4: Rework `src/components/sections/AboutSection.jsx` (Left-Anchored Editorial Narrative)**

Implement `AboutSection`:
- `<section id="about" className="reveal-on-scroll relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">`.
- Left-aligned header: quiet section label (`text-xs font-mono uppercase tracking-wider text-season-foreground`) `"About"` + `<h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-1">About Me</h2>`.
- 12-col asymmetric grid (`mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start`):
  - Left (`lg:col-span-5`): Framed portrait (`aspect-[4/5] w-full max-w-sm rounded-xl object-cover border border-border`, `loading="lazy"`, `width="380" height="475"`, `onError` fallback).
  - Right (`lg:col-span-7 flex flex-col gap-6`):
    - Narrative bio (`text-base sm:text-lg leading-relaxed text-muted-foreground max-w-prose`).
    - `<Separator />`
    - 2 horizontal editorial metadata blocks (`grid grid-cols-1 sm:grid-cols-2 gap-6`):
      - `Experience`: `IconBriefcase` + `<h3>Experience</h3>` + `siteSettings.expYears` / `siteSettings.expSub`.
      - `Education`: `IconSchool` + `<h3>Education</h3>` + `siteSettings.eduDegree` / `siteSettings.eduMajor`.

- [ ] **Step 5: Rework `src/components/sections/ExperienceSection.jsx` (Tonal Structured Index)**

Implement `ExperienceSection`:
- Tonal full-width band: `<section id="experience" className="reveal-on-scroll relative z-10 border-y border-border bg-muted/40 py-20 lg:py-24">`.
- Inner container `mx-auto max-w-6xl px-4 sm:px-6 lg:px-8`.
- Left-aligned header: `"Technical Stack"` + `<h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-1">Experience &amp; Skills</h2>`.
- 2-column grid (`mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6`):
  - `<Card>` for `Programming Languages` (`CardHeader` with `IconCode` + `CardTitle`, `CardContent` with `grid grid-cols-1 sm:grid-cols-2 gap-3`).
  - `<Card>` for `Frameworks & Tools` (`CardHeader` with `IconStack2` + `CardTitle`, `CardContent` with `grid grid-cols-1 sm:grid-cols-2 gap-3`).
- Each skill card preserves exact class `.skill-item` and stable key `const itemKey = (skill.name || skill.id || '').toLowerCase().trim();`:
  - `.skill-icon-box` (`size-10 shrink-0 rounded-lg border border-border bg-muted/70 flex items-center justify-center text-foreground`) rendering `<SkillIcon skill={skill} size="1.25rem" />`
  - Skill name (`font-medium text-sm text-foreground truncate`)
  - `<Badge variant={isExperienced ? 'secondary' : 'outline'}>` with clean semantic styling (preserving `experienced` / `intermediate` class tokens for test compatibility).
- Honest empty states if `languages.length === 0` ("No programming languages listed yet.") or `tools.length === 0` ("No frameworks or tools listed yet.").

- [ ] **Step 6: Run tests for Task 3**

Run:
```powershell
npx vitest run test/components/sections/ExperienceSection.test.jsx test/features/animations/ScrollRevealIntegration.test.jsx test/App.test.jsx
```
Expected: All 3 test files PASS.

- [ ] **Step 7: Commit Task 3**

```powershell
git add src/components/sections/HeroSection.jsx src/components/sections/AboutSection.jsx src/components/sections/ExperienceSection.jsx test/components/sections/ExperienceSection.test.jsx
git commit -m "feat(ui): rework Hero, About, and Experience sections with Editorial Craft layout"
```

---

### Task 4: Projects Showcase (`ProjectsSection`) & Gallery Modal (`ProjectModal`)

**Files:**
- Modify: `src/components/sections/ProjectsSection.jsx`
- Modify: `src/components/sections/ProjectModal.jsx`

**Interfaces:**
- Consumes: `@/components/ui/{card,button,badge,input,dialog,separator}`, `@tabler/icons-react`, `formatRichDescription`, `resolveProjectImage`, `useScrollReveal`, `trackProjectView`.
- Produces:
  - `ProjectsSection({ projects })` (filter tabs, search input + clear, 6-item cap, Show More/Less smooth scroll, no Details button)
  - `ProjectModal({ project, onClose })` (shadcn `Dialog` with gallery prev/next, keyboard nav ignoring inputs, thumbnail strip)

- [ ] **Step 1: Rework `src/components/sections/ProjectsSection.jsx` with shadcn `Card`, `Input`, `Badge`, `Button`**

Implement `ProjectsSection`:
- `<section id="projects" className="reveal-on-scroll relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">`.
- Header + controls row:
  - Left-aligned header: `"Selected Work"` + `<h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mt-1">Projects</h2>`.
  - Toolbar (`mt-8 flex flex-col gap-4`):
    - Search bar using shadcn `<Input id="project-search-input" ... />` with leading `IconSearch` and conditional clear button (`aria-label="Clear search"`, `IconX`).
    - Category filter bar (`role="tablist"`, `aria-label="Filter projects by category"`, `flex flex-wrap gap-2`): each button has `role="tab"`, `aria-selected={isActive}`, `data-filter={chip.value}`, `className="filter-chip ..."`, styled cleanly with active high-contrast `--primary` or seasonal accent border (`min-h-10`).
- Empty state (`#projects-empty-state`): Clean bordered container (`rounded-xl border border-dashed border-border bg-card p-10 text-center flex flex-col items-center gap-3`) with `IconFolderOff`, `"No matching projects found"`, helpful guidance text, and `<Button variant="outline" id="reset-filter-btn" onClick={resetFilters}>Reset Filters</Button>`.
- Project grid (`id="projects-grid"`, `className="projects-grid reveal-stagger mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"`):
  - Each item is `<article className="project-card reveal-on-scroll group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-foreground/25 hover:shadow-md cursor-pointer" style={{ '--stagger-idx': index % 6 }} ...>`
  - Media container (`relative aspect-[16/10] w-full overflow-hidden bg-muted border-b border-border`): blurred backdrop + `object-contain` `<img>` (`loading="lazy"`, `onError` fallback) + top-left `<Badge className="absolute top-3 left-3 ...">{proj.category || 'Application'}</Badge>`.
  - Body (`flex flex-1 flex-col gap-3 p-5`):
    - `<h3 className="font-display text-lg font-semibold leading-snug text-foreground">{proj.title}</h3>`
    - Formatted description (`text-sm text-muted-foreground line-clamp-3`)
    - Tech stack badges (`flex flex-wrap gap-1.5 mt-auto pt-1`): up to 4 `<Badge variant="secondary">` + `+{techStack.length - 4}`
    - Footer actions (`.project-btn-container`, `flex flex-wrap items-center gap-2 pt-3 border-t border-border`): `GitHub` (`<Button asChild variant="outline" size="sm">`), `Live Demo`/`Play Store` (`<Button asChild size="sm">`), or `Coming Soon` (`<Badge variant="outline">`). Clicking any external link stops propagation. No "Details" button.
- Pagination toggle: When `filteredProjects.length > INITIAL_LIMIT`, render centered `<Button variant="outline" size="lg" aria-expanded={isExpanded} aria-controls="projects-grid">` toggling `Show More Projects (N more)` / `Show Less` (preserving smooth scroll back to `#projects` on collapse).

- [ ] **Step 2: Rework `src/components/sections/ProjectModal.jsx` with shadcn `Dialog` (Review Focus #1)**

Implement `ProjectModal`:
- Render `<Dialog open={Boolean(project)} onOpenChange={(open) => { if (!open) onClose(); }}>`
- `<DialogContent id="project-detail-modal" className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">`:
  - Media stage (`relative aspect-video w-full overflow-hidden bg-muted border-b border-border`): blurred backdrop + `object-contain` `<img>` + category `<Badge>` + when `hasGallery`:
    - Mono counter badge (`1 / 3`)
    - `Previous image` (`aria-label="Previous image"`) & `Next image` (`aria-label="Next image"`) `<Button variant="secondary" size="icon">`
  - When `hasGallery`: Thumbnail strip (`role="region" aria-label="Image Gallery Thumbnails"`) with clean active border highlight (`ring-2 ring-season-accent`).
  - Content section (`p-6 flex flex-col gap-5`):
    - `<DialogHeader className="flex flex-row items-start justify-between gap-4">` with `<DialogTitle id="modal-project-title" className="font-display text-2xl font-bold">{project.title}</DialogTitle>`, `<DialogDescription className="sr-only">Project preview and details</DialogDescription>`, and Live Project / Coming Soon `<Badge>`.
    - Rich formatted description (`text-sm sm:text-base text-muted-foreground leading-relaxed`).
    - When `techList.length > 0`: `"Technologies Used"` heading + `<Badge variant="secondary">` list.
    - Footer action bar (`flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-border`): `GitHub Repository` (`variant="outline"`), `Live Demo`/`Play Store` (default), and `Close` (`variant="outline"`).
- Keep the exact `document` `keydown` listener for `ArrowLeft`, `ArrowRight` (ignoring `input`/`textarea`/`contentEditable` per Review Focus #1), and `Escape` calling `onClose()`.

- [ ] **Step 3: Run tests for Task 4**

Run:
```powershell
npx vitest run test/components/sections/ProjectsSection.test.jsx test/components/sections/ProjectModal.test.jsx test/features/animations/ScrollRevealIntegration.test.jsx
```
Expected: All 3 test files PASS.

- [ ] **Step 4: Commit Task 4**

```powershell
git add src/components/sections/ProjectsSection.jsx src/components/sections/ProjectModal.jsx
git commit -m "feat(ui): rework ProjectsSection and ProjectModal with shadcn Card and Dialog"
```

---

### Task 5: Contact (`ContactSection`), Footer (`Footer`), FloatingActions, `PrivacyPolicyPage` & `NotFoundPage`

**Files:**
- Modify: `src/components/sections/ContactSection.jsx`
- Modify: `src/components/layout/Footer.jsx`
- Modify: `src/components/layout/FloatingActions.jsx`
- Modify: `src/pages/PrivacyPolicyPage.jsx`
- Modify: `src/pages/NotFoundPage.jsx`
- Create: `test/components/sections/ContactSection.test.jsx`

**Interfaces:**
- Consumes: `@/components/ui/{card,button,badge,alert,separator,tooltip,skeleton}`, `sonner` (`toast`), `@tabler/icons-react`, `useSound`, `usePrivacyPolicy`.
- Produces:
  - `ContactSection({ contactSettings })` with Sonner copy toast & full non-truncated email
  - `Footer({ variant, siteName })`
  - `FloatingActions({ whatsapp })` (standalone safe with internal `TooltipProvider`)
  - `PrivacyPolicyPage()` and `NotFoundPage()`

- [ ] **Step 1: Write `test/components/sections/ContactSection.test.jsx` (Review Focus #2)**

Create `test/components/sections/ContactSection.test.jsx`:
```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactSection } from '../../../src/components/sections/ContactSection';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

import { toast } from 'sonner';

describe('ContactSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });
  });

  it('renders full email address and social channel links', () => {
    render(
      <ContactSection
        contactSettings={{
          email: 'me@vinsensiusarka.id',
          linkedin: 'https://www.linkedin.com/in/vinsensiusarka/',
          github: 'https://github.com/vinsensiusarko'
        }}
      />
    );

    expect(screen.getByRole('heading', { name: /Contact Me/i })).toBeInTheDocument();
    expect(screen.getByText('me@vinsensiusarka.id')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /LinkedIn profile/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /GitHub profile/i })).toBeInTheDocument();
  });

  it('copies email to clipboard and fires Sonner success toast', async () => {
    render(<ContactSection contactSettings={{ email: 'me@vinsensiusarka.id' }} />);

    const copyBtn = screen.getByRole('button', { name: /Copy email address/i });
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('me@vinsensiusarka.id');
      expect(toast.success).toHaveBeenCalledWith('Copied me@vinsensiusarka.id to clipboard');
    });
  });
});
```

- [ ] **Step 2: Run new ContactSection test to verify it fails before Sonner migration**

Run: `npx vitest run test/components/sections/ContactSection.test.jsx`
Expected: FAIL because `ContactSection` does not yet call `toast.success` from `sonner`.

- [ ] **Step 3: Rework `src/components/sections/ContactSection.jsx` (2-Column Editorial Split + Sonner)**

Implement `ContactSection`:
- `<section id="contact" className="reveal-on-scroll relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24">`.
- 12-col split (`grid grid-cols-1 lg:grid-cols-12 gap-10 items-start`):
  - Left (`lg:col-span-5 flex flex-col gap-5`):
    - Quiet label `"Get In Touch"` + `<h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Contact Me</h2>`.
    - Short direct note ("Available for web and mobile development collaborations, freelance engagements, or engineering roles.").
    - Primary Email `<Card>` (`p-5 flex flex-col gap-3`): `mailto:` anchor showing full non-truncated `me@vinsensiusarka.id` (`break-all sm:break-normal font-medium text-foreground`) + `<Button type="button" variant="outline" size="sm" onClick={handleCopyEmail} aria-label="Copy email address">` calling `toast.success(\`Copied ${email} to clipboard\`)` (and `toast.error` fallback if clipboard throws).
  - Right (`lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5`):
    - 5 clean accessible social channel cards (`LinkedIn`, `GitHub`, `Instagram`, `Facebook`, `X / Twitter`), each an `<a>` styled as an interactive shadcn surface (`rounded-xl border border-border bg-card p-4 flex items-center gap-3.5 transition-colors hover:border-foreground/30 hover:bg-muted/40 min-h-16`).

- [ ] **Step 4: Rework `src/components/layout/Footer.jsx` and `src/components/layout/FloatingActions.jsx`**

Update `Footer.jsx`:
- Single-row editorial footer (`mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10`) with `<Separator className="mb-8" />`, copyright on left (`Copyright © {currentYear} {siteName}. All Rights Reserved.`), and 5 real links (`About`, `Experience`, `Projects`, `Contact`, `Privacy Policy`) on right (centered copyright only when `variant === 'policy'`).

Update `FloatingActions.jsx`:
- Wrap in `<TooltipProvider delayDuration={200}>` (Review Focus #2).
- Fixed bottom-right vertical dock (`fixed bottom-5 right-5 z-30 flex flex-col gap-2.5 pointer-events-auto`):
  - Sound toggle `<Button id="sound-toggle-btn" variant={isMuted ? 'outline' : 'default'} size="icon" className="size-11 rounded-full shadow-md">` (`aria-label={isMuted ? 'Enable Sound Effects' : 'Mute Sound Effects'}`)
  - Back-to-top `<Button id="back-to-top-btn" variant="outline" size="icon" className={cn('size-11 rounded-full shadow-md transition-all', showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none')}>` (`aria-label="Back to top"`)
  - WhatsApp link `<Button asChild size="icon" className="size-11 rounded-full shadow-md bg-[#25D366] text-white hover:bg-[#1fb85a]">` (`aria-label="Chat on WhatsApp"`)

- [ ] **Step 5: Rework `src/pages/PrivacyPolicyPage.jsx` and `src/pages/NotFoundPage.jsx`**

Update `PrivacyPolicyPage.jsx`:
- Use `usePrivacyPolicy()` (render shadcn `<Skeleton>` block if `loading` and `!policy?.title`).
- Editorial legal document layout (`mx-auto max-w-4xl px-4 sm:px-6 py-12 lg:py-16 flex flex-col gap-10`):
  - Header with `<Badge variant="secondary">` metadata row (`Google Play Store Compliant`, `Last Updated`, `Developer`).
  - 3-column highlight `<Card>` grid.
  - Quick Navigation TOC `<Card>` with clean flex-wrap anchor pills to `#section-1`..`#section-11`.
  - Numbered sections (`#section-1` to `#section-11`) with crisp typography, shadcn `<Alert>` for the "Strict Commitment" data commitment box, 2-column permission `<Card>` grid, third-party link cards, deletion instructions `<Card>`, developer info `<Card>`, and bottom `<Button asChild>` links (`Back to Portfolio`, `Contact Developer`).
  - Replace the two em dashes (`—`) in Section 9 prose with commas (`safeguards, including SSL/TLS encryption for all data transmissions, to protect...`).

Update `NotFoundPage.jsx`:
- Centered editorial 404 layout (`min-h-screen flex flex-col items-center justify-center px-4 text-center bg-background text-foreground`): clean typographic `404` display mark (`font-mono text-sm text-season-foreground`), `<h1 className="font-display text-4xl sm:text-5xl font-bold mt-2">Oops!</h1>`, `"Halaman yang Anda cari tidak ditemukan."`, and `<Button asChild size="lg" className="mt-6"><Link to="/">Back to Portfolio</Link></Button>`.

- [ ] **Step 6: Run full Vitest suite and production build**

Run:
```powershell
npx vitest run; npm run build
```
Expected: All 26 test files (95+ tests) PASS 100%, and `vite build` succeeds cleanly.

- [ ] **Step 7: Commit Task 5**

```powershell
git add src/components/sections/ContactSection.jsx src/components/layout/Footer.jsx src/components/layout/FloatingActions.jsx src/pages/PrivacyPolicyPage.jsx src/pages/NotFoundPage.jsx test/components/sections/ContactSection.test.jsx
git commit -m "feat(ui): rework Contact, Footer, FloatingActions, PrivacyPolicy, and 404 pages"
```

---

### Task 6: Full Visual/Interactive Verification, Admin Coexistence Check & Antislop Mode `after` Audit

**Files:**
- Create: `anti-slop/audit-001-2026-11-23.md`

**Interfaces:**
- Consumes: All completed public UI components from Tasks 1-5 and antislop skills (`antislop`, `antislop-ui`, `antislop-copywriting`, `antislop-human`, `antislop-layoutmobile`).
- Produces: Numbered antislop audit findings file (`anti-slop/audit-001-2026-11-23.md`) with `HIGH`/`MEDIUM`/`LOW` priorities ready for user selection, followed by approved fixes and final Delivery Gate report.

- [ ] **Step 1: Verify full test suite and clean build**

Run:
```powershell
npx vitest run; npm run build
```
Expected: 100% passing tests and clean production bundle.

- [ ] **Step 2: Run full antislop `after` audit across all modified public UI files**

Read `antislop-copywriting`, `antislop-human`, and `antislop-layoutmobile` skills, inspect every reworked public component and `src/styles/index.css` against all 40 rules (R-01 to R-40) and C-1..C-5, verify Light/Dark + 4 Seasons + Mobile 390px + Desktop 1440px + `/admin` coexistence, and write numbered findings to `anti-slop/audit-001-2026-11-23.md`.

- [ ] **Step 3: Present audit findings to user and await item selection**

Do not modify code for audit findings until the user selects which numbered items to fix. After fixing approved items, re-run `npx vitest run; npm run build`, commit, and emit the mandatory **antislop Delivery Gate PASS/FAIL report** with element-by-element verification evidence.
