# React 19 Migration & 4-Season Animation System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Vinsensius Arka public portfolio (`/`, `/privacy-policy`, `*`) to a modular React 19 + Vite SPA with a 60fps HTML5 Canvas 4-Season Animation & Theme System (Spring/Semi, Summer/Panas, Autumn/Gugur, Winter/Dingin), while preserving the existing `/admin` CMS dashboard in `public/admin/`.

**Architecture:** A feature-modular React 19 Single Page Application built with Vite and React Router v7 (`BrowserRouter`), backed by the Firebase v11 Modular SDK (`onSnapshot`) with instant static fallback data (`fallbackData.js`). Global state is managed via `ThemeContext` (Light/Dark mode) and `SeasonContext` (auto-detecting the current season by calendar month with manual visitor override and particle toggle), driving both CSS custom properties on `document.documentElement` (`data-theme` and `data-season`) and a lightweight `requestAnimationFrame` `<SeasonalCanvas />` particle engine.

**Tech Stack:** React 19 (`react`, `react-dom`), Vite 6 (`vite`, `@vitejs/plugin-react`), React Router v7 (`react-router`), Firebase Modular SDK v11 (`firebase/app`, `firebase/firestore`), Vitest + React Testing Library (`vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`), Vanilla Modular CSS & CSS Custom Properties, HTML5 Canvas 2D API.

**Spec:** `docs/superpowers/specs/2026-11-15-react-migration-seasonal-design.md`

## Global Constraints

- **React & Build Stack:** React 19 (`^19.0.0`), `react-dom` (`^19.0.0`), `react-router` (`^7.0.0`), `firebase` (`^11.0.0`), `vite` (`^6.0.0`), `@vitejs/plugin-react` (`^4.3.0`), JavaScript (`.js` / `.jsx`).
- **Phased Migration Boundary (Tahap 1):** Only the public portfolio (`/`), Privacy Policy (`/privacy-policy`), and 404 (`*`) migrate to React. The existing Admin Dashboard (`public/admin/**`), `public/assets/**`, and `public/js/firebase-config.js` MUST remain intact in `public/` so Vite copies them to `dist/admin/`, `dist/assets/`, and `dist/js/firebase-config.js` without breaking `/admin`'s relative `../js/firebase-config.js` and `../assets/favicon.ico` references.
- **Zero Heavy Particle Libraries:** The 4-season particle system (`<SeasonalCanvas />`) must use native HTML5 `<canvas>` 2D API with `requestAnimationFrame`, capped at 45 particles on desktop (`window.innerWidth >= 768`) and 20 particles on mobile (`window.innerWidth < 768`), pausing automatically when `document.hidden` is true or `particlesEnabled` is false.
- **Seasonal Auto-Detection & Override:** Default season auto-detects from `new Date().getMonth()` (`2,3,4` -> `spring`; `5,6,7` -> `summer`; `8,9,10` -> `autumn`; `11,0,1` -> `winter`) unless overridden in `localStorage.getItem('season')`.
- **Accessibility:** Respect `prefers-reduced-motion: reduce` by defaulting `particlesEnabled` to `false` unless explicitly enabled in `localStorage.getItem('season_particles')`. `<SeasonalCanvas />` must have `aria-hidden="true"` and `pointer-events: none`.
- **Zero-Blank-Screen Resilience:** All Firestore listeners (`projects`, `skills`, `settings/site_settings`, `settings/contact_settings`, `settings/privacy_policy`) must initialize immediately with `fallbackData.js` and gracefully fall back if Firestore errors or returns empty snapshots.

## Review Focus

1. **Corrupted or invalid `localStorage.getItem('season')` value (e.g., `"rainy"` or `"invalid"`):** `SeasonContext` must validate stored values against `['spring', 'summer', 'autumn', 'winter']` and fall back to the calendar-month auto-detected season instead of setting an invalid `data-season` attribute or crashing config lookups (tested in Task 3).
2. **`prefers-reduced-motion: reduce` OS accessibility preference active on initial visit:** `SeasonContext` must initialize `particlesEnabled` to `false` when `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is `true` and `localStorage.getItem('season_particles')` is unset, while still allowing manual toggle override (tested in Task 3).
3. **HTML/XSS special characters inside Firestore project descriptions (e.g., `<script>alert(1)</script>`):** `formatRichDescription` must escape `&`, `<`, `>`, and `"` across numbered lists (`1. `), bullet lists (`- ` / `* ` / `• `), and plain paragraphs before returning HTML strings (tested in Task 2).
4. **Case-insensitive search and technology-inferred category filtering in `ProjectsSection`:** Filtering by `"Mobile Application"` must match projects whose `category` is `"Mobile Application"` OR whose `techStack` includes `"Flutter"`, and searching a keyword with zero matches must display `#projects-empty-state` with a working "Reset Filters" button that restores all projects (tested in Task 7).
5. **Clicking external action links (`GitHub` / `Live Demo`) inside a Project Card:** Clicking a `.project-btn-container a` link inside a `.project-card` must NOT open the Quick View `ProjectModal`, whereas clicking the card body opens the modal and pressing `Escape` closes it (tested in Task 7).

---

## File Structure Map

- **Root & Configuration:**
  - `package.json` — Dependencies (`react`, `react-dom`, `react-router`, `firebase`) and devDependencies (`vite`, `@vitejs/plugin-react`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`).
  - `vite.config.js` — Vite build config (`outDir: 'dist'`) + Vitest test config (`environment: 'jsdom'`, `setupFiles: './src/test/setup.js'`).
  - `index.html` — Root Vite SPA entry HTML (preserving SEO meta, JSON-LD schema, Google Fonts, Font Awesome 6.5.2, and `admin.*` subdomain redirect script).
  - `firebase.json` — Firebase Hosting config updated to `"public": "dist"` with `/admin` rewrites followed by SPA rewrite `{"source": "**", "destination": "/index.html"}`.
  - `.github/workflows/firebase-hosting-merge.yml` & `.github/workflows/firebase-hosting-pull-request.yml` — CI/CD workflows updated with `actions/setup-node@v4`, `npm ci`, and `npm run build`.
- **Application Source (`src/`):**
  - `src/test/setup.js` — Vitest + `@testing-library/jest-dom` setup and `matchMedia` / Canvas 2D mock helpers.
  - `src/data/fallbackData.js` — Complete static fallback data for projects (9 items), skills (11 items), site settings, contact settings, and privacy policy.
  - `src/utils/formatDescription.js` & `src/utils/formatDescription.test.js` — Rich text formatter for project descriptions (paragraphs, numbered lists, bullet lists with HTML escaping).
  - `src/services/firebase.js` — Modular Firebase v11 initialization (`initializeApp`, `getFirestore`).
  - `src/features/season/seasonConfig.js` — Metadata, labels (`Semi`, `Panas`, `Gugur`, `Dingin`), icons, and particle physics parameters for the 4 seasons + `detectSeasonByMonth(monthIndex)`.
  - `src/context/ThemeContext.jsx` — Light/Dark theme state, `localStorage` persistence (`theme`), and `document.documentElement.setAttribute('data-theme', theme)`.
  - `src/context/SeasonContext.jsx` & `src/context/SeasonContext.test.jsx` — 4-Season state (`season`, `setSeason`, `isAutoSeason`, `resetToAutoSeason`, `particlesEnabled`, `toggleParticles`, `seasonMeta`), syncing `data-season` on `document.documentElement`.
  - `src/features/season/SeasonalCanvas.jsx` — 60fps HTML5 Canvas 2D particle renderer for Cherry Blossoms (`spring`), Sunbeams & Fireflies (`summer`), Maple Leaves (`autumn`), and Snowflakes (`winter`).
  - `src/features/season/SeasonSwitcher.jsx` & `src/features/season/SeasonSwitcher.test.jsx` — Interactive Navbar dropdown pill for switching seasons, toggling canvas particles, and resetting to auto-detected season.
  - `src/styles/variables.css` — Light/Dark theme CSS variables + `html[data-season="..."]` seasonal accent overrides + SeasonSwitcher and Hero Seasonal Badge styles.
  - `src/styles/global.css` — Portfolio & Privacy Policy global styles (migrated from `public/css/style.css` and enhanced to use `--season-accent` variables).
  - `src/styles/mediaqueries.css` — Responsive breakpoint styles (migrated from `public/css/mediaqueries.css`).
  - `src/hooks/usePortfolioData.js` — Real-time Firestore `onSnapshot` hook for `projects`, `skills`, `settings/site_settings`, and `settings/contact_settings`.
  - `src/hooks/usePrivacyPolicy.js` — Real-time Firestore `onSnapshot` hook for `settings/privacy_policy`.
  - `src/hooks/useScrollReveal.js` — `IntersectionObserver` hook for `.reveal-on-scroll` sections.
  - `src/components/layout/Navbar.jsx` — Responsive desktop & mobile hamburger navigation integrating `<SeasonSwitcher />` and theme toggle.
  - `src/components/layout/Footer.jsx` — Dynamic copyright year & navigation footer.
  - `src/components/layout/FloatingActions.jsx` — Back-to-top button and dynamic WhatsApp floating CTA.
  - `src/components/sections/HeroSection.jsx` — Hero profile section with custom React typewriter effect, seasonal badge (`🌸 Spring Edition`, etc.), CV download, and social links.
  - `src/components/sections/AboutSection.jsx` — About Me photo, experience/education cards, and bio text.
  - `src/components/sections/ExperienceSection.jsx` — Programming Languages and Frameworks & Tools skill grids (including custom Flutter SVG).
  - `src/components/sections/ProjectModal.jsx` — Quick View modal dialog with Escape key & backdrop click dismissal.
  - `src/components/sections/ProjectsSection.jsx` & `src/components/sections/ProjectsSection.test.jsx` — Search box, category filter chips, project cards, empty state, and `ProjectModal` integration.
  - `src/components/sections/ContactSection.jsx` — Contact cards with one-click email copy and toast notification.
  - `src/pages/HomePage.jsx` — Main portfolio view assembling all sections.
  - `src/pages/PrivacyPolicyPage.jsx` — Google Play Store & Web Privacy Policy page synced with Firestore.
  - `src/pages/NotFoundPage.jsx` — 404 page with custom SVG illustration and link back to `/`.
  - `src/App.jsx` — Root layout (`ThemeProvider`, `SeasonProvider`, `<SeasonalCanvas />`, `<Routes>`).
  - `src/main.jsx` — React 19 `createRoot` entry point.

---

### Task 1: Project Scaffolding, Vite + Vitest Setup, & Legacy Public Cleanup

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/test/setup.js`
- Create: `src/test/smoke.test.js`
- Modify: `.gitignore`
- Delete: `public/index.html`, `public/privacy-policy.html`, `public/404.html`, `public/js/main.js`, `public/js/typelighter.min.js` (keeping `public/admin/**`, `public/assets/**`, `public/js/firebase-config.js`, `public/robots.txt`, `public/sitemap.xml`, `public/site.webmanifest`)

**Interfaces:**
- Consumes: Existing static assets in `public/assets/` and `public/admin/`
- Produces: Working Vite 6 + React 19 + Vitest toolchain (`npm test` and `npm run build`)

- [ ] **Step 1: Create `package.json` with React 19, React Router v7, Firebase v11, Vite 6, and Vitest**

```json
{
  "name": "vinsensiusarko-portfolio",
  "private": true,
  "version": "3.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "firebase": "^11.3.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router": "^7.1.5"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.2.0",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^26.0.0",
    "vite": "^6.1.0",
    "vitest": "^3.0.5"
  }
}
```

- [ ] **Step 2: Create `vite.config.js` and `src/test/setup.js`**

Write `vite.config.js`:
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true
  }
});
```

Write `src/test/setup.js`:
```javascript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });
}

if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => ({
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    closePath: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    }))
  }));
}
```

- [ ] **Step 3: Create root `index.html` for Vite SPA**

Write `index.html` at the repository root:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Subdomain Router: If accessed via admin.*, immediately route to /admin -->
    <script>
      (function () {
        if (
          window.location.hostname.startsWith('admin.') &&
          !window.location.pathname.startsWith('/admin')
        ) {
          window.location.replace(
            '/admin' +
              window.location.pathname +
              window.location.search +
              window.location.hash
          );
        }
      })();
    </script>
    <meta
      name="google-site-verification"
      content="0zYiihEbj8shbLC1m4sEfeZC--VJimE8-FxzqDEcpM8"
    />

    <title>Vinsensius Arka — Web &amp; Mobile Developer</title>
    <meta
      name="description"
      content="Vinsensius Arka is a Web &amp; Mobile Developer specializing in Flutter, Laravel, Java, and modern web technologies. Explore projects, skills, and portfolio."
    />
    <meta name="author" content="Vinsensius Arka" />

    <!-- Canonical & PWA Meta -->
    <link rel="canonical" href="https://vinsensiusarka.id/" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="theme-color" content="#0f172a" />

    <!-- Open Graph / Social Media Meta -->
    <meta
      property="og:title"
      content="Vinsensius Arka — Web &amp; Mobile Developer"
    />
    <meta
      property="og:description"
      content="Explore projects, skills, and professional portfolio of Vinsensius Arka."
    />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://vinsensiusarka.id" />
    <meta
      property="og:image"
      content="https://vinsensiusarka.id/assets/images/arko-pic.png"
    />
    <meta name="twitter:card" content="summary_large_image" />

    <!-- Performance Preconnect & Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
    />

    <!-- Font Awesome 6 Icons -->
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
      crossorigin="anonymous"
    />
    <link rel="shortcut icon" href="/assets/favicon.ico" type="image/x-icon" />

    <!-- Schema.org JSON-LD for Rich Search Results -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Vinsensius Arka",
        "url": "https://vinsensiusarka.id",
        "image": "https://vinsensiusarka.id/assets/images/arko-pic.png",
        "jobTitle": "Web & Mobile Developer",
        "sameAs": [
          "https://github.com/vinsensiusarko",
          "https://www.linkedin.com/in/vinsensiusarko/",
          "https://www.instagram.com/vinsensiusarko/",
          "https://x.com/vinsensiusarko"
        ]
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Update `.gitignore`, remove legacy public HTML/JS files that are replaced by React SPA, and write smoke test**

Ensure `dist/` and `node_modules/` are ignored in `.gitignore`:
```gitignore
node_modules/
dist/
.firebase/
.env
.env.*
firebase-debug.log*
```

Remove legacy public root HTML and scripts (while preserving `public/admin/`, `public/assets/`, and `public/js/firebase-config.js`):
```powershell
git rm public/index.html public/privacy-policy.html public/404.html public/js/main.js public/js/typelighter.min.js
```

Write `src/test/smoke.test.js`:
```javascript
import { describe, it, expect } from 'vitest';

describe('Toolchain smoke test', () => {
  it('runs Vitest with jsdom environment', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });
});
```

- [ ] **Step 5: Install dependencies and run Vitest to verify setup**

Run: `npm install && npm test`
Expected: `1 passed` in `src/test/smoke.test.js`

- [ ] **Step 6: Commit**

```powershell
git add package.json package-lock.json vite.config.js index.html .gitignore src/test/setup.js src/test/smoke.test.js
git commit -m "chore: scaffold React 19 + Vite 6 + Vitest and clean legacy public root files"
```

---

### Task 2: Static Fallback Data, Description Formatter Utility, & Firebase Service

**Files:**
- Create: `src/data/fallbackData.js`
- Create: `src/utils/formatDescription.js`
- Create: `src/utils/formatDescription.test.js`
- Create: `src/services/firebase.js`
- Delete: `src/test/smoke.test.js`

**Interfaces:**
- Consumes: None
- Produces:
  - `src/data/fallbackData.js`: `FALLBACK_PROJECTS`, `FALLBACK_SKILLS`, `FALLBACK_SITE_SETTINGS`, `FALLBACK_CONTACT_SETTINGS`, `FALLBACK_PRIVACY_POLICY`
  - `src/utils/formatDescription.js`: `formatRichDescription(text: string): string`
  - `src/services/firebase.js`: `app`, `db`

- [ ] **Step 1: Write the failing unit tests for `formatRichDescription` (including Review Focus #3 XSS escaping)**

Write `src/utils/formatDescription.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import { formatRichDescription } from './formatDescription';

describe('formatRichDescription', () => {
  it('returns empty string for null, undefined, or empty input', () => {
    expect(formatRichDescription('')).toBe('');
    expect(formatRichDescription(null)).toBe('');
    expect(formatRichDescription(undefined)).toBe('');
  });

  it('formats plain paragraphs with .rich-desc-p', () => {
    const res = formatRichDescription('First paragraph\nSecond paragraph');
    expect(res).toContain('<p class="rich-desc-p">First paragraph</p>');
    expect(res).toContain('<p class="rich-desc-p">Second paragraph</p>');
  });

  it('formats numbered list items into .rich-list-group and .rich-numbered-item', () => {
    const res = formatRichDescription('1. Auth module\n2) Dashboard view');
    expect(res).toContain('<div class="rich-list-group">');
    expect(res).toContain('<span class="rich-number-badge">1</span>');
    expect(res).toContain('<span class="rich-item-text">Auth module</span>');
    expect(res).toContain('<span class="rich-number-badge">2</span>');
    expect(res).toContain('<span class="rich-item-text">Dashboard view</span>');
  });

  it('formats bullet list items (-, *, •) into .rich-bullet-item', () => {
    const res = formatRichDescription('- Offline sync\n• Thermal printer');
    expect(res).toContain('rich-bullet-item');
    expect(res).toContain('<span class="rich-item-text">Offline sync</span>');
    expect(res).toContain('<span class="rich-item-text">Thermal printer</span>');
  });

  it('escapes HTML and XSS payloads in paragraphs and list items (Review Focus #3)', () => {
    const malicious = '<script>alert("xss")</script>\n- <img src=x onerror="hack()">';
    const res = formatRichDescription(malicious);
    expect(res).not.toContain('<script>');
    expect(res).not.toContain('<img');
    expect(res).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    expect(res).toContain('&lt;img src=x onerror=&quot;hack()&quot;&gt;');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/utils/formatDescription.test.js`
Expected: FAIL with `Cannot find module './formatDescription'`

- [ ] **Step 3: Implement `src/utils/formatDescription.js`, `src/data/fallbackData.js`, and `src/services/firebase.js`**

Write `src/utils/formatDescription.js`:
```javascript
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatRichDescription(text) {
  if (!text) return '';

  const lines = String(text).split(/\r?\n/);
  let html = '';
  let inListGroup = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      if (inListGroup) {
        html += '</div>';
        inListGroup = false;
      }
      continue;
    }

    const olMatch = line.match(/^(\d+)[.)]\s+(.*)/);
    const ulMatch = line.match(/^[-*•]\s+(.*)/);

    if (olMatch) {
      if (!inListGroup) {
        html += '<div class="rich-list-group">';
        inListGroup = true;
      }
      html += `<div class="rich-list-item rich-numbered-item"><span class="rich-number-badge">${olMatch[1]}</span><span class="rich-item-text">${escapeHtml(olMatch[2])}</span></div>`;
    } else if (ulMatch) {
      if (!inListGroup) {
        html += '<div class="rich-list-group">';
        inListGroup = true;
      }
      html += `<div class="rich-list-item rich-bullet-item"><span class="rich-check-badge"><i class="fa-solid fa-circle-check"></i></span><span class="rich-item-text">${escapeHtml(ulMatch[1])}</span></div>`;
    } else {
      if (inListGroup) {
        html += '</div>';
        inListGroup = false;
      }
      html += `<p class="rich-desc-p">${escapeHtml(line)}</p>`;
    }
  }

  if (inListGroup) {
    html += '</div>';
  }

  return html;
}
```

Write `src/data/fallbackData.js`:
```javascript
export const FALLBACK_PROJECTS = [
  {
    id: 'chatting-app',
    order: 1,
    title: 'Chatting App',
    description:
      'Java-based multi-client chatting application with real-time socket communication.',
    category: 'Desktop Application',
    image: '/assets/images/portfolio-1.png',
    techStack: ['Java', 'Socket', 'Swing', 'Networking'],
    githubUrl: 'https://github.com/vinsensiusarko/Chatting-App',
    demoUrl: '',
    demoLabel: 'Live Demo',
    isComingSoon: true
  },
  {
    id: 'kanisius-high-school',
    order: 2,
    title: 'Kanisius High School',
    description:
      'Interactive digital yearbook website with graduate profiles, memories, and photo galleries.',
    category: 'Web Application',
    image: '/assets/images/portfolio-2.png',
    techStack: ['PHP', 'MySQL', 'HTML5', 'CSS3', 'JavaScript'],
    githubUrl: 'https://github.com/vinsensiusarko/Yearbook-Website',
    demoUrl: 'https://kanisiushs.sch.id',
    demoLabel: 'Live Demo',
    isComingSoon: false
  },
  {
    id: 'kanisius-middle-school',
    order: 3,
    title: 'Kanisius Middle School',
    description:
      'Official school portal providing academic announcements, school profile, and student news.',
    category: 'Web Portal',
    image: '/assets/images/portfolio-3.png',
    techStack: ['WordPress', 'PHP', 'MySQL', 'CMS'],
    githubUrl: '',
    demoUrl: 'https://smpkanisiuspati.sch.id',
    demoLabel: 'Live Demo',
    isComingSoon: false
  },
  {
    id: 'spmb-uns-solo',
    order: 4,
    title: 'SPMB UNS Solo',
    description:
      'Portal and landing interface for student admission registration at Universitas Sebelas Maret.',
    category: 'Web Portal',
    image: '/assets/images/portfolio-4.png',
    techStack: ['Laravel', 'PHP', 'MySQL', 'Bootstrap'],
    githubUrl: '',
    demoUrl: 'https://spmb.uns.ac.id',
    demoLabel: 'Live Demo',
    isComingSoon: false
  },
  {
    id: 'arkommerce-admin-fe',
    order: 5,
    title: 'Arkommerce — Admin FE',
    description:
      'Modern responsive administration dashboard for shoes e-commerce with order and inventory management.',
    category: 'Web Application',
    image: '/assets/images/portfolio-5.png',
    techStack: ['React', 'JavaScript', 'CSS3', 'Firebase'],
    githubUrl: 'https://github.com/vinsensiusarko/admin-ecommerce-shoes-fe',
    demoUrl: 'https://arkommerce-admin.web.app',
    demoLabel: 'Live Demo',
    isComingSoon: false
  },
  {
    id: 'arkommerce-admin-be',
    order: 6,
    title: 'Arkommerce — Admin BE',
    description:
      'RESTful API backend service powering products, authentication, transactions, and admin operations.',
    category: 'Backend API',
    image: '/assets/images/portfolio-6.png',
    techStack: ['Node JS', 'Express', 'RESTful API', 'MySQL'],
    githubUrl: 'https://github.com/vinsensiusarko/admin-ecommerce-shoes-be',
    demoUrl: 'https://arkommerce-be-production.up.railway.app',
    demoLabel: 'Live Demo',
    isComingSoon: false
  },
  {
    id: 'pmi-malang',
    order: 7,
    title: 'PMI Malang',
    description:
      'Extension application connected with PMI Malang database to generate and automate reports.',
    category: 'Desktop Application',
    image: '/assets/images/portfolio-7.png',
    techStack: ['Java', 'MySQL', 'Database', 'Reporting'],
    githubUrl: 'https://github.com/vinsensiusarko/PMI-Malang',
    demoUrl: '',
    demoLabel: 'Live Demo',
    isComingSoon: true
  },
  {
    id: 'mozaic-pos-app',
    order: 8,
    title: 'Mozaic POS App',
    description:
      'Commercial Point of Sale mobile application released on Google Play Store for retail & transactions.',
    category: 'Mobile Application',
    image: '/assets/images/portfolio-8.png',
    techStack: ['Flutter', 'Dart', 'Firebase', 'SQLite'],
    githubUrl: '',
    demoUrl:
      'https://play.google.com/store/apps/details?id=com.ciptasolutindo.mozaic_app_new',
    demoLabel: 'Play Store',
    isComingSoon: false
  },
  {
    id: 'smart-system',
    order: 9,
    title: 'SMArT',
    description:
      'Sistem Manajemen Administrasi Terpadu — integrated administrative and institutional management system.',
    category: 'Web Application',
    image: '/assets/images/portfolio-9.png',
    techStack: ['PHP', 'MySQL', 'Bootstrap', 'Management'],
    githubUrl: '',
    demoUrl: '',
    demoLabel: 'Live Demo',
    isComingSoon: true
  }
];

export const FALLBACK_SKILLS = [
  { id: 'html5', order: 1, name: 'HTML5', level: 'Experienced', category: 'language', iconClass: 'fa-brands fa-html5' },
  { id: 'css3', order: 2, name: 'CSS3', level: 'Experienced', category: 'language', iconClass: 'fa-brands fa-css3-alt' },
  { id: 'javascript', order: 3, name: 'JavaScript', level: 'Experienced', category: 'language', iconClass: 'fa-brands fa-js' },
  { id: 'java', order: 4, name: 'Java', level: 'Experienced', category: 'language', iconClass: 'fa-brands fa-java' },
  { id: 'flutter', order: 5, name: 'Flutter', level: 'Experienced', category: 'language', iconClass: 'fa-brands fa-flutter', iconType: 'svg' },
  { id: 'php', order: 6, name: 'PHP', level: 'Experienced', category: 'language', iconClass: 'fa-brands fa-php' },
  { id: 'laravel', order: 7, name: 'Laravel', level: 'Experienced', category: 'framework_tool', iconClass: 'fa-brands fa-laravel' },
  { id: 'nodejs', order: 8, name: 'Node JS', level: 'Intermediate', category: 'framework_tool', iconClass: 'fa-brands fa-node-js' },
  { id: 'mysql', order: 9, name: 'MySQL', level: 'Experienced', category: 'framework_tool', iconClass: 'fa-solid fa-database' },
  { id: 'git', order: 10, name: 'Git', level: 'Experienced', category: 'framework_tool', iconClass: 'fa-brands fa-git-alt' },
  { id: 'wordpress', order: 11, name: 'WordPress', level: 'Intermediate', category: 'framework_tool', iconClass: 'fa-brands fa-wordpress' }
];

export const FALLBACK_SITE_SETTINGS = {
  name: 'Vinsensius Arka',
  heroGreeting: "Hello, I'm",
  typewriterRoles: ['Web Developer', 'Mobile Developer'],
  bioText:
    'I am a passionate software developer with experience in building responsive web applications and cross-platform mobile solutions. I specialize in turning complex problems into clean, intuitive, and performant digital experiences using modern frameworks like Flutter, Laravel, and native Java. Always excited to learn, collaborate, and build impactful software.',
  expYears: '3+ years',
  expSub: 'Web & Mobile Development',
  eduDegree: 'Bachelors Degree',
  eduMajor: 'Computer Science',
  cvUrl: '/assets/docs/cv-vinsensiusarka.pdf',
  cvBase64: '',
  cvFileName: 'CV-VinsensiusArka.pdf',
  heroImage: '/assets/images/arko-pic.png',
  aboutImage: '/assets/images/arko-about.jpg'
};

export const FALLBACK_CONTACT_SETTINGS = {
  email: 'me@vinsensiusarka.id',
  whatsapp: '6285179793167',
  linkedin: 'https://www.linkedin.com/in/vinsensiusarka/',
  github: 'https://github.com/vinsensiusarko',
  instagram: 'https://www.instagram.com/vinsensiusarko/',
  facebook: 'https://www.facebook.com/vinsensiusarko/',
  twitter: 'https://x.com/vinsensiusarko'
};

export const FALLBACK_PRIVACY_POLICY = {
  title: 'Privacy Policy',
  subtitle: 'Developer Policies & User Data',
  lastUpdated: 'September 28, 2026',
  developerName: 'Vinsensius Arka',
  contactEmail: 'me@vinsensiusarka.id',
  contactWebsite: 'https://vinsensiusarka.id',
  complianceBadge: 'Google Play Store Compliant',
  highlight1Title: 'Privacy First',
  highlight1Desc:
    'We do not sell, rent, or trade your personal information to any third parties.',
  highlight2Title: 'Secure & Encrypted',
  highlight2Desc:
    'HTTPS encryption and standard security protections across all app features.',
  highlight3Title: 'Data Deletion',
  highlight3Desc:
    'Full rights to request complete deletion of your account and records anytime.',
  sectionScope:
    'Welcome to the Privacy Policy of Vinsensius Arka ("Developer", "we", "us", or "our"). This Privacy Policy applies to all mobile applications, software, tools, and digital services published and maintained under our developer account on the Google Play Store (including Mozaic POS App, Satus Mobile, and subsequent releases), as well as our official developer portfolio website.',
  sectionDataCollection:
    'We collect only the minimum necessary information required to operate, maintain, and provide the services you request. This includes account credentials, business transaction logs entered by you, and automated diagnostic device telemetry (device model, OS version, and crash logs).',
  sectionPermissions:
    'Our applications request only runtime system permissions that are strictly necessary for specific user-initiated features: Camera (for barcode/QR scanning), Storage/Files (for sales reports & backups), Network (for cloud synchronization), and Notifications (for transaction confirmations).',
  sectionThirdParty:
    'We may integrate verified third-party developer services such as Google Play Services, Google Play In-App Billing, and Google Firebase (Crashlytics, Firestore) to facilitate core infrastructure and stability monitoring.',
  sectionDataDeletion:
    'In accordance with Google Play\'s User Data & Account Deletion policies, and global privacy frameworks (such as GDPR and CCPA), you have full control over your personal data:',
  sectionContact:
    'If you have questions, comments, or concerns regarding this Privacy Policy, our data practices, or our mobile applications, please contact us:'
};
```

Write `src/services/firebase.js`:
```javascript
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA2d2w-kfcL4fV5sI1m7V_N_l-H36rK02s',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'vinsensiusarko.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'vinsensiusarko',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'vinsensiusarko.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '639316523712',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:639316523712:web:2a379691ff732f8c8a0b25',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-5N5E36E73R'
};

let app = null;
let db = null;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (err) {
  console.warn('Firebase initialization warning (using static fallback data):', err);
}

export { app, db };
```

Remove the temporary smoke test:
```powershell
Remove-Item src/test/smoke.test.js -ErrorAction SilentlyContinue
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (`src/utils/formatDescription.test.js` passes all 5 tests)

- [ ] **Step 5: Commit**

```powershell
git add src/data/fallbackData.js src/utils/formatDescription.js src/utils/formatDescription.test.js src/services/firebase.js
git commit -m "feat: add fallback portfolio data, rich description formatter, and Firebase service"
```

---

### Task 3: ThemeContext & SeasonContext with Auto-Month Detection

**Files:**
- Create: `src/features/season/seasonConfig.js`
- Create: `src/context/ThemeContext.jsx`
- Create: `src/context/SeasonContext.jsx`
- Create: `src/context/SeasonContext.test.jsx`

**Interfaces:**
- Consumes: React 19 Context API
- Produces:
  - `src/features/season/seasonConfig.js`: `SEASONS`, `VALID_SEASON_IDS`, `detectSeasonByMonth(monthIndex?: number): string`
  - `src/context/ThemeContext.jsx`: `ThemeProvider`, `useTheme(): { theme, toggleTheme }`
  - `src/context/SeasonContext.jsx`: `SeasonProvider`, `useSeason(): { season, setSeason, isAutoSeason, resetToAutoSeason, particlesEnabled, toggleParticles, seasonMeta, seasons }`

- [ ] **Step 1: Write the failing tests for `SeasonContext` and `detectSeasonByMonth` (including Review Focus #1 and #2)**

Write `src/context/SeasonContext.test.jsx`:
```jsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { detectSeasonByMonth } from '../features/season/seasonConfig';
import { SeasonProvider, useSeason } from './SeasonContext';

function SeasonTestConsumer() {
  const {
    season,
    setSeason,
    isAutoSeason,
    resetToAutoSeason,
    particlesEnabled,
    toggleParticles,
    seasonMeta
  } = useSeason();

  return (
    <div>
      <span data-testid="season">{season}</span>
      <span data-testid="label">{seasonMeta.labelId}</span>
      <span data-testid="auto">{String(isAutoSeason)}</span>
      <span data-testid="particles">{String(particlesEnabled)}</span>
      <button onClick={() => setSeason('winter')}>Set Winter</button>
      <button onClick={resetToAutoSeason}>Reset Auto</button>
      <button onClick={toggleParticles}>Toggle Particles</button>
    </div>
  );
}

describe('detectSeasonByMonth', () => {
  it('maps months 2, 3, 4 (Mar-May) to spring', () => {
    expect(detectSeasonByMonth(2)).toBe('spring');
    expect(detectSeasonByMonth(3)).toBe('spring');
    expect(detectSeasonByMonth(4)).toBe('spring');
  });

  it('maps months 5, 6, 7 (Jun-Aug) to summer', () => {
    expect(detectSeasonByMonth(5)).toBe('summer');
    expect(detectSeasonByMonth(6)).toBe('summer');
    expect(detectSeasonByMonth(7)).toBe('summer');
  });

  it('maps months 8, 9, 10 (Sep-Nov) to autumn', () => {
    expect(detectSeasonByMonth(8)).toBe('autumn');
    expect(detectSeasonByMonth(9)).toBe('autumn');
    expect(detectSeasonByMonth(10)).toBe('autumn');
  });

  it('maps months 11, 0, 1 (Dec-Feb) to winter', () => {
    expect(detectSeasonByMonth(11)).toBe('winter');
    expect(detectSeasonByMonth(0)).toBe('winter');
    expect(detectSeasonByMonth(1)).toBe('winter');
  });
});

describe('SeasonContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-season');
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }));
  });

  it('syncs data-season on document.documentElement and supports manual override and reset', () => {
    render(
      <SeasonProvider>
        <SeasonTestConsumer />
      </SeasonProvider>
    );

    expect(screen.getByTestId('auto').textContent).toBe('true');
    const initialSeason = screen.getByTestId('season').textContent;
    expect(document.documentElement.getAttribute('data-season')).toBe(initialSeason);

    fireEvent.click(screen.getByText('Set Winter'));
    expect(screen.getByTestId('season').textContent).toBe('winter');
    expect(screen.getByTestId('label').textContent).toBe('Dingin');
    expect(screen.getByTestId('auto').textContent).toBe('false');
    expect(localStorage.getItem('season')).toBe('winter');
    expect(document.documentElement.getAttribute('data-season')).toBe('winter');

    fireEvent.click(screen.getByText('Reset Auto'));
    expect(screen.getByTestId('auto').textContent).toBe('true');
    expect(localStorage.getItem('season')).toBeNull();
  });

  it('ignores corrupted or unrecognized localStorage season values and falls back to auto season (Review Focus #1)', () => {
    localStorage.setItem('season', 'monsoon-invalid');
    render(
      <SeasonProvider>
        <SeasonTestConsumer />
      </SeasonProvider>
    );

    const activeSeason = screen.getByTestId('season').textContent;
    expect(['spring', 'summer', 'autumn', 'winter']).toContain(activeSeason);
    expect(screen.getByTestId('auto').textContent).toBe('true');
  });

  it('defaults particlesEnabled to false when prefers-reduced-motion: reduce is active and localStorage is unset (Review Focus #2)', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }));

    render(
      <SeasonProvider>
        <SeasonTestConsumer />
      </SeasonProvider>
    );

    expect(screen.getByTestId('particles').textContent).toBe('false');

    fireEvent.click(screen.getByText('Toggle Particles'));
    expect(screen.getByTestId('particles').textContent).toBe('true');
    expect(localStorage.getItem('season_particles')).toBe('true');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/context/SeasonContext.test.jsx`
Expected: FAIL with `Cannot find module '../features/season/seasonConfig'`

- [ ] **Step 3: Implement `src/features/season/seasonConfig.js`, `src/context/ThemeContext.jsx`, and `src/context/SeasonContext.jsx`**

Write `src/features/season/seasonConfig.js`:
```javascript
export const SEASONS = {
  spring: {
    id: 'spring',
    labelId: 'Semi',
    labelEn: 'Spring',
    emoji: '🌸',
    badgeText: '🌸 Spring Edition',
    description: 'Sakura Petals',
    colors: ['#f9a8d4', '#f472b6', '#fbcfe8'],
    particleCountDesktop: 35,
    particleCountMobile: 16
  },
  summer: {
    id: 'summer',
    labelId: 'Panas',
    labelEn: 'Summer',
    emoji: '☀️',
    badgeText: '☀️ Summer Edition',
    description: 'Golden Sunbeams & Fireflies',
    colors: ['#fde047', '#f59e0b', '#fef08a'],
    particleCountDesktop: 30,
    particleCountMobile: 15
  },
  autumn: {
    id: 'autumn',
    labelId: 'Gugur',
    labelEn: 'Autumn',
    emoji: '🍂',
    badgeText: '🍂 Autumn Edition',
    description: 'Falling Maple Leaves',
    colors: ['#ea580c', '#d97706', '#b45309', '#dc2626'],
    particleCountDesktop: 32,
    particleCountMobile: 15
  },
  winter: {
    id: 'winter',
    labelId: 'Dingin',
    labelEn: 'Winter',
    emoji: '❄️',
    badgeText: '❄️ Winter Edition',
    description: 'Soft Snowflakes',
    colors: ['#bae6fd', '#7dd3fc', '#e0f2fe', '#ffffff'],
    particleCountDesktop: 42,
    particleCountMobile: 20
  }
};

export const VALID_SEASON_IDS = Object.keys(SEASONS);

export function detectSeasonByMonth(monthIndex = new Date().getMonth()) {
  if (monthIndex >= 2 && monthIndex <= 4) return 'spring';
  if (monthIndex >= 5 && monthIndex <= 7) return 'summer';
  if (monthIndex >= 8 && monthIndex <= 10) return 'autumn';
  return 'winter';
}
```

Write `src/context/ThemeContext.jsx`:
```jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch (e) {}

  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }
  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      try {
        if (!localStorage.getItem('theme')) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      } catch (err) {}
    };
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('theme', next);
      } catch (e) {}
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
```

Write `src/context/SeasonContext.jsx`:
```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import {
  SEASONS,
  VALID_SEASON_IDS,
  detectSeasonByMonth
} from '../features/season/seasonConfig';

const SeasonContext = createContext(null);

function getInitialSeasonState() {
  try {
    const saved = localStorage.getItem('season');
    if (saved && VALID_SEASON_IDS.includes(saved)) {
      return { season: saved, isAutoSeason: false };
    }
    if (saved && !VALID_SEASON_IDS.includes(saved)) {
      localStorage.removeItem('season');
    }
  } catch (e) {}

  return { season: detectSeasonByMonth(), isAutoSeason: true };
}

function getInitialParticlesEnabled() {
  try {
    const saved = localStorage.getItem('season_particles');
    if (saved === 'true') return true;
    if (saved === 'false') return false;
  } catch (e) {}

  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return false;
  }
  return true;
}

export function SeasonProvider({ children }) {
  const [seasonState, setSeasonState] = useState(getInitialSeasonState);
  const [particlesEnabled, setParticlesEnabled] = useState(
    getInitialParticlesEnabled
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-season', seasonState.season);
  }, [seasonState.season]);

  const setSeason = (nextSeason) => {
    if (!VALID_SEASON_IDS.includes(nextSeason)) return;
    try {
      localStorage.setItem('season', nextSeason);
    } catch (e) {}
    setSeasonState({ season: nextSeason, isAutoSeason: false });
  };

  const resetToAutoSeason = () => {
    try {
      localStorage.removeItem('season');
    } catch (e) {}
    setSeasonState({ season: detectSeasonByMonth(), isAutoSeason: true });
  };

  const toggleParticles = () => {
    setParticlesEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('season_particles', String(next));
      } catch (e) {}
      return next;
    });
  };

  const seasonMeta = SEASONS[seasonState.season] || SEASONS.spring;

  return (
    <SeasonContext.Provider
      value={{
        season: seasonState.season,
        setSeason,
        isAutoSeason: seasonState.isAutoSeason,
        resetToAutoSeason,
        particlesEnabled,
        toggleParticles,
        seasonMeta,
        seasons: SEASONS
      }}
    >
      {children}
    </SeasonContext.Provider>
  );
}

export function useSeason() {
  const ctx = useContext(SeasonContext);
  if (!ctx) {
    throw new Error('useSeason must be used within a SeasonProvider');
  }
  return ctx;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/context/SeasonContext.test.jsx`
Expected: PASS (all 7 tests in `SeasonContext.test.jsx` pass)

- [ ] **Step 5: Commit**

```powershell
git add src/features/season/seasonConfig.js src/context/ThemeContext.jsx src/context/SeasonContext.jsx src/context/SeasonContext.test.jsx
git commit -m "feat: implement ThemeContext and SeasonContext with month auto-detection"
```

---

### Task 4: 4-Season HTML5 Canvas Particle Engine & SeasonSwitcher UI

**Files:**
- Create: `src/features/season/SeasonalCanvas.jsx`
- Create: `src/features/season/SeasonSwitcher.jsx`
- Create: `src/features/season/SeasonSwitcher.test.jsx`

**Interfaces:**
- Consumes: `useSeason()` from `src/context/SeasonContext.jsx`, ` useTheme()` from `src/context/ThemeContext.jsx`
- Produces:
  - `src/features/season/SeasonalCanvas.jsx`: `<SeasonalCanvas />`
  - `src/features/season/SeasonSwitcher.jsx`: `<SeasonSwitcher />`

- [ ] **Step 1: Write the failing component tests for `SeasonSwitcher` and `SeasonalCanvas`**

Write `src/features/season/SeasonSwitcher.test.jsx`:
```jsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../context/ThemeContext';
import { SeasonProvider } from '../../context/SeasonContext';
import { SeasonSwitcher } from './SeasonSwitcher';
import { SeasonalCanvas } from './SeasonalCanvas';

function renderWithProviders(ui) {
  return render(
    <ThemeProvider>
      <SeasonProvider>{ui}</SeasonProvider>
    </ThemeProvider>
  );
}

describe('SeasonSwitcher & SeasonalCanvas', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('opens dropdown, switches between Semi, Panas, Gugur, Dingin, and toggles particles', () => {
    renderWithProviders(
      <>
        <SeasonSwitcher />
        <SeasonalCanvas />
      </>
    );

    const trigger = screen.getByRole('button', { name: /musim|season/i });
    fireEvent.click(trigger);

    const autumnOption = screen.getByRole('menuitem', { name: /Gugur/i });
    fireEvent.click(autumnOption);

    expect(document.documentElement.getAttribute('data-season')).toBe('autumn');
    expect(trigger.textContent).toContain('Gugur');

    // Reopen dropdown to toggle particles
    fireEvent.click(trigger);
    const particleBtn = screen.getByRole('button', { name: /Efek Animasi/i });
    fireEvent.click(particleBtn);

    expect(localStorage.getItem('season_particles')).toBe('false');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/features/season/SeasonSwitcher.test.jsx`
Expected: FAIL with `Cannot find module './SeasonSwitcher'`

- [ ] **Step 3: Implement `src/features/season/SeasonalCanvas.jsx` and `src/features/season/SeasonSwitcher.jsx`**

Write `src/features/season/SeasonalCanvas.jsx`:
```jsx
import { useEffect, useRef } from 'react';
import { useSeason } from '../../context/SeasonContext';
import { useTheme } from '../../context/ThemeContext';

function createParticle(width, height, season) {
  const colors = {
    spring: ['#f9a8d4', '#f472b6', '#fbcfe8'],
    summer: ['#fde047', '#f59e0b', '#fef08a'],
    autumn: ['#ea580c', '#d97706', '#b45309', '#dc2626'],
    winter: ['#bae6fd', '#7dd3fc', '#e0f2fe', '#ffffff']
  }[season] || ['#f9a8d4'];

  const color = colors[Math.floor(Math.random() * colors.length)];

  if (season === 'spring') {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: 6 + Math.random() * 6,
      speedY: 0.6 + Math.random() * 0.8,
      speedX: 0.3 + Math.random() * 0.6,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.02,
      swayOffset: Math.random() * Math.PI * 2,
      opacity: 0.55 + Math.random() * 0.3,
      color
    };
  }

  if (season === 'summer') {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: 2.5 + Math.random() * 4.5,
      speedY: -0.25 - Math.random() * 0.45,
      speedX: (Math.random() - 0.5) * 0.4,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
      opacity: 0.35 + Math.random() * 0.45,
      color
    };
  }

  if (season === 'autumn') {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: 8 + Math.random() * 7,
      speedY: 0.75 + Math.random() * 1.0,
      speedX: 0.4 + Math.random() * 0.7,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.03,
      swayOffset: Math.random() * Math.PI * 2,
      opacity: 0.6 + Math.random() * 0.3,
      color
    };
  }

  // winter
  const depth = 0.4 + Math.random() * 0.6;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: (2 + Math.random() * 3.5) * depth,
    speedY: (0.5 + Math.random() * 0.9) * depth,
    speedX: (Math.random() - 0.5) * 0.4,
    swayOffset: Math.random() * Math.PI * 2,
    opacity: 0.4 + depth * 0.45,
    color
  };
}

function drawPetal(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(
    -p.size * 0.5,
    -p.size * 0.6,
    -p.size,
    p.size * 0.3,
    0,
    p.size
  );
  ctx.bezierCurveTo(
    p.size,
    p.size * 0.3,
    p.size * 0.5,
    -p.size * 0.6,
    0,
    0
  );
  ctx.fill();
  ctx.restore();
}

function drawFirefly(ctx, p, isDark) {
  ctx.save();
  const alpha = p.opacity * (0.55 + 0.45 * Math.sin(p.pulse));
  ctx.globalAlpha = Math.max(0.1, alpha);
  const radius = p.size * (isDark ? 2.4 : 2.0);
  const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
  grad.addColorStop(0, p.color);
  grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMapleLeaf(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  const s = p.size * 0.6;
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.5, -s * 0.3);
  ctx.lineTo(s, -s * 0.2);
  ctx.lineTo(s * 0.4, s * 0.3);
  ctx.lineTo(s * 0.6, s);
  ctx.lineTo(0, s * 0.5);
  ctx.lineTo(-s * 0.6, s);
  ctx.lineTo(-s * 0.4, s * 0.3);
  ctx.lineTo(-s, -s * 0.2);
  ctx.lineTo(-s * 0.5, -s * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSnowflake(ctx, p, isDark) {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = isDark ? p.color : '#38bdf8';
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function SeasonalCanvas() {
  const canvasRef = useRef(null);
  const { season, particlesEnabled, seasonMeta } = useSeason();
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !particlesEnabled) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = null;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const count = isMobile
      ? seasonMeta.particleCountMobile
      : seasonMeta.particleCountDesktop;

    const particles = Array.from({ length: count }, () =>
      createParticle(width, height, season)
    );

    let tick = 0;

    const renderLoop = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      tick += 0.015;
      ctx.clearRect(0, 0, width, height);
      const isDark = theme === 'dark';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (season === 'spring') {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(tick + p.swayOffset) * 0.45;
          p.angle += p.spin;
          if (p.y > height + 20) {
            p.y = -15;
            p.x = Math.random() * width;
          }
          if (p.x > width + 20) p.x = -15;
          drawPetal(ctx, p);
        } else if (season === 'summer') {
          p.y += p.speedY;
          p.x += p.speedX + Math.cos(tick + p.pulse) * 0.2;
          p.pulse += p.pulseSpeed;
          if (p.y < -20) {
            p.y = height + 15;
            p.x = Math.random() * width;
          }
          if (p.x < -20) p.x = width + 15;
          if (p.x > width + 20) p.x = -15;
          drawFirefly(ctx, p, isDark);
        } else if (season === 'autumn') {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(tick * 1.2 + p.swayOffset) * 0.7;
          p.angle += p.spin;
          if (p.y > height + 20) {
            p.y = -15;
            p.x = Math.random() * width;
          }
          if (p.x > width + 20) p.x = -15;
          drawMapleLeaf(ctx, p);
        } else {
          p.y += p.speedY;
          p.x += p.speedX + Math.sin(tick + p.swayOffset) * 0.35;
          if (p.y > height + 15) {
            p.y = -10;
            p.x = Math.random() * width;
          }
          if (p.x > width + 15) p.x = -10;
          if (p.x < -15) p.x = width + 10;
          drawSnowflake(ctx, p, isDark);
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [season, particlesEnabled, seasonMeta, theme]);

  if (!particlesEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="seasonal-canvas"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
}
```

Write `src/features/season/SeasonSwitcher.jsx`:
```jsx
import { useState, useRef, useEffect } from 'react';
import { useSeason } from '../../context/SeasonContext';

export function SeasonSwitcher() {
  const {
    season,
    setSeason,
    isAutoSeason,
    resetToAutoSeason,
    particlesEnabled,
    toggleParticles,
    seasonMeta,
    seasons
  } = useSeason();

  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <div className="season-switcher" ref={containerRef}>
      <button
        type="button"
        className="season-switcher-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Pilih musim (saat ini: ${seasonMeta.labelId})`}
        title={`Tema Musim: ${seasonMeta.labelId} (${seasonMeta.labelEn})`}
      >
        <span className="season-emoji" aria-hidden="true">
          {seasonMeta.emoji}
        </span>
        <span className="season-label">{seasonMeta.labelId}</span>
        <i
          className={`fa-solid fa-chevron-down season-chevron ${open ? 'open' : ''}`}
          aria-hidden="true"
        ></i>
      </button>

      {open && (
        <div className="season-dropdown-menu" role="menu" aria-label="Pilihan Musim">
          <div className="season-dropdown-header">
            <span>Suasana Musim</span>
            {isAutoSeason && <span className="season-auto-tag">Auto</span>}
          </div>

          <div className="season-options-grid">
            {Object.values(seasons).map((item) => {
              const isActive = item.id === season;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  className={`season-option-btn ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setSeason(item.id);
                    setOpen(false);
                  }}
                >
                  <span className="season-option-emoji">{item.emoji}</span>
                  <div className="season-option-text">
                    <strong>{item.labelId}</strong>
                    <small>{item.labelEn}</small>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="season-dropdown-footer">
            <button
              type="button"
              className="season-toggle-particles-btn"
              onClick={toggleParticles}
            >
              <span>
                <i className="fa-solid fa-wand-magic-sparkles"></i> Efek Animasi
              </span>
              <span className={`season-status-pill ${particlesEnabled ? 'on' : 'off'}`}>
                {particlesEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            {!isAutoSeason && (
              <button
                type="button"
                className="season-reset-auto-btn"
                onClick={() => {
                  resetToAutoSeason();
                  setOpen(false);
                }}
              >
                <i className="fa-solid fa-rotate-left"></i> Ikuti Kalender Otomatis
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/features/season/SeasonSwitcher.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```powershell
git add src/features/season/SeasonalCanvas.jsx src/features/season/SeasonSwitcher.jsx src/features/season/SeasonSwitcher.test.jsx
git commit -m "feat: add 4-season HTML5 canvas particle engine and SeasonSwitcher UI"
```

---

### Task 5: Global Styles, Seasonal CSS Variables, & Media Queries

**Files:**
- Create: `src/styles/variables.css`
- Move & Modify: `public/css/style.css` -> `src/styles/global.css`
- Move: `public/css/mediaqueries.css` -> `src/styles/mediaqueries.css`

**Interfaces:**
- Consumes: `html[data-theme="..."]` and `html[data-season="..."]` attributes set by `ThemeContext` and `SeasonContext`
- Produces: Complete styling for the React portfolio, Privacy Policy, 404 page, SeasonSwitcher, and Seasonal Hero Badge

- [ ] **Step 1: Move existing CSS files from `public/css/` into `src/styles/`**

Run:
```powershell
New-Item -ItemType Directory -Force -Path src/styles | Out-Null
git mv public/css/style.css src/styles/global.css
git mv public/css/mediaqueries.css src/styles/mediaqueries.css
```

- [ ] **Step 2: Create `src/styles/variables.css` with Light/Dark and 4-Season (`spring`, `summer`, `autumn`, `winter`) CSS Custom Properties and Season UI classes**

Write `src/styles/variables.css`:
```css
/* ==========================================================================
   SEASONAL & THEME CSS CUSTOM PROPERTIES
   ========================================================================== */

:root,
html[data-season="spring"] {
  --season-accent: #ec4899;
  --season-accent-soft: rgba(236, 72, 153, 0.12);
  --season-glow: rgba(244, 114, 182, 0.25);
  --season-badge-bg: #fdf2f8;
  --season-badge-text: #be185d;
  --season-badge-border: rgba(236, 72, 153, 0.3);
}

html[data-theme="dark"][data-season="spring"] {
  --season-accent: #f472b6;
  --season-accent-soft: rgba(244, 114, 182, 0.16);
  --season-glow: rgba(244, 114, 182, 0.3);
  --season-badge-bg: rgba(131, 24, 67, 0.45);
  --season-badge-text: #fbcfe8;
  --season-badge-border: rgba(244, 114, 182, 0.35);
}

html[data-season="summer"] {
  --season-accent: #f59e0b;
  --season-accent-soft: rgba(245, 158, 11, 0.12);
  --season-glow: rgba(251, 191, 36, 0.25);
  --season-badge-bg: #fffbeb;
  --season-badge-text: #b45309;
  --season-badge-border: rgba(245, 158, 11, 0.35);
}

html[data-theme="dark"][data-season="summer"] {
  --season-accent: #fbbf24;
  --season-accent-soft: rgba(251, 191, 36, 0.16);
  --season-glow: rgba(251, 191, 36, 0.3);
  --season-badge-bg: rgba(120, 53, 15, 0.45);
  --season-badge-text: #fde68a;
  --season-badge-border: rgba(251, 191, 36, 0.35);
}

html[data-season="autumn"] {
  --season-accent: #ea580c;
  --season-accent-soft: rgba(234, 88, 12, 0.12);
  --season-glow: rgba(249, 115, 22, 0.25);
  --season-badge-bg: #fff7ed;
  --season-badge-text: #c2410c;
  --season-badge-border: rgba(234, 88, 12, 0.35);
}

html[data-theme="dark"][data-season="autumn"] {
  --season-accent: #fb923c;
  --season-accent-soft: rgba(251, 146, 60, 0.16);
  --season-glow: rgba(251, 146, 60, 0.3);
  --season-badge-bg: rgba(124, 45, 18, 0.45);
  --season-badge-text: #fed7aa;
  --season-badge-border: rgba(251, 146, 60, 0.35);
}

html[data-season="winter"] {
  --season-accent: #0284c7;
  --season-accent-soft: rgba(2, 132, 199, 0.12);
  --season-glow: rgba(56, 189, 248, 0.25);
  --season-badge-bg: #f0f9ff;
  --season-badge-text: #0369a1;
  --season-badge-border: rgba(2, 132, 199, 0.35);
}

html[data-theme="dark"][data-season="winter"] {
  --season-accent: #38bdf8;
  --season-accent-soft: rgba(56, 189, 248, 0.16);
  --season-glow: rgba(56, 189, 248, 0.3);
  --season-badge-bg: rgba(12, 74, 110, 0.45);
  --season-badge-text: #bae6fd;
  --season-badge-border: rgba(56, 189, 248, 0.35);
}

/* ==========================================================================
   SEASON SWITCHER & SEASONAL HERO BADGE STYLES
   ========================================================================== */

.season-switcher {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.season-switcher-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.42rem 0.85rem;
  border-radius: var(--radius-pill);
  border: 1px solid var(--season-badge-border);
  background: var(--season-badge-bg);
  color: var(--season-badge-text);
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.season-switcher-trigger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--season-glow);
}

.season-chevron {
  font-size: 0.7rem;
  transition: transform var(--transition-fast);
}

.season-chevron.open {
  transform: rotate(180deg);
}

.season-dropdown-menu {
  position: absolute;
  top: calc(100% + 0.6rem);
  right: 0;
  width: 250px;
  background: var(--bg-primary);
  border: 1px solid var(--bg-card-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 0.75rem;
  z-index: 1200;
}

.season-dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
  margin-bottom: 0.55rem;
  padding: 0 0.25rem;
}

.season-auto-tag {
  background: var(--season-badge-bg);
  color: var(--season-badge-text);
  border: 1px solid var(--season-badge-border);
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-pill);
  font-size: 0.68rem;
}

.season-options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.45rem;
  margin-bottom: 0.65rem;
}

.season-option-btn {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.6rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--bg-card-border);
  background: var(--bg-card);
  color: var(--text-primary);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.season-option-btn:hover {
  border-color: var(--season-accent);
}

.season-option-btn.active {
  background: var(--season-badge-bg);
  border-color: var(--season-accent);
  color: var(--season-badge-text);
}

.season-option-emoji {
  font-size: 1.15rem;
}

.season-option-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.season-option-text strong {
  font-size: 0.8rem;
}

.season-option-text small {
  font-size: 0.68rem;
  opacity: 0.8;
}

.season-dropdown-footer {
  border-top: 1px solid var(--border-light);
  padding-top: 0.55rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.season-toggle-particles-btn,
.season-reset-auto-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.42rem 0.6rem;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: var(--bg-card-alt);
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
}

.season-reset-auto-btn {
  justify-content: center;
  gap: 0.4rem;
  color: var(--season-accent);
  background: transparent;
}

.season-status-pill {
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-pill);
  font-size: 0.68rem;
  font-weight: 700;
}

.season-status-pill.on {
  background: var(--season-badge-bg);
  color: var(--season-badge-text);
}

.season-status-pill.off {
  background: var(--bg-card-border);
  color: var(--text-muted);
}

.hero-season-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.85rem;
  margin-bottom: 0.65rem;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
  font-weight: 600;
  background: var(--season-badge-bg);
  color: var(--season-badge-text);
  border: 1px solid var(--season-badge-border);
  box-shadow: 0 2px 10px var(--season-glow);
}

/* Subtle seasonal accents on active filter chip and hero image ring */
#profile .section__pic-container img {
  box-shadow: 0 12px 32px var(--season-glow);
  border: 3px solid var(--season-badge-border);
  transition: box-shadow var(--transition-normal), border-color var(--transition-normal);
}

.filter-chip.active {
  border-color: var(--season-accent) !important;
  box-shadow: 0 4px 14px var(--season-glow);
}

main,
nav,
footer,
.floating-actions,
.project-modal-backdrop {
  position: relative;
  z-index: 2;
}
```

- [ ] **Step 3: Commit the migrated and modularized CSS files**

```powershell
git add src/styles/variables.css src/styles/global.css src/styles/mediaqueries.css
git commit -m "style: migrate portfolio CSS to src/styles and add 4-season CSS custom properties"
```

---

### Task 6: Custom Hooks (`usePortfolioData`, `usePrivacyPolicy`, `useScrollReveal`) & Layout Components (`Navbar`, `Footer`, `FloatingActions`)

**Files:**
- Create: `src/hooks/usePortfolioData.js`
- Create: `src/hooks/usePrivacyPolicy.js`
- Create: `src/hooks/useScrollReveal.js`
- Create: `src/components/layout/Navbar.jsx`
- Create: `src/components/layout/Footer.jsx`
- Create: `src/components/layout/FloatingActions.jsx`

**Interfaces:**
- Consumes: `db` from `src/services/firebase.js`, `FALLBACK_*` from `src/data/fallbackData.js`, `useTheme()` from `src/context/ThemeContext.jsx`, `<SeasonSwitcher />` from `src/features/season/SeasonSwitcher.jsx`
- Produces:
  - `usePortfolioData(): { projects, skills, siteSettings, contactSettings }`
  - `usePrivacyPolicy(): { policy }`
  - `useScrollReveal(deps?: any[]): void`
  - `<Navbar variant="home" | "policy" />`
  - `<Footer variant="home" | "policy" siteName={string} />`
  - `<FloatingActions whatsapp={string} />`

- [ ] **Step 1: Create `src/hooks/usePortfolioData.js`, `src/hooks/usePrivacyPolicy.js`, and `src/hooks/useScrollReveal.js`**

Write `src/hooks/usePortfolioData.js`:
```javascript
import { useState, useEffect } from 'react';
import { collection, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import {
  FALLBACK_PROJECTS,
  FALLBACK_SKILLS,
  FALLBACK_SITE_SETTINGS,
  FALLBACK_CONTACT_SETTINGS
} from '../data/fallbackData';

function normalizeAssetPath(path, defaultPath) {
  if (!path) return defaultPath;
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('/')
  ) {
    return path;
  }
  return `/${path}`;
}

export function usePortfolioData() {
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);
  const [skills, setSkills] = useState(FALLBACK_SKILLS);
  const [siteSettings, setSiteSettings] = useState(FALLBACK_SITE_SETTINGS);
  const [contactSettings, setContactSettings] = useState(FALLBACK_CONTACT_SETTINGS);

  useEffect(() => {
    if (!db) return;

    const unsubProjects = onSnapshot(
      query(collection(db, 'projects'), orderBy('order', 'asc')),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            items.push({
              id: docSnap.id,
              ...data,
              image: normalizeAssetPath(data.image, '/assets/images/portfolio-1.png')
            });
          });
          setProjects(items);
        }
      },
      (err) => console.warn('Firestore projects listener (using fallback):', err)
    );

    const unsubSkills = onSnapshot(
      query(collection(db, 'skills'), orderBy('order', 'asc')),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = [];
          snapshot.forEach((docSnap) => {
            items.push({ id: docSnap.id, ...docSnap.data() });
          });
          setSkills(items);
        }
      },
      (err) => console.warn('Firestore skills listener (using fallback):', err)
    );

    const unsubSite = onSnapshot(
      doc(db, 'settings', 'site_settings'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSiteSettings((prev) => ({
            ...prev,
            ...data,
            heroImage: normalizeAssetPath(data.heroImage, prev.heroImage),
            aboutImage: normalizeAssetPath(data.aboutImage, prev.aboutImage),
            cvUrl: normalizeAssetPath(data.cvUrl, prev.cvUrl)
          }));
        }
      },
      (err) => console.warn('Firestore site_settings listener (using fallback):', err)
    );

    const unsubContact = onSnapshot(
      doc(db, 'settings', 'contact_settings'),
      (docSnap) => {
        if (docSnap.exists()) {
          setContactSettings((prev) => ({ ...prev, ...docSnap.data() }));
        }
      },
      (err) => console.warn('Firestore contact_settings listener (using fallback):', err)
    );

    return () => {
      unsubProjects();
      unsubSkills();
      unsubSite();
      unsubContact();
    };
  }, []);

  return { projects, skills, siteSettings, contactSettings };
}
```

Write `src/hooks/usePrivacyPolicy.js`:
```javascript
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FALLBACK_PRIVACY_POLICY } from '../data/fallbackData';

export function usePrivacyPolicy() {
  const [policy, setPolicy] = useState(FALLBACK_PRIVACY_POLICY);

  useEffect(() => {
    if (!db) return;

    const unsub = onSnapshot(
      doc(db, 'settings', 'privacy_policy'),
      (docSnap) => {
        if (docSnap.exists()) {
          setPolicy((prev) => ({ ...prev, ...docSnap.data() }));
        }
      },
      (err) => console.warn('Firestore privacy_policy listener (using fallback):', err)
    );

    return () => unsub();
  }, []);

  return { policy };
}
```

Write `src/hooks/useScrollReveal.js`:
```javascript
import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll('.reveal-on-scroll');
    if (!elements.length) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      elements.forEach((el) => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: '0px 0px -40px 0px', threshold: 0.12 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
```

- [ ] **Step 2: Create `src/components/layout/Navbar.jsx`, `src/components/layout/Footer.jsx`, and `src/components/layout/FloatingActions.jsx`**

Write `src/components/layout/Navbar.jsx`:
```jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useTheme } from '../../context/ThemeContext';
import { SeasonSwitcher } from '../../features/season/SeasonSwitcher';

export function Navbar({ variant = 'home', siteName = 'Vinsensius Arka' }) {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const isDark = theme === 'dark';

  return (
    <>
      <nav
        id="desktop-nav"
        className={`${variant === 'policy' ? 'policy-nav' : ''} ${scrolled ? 'scrolled' : ''}`.trim()}
      >
        <div className="logo">
          {variant === 'policy' ? (
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              {siteName}
            </Link>
          ) : (
            <a href="#profile">{siteName}</a>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {variant === 'policy' ? (
            <>
              <ul className="nav-links policy-nav-links">
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/#projects">Projects</Link>
                </li>
                <li>
                  <Link to="/#contact">Contact</Link>
                </li>
              </ul>
              <Link to="/" className="btn btn-color-1 btn-nav-back">
                <i className="fa-solid fa-arrow-left"></i> Back to Portfolio
              </Link>
            </>
          ) : (
            <ul className="nav-links">
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#experience">Experience</a>
              </li>
              <li>
                <a href="#projects">Projects</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          )}

          <SeasonSwitcher />

          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <i className={isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}></i>
          </button>
        </div>
      </nav>

      <nav id="hamburger-nav" className={scrolled ? 'scrolled' : ''}>
        <div className="logo">
          {variant === 'policy' ? (
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              {siteName}
            </Link>
          ) : (
            <a href="#profile">{siteName}</a>
          )}
        </div>

        <div className="hamburger-menu">
          <SeasonSwitcher />

          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <i className={isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}></i>
          </button>

          <button
            type="button"
            className={`hamburger-icon ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul className={`menu-links ${menuOpen ? 'open' : ''}`} id="mobile-menu">
            {variant === 'policy' ? (
              <>
                <li>
                  <Link to="/" onClick={closeMenu}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/#about" onClick={closeMenu}>
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/#projects" onClick={closeMenu}>
                    Projects
                  </Link>
                </li>
                <li>
                  <Link to="/#contact" onClick={closeMenu}>
                    Contact
                  </Link>
                </li>
                <li style={{ padding: '0.5rem 1rem' }}>
                  <Link
                    to="/"
                    onClick={closeMenu}
                    className="btn btn-color-1"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      fontSize: '0.88rem',
                      padding: '0.65rem 1rem'
                    }}
                  >
                    <i className="fa-solid fa-arrow-left"></i> Back to Portfolio
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <a href="#about" onClick={closeMenu}>
                    About
                  </a>
                </li>
                <li>
                  <a href="#experience" onClick={closeMenu}>
                    Experience
                  </a>
                </li>
                <li>
                  <a href="#projects" onClick={closeMenu}>
                    Projects
                  </a>
                </li>
                <li>
                  <a href="#contact" onClick={closeMenu}>
                    Contact
                  </a>
                </li>
                <li>
                  <Link to="/privacy-policy" onClick={closeMenu}>
                    Privacy Policy
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </>
  );
}
```

Write `src/components/layout/Footer.jsx`:
```jsx
import { Link } from 'react-router';

export function Footer({ variant = 'home', siteName = 'Vinsensius Arka' }) {
  const currentYear = new Date().getFullYear();

  if (variant === 'policy') {
    return (
      <footer className="policy-footer">
        <p>
          Copyright &#169; <span id="current-year">{currentYear}</span> {siteName}. All
          Rights Reserved.
        </p>
      </footer>
    );
  }

  return (
    <footer>
      <nav aria-label="Footer navigation">
        <ul className="nav-links">
          <li>
            <a href="#about">About</a>
          </li>
          <li>
            <a href="#experience">Experience</a>
          </li>
          <li>
            <a href="#projects">Projects</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
          <li>
            <Link to="/privacy-policy">Privacy Policy</Link>
          </li>
        </ul>
      </nav>
      <p>
        Copyright &#169; <span id="current-year">{currentYear}</span> {siteName}. All
        Rights Reserved.
      </p>
    </footer>
  );
}
```

Write `src/components/layout/FloatingActions.jsx`:
```jsx
import { useState, useEffect } from 'react';

export function FloatingActions({ whatsapp = '6285179793167' }) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cleanWa = String(whatsapp || '6285179793167').replace(/\D/g, '');

  return (
    <div className="floating-actions" aria-label="Quick action buttons">
      <button
        type="button"
        id="back-to-top-btn"
        className={`back-to-top-btn ${showBackToTop ? 'show' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        title="Back to top"
      >
        <i className="fa-solid fa-arrow-up"></i>
      </button>
      <a
        href={`https://api.whatsapp.com/send?phone=${cleanWa}`}
        className="float whatsapp-float-btn"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <i className="fa-brands fa-whatsapp my-float"></i>
      </a>
    </div>
  );
}
```

- [ ] **Step 3: Run test suite to verify no regressions**

Run: `npm test`
Expected: PASS

- [ ] **Step 4: Commit**

```powershell
git add src/hooks/usePortfolioData.js src/hooks/usePrivacyPolicy.js src/hooks/useScrollReveal.js src/components/layout/Navbar.jsx src/components/layout/Footer.jsx src/components/layout/FloatingActions.jsx
git commit -m "feat: add Firestore hooks and Navbar, Footer, and FloatingActions layout components"
```

---

### Task 7: Portfolio Sections (`HeroSection`, `AboutSection`, `ExperienceSection`, `ProjectModal`, `ProjectsSection`, `ContactSection`)

**Files:**
- Create: `src/components/sections/HeroSection.jsx`
- Create: `src/components/sections/AboutSection.jsx`
- Create: `src/components/sections/ExperienceSection.jsx`
- Create: `src/components/sections/ProjectModal.jsx`
- Create: `src/components/sections/ProjectsSection.jsx`
- Create: `src/components/sections/ContactSection.jsx`
- Create: `src/components/sections/ProjectsSection.test.jsx`

**Interfaces:**
- Consumes: `useSeason()` from `src/context/SeasonContext.jsx`, `formatRichDescription` from `src/utils/formatDescription.js`
- Produces:
  - `<HeroSection siteSettings={object} contactSettings={object} />`
  - `<AboutSection siteSettings={object} />`
  - `<ExperienceSection skills={array} />`
  - `<ProjectModal project={object|null} onClose={function} />`
  - `<ProjectsSection projects={array} />`
  - `<ContactSection contactSettings={object} />`

- [ ] **Step 1: Write the failing component tests for `ProjectsSection` and `ProjectModal` (including Review Focus #4 and #5)**

Write `src/components/sections/ProjectsSection.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectsSection } from './ProjectsSection';
import { FALLBACK_PROJECTS } from '../../data/fallbackData';

describe('ProjectsSection & ProjectModal', () => {
  it('filters projects by category (including technology-inferred matches) and resets empty search results (Review Focus #4)', () => {
    render(<ProjectsSection projects={FALLBACK_PROJECTS} />);

    // Initially all 9 fallback projects are rendered
    expect(screen.getAllByRole('article')).toHaveLength(9);

    // Filter by Mobile App -> Mozaic POS App (Flutter)
    fireEvent.click(screen.getByRole('tab', { name: /Mobile App/i }));
    const mobileCards = screen.getAllByRole('article');
    expect(mobileCards).toHaveLength(1);
    expect(screen.getByText('Mozaic POS App')).toBeInTheDocument();

    // Search for a non-existent keyword in uppercase
    const searchInput = screen.getByPlaceholderText(/Search projects/i);
    fireEvent.change(searchInput, { target: { value: 'NONEXISTENT_TECH_XYZ' } });

    expect(screen.queryAllByRole('article')).toHaveLength(0);
    expect(screen.getByText(/No matching projects found/i)).toBeInTheDocument();

    // Click Reset Filters button
    fireEvent.click(screen.getByRole('button', { name: /Reset Filters/i }));
    expect(screen.getAllByRole('article')).toHaveLength(9);
  });

  it('opens Quick View modal on card click, closes on Escape, and does NOT open modal when clicking external GitHub/Live Demo links (Review Focus #5)', () => {
    render(<ProjectsSection projects={FALLBACK_PROJECTS} />);

    // Clicking external GitHub link inside card must NOT open modal
    const githubLinks = screen.getAllByRole('link', { name: /GitHub/i });
    fireEvent.click(githubLinks[0]);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Clicking card title/body opens Quick View modal
    fireEvent.click(screen.getByText('Kanisius High School'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Technologies Used')).toBeInTheDocument();

    // Pressing Escape closes modal
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/sections/ProjectsSection.test.jsx`
Expected: FAIL with `Cannot find module './ProjectsSection'`

- [ ] **Step 3: Implement `HeroSection`, `AboutSection`, `ExperienceSection`, `ProjectModal`, `ProjectsSection`, and `ContactSection`**

Write `src/components/sections/HeroSection.jsx`:
```jsx
import { useState, useEffect } from 'react';
import { useSeason } from '../../context/SeasonContext';

export function HeroSection({ siteSettings, contactSettings }) {
  const { seasonMeta } = useSeason();
  const roles =
    Array.isArray(siteSettings.typewriterRoles) &&
    siteSettings.typewriterRoles.length > 0
      ? siteSettings.typewriterRoles
      : ['Web Developer', 'Mobile Developer'];

  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentRole = roles[roleIndex % roles.length];
    const typeSpeed = isDeleting ? 45 : 95;

    const timer = setTimeout(() => {
      if (!isDeleting && displayText === currentRole) {
        setTimeout(() => setIsDeleting(true), 1600);
      } else if (isDeleting && displayText === '') {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % roles.length);
      } else {
        setDisplayText(
          currentRole.substring(0, displayText.length + (isDeleting ? -1 : 1))
        );
      }
    }, typeSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, roleIndex, roles]);

  const cvHref = siteSettings.cvBase64 || siteSettings.cvUrl || '/assets/docs/cv-vinsensiusarka.pdf';
  const isBase64Cv = Boolean(siteSettings.cvBase64);

  return (
    <section id="profile">
      <div className="section__pic-container">
        <img
          id="hero-img"
          src={siteSettings.heroImage || '/assets/images/arko-pic.png'}
          alt={`Portrait of ${siteSettings.name || 'Vinsensius Arka'}`}
          width="380"
          height="380"
        />
      </div>
      <div className="section__text">
        <div className="hero-season-badge" aria-label={`Active season: ${seasonMeta.labelEn}`}>
          <span>{seasonMeta.badgeText}</span>
        </div>
        <p className="section__text__p1">{siteSettings.heroGreeting || "Hello, I'm"}</p>
        <h1 className="title">{siteSettings.name || 'Vinsensius Arka'}</h1>
        <p className="section__text__p2">
          <span className="typeWriter">{displayText || roles[0]}</span>
        </p>
        <div className="btn-container">
          <a
            href={cvHref}
            download={
              isBase64Cv || cvHref.endsWith('.pdf')
                ? siteSettings.cvFileName || 'CV-VinsensiusArka.pdf'
                : undefined
            }
            target={!isBase64Cv && cvHref.startsWith('http') ? '_blank' : undefined}
            rel={!isBase64Cv && cvHref.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="btn btn-color-2"
          >
            <i className="fa-solid fa-file-arrow-down"></i> Download CV
          </a>
          <a href="#contact" className="btn btn-color-1">
            <i className="fa-solid fa-paper-plane"></i> Contact Info
          </a>
        </div>
        <div id="socials-container">
          <a
            href={contactSettings.linkedin || 'https://www.linkedin.com/in/vinsensiusarka/'}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            aria-label="LinkedIn Profile"
          >
            <i className="fa-brands fa-linkedin"></i>
          </a>
          <a
            href={contactSettings.github || 'https://github.com/vinsensiusarko'}
            target="_blank"
            rel="noopener noreferrer"
            className="social-link"
            aria-label="GitHub Profile"
          >
            <i className="fa-brands fa-github"></i>
          </a>
        </div>
      </div>
    </section>
  );
}
```

Write `src/components/sections/AboutSection.jsx`:
```jsx
export function AboutSection({ siteSettings }) {
  return (
    <section id="about" className="reveal-on-scroll">
      <p className="section__text__p1">Get To Know More</p>
      <h2 className="title">About Me</h2>
      <div className="section-container">
        <div className="section__pic-container about-pic-wrapper">
          <img
            id="about-img"
            src={siteSettings.aboutImage || '/assets/images/arko-about.jpg'}
            alt={`${siteSettings.name || 'Vinsensius Arka'} personal photo`}
            width="380"
            height="380"
            style={{ borderRadius: 'var(--radius-card)', objectFit: 'cover' }}
            loading="lazy"
          />
        </div>
        <div className="about-details-container">
          <div className="about-containers">
            <div className="details-container">
              <i className="fa-solid fa-briefcase about-card-icon"></i>
              <h3>Experience</h3>
              <p>
                {siteSettings.expYears || '3+ years'} <br />
                {siteSettings.expSub || 'Web & Mobile Development'}
              </p>
            </div>
            <div className="details-container">
              <i className="fa-solid fa-graduation-cap about-card-icon"></i>
              <h3>Education</h3>
              <p>
                {siteSettings.eduDegree || 'Bachelors Degree'} <br />
                {siteSettings.eduMajor || 'Computer Science'}
              </p>
            </div>
          </div>
          <div className="text-container">
            <p>{siteSettings.bioText}</p>
          </div>
        </div>
      </div>
      <div className="arrow">
        <a href="#experience" aria-label="Scroll down to Experience section">
          <i className="fa-solid fa-chevron-down"></i>
        </a>
      </div>
    </section>
  );
}
```

Write `src/components/sections/ExperienceSection.jsx`:
```jsx
function SkillIcon({ skill }) {
  if (
    String(skill.name || '').toLowerCase() === 'flutter' ||
    skill.iconType === 'svg'
  ) {
    return (
      <svg
        className="skill-icon"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M14.314 0L2.3 12 6 15.7 21.684.013h-7.357zm.014 11.072L7.857 17.53l6.47 6.47H21.7l-6.46-6.468 6.46-6.46h-7.37z" />
      </svg>
    );
  }
  return <i className={`${skill.iconClass || 'fa-solid fa-code'} skill-icon`}></i>;
}

export function ExperienceSection({ skills }) {
  const languages = skills.filter((s) => s.category === 'language');
  const tools = skills.filter((s) => s.category === 'framework_tool');

  return (
    <section id="experience" className="reveal-on-scroll">
      <p className="section__text__p1">Explore My</p>
      <h2 className="title">Experience &amp; Skills</h2>
      <div className="experience-details-container">
        <div className="experience-box">
          <h3 className="experience-sub-title">Programming Languages</h3>
          <div className="article-container">
            {languages.map((skill) => (
              <div className="skill-item" key={skill.id || skill.name}>
                <SkillIcon skill={skill} />
                <div className="skill-info">
                  <h3>{skill.name}</h3>
                  <p>{skill.level || 'Experienced'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="experience-box">
          <h3 className="experience-sub-title">Frameworks &amp; Tools</h3>
          <div className="article-container">
            {tools.map((skill) => (
              <div className="skill-item" key={skill.id || skill.name}>
                <SkillIcon skill={skill} />
                <div className="skill-info">
                  <h3>{skill.name}</h3>
                  <p>{skill.level || 'Experienced'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="arrow">
        <a href="#projects" aria-label="Scroll down to Projects section">
          <i className="fa-solid fa-chevron-down"></i>
        </a>
      </div>
    </section>
  );
}
```

Write `src/components/sections/ProjectModal.jsx`:
```jsx
import { useEffect } from 'react';
import { formatRichDescription } from '../../utils/formatDescription';

export function ProjectModal({ project, onClose }) {
  useEffect(() => {
    if (!project) return;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const imgSrc = project.image || '/assets/images/portfolio-1.png';
  const isComingSoon = Boolean(project.isComingSoon) || (!project.demoUrl && !project.githubUrl);
  const techList = Array.isArray(project.techStack) ? project.techStack : [];
  const isPlayStore =
    project.demoLabel === 'Play Store' ||
    String(project.demoUrl || '').includes('play.google.com');

  return (
    <div
      id="project-detail-modal"
      className="project-modal-backdrop show"
      aria-hidden="false"
      role="dialog"
      aria-labelledby="modal-project-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="project-modal-dialog">
        <button
          type="button"
          className="project-modal-close"
          aria-label="Close project details"
          id="modal-close-btn"
          onClick={onClose}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="project-modal-image-wrapper">
          <div
            id="modal-project-backdrop"
            className="project-modal-backdrop-bg"
            style={{ backgroundImage: `url('${imgSrc}')` }}
          ></div>
          <img id="modal-project-img" src={imgSrc} alt={`${project.title} preview`} />
          <span id="modal-project-category" className="project-category-badge">
            {project.category || 'Project'}
          </span>
        </div>

        <div className="project-modal-content">
          <div className="project-modal-header">
            <h3 id="modal-project-title">{project.title}</h3>
            <div id="modal-project-status">
              {isComingSoon ? (
                <span className="badge-coming-soon">
                  <i className="fa-solid fa-clock"></i> Coming Soon
                </span>
              ) : (
                <span
                  className="badge-coming-soon"
                  style={{ color: '#10b981', borderColor: '#10b981' }}
                >
                  <i className="fa-solid fa-check"></i> Live Project
                </span>
              )}
            </div>
          </div>

          <div
            id="modal-project-desc"
            className="project-modal-desc"
            dangerouslySetInnerHTML={{
              __html: formatRichDescription(project.description || '')
            }}
          />

          <div className="project-modal-tech">
            <h4>Technologies Used</h4>
            <div id="modal-project-tech-list" className="tech-badge-container">
              {techList.map((tech) => (
                <span className="tech-pill" key={tech}>
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="project-modal-actions" id="modal-project-actions">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-color-2 btn-sm"
              >
                <i className="fa-brands fa-github"></i> GitHub Repository
              </a>
            )}
            {!project.isComingSoon && project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-color-1 btn-sm"
              >
                <i
                  className={
                    isPlayStore
                      ? 'fa-brands fa-google-play'
                      : 'fa-solid fa-arrow-up-right-from-square'
                  }
                ></i>{' '}
                {project.demoLabel || 'Live Demo'}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

Write `src/components/sections/ProjectsSection.jsx`:
```jsx
import { useState, useMemo } from 'react';
import { formatRichDescription } from '../../utils/formatDescription';
import { ProjectModal } from './ProjectModal';

const FILTER_CHIPS = [
  { label: 'All Projects', value: 'all' },
  { label: 'Mobile App', value: 'Mobile Application' },
  { label: 'Web App', value: 'Web Application' },
  { label: 'Web Portal', value: 'Web Portal' },
  { label: 'Backend API', value: 'Backend API' }
];

function matchesProjectFilter(project, categoryFilter, searchQuery) {
  const category = String(project.category || '').toLowerCase();
  const tech = (project.techStack || []).join(', ').toLowerCase();
  const title = String(project.title || '').toLowerCase();
  const desc = String(project.description || '').toLowerCase();

  let matchesCategory = false;
  if (categoryFilter === 'all') {
    matchesCategory = true;
  } else {
    const targetFilter = categoryFilter.toLowerCase();
    matchesCategory = category.includes(targetFilter);
    if (!matchesCategory) {
      if (
        targetFilter.includes('mobile') &&
        (category.includes('mobile') || tech.includes('flutter'))
      ) {
        matchesCategory = true;
      } else if (
        targetFilter.includes('web application') &&
        (category.includes('web application') || category.includes('enterprise'))
      ) {
        matchesCategory = true;
      } else if (
        targetFilter.includes('web portal') &&
        (category.includes('portal') ||
          tech.includes('wordpress') ||
          tech.includes('laravel'))
      ) {
        matchesCategory = true;
      } else if (
        targetFilter.includes('backend') &&
        (category.includes('backend') ||
          tech.includes('node') ||
          tech.includes('express'))
      ) {
        matchesCategory = true;
      }
    }
  }

  let matchesSearch = true;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    matchesSearch =
      title.includes(q) ||
      tech.includes(q) ||
      desc.includes(q) ||
      category.includes(q);
  }

  return matchesCategory && matchesSearch;
}

export function ProjectsSection({ projects }) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  const filteredProjects = useMemo(() => {
    const trimmed = searchQuery.trim();
    return projects.filter((p) =>
      matchesProjectFilter(p, categoryFilter, trimmed)
    );
  }, [projects, categoryFilter, searchQuery]);

  const resetFilters = () => {
    setCategoryFilter('all');
    setSearchQuery('');
  };

  return (
    <section id="projects" className="reveal-on-scroll">
      <p className="section__text__p1">Browse My Recent</p>
      <h2 className="title">Projects</h2>

      <div className="project-controls">
        <div className="project-search-box">
          <i className="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            id="project-search-input"
            className="project-search-input"
            placeholder="Search projects by title or tech stack (e.g. Flutter, React, Laravel)..."
            aria-label="Search projects"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery.length > 0 && (
            <button
              type="button"
              id="project-search-clear"
              className="project-search-clear"
              aria-label="Clear search"
              onClick={() => setSearchQuery('')}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>

        <div
          className="project-filter-chips"
          role="tablist"
          aria-label="Filter projects by category"
        >
          {FILTER_CHIPS.map((chip) => {
            const isActive = categoryFilter === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                className={`filter-chip ${isActive ? 'active' : ''}`}
                data-filter={chip.value}
                role="tab"
                aria-selected={isActive}
                onClick={() => setCategoryFilter(chip.value)}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div id="projects-empty-state" className="projects-empty-state">
          <i className="fa-solid fa-folder-open empty-icon"></i>
          <h3>No matching projects found</h3>
          <p>Try searching for a different keyword or choose another category.</p>
          <button
            type="button"
            className="btn btn-color-2 btn-sm"
            id="reset-filter-btn"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((proj) => {
            const imgSrc = proj.image || '/assets/images/portfolio-1.png';
            const isComingSoon = Boolean(proj.isComingSoon);
            const isPlayStore =
              proj.demoLabel === 'Play Store' ||
              String(proj.demoUrl || '').includes('play.google.com');

            return (
              <article
                key={proj.id || proj.title}
                className="project-card"
                data-category={proj.category || 'Web Application'}
                data-tech={(proj.techStack || []).join(', ')}
                onClick={(e) => {
                  if (e.target.closest('.project-btn-container a')) return;
                  setSelectedProject(proj);
                }}
              >
                <div className="project-img-wrapper" title="Click to view details">
                  <div
                    className="project-img-backdrop"
                    style={{ backgroundImage: `url('${imgSrc}')` }}
                  ></div>
                  <img
                    src={imgSrc}
                    alt={`${proj.title} preview`}
                    loading="lazy"
                    decoding="async"
                    className="project-img-main"
                  />
                  <span className="project-quick-view-badge">
                    <i className="fa-solid fa-expand"></i> Quick View
                  </span>
                </div>

                <div className="project-content">
                  <h3 className="project-title">{proj.title}</h3>
                  <div
                    className="project-desc"
                    dangerouslySetInnerHTML={{
                      __html: formatRichDescription(proj.description || '')
                    }}
                  />
                  <div className="project-btn-container">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-color-2 btn-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <i className="fa-brands fa-github"></i> GitHub
                      </a>
                    )}

                    {isComingSoon ? (
                      <span className="badge-coming-soon">
                        <i className="fa-solid fa-clock"></i> Coming Soon
                      </span>
                    ) : proj.demoUrl ? (
                      <a
                        href={proj.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-color-1 btn-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <i
                          className={
                            isPlayStore
                              ? 'fa-brands fa-google-play'
                              : 'fa-solid fa-arrow-up-right-from-square'
                          }
                        ></i>{' '}
                        {proj.demoLabel || 'Live Demo'}
                      </a>
                    ) : (
                      !proj.githubUrl && (
                        <span className="badge-coming-soon">
                          <i className="fa-solid fa-clock"></i> Coming Soon
                        </span>
                      )
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="arrow">
        <a href="#contact" aria-label="Scroll down to Contact section">
          <i className="fa-solid fa-chevron-down"></i>
        </a>
      </div>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
```

Write `src/components/sections/ContactSection.jsx`:
```jsx
import { useState } from 'react';

export function ContactSection({ contactSettings }) {
  const [toastMessage, setToastMessage] = useState('');

  const email = contactSettings.email || 'me@vinsensiusarka.id';

  const handleCopyEmail = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      }
      setToastMessage(`Copied ${email} to clipboard!`);
      setTimeout(() => setToastMessage(''), 2500);
    } catch (err) {
      setToastMessage('Copied to clipboard!');
      setTimeout(() => setToastMessage(''), 2500);
    }
  };

  return (
    <>
      <section id="contact" className="reveal-on-scroll">
        <p className="section__text__p1">Get In Touch</p>
        <h2 className="title">Contact Me</h2>
        <div className="contact-grid">
          <a
            href={`mailto:${email}`}
            className="contact-card"
            aria-label={`Send email to ${email}`}
          >
            <div className="contact-card-icon">
              <i className="fa-solid fa-envelope"></i>
            </div>
            <div className="contact-card-info">
              <span className="contact-card-label">Email</span>
              <span className="contact-card-value">{email}</span>
            </div>
            <button
              type="button"
              className="contact-copy-btn"
              onClick={handleCopyEmail}
              aria-label="Copy email address"
              title="Copy email to clipboard"
            >
              <i className="fa-regular fa-copy"></i>
            </button>
          </a>

          <a
            href={contactSettings.linkedin || 'https://www.linkedin.com/in/vinsensiusarka/'}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card"
            aria-label="LinkedIn profile"
          >
            <div className="contact-card-icon">
              <i className="fa-brands fa-linkedin"></i>
            </div>
            <div className="contact-card-info">
              <span className="contact-card-label">LinkedIn</span>
              <span className="contact-card-value">Vinsensius Arka</span>
            </div>
          </a>

          <a
            href={contactSettings.github || 'https://github.com/vinsensiusarko'}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card"
            aria-label="GitHub profile"
          >
            <div className="contact-card-icon">
              <i className="fa-brands fa-github"></i>
            </div>
            <div className="contact-card-info">
              <span className="contact-card-label">GitHub</span>
              <span className="contact-card-value">vinsensiusarko</span>
            </div>
          </a>

          <a
            href={contactSettings.instagram || 'https://www.instagram.com/vinsensiusarko/'}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card"
            aria-label="Instagram profile"
          >
            <div className="contact-card-icon">
              <i className="fa-brands fa-instagram"></i>
            </div>
            <div className="contact-card-info">
              <span className="contact-card-label">Instagram</span>
              <span className="contact-card-value">@vinsensiusarko</span>
            </div>
          </a>

          <a
            href={contactSettings.facebook || 'https://www.facebook.com/vinsensiusarko/'}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card"
            aria-label="Facebook profile"
          >
            <div className="contact-card-icon">
              <i className="fa-brands fa-facebook"></i>
            </div>
            <div className="contact-card-info">
              <span className="contact-card-label">Facebook</span>
              <span className="contact-card-value">Vinsensius Arka</span>
            </div>
          </a>

          <a
            href={contactSettings.twitter || 'https://x.com/vinsensiusarko'}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card"
            aria-label="X Twitter profile"
          >
            <div className="contact-card-icon">
              <i className="fa-brands fa-x-twitter"></i>
            </div>
            <div className="contact-card-info">
              <span className="contact-card-label">X / Twitter</span>
              <span className="contact-card-value">@vinsensiusarko</span>
            </div>
          </a>
        </div>
      </section>

      <div
        id="public-toast"
        className={`public-toast ${toastMessage ? 'show' : ''}`}
        role="alert"
        aria-live="polite"
      >
        {toastMessage && (
          <>
            <i className="fa-solid fa-circle-check" style={{ color: '#10b981' }}></i>{' '}
            {toastMessage}
          </>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/components/sections/ProjectsSection.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```powershell
git add src/components/sections/HeroSection.jsx src/components/sections/AboutSection.jsx src/components/sections/ExperienceSection.jsx src/components/sections/ProjectModal.jsx src/components/sections/ProjectsSection.jsx src/components/sections/ContactSection.jsx src/components/sections/ProjectsSection.test.jsx
git commit -m "feat: implement portfolio sections and interactive ProjectsSection modal and filters"
```

---

### Task 8: Pages (`HomePage`, `PrivacyPolicyPage`, `NotFoundPage`), App Router, & Entry Point

**Files:**
- Create: `src/pages/HomePage.jsx`
- Create: `src/pages/PrivacyPolicyPage.jsx`
- Create: `src/pages/NotFoundPage.jsx`
- Create: `src/App.jsx`
- Create: `src/main.jsx`
- Create: `src/App.test.jsx`

**Interfaces:**
- Consumes: All hooks, contexts, layout components, section components, and `SeasonalCanvas`
- Produces:
  - `src/pages/HomePage.jsx`: `<HomePage />`
  - `src/pages/PrivacyPolicyPage.jsx`: `<PrivacyPolicyPage />`
  - `src/pages/NotFoundPage.jsx`: `<NotFoundPage />`
  - `src/App.jsx`: `<App />`
  - `src/main.jsx`: React root mount

- [ ] **Step 1: Write the failing route integration test in `src/App.test.jsx`**

Write `src/App.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AppRoutes } from './App';
import { ThemeProvider } from './context/ThemeContext';
import { SeasonProvider } from './context/SeasonContext';

function renderRoute(initialEntry = '/') {
  return render(
    <ThemeProvider>
      <SeasonProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <AppRoutes />
        </MemoryRouter>
      </SeasonProvider>
    </ThemeProvider>
  );
}

describe('App routing integration', () => {
  it('renders HomePage at / with Hero, About, Experience, Projects, and Contact sections', () => {
    renderRoute('/');
    expect(screen.getByRole('heading', { name: /Vinsensius Arka/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /About Me/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Projects/i })).toBeInTheDocument();
  });

  it('renders PrivacyPolicyPage at /privacy-policy', () => {
    renderRoute('/privacy-policy');
    expect(screen.getByRole('heading', { name: /Privacy Policy/i })).toBeInTheDocument();
    expect(screen.getByText(/Google Play Store Compliant/i)).toBeInTheDocument();
  });

  it('renders NotFoundPage at unknown routes', () => {
    renderRoute('/some-non-existent-page');
    expect(screen.getByRole('heading', { name: /Oops!/i })).toBeInTheDocument();
    expect(screen.getByText(/Halaman yang Anda cari tidak ditemukan/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/App.test.jsx`
Expected: FAIL with `Cannot find module './App'`

- [ ] **Step 3: Implement `src/pages/HomePage.jsx`, `src/pages/PrivacyPolicyPage.jsx`, `src/pages/NotFoundPage.jsx`, `src/App.jsx`, and `src/main.jsx`**

Write `src/pages/HomePage.jsx`:
```jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { FloatingActions } from '../components/layout/FloatingActions';
import { HeroSection } from '../components/sections/HeroSection';
import { AboutSection } from '../components/sections/AboutSection';
import { ExperienceSection } from '../components/sections/ExperienceSection';
import { ProjectsSection } from '../components/sections/ProjectsSection';
import { ContactSection } from '../components/sections/ContactSection';

export function HomePage() {
  const { projects, skills, siteSettings, contactSettings } = usePortfolioData();
  const { hash } = useLocation();
  useScrollReveal();

  useEffect(() => {
    document.title = `${siteSettings.name || 'Vinsensius Arka'} — Web & Mobile Developer`;
  }, [siteSettings.name]);

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }
    }
  }, [hash]);

  return (
    <>
      <a href="#profile" className="skip-link">
        Skip to main content
      </a>
      <Navbar variant="home" siteName={siteSettings.name} />
      <main id="main-content">
        <HeroSection siteSettings={siteSettings} contactSettings={contactSettings} />
        <AboutSection siteSettings={siteSettings} />
        <ExperienceSection skills={skills} />
        <ProjectsSection projects={projects} />
        <ContactSection contactSettings={contactSettings} />
      </main>
      <Footer variant="home" siteName={siteSettings.name} />
      <FloatingActions whatsapp={contactSettings.whatsapp} />
    </>
  );
}
```

Write `src/pages/PrivacyPolicyPage.jsx`:
```jsx
import { useEffect } from 'react';
import { Link } from 'react-router';
import { usePrivacyPolicy } from '../hooks/usePrivacyPolicy';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { FloatingActions } from '../components/layout/FloatingActions';

export function PrivacyPolicyPage() {
  const { policy } = usePrivacyPolicy();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    document.title = `${policy.title || 'Privacy Policy'} - ${policy.developerName || 'Vinsensius Arka'}`;
  }, [policy.title, policy.developerName]);

  const cleanWebsite = String(policy.contactWebsite || 'https://vinsensiusarka.id')
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');

  return (
    <>
      <Navbar variant="policy" siteName={policy.developerName || 'Vinsensius Arka'} />
      <main className="policy-wrapper">
        <header className="policy-header-section">
          <p className="section__text__p1" id="policy-subtitle">
            {policy.subtitle}
          </p>
          <h1 className="title" id="policy-title">
            {policy.title}
          </h1>
          <div className="policy-meta-badges">
            <span className="policy-pill-badge" id="badge-compliance">
              <i className="fa-solid fa-shield-halved"></i> {policy.complianceBadge}
            </span>
            <span className="policy-pill-badge" id="badge-last-updated">
              <i className="fa-regular fa-calendar-check"></i> Last Updated:{' '}
              {policy.lastUpdated}
            </span>
            <span className="policy-pill-badge" id="badge-developer">
              <i className="fa-solid fa-code"></i> Developer: {policy.developerName}
            </span>
          </div>
        </header>

        <div className="about-containers policy-highlight-grid">
          <div className="details-container color-container">
            <i className="fa-solid fa-user-shield policy-card-icon"></i>
            <h3 id="highlight-1-title">{policy.highlight1Title}</h3>
            <p id="highlight-1-desc">{policy.highlight1Desc}</p>
          </div>
          <div className="details-container color-container">
            <i className="fa-solid fa-lock policy-card-icon"></i>
            <h3 id="highlight-2-title">{policy.highlight2Title}</h3>
            <p id="highlight-2-desc">{policy.highlight2Desc}</p>
          </div>
          <div className="details-container color-container">
            <i className="fa-solid fa-trash-can policy-card-icon"></i>
            <h3 id="highlight-3-title">{policy.highlight3Title}</h3>
            <p id="highlight-3-desc">{policy.highlight3Desc}</p>
          </div>
        </div>

        <div className="details-container policy-toc-box">
          <h3>
            <i className="fa-solid fa-list-ul"></i> Quick Navigation
          </h3>
          <div className="policy-toc-links">
            <a href="#section-1">1. Scope</a>
            <a href="#section-2">2. Data Collection</a>
            <a href="#section-3">3. App Permissions</a>
            <a href="#section-4">4. How We Use Data</a>
            <a href="#section-5">5. Third-Party Services</a>
            <a href="#section-6">6. Data Retention</a>
            <a href="#section-7">7. Data Deletion</a>
            <a href="#section-8">8. Children&apos;s Privacy</a>
            <a href="#section-9">9. Security</a>
            <a href="#section-10">10. Policy Updates</a>
            <a href="#section-11">11. Contact Info</a>
          </div>
        </div>

        <div className="policy-doc-container">
          <div id="section-1" className="policy-block">
            <h2>
              <span>1</span> Introduction &amp; Scope
            </h2>
            <p id="section-1-p1">{policy.sectionScope}</p>
            <p>
              We respect your personal privacy and are committed to safeguarding
              user data through transparency and security. By downloading,
              installing, or accessing any of our mobile applications, you agree
              to the collection and use of information in accordance with this
              Privacy Policy.
            </p>
          </div>

          <div id="section-2" className="policy-block">
            <h2>
              <span>2</span> Information We Collect
            </h2>
            <p id="section-2-intro">{policy.sectionDataCollection}</p>
            <h3>A. Information You Provide Directly</h3>
            <ul>
              <li>
                <strong>Account &amp; Profile Details:</strong> If an application
                includes account registration or authentication, we may collect
                your name, email address, username, phone number, and
                business/store name (for commercial applications such as
                point-of-sale systems).
              </li>
              <li>
                <strong>Operational &amp; Transaction Data:</strong> In business
                productivity applications, data entered by you (such as sales
                records, product catalogs, customer receipts, or inventory) is
                stored securely to enable core app functions.
              </li>
              <li>
                <strong>Customer Support Communications:</strong> If you contact
                us for technical assistance, bug reports, or feature requests, we
                collect your email address, inquiry details, and any screenshots
                or logs you provide.
              </li>
            </ul>
            <h3>B. Information Collected Automatically (Diagnostic Data)</h3>
            <p>
              When you run our mobile apps, automated telemetry and performance
              data may be logged by our systems or verified third-party SDKs to
              diagnose crashes and optimize reliability:
            </p>
            <ul>
              <li>
                <strong>Device Telemetry:</strong> Device model, manufacturer,
                Android OS version, system language, screen resolution, and
                network state.
              </li>
              <li>
                <strong>Crash Logs &amp; Diagnostics:</strong> Real-time stack
                traces, memory state at time of crash, and error reports
                generated via Google Play Console and Firebase Crashlytics.
              </li>
            </ul>
          </div>

          <div id="section-3" className="policy-block">
            <h2>
              <span>3</span> Application Device Permissions
            </h2>
            <p id="section-3-intro">{policy.sectionPermissions}</p>
            <div className="policy-permission-grid">
              <div className="permission-item">
                <div className="permission-icon">
                  <i className="fa-solid fa-camera"></i>
                </div>
                <div className="permission-text">
                  <strong>Camera</strong>
                  <p>
                    Used strictly when you scan product barcodes, QR codes, or
                    take item photos. Never accessed in the background.
                  </p>
                </div>
              </div>
              <div className="permission-item">
                <div className="permission-icon">
                  <i className="fa-solid fa-folder-open"></i>
                </div>
                <div className="permission-text">
                  <strong>Storage / Files / Media</strong>
                  <p>
                    Used to export PDF/Excel sales reports, create local database
                    backups, or import product images from your gallery.
                  </p>
                </div>
              </div>
              <div className="permission-item">
                <div className="permission-icon">
                  <i className="fa-solid fa-wifi"></i>
                </div>
                <div className="permission-text">
                  <strong>Internet / Network State</strong>
                  <p>
                    Required to synchronize transactions with cloud databases,
                    verify license status, and download updates.
                  </p>
                </div>
              </div>
              <div className="permission-item">
                <div className="permission-icon">
                  <i className="fa-solid fa-bell"></i>
                </div>
                <div className="permission-text">
                  <strong>Notifications</strong>
                  <p>
                    Used to deliver operational alerts, transaction
                    confirmations, or system status updates.
                  </p>
                </div>
              </div>
            </div>
            <p className="policy-hint">
              <i className="fa-solid fa-circle-info"></i> You can modify or
              revoke any permission at any time via your device settings (
              <em>Settings &gt; Apps &gt; [App Name] &gt; Permissions</em>).
            </p>
          </div>

          <div id="section-4" className="policy-block">
            <h2>
              <span>4</span> How We Use Your Information
            </h2>
            <p>
              We process collected information exclusively for valid, legitimate
              purposes:
            </p>
            <ul>
              <li>
                To operate, maintain, and deliver all core features of our mobile
                applications.
              </li>
              <li>
                To manage authentication, user accounts, and data
                synchronization.
              </li>
              <li>
                To identify, debug, and resolve crashes, errors, and performance
                bottlenecks.
              </li>
              <li>
                To respond to user inquiries, provide customer support, and
                process feedback.
              </li>
              <li>
                To maintain security, prevent unauthorized usage, and protect
                user accounts.
              </li>
              <li>
                To comply with applicable legal obligations and Google Play
                Developer policies.
              </li>
            </ul>
            <div className="policy-alert-box">
              <i className="fa-solid fa-circle-check"></i>
              <div>
                <strong>Strict Commitment:</strong> We do <strong>NOT</strong>{' '}
                sell, rent, monetize, or trade your personal data to data
                brokers, advertising networks, or third parties.
              </div>
            </div>
          </div>

          <div id="section-5" className="policy-block">
            <h2>
              <span>5</span> Third-Party Service Providers
            </h2>
            <p id="section-5-intro">{policy.sectionThirdParty}</p>
            <div className="third-party-cards">
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="third-party-card"
              >
                <div className="tp-info">
                  <i className="fa-brands fa-google-play"></i>
                  <div>
                    <strong>Google Play Services</strong>
                    <p>Android core system features, licensing, and security APIs</p>
                  </div>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square tp-arrow"></i>
              </a>
              <a
                href="https://firebase.google.com/policies/analytics"
                target="_blank"
                rel="noopener noreferrer"
                className="third-party-card"
              >
                <div className="tp-info">
                  <i className="fa-solid fa-chart-line"></i>
                  <div>
                    <strong>Google Analytics for Firebase</strong>
                    <p>Aggregated app performance benchmarks and usage metrics</p>
                  </div>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square tp-arrow"></i>
              </a>
              <a
                href="https://firebase.google.com/terms/crashlytics"
                target="_blank"
                rel="noopener noreferrer"
                className="third-party-card"
              >
                <div className="tp-info">
                  <i className="fa-solid fa-bug"></i>
                  <div>
                    <strong>Firebase Crashlytics</strong>
                    <p>Real-time application crash reporting and stability diagnostics</p>
                  </div>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square tp-arrow"></i>
              </a>
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="third-party-card"
              >
                <div className="tp-info">
                  <i className="fa-solid fa-rectangle-ad"></i>
                  <div>
                    <strong>Google AdMob</strong> (if enabled)
                    <p>Displaying non-intrusive in-app advertisements</p>
                  </div>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square tp-arrow"></i>
              </a>
            </div>
          </div>

          <div id="section-6" className="policy-block">
            <h2>
              <span>6</span> Data Retention Policy
            </h2>
            <p>
              We retain personal data and application records only for as long as
              necessary to fulfill the purposes set out in this Privacy Policy,
              maintain active user accounts, or comply with legal, tax, and
              accounting standards. When data is no longer needed, it is
              permanently deleted, anonymized, or securely isolated from further
              processing.
            </p>
          </div>

          <div id="section-7" className="policy-block">
            <h2>
              <span>7</span> User Rights &amp; Data Deletion (Google Play Compliance)
            </h2>
            <p id="section-7-p1">{policy.sectionDataDeletion}</p>
            <ul>
              <li>
                <strong>Right to Access:</strong> You may request a copy of the
                personal information we hold about you.
              </li>
              <li>
                <strong>Right to Rectification:</strong> You may request
                correction of any inaccurate or outdated information.
              </li>
              <li>
                <strong>Right to Erasure (Data Deletion):</strong> You may
                request permanent deletion of your account and associated
                personal data.
              </li>
            </ul>
            <div className="deletion-instruction-card">
              <h3>
                <i className="fa-solid fa-envelope-open-text"></i> How to Request
                Account &amp; Data Deletion
              </h3>
              <p>
                To request permanent deletion of your account and any personal
                data associated with our applications, please send an email to:
              </p>
              <div className="email-highlight">
                <a
                  id="deletion-email-link"
                  href={`mailto:${policy.contactEmail}?subject=Data%20Deletion%20Request`}
                >
                  <i className="fa-solid fa-paper-plane"></i>{' '}
                  <span id="deletion-email-text">{policy.contactEmail}</span>
                </a>
              </div>
              <ul className="deletion-steps">
                <li>
                  <strong>Subject:</strong>{' '}
                  <code>Data Deletion Request - [Application Name]</code>
                </li>
                <li>
                  <strong>Details:</strong> Provide your registered email address
                  or account username.
                </li>
                <li>
                  <strong>Timeline:</strong> Your request will be fulfilled
                  within <strong>30 days</strong>, and you will receive a
                  confirmation email upon completion.
                </li>
              </ul>
            </div>
          </div>

          <div id="section-8" className="policy-block">
            <h2>
              <span>8</span> Children&apos;s Privacy (COPPA Compliance)
            </h2>
            <p>
              Our applications and services are not directed toward children
              under the age of 13. We do not knowingly collect or solicit
              personally identifiable information from children under 13.
            </p>
          </div>

          <div id="section-9" className="policy-block">
            <h2>
              <span>9</span> Security of Your Information
            </h2>
            <p>
              We implement administrative, technical, and physical
              safeguards—including SSL/TLS encryption for all data
              transmissions—to protect your personal information against
              unauthorized access, destruction, loss, or alteration.
            </p>
          </div>

          <div id="section-10" className="policy-block">
            <h2>
              <span>10</span> Changes to This Privacy Policy
            </h2>
            <p>
              We may update our Privacy Policy periodically to reflect
              enhancements in our applications or updates to Google Play
              Developer policies. Any modifications will be posted directly to
              this page with an updated &quot;Last Updated&quot; timestamp at the top.
            </p>
          </div>

          <div id="section-11" className="policy-block">
            <h2>
              <span>11</span> Developer Contact Information
            </h2>
            <p id="section-11-contact">{policy.sectionContact}</p>
            <div className="developer-card">
              <div className="dev-item">
                <i className="fa-solid fa-user"></i>
                <div>
                  <span className="label">Developer</span>
                  <span className="val" id="contact-dev-name">
                    {policy.developerName}
                  </span>
                </div>
              </div>
              <div className="dev-item">
                <i className="fa-solid fa-envelope"></i>
                <div>
                  <span className="label">Email</span>
                  <a
                    className="val"
                    id="contact-email-link"
                    href={`mailto:${policy.contactEmail}`}
                  >
                    {policy.contactEmail}
                  </a>
                </div>
              </div>
              <div className="dev-item">
                <i className="fa-solid fa-globe"></i>
                <div>
                  <span className="label">Website</span>
                  <a
                    className="val"
                    id="contact-website-link"
                    href={policy.contactWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {cleanWebsite}
                  </a>
                </div>
              </div>
              <div className="dev-item">
                <i className="fa-brands fa-github"></i>
                <div>
                  <span className="label">GitHub</span>
                  <a
                    className="val"
                    href="https://github.com/vinsensiusarko"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    vinsensiusarko
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="policy-action-buttons">
          <Link to="/" className="btn btn-color-1 btn-wide">
            <i className="fa-solid fa-arrow-left"></i> Back to Portfolio
          </Link>
          <a
            id="bottom-contact-btn"
            href={`mailto:${policy.contactEmail}`}
            className="btn btn-color-2 btn-wide"
          >
            <i className="fa-solid fa-envelope"></i> Contact Developer
          </a>
        </div>
      </main>
      <Footer variant="policy" siteName={policy.developerName || 'Vinsensius Arka'} />
      <FloatingActions />
    </>
  );
}
```

Write `src/pages/NotFoundPage.jsx`:
```jsx
import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        textAlign: 'center'
      }}
    >
      <div
        className="main"
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '500px'
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          width="470"
          height="290"
          viewBox="0 0 470 290"
          style={{ width: '100%', height: 'auto' }}
        >
          <defs>
            <path
              className="fundo"
              id="prefix__a"
              d="M5.063 128.67c-2.513 15.192 5.633 31.093 17.898 38.941 5.99 3.832 13.34 6.528 16.471 13.254 4.868 10.452-3.879 22.437-13.113 28.515-9.236 6.078-20.5 10.9-24.704 21.683-2.771 7.108-1.685 15.387 1.058 22.507 10.06 26.112 39.393 37.547 65.479 36.15 26.086-1.396 50.827-12.407 76.416-18.075 87.873-19.465 180.005 24.717 267.728 4.47 13.65-3.151 27.4-8.081 37.943-17.99 11.883-11.167 18.632-28.016 19.65-45.023.97-16.225-4.34-34.495-17.744-41.806-7.834-4.273-17.196-4.1-25.7-1.774-5.43 1.483-10.767 3.808-16.369 3.848-5.601.038-11.763-3-13.386-8.808-1.707-6.107 2.182-12.41 6.642-16.577 9.072-8.474 21.203-12.707 29.441-22.126 7.927-9.063 11.264-22.574 8.574-34.716-2.692-12.141-11.326-22.538-22.188-26.715-27.683-10.645-57.844 18.377-86.152 9.873-2.101-.63-4.312-1.605-5.418-3.641-1.08-1.988-.834-4.51-.214-6.716 3.468-12.348 16.939-20.21 17.528-33.102.32-7.008-3.504-13.564-8.325-18.251-33.126-32.2-81.125 6.102-114.9 18.194-55.542 19.884-112.157 36.49-167.849 55.963-20.81 7.275-44.91 18.606-48.766 41.922z"
            />
          </defs>
          <g fill="none" fillRule="evenodd">
            <path
              fill="transparent"
              d="M0 0H1366V800H0z"
              transform="translate(-448 -157)"
            />
            <g transform="translate(-448 -157) translate(448 157)">
              <mask id="prefix__b" fill="#fff">
                <use xlinkHref="#prefix__a" />
              </mask>
              <use fill="var(--bg-card)" xlinkHref="#prefix__a" />
              <path
                fill="var(--bg-card-alt)"
                fillRule="nonzero"
                d="M-14.199 211.2H481.36V301.2H-14.199z"
                mask="url(#prefix__b)"
              />
              <path
                fill="#4B4B62"
                className="path dash"
                fillRule="nonzero"
                stroke="#4B4B62"
                strokeWidth="2"
                d="M198.754 186c1.56 0 2.246-.703 2.246-2.3v-41.4c0-1.597-.686-2.3-2.246-2.3h-9.608c-1.56 0-2.247.703-2.247 2.3v19.678h-5.802c-1.185 0-1.934-.83-1.934-2.172V142.3c0-1.597-.686-2.3-2.246-2.3h-9.67c-1.56 0-2.247.703-2.247 2.3v22.425c0 7.283 3.244 10.606 11.355 10.606H186.9v8.369c0 1.597.687 2.3 2.247 2.3h9.608zm32.277 1c15.3 0 18.969-5.248 18.969-13.056V152.12c0-7.808-3.67-13.12-18.969-13.12-15.3 0-19.031 5.312-19.031 13.12v21.824c0 7.808 3.732 13.056 19.031 13.056zm.969-12c-4.25 0-5-1.27-5-2.986v-17.091c0-1.652.75-2.923 5-2.923 4.313 0 5 1.27 5 2.923v17.09c0 1.716-.688 2.987-5 2.987zm62.754 11c1.56 0 2.246-.703 2.246-2.3v-41.4c0-1.597-.686-2.3-2.246-2.3h-9.608c-1.56 0-2.247.703-2.247 2.3v19.678h-5.802c-1.185 0-1.934-.83-1.934-2.172V142.3c0-1.597-.686-2.3-2.246-2.3h-9.67c-1.56 0-2.247.703-2.247 2.3v22.425c0 7.283 3.244 10.606 11.355 10.606H282.9v8.369c0 1.597.687 2.3 2.247 2.3h9.608z"
              />
            </g>
          </g>
        </svg>
      </div>
      <div className="text_sorry">
        <h1 className="title" style={{ marginBottom: '0.5rem' }}>
          Oops!
        </h1>
        <p style={{ marginBottom: '1.5rem' }}>
          Halaman yang Anda cari tidak ditemukan.
        </p>
        <Link to="/" className="btn btn-color-1">
          <i className="fa-solid fa-arrow-left"></i> Back to Portfolio
        </Link>
      </div>
    </div>
  );
}
```

Write `src/App.jsx`:
```jsx
import { BrowserRouter, Routes, Route } from 'react-router';
import { ThemeProvider } from './context/ThemeContext';
import { SeasonProvider } from './context/SeasonContext';
import { SeasonalCanvas } from './features/season/SeasonalCanvas';
import { HomePage } from './pages/HomePage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function AppRoutes() {
  return (
    <>
      <SeasonalCanvas />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/privacy-policy.html" element={<PrivacyPolicyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SeasonProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </SeasonProvider>
    </ThemeProvider>
  );
}
```

Write `src/main.jsx`:
```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import './styles/mediaqueries.css';
import './styles/variables.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 4: Run test suite and Vite production build to verify**

Run: `npm test && npm run build`
Expected: All tests PASS and `vite build` succeeds, generating `dist/index.html`, `dist/assets/`, `dist/admin/index.html`, and `dist/js/firebase-config.js`.

- [ ] **Step 5: Commit**

```powershell
git add src/pages/HomePage.jsx src/pages/PrivacyPolicyPage.jsx src/pages/NotFoundPage.jsx src/App.jsx src/main.jsx src/App.test.jsx
git commit -m "feat: add HomePage, PrivacyPolicyPage, NotFoundPage, and React Router v7 setup"
```

---

### Task 9: Firebase Hosting (`firebase.json`) & GitHub Actions CI/CD Build Integration

**Files:**
- Modify: `firebase.json`
- Modify: `.github/workflows/firebase-hosting-merge.yml`
- Modify: `.github/workflows/firebase-hosting-pull-request.yml`

**Interfaces:**
- Consumes: `dist/` build output from `npm run build`
- Produces: Production-ready Firebase Hosting SPA + `/admin` routing configuration and automated GitHub Actions build-and-deploy pipelines

- [ ] **Step 1: Update `firebase.json` to serve `"dist"` with `/admin` rewrites and SPA fallback**

Write `firebase.json`:
```json
{
  "hosting": {
    "site": "vinsensiusarko",
    "public": "dist",
    "cleanUrls": true,
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/admin/**",
        "destination": "/admin/index.html"
      },
      {
        "source": "/admin",
        "destination": "/admin/index.html"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|webp|svg|ico|woff|woff2|ttf|eot)",
        "headers": [
          { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
        ]
      },
      {
        "source": "assets/**/*.@(css|js)",
        "headers": [
          { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
        ]
      },
      {
        "source": "**/*.@(html|htm)",
        "headers": [
          { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" },
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules"
  }
}
```

- [ ] **Step 2: Update `.github/workflows/firebase-hosting-merge.yml` and `.github/workflows/firebase-hosting-pull-request.yml` to run `npm ci && npm run build`**

Write `.github/workflows/firebase-hosting-merge.yml`:
```yaml
name: Deploy to Firebase Hosting on merge
'on':
  workflow_dispatch:
  push:
    branches:
      - main
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_VINSENSIUSARKO }}'
          channelId: live
          projectId: vinsensiusarko
```

Write `.github/workflows/firebase-hosting-pull-request.yml`:
```yaml
name: Deploy to Firebase Hosting on PR
'on': pull_request
jobs:
  build_and_preview:
    if: '${{ github.event.pull_request.head.repo.full_name == github.repository }}'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_VINSENSIUSARKO }}'
          projectId: vinsensiusarko
```

- [ ] **Step 3: Run full test suite and production build verification**

Run: `npm test && npm run build`
Expected:
- All Vitest test suites pass (`formatDescription.test.js`, `SeasonContext.test.jsx`, `SeasonSwitcher.test.jsx`, `ProjectsSection.test.jsx`, `App.test.jsx`).
- `dist/index.html`, `dist/admin/index.html`, `dist/js/firebase-config.js`, and `dist/assets/favicon.ico` exist in the build output.

- [ ] **Step 4: Commit**

```powershell
git add firebase.json .github/workflows/firebase-hosting-merge.yml .github/workflows/firebase-hosting-pull-request.yml
git commit -m "ci: configure Firebase Hosting and GitHub Actions for Vite React build"
```
