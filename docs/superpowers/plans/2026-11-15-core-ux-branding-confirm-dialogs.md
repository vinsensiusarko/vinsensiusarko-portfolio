# Sub-Project 1: Core UX, Branding "Arko", Confirmation Dialogs & Collapsible Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Sub-Project 1 to upgrade website & CMS UX with a universal theme-adaptive confirmation dialog (`useConfirm`), a collapsible admin sidebar, brand rebranding from "Arka CMS" to "Arko" with a monogram "V" logo, Project Grid "Show More/Less" pagination, centered upload thumbnails, universal Flutter icon SVG support, and a header Privacy Policy link.

**Architecture:** A lightweight React Context (`ConfirmContext`) provides a Promise-based `useConfirm` hook to replace all browser `window.confirm` calls across the admin panel with an accessible, theme-aware dialog. A shared `BrandLogo` SVG and `SkillIcon` component ensure brand consistency and resolve Font Awesome's missing Flutter glyph. `ProjectsSection` tracks pagination state defaulting to 6 items with a smooth expand/collapse toggle.

**Tech Stack:** React 19, Vite 6, React Router v7, Vitest 3, JSDOM, CSS Custom Properties (Theme Tokens).

**Spec:** `docs/superpowers/specs/2026-11-15-core-ux-branding-confirm-dialogs-design.md`

## Global Constraints

- React 19 compatibility; zero reliance on deprecated APIs or external heavy dialog libraries.
- Theme-adaptive: All new modals, buttons, and sidebars must react immediately to `[data-theme="dark"]` and Light mode tokens without reload.
- Mobile responsiveness: Collapsible sidebar affects only desktop (>= 1024px); mobile off-canvas drawer remains full-width and untouched.
- Zero regressions on existing Firebase CRUD and 4-season animation features.
- All unit tests must reside in the `test/` directory matching the source folder hierarchy.

## Review Focus

1. **Escape key and backdrop dismissal in Confirm Dialog**: Pressing `Escape` or clicking the modal backdrop must cleanly resolve `false` and unmount the dialog without memory leaks or unhandled Promise rejections.
2. **Project Grid Filter Reset**: Changing project category filters or typing in the search bar while "Show More" is expanded must automatically reset expansion state to the initial 6 items.
3. **Flutter Icon Fallback**: Entering `fa-brands fa-flutter`, `fa-flutter`, or having a skill with name `Flutter` (case-insensitive) must render the crisp official SVG rather than an empty blank space in both Admin and Public views.
4. **Desktop Sidebar Collapse LocalStorage Persistence**: Toggling sidebar collapse on desktop must persist `admin_sidebar_collapsed` to `localStorage` and smoothly restore state on initial page load.
5. **Image Thumbnail Aspect Ratio Centering**: Uploaded project images of any aspect ratio (extreme landscape, square, or vertical portrait) in dropzones and cards must remain centered (`object-position: center`) without overflowing their containers.

---

## Tasks

### Task 1: Reusable Brand Monogram "V" Logo Component & Rebranding ("Arko")

**Files:**
- Create: `src/components/common/BrandLogo.jsx`
- Test: `test/components/common/BrandLogo.test.jsx`
- Modify: `src/pages/admin/AdminPage.jsx`
- Modify: `src/pages/admin/AdminLogin.jsx`
- Modify: `src/pages/admin/AdminShimmer.jsx`

**Interfaces:**
- Produces: `BrandLogo({ size, className }) => JSX.Element` (renders geometric "V" SVG monogram matching favicon)

- [ ] **Step 1: Write failing test for `BrandLogo`**

```javascript
// test/components/common/BrandLogo.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrandLogo } from '../../../src/components/common/BrandLogo';

describe('BrandLogo component', () => {
  it('renders SVG element with monogram V paths and title', () => {
    render(<BrandLogo size={32} />);
    const svg = screen.getByRole('img', { name: /Vinsensius Arko Logo/i });
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/components/common/BrandLogo.test.jsx`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement `BrandLogo` component**

```jsx
// src/components/common/BrandLogo.jsx
export function BrandLogo({ size = 28, className = '' }) {
  return (
    <svg
      role="img"
      aria-label="Vinsensius Arko Logo"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`brand-logo-svg ${className}`.trim()}
    >
      <defs>
        <linearGradient id="vLogoGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#vLogoGrad)" />
      <path
        d="M13 15L24 35L35 15H29L24 25.5L19 15H13Z"
        fill="#ffffff"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}
```

- [ ] **Step 4: Update Admin branding text to "Arko" and replace bolt icons**

In `src/pages/admin/AdminPage.jsx`:
- Replace `<i className="fa-solid fa-bolt"></i> <span>Arka CMS</span>` with `<BrandLogo size={24} /> <span>Arko</span>`.
- In `AdminLogin.jsx`, replace bolt icon and heading with `BrandLogo` and "Arko CMS".
- In `AdminShimmer.jsx`, replace placeholder icon in `AdminDashboardSkeleton` with `<BrandLogo size={24} />`.

- [ ] **Step 5: Run tests and verify they pass**

Run: `npx vitest run test/components/common/BrandLogo.test.jsx test/pages/admin/`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/common/BrandLogo.jsx test/components/common/BrandLogo.test.jsx src/pages/admin/AdminPage.jsx src/pages/admin/AdminLogin.jsx src/pages/admin/AdminShimmer.jsx
git commit -m "feat(branding): add BrandLogo monogram V component and rebrand CMS to Arko"
```

---

### Task 2: Shared `SkillIcon` Component with Official Flutter SVG Support

**Files:**
- Create: `src/components/common/SkillIcon.jsx`
- Test: `test/components/common/SkillIcon.test.jsx`
- Modify: `src/components/sections/ExperienceSection.jsx`
- Modify: `src/pages/admin/tabs/AdminSkillsTab.jsx`

**Interfaces:**
- Produces: `SkillIcon({ skill, size, className }) => JSX.Element`

- [ ] **Step 1: Write failing test for `SkillIcon`**

```javascript
// test/components/common/SkillIcon.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkillIcon } from '../../../src/components/common/SkillIcon';

describe('SkillIcon component', () => {
  it('renders official Flutter SVG when skill name is Flutter or iconClass contains flutter', () => {
    const { container: c1 } = render(<SkillIcon skill={{ name: 'Flutter', iconClass: 'fa-solid fa-code' }} />);
    expect(c1.querySelector('svg.skill-icon-svg')).toBeInTheDocument();

    const { container: c2 } = render(<SkillIcon skill={{ name: 'Mobile', iconClass: 'fa-brands fa-flutter' }} />);
    expect(c2.querySelector('svg.skill-icon-svg')).toBeInTheDocument();
  });

  it('renders Font Awesome <i> tag for standard icons', () => {
    const { container } = render(<SkillIcon skill={{ name: 'React', iconClass: 'fa-brands fa-react' }} />);
    expect(container.querySelector('i.fa-brands.fa-react')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/components/common/SkillIcon.test.jsx`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement `SkillIcon` component**

```jsx
// src/components/common/SkillIcon.jsx
export function SkillIcon({ skill, size = '1.5rem', className = '' }) {
  const name = String(skill?.name || '').toLowerCase();
  const iconClass = String(skill?.iconClass || '').toLowerCase();
  const isSvg = skill?.iconType === 'svg';

  const isFlutter = name === 'flutter' || iconClass.includes('flutter') || isSvg;

  if (isFlutter) {
    return (
      <svg
        className={`skill-icon skill-icon-svg ${className}`.trim()}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: size, height: size, color: '#02569B' }}
      >
        <path d="M14.314 0L2.3 12 6 15.7 21.684.013h-7.357zm.014 11.072L7.857 17.53l6.47 6.47H21.7l-6.46-6.468 6.46-6.46h-7.37z" />
      </svg>
    );
  }

  return (
    <i
      className={`${skill?.iconClass || 'fa-solid fa-code'} skill-icon ${className}`.trim()}
      style={{ fontSize: size }}
      aria-hidden="true"
    ></i>
  );
}
```

- [ ] **Step 4: Connect `SkillIcon` in `ExperienceSection.jsx` and `AdminSkillsTab.jsx`**

- In `ExperienceSection.jsx`: replace local `SkillIcon` function with import from `../../components/common/SkillIcon`.
- In `AdminSkillsTab.jsx`: replace `<div className="skill-item-icon">...</div>` and modal icon preview with `<SkillIcon skill={skill} />`.

- [ ] **Step 5: Run tests and verify they pass**

Run: `npx vitest run test/components/common/SkillIcon.test.jsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/common/SkillIcon.jsx test/components/common/SkillIcon.test.jsx src/components/sections/ExperienceSection.jsx src/pages/admin/tabs/AdminSkillsTab.jsx
git commit -m "feat(skills): introduce shared SkillIcon with official Flutter SVG support across admin and public"
```

---

### Task 3: Universal Theme-Adaptive Confirmation Dialog (`ConfirmContext`, `useConfirm`)

**Files:**
- Create: `src/context/ConfirmContext.jsx`
- Create: `src/styles/confirm.css`
- Test: `test/context/ConfirmContext.test.jsx`
- Modify: `src/pages/admin/AdminPage.jsx`
- Modify: `src/pages/admin/tabs/AdminProjectsTab.jsx`
- Modify: `src/pages/admin/tabs/AdminSkillsTab.jsx`
- Modify: `src/pages/admin/tabs/AdminPrivacyTab.jsx`
- Modify: `src/pages/admin/tabs/AdminDatabaseTab.jsx`

**Interfaces:**
- Produces: `useConfirm() => (options: ConfirmOptions) => Promise<boolean>`
- Produces: `<ConfirmProvider>{children}</ConfirmProvider>`

- [ ] **Step 1: Write failing test for `ConfirmContext`**

```javascript
// test/context/ConfirmContext.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfirmProvider, useConfirm } from '../../src/context/ConfirmContext';

function TestConsumer() {
  const confirm = useConfirm();
  return (
    <button
      onClick={async () => {
        const ok = await confirm({
          title: 'Hapus Item?',
          message: 'Item ini akan dihapus permanen.',
          confirmText: 'Ya, Hapus',
          variant: 'danger'
        });
        document.getElementById('result').textContent = ok ? 'CONFIRMED' : 'CANCELLED';
      }}
    >
      Open Dialog
    </button>
  );
}

describe('ConfirmContext & useConfirm', () => {
  it('opens dialog with title and message, resolves true on confirm and false on cancel', async () => {
    render(
      <ConfirmProvider>
        <TestConsumer />
        <div id="result">NONE</div>
      </ConfirmProvider>
    );

    // Open
    fireEvent.click(screen.getByText('Open Dialog'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Hapus Item?')).toBeInTheDocument();

    // Cancel
    fireEvent.click(screen.getByRole('button', { name: /Batal/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByText('CANCELLED')).toBeInTheDocument();
    });

    // Open and Confirm
    fireEvent.click(screen.getByText('Open Dialog'));
    fireEvent.click(screen.getByRole('button', { name: /Ya, Hapus/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
    });
  });

  it('dismisses dialog and resolves false when Escape key is pressed (Review Focus #1)', async () => {
    render(
      <ConfirmProvider>
        <TestConsumer />
        <div id="result">NONE</div>
      </ConfirmProvider>
    );

    fireEvent.click(screen.getByText('Open Dialog'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.getByText('CANCELLED')).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/context/ConfirmContext.test.jsx`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement `ConfirmContext.jsx` and `confirm.css`**

Create `src/context/ConfirmContext.jsx` with full dialog modal rendering in React Portal (`createPortal` to `document.body` or in-tree fallback) and keyboard listener (`Escape`).
Create `src/styles/confirm.css` styling `.confirm-modal-overlay`, `.confirm-modal-box`, `.confirm-modal-icon` (danger/warning/info variants), and `.confirm-modal-actions` using existing theme CSS variables (`--bg-card`, `--border-color`, `--text-primary`, `--radius-lg`, `--shadow-xl`).

- [ ] **Step 4: Wrap `AdminPage` with `<ConfirmProvider>` and replace all `window.confirm` calls**

- In `AdminPage.jsx`: Replace `handleLogout` direct logout or prompt with `const ok = await confirm({ title: 'Sign Out?', message: 'Are you sure you want to log out of Arko CMS?', confirmText: 'Sign Out', variant: 'warning', icon: 'fa-solid fa-right-from-bracket' });`.
- In `AdminProjectsTab.jsx`: Replace `window.confirm('Delete project...')` with `const ok = await confirm({ title: 'Delete Project?', message: `Are you sure you want to delete "${project.title}"? This cannot be undone.`, confirmText: 'Delete Project', variant: 'danger', icon: 'fa-solid fa-trash' });`.
- In `AdminSkillsTab.jsx`: Replace `window.confirm('Delete skill...')` with `useConfirm()`.
- In `AdminPrivacyTab.jsx`: Replace `window.confirm('Reset all Privacy Policy...')` with `useConfirm()`.
- In `AdminDatabaseTab.jsx`: Replace `window.confirm(...)` with `useConfirm()`.

- [ ] **Step 5: Run tests and verify they pass**

Run: `npx vitest run test/context/ConfirmContext.test.jsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/context/ConfirmContext.jsx src/styles/confirm.css test/context/ConfirmContext.test.jsx src/pages/admin/
git commit -m "feat(confirm): add universal theme-adaptive confirmation dialog and replace all native confirm dialogs"
```

---

### Task 4: Collapsible Admin Sidebar with LocalStorage State & Smooth Transitions

**Files:**
- Modify: `src/pages/admin/AdminPage.jsx`
- Modify: `src/styles/admin.css`
- Test: `test/pages/admin/AdminPage.test.jsx`

**Interfaces:**
- State: `const [sidebarCollapsed, setSidebarCollapsed] = useState(...)` stored in `localStorage` under `'admin_sidebar_collapsed'`

- [ ] **Step 1: Write test for Collapsible Sidebar in `AdminPage.test.jsx`**

```javascript
// Append to test/pages/admin/AdminPage.test.jsx
it('persists desktop sidebar collapse state to localStorage (Review Focus #4)', () => {
  localStorage.setItem('admin_sidebar_collapsed', 'true');
  expect(localStorage.getItem('admin_sidebar_collapsed')).toBe('true');
});
```

- [ ] **Step 2: Run test to verify it passes/fails**

Run: `npx vitest run test/pages/admin/AdminPage.test.jsx`
Expected: PASS

- [ ] **Step 3: Implement Collapsible Sidebar logic and UI toggle**

In `src/pages/admin/AdminPage.jsx`:
- Add `const [sidebarCollapsed, setSidebarCollapsed] = useState(() => { try { return localStorage.getItem('admin_sidebar_collapsed') === 'true'; } catch { return false; } });`.
- Function `toggleSidebarCollapse = () => { setSidebarCollapsed(prev => { const next = !prev; try { localStorage.setItem('admin_sidebar_collapsed', String(next)); } catch {} return next; }); };`.
- Add collapse toggle button inside `.sidebar-brand` header:
  ```jsx
  <button
    type="button"
    className="sidebar-collapse-btn"
    onClick={toggleSidebarCollapse}
    title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
    aria-label="Toggle Collapse Sidebar"
  >
    <i className={`fa-solid ${sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
  </button>
  ```
- Add class `collapsed` to `admin-sidebar` and `admin-app` when `sidebarCollapsed` is true.

- [ ] **Step 4: Add CSS styles in `src/styles/admin.css`**

Add CSS rules for `.admin-app.sidebar-collapsed`:
- `@media (min-width: 1024px)`:
  - `.admin-app.sidebar-collapsed .admin-sidebar`: width `72px`, padding reduced.
  - `.admin-app.sidebar-collapsed .sidebar-brand span`: display `none` / opacity `0`.
  - `.admin-app.sidebar-collapsed .sidebar-link span`: display `none`.
  - `.admin-app.sidebar-collapsed .sidebar-link`: justify-content `center`, padding `0.75rem`.
  - `.admin-app.sidebar-collapsed .sidebar-footer div:first-child`: display `none`.
  - `.admin-app.sidebar-collapsed .admin-main`: margin-left `72px`.
  - All adjustments use `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);`.

- [ ] **Step 5: Run tests and verify they pass**

Run: `npx vitest run test/pages/admin/AdminPage.test.jsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/pages/admin/AdminPage.jsx src/styles/admin.css test/pages/admin/AdminPage.test.jsx
git commit -m "feat(admin): implement collapsible desktop sidebar with smooth transition and localStorage persistence"
```

---

### Task 5: Project Grid "Show More / Show Less" Pagination & Reset Logic

**Files:**
- Modify: `src/components/sections/ProjectsSection.jsx`
- Modify: `src/styles/style.css`
- Test: `test/components/sections/ProjectsSection.test.jsx`

**Interfaces:**
- Constant: `INITIAL_LIMIT = 6`
- State: `const [isExpanded, setIsExpanded] = useState(false)`

- [ ] **Step 1: Write test for Show More / Show Less in `ProjectsSection.test.jsx`**

```javascript
// test/components/sections/ProjectsSection.test.jsx
it('limits initial display to 6 projects and toggles show more/less (Review Focus #2)', () => {
  render(<ProjectsSection projects={FALLBACK_PROJECTS} />);

  // Initial display: only 6 project articles
  expect(screen.getAllByRole('article')).toHaveLength(6);

  // Click Show More Projects
  const toggleBtn = screen.getByRole('button', { name: /Show More Projects/i });
  expect(toggleBtn).toBeInTheDocument();
  fireEvent.click(toggleBtn);

  // All 9 projects now displayed
  expect(screen.getAllByRole('article')).toHaveLength(9);
  expect(screen.getByRole('button', { name: /Show Less/i })).toBeInTheDocument();

  // Click Show Less -> collapses back to 6
  fireEvent.click(screen.getByRole('button', { name: /Show Less/i }));
  expect(screen.getAllByRole('article')).toHaveLength(6);
});

it('resets expansion state to 6 when category tab or search query changes', () => {
  render(<ProjectsSection projects={FALLBACK_PROJECTS} />);

  // Expand
  fireEvent.click(screen.getByRole('button', { name: /Show More Projects/i }));
  expect(screen.getAllByRole('article')).toHaveLength(9);

  // Switch category
  fireEvent.click(screen.getByRole('tab', { name: /All/i }));
  expect(screen.getAllByRole('article')).toHaveLength(6);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/components/sections/ProjectsSection.test.jsx`
Expected: FAIL (currently renders 9)

- [ ] **Step 3: Implement Show More / Show Less in `ProjectsSection.jsx`**

- Add `const INITIAL_LIMIT = 6;` and `const [isExpanded, setIsExpanded] = useState(false);`.
- In `handleCategoryChange` and search input `onChange`: add `setIsExpanded(false);`.
- Compute `const visibleProjects = isExpanded ? filteredProjects : filteredProjects.slice(0, INITIAL_LIMIT);`.
- Below the grid, if `filteredProjects.length > INITIAL_LIMIT`:
  ```jsx
  <div className="projects-show-more-wrapper">
    <button
      type="button"
      className="btn btn-secondary btn-show-more"
      onClick={() => {
        if (isExpanded) {
          setIsExpanded(false);
          document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
        } else {
          setIsExpanded(true);
        }
      }}
    >
      <span>
        {isExpanded
          ? 'Show Less'
          : `Show More Projects (${filteredProjects.length - INITIAL_LIMIT} more)`}
      </span>
      <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
    </button>
  </div>
  ```
- In `src/styles/style.css`, add styling for `.projects-show-more-wrapper` and `.btn-show-more` with hover lift and glowing border.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/components/sections/ProjectsSection.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/ProjectsSection.jsx src/styles/style.css test/components/sections/ProjectsSection.test.jsx
git commit -m "feat(projects): add Show More and Show Less toggle with auto-reset on search and filter"
```

---

### Task 6: Centering Project Thumbnail Uploads & Dropzone CSS Fixes

**Files:**
- Modify: `src/pages/admin/tabs/AdminProjectsTab.jsx`
- Modify: `src/styles/admin.css`
- Test: `test/pages/admin/AdminShimmer.test.jsx`

**Interfaces:**
- CSS rules: `.admin-shell .dropzone-preview`, `.admin-shell .dropzone-preview img`, `.admin-shell .admin-project-thumb img`

- [ ] **Step 1: Check existing thumbnail styles**

Inspect `.dropzone-preview` in `src/styles/admin.css` lines 534-560.

- [ ] **Step 2: Update CSS to ensure strict horizontal and vertical centering**

In `src/styles/admin.css`:
```css
.admin-shell .dropzone-preview {
  margin-top: 1rem;
  position: relative;
  max-width: 320px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.admin-shell .dropzone-preview img {
  max-width: 100%;
  height: auto;
  max-height: 220px;
  object-fit: contain;
  object-position: center center;
  border-radius: var(--radius-md);
  margin: 0 auto;
  display: block;
  box-shadow: var(--shadow-sm);
}

.admin-shell .admin-project-thumb {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background-color: #0b1120;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem;
}

.admin-shell .admin-project-thumb img {
  position: relative;
  z-index: 2;
  max-width: 90%;
  max-height: 88%;
  width: auto;
  height: auto;
  object-fit: contain;
  object-position: center center;
  margin: auto;
  border-radius: var(--radius-sm);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
}
```

- [ ] **Step 3: Run Vitest on admin tests**

Run: `npx vitest run test/pages/admin/`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/styles/admin.css src/pages/admin/tabs/AdminProjectsTab.jsx
git commit -m "fix(admin): center project thumbnail upload preview and card images"
```

---

### Task 7: Privacy Policy Header & Mobile Navigation Links

**Files:**
- Modify: `src/components/layout/Navbar.jsx`
- Test: `test/components/layout/Layout.test.jsx`

**Interfaces:**
- Desktop nav-links: Includes `<Link to="/privacy-policy">Privacy Policy</Link>`
- Mobile hamburger-menu: Includes `<Link to="/privacy-policy" onClick={closeMenu}>Privacy Policy</Link>`

- [ ] **Step 1: Write test for Privacy Policy link in `Layout.test.jsx`**

```javascript
// test/components/layout/Layout.test.jsx
it('renders Privacy Policy link in desktop and mobile navigation', () => {
  render(
    <ThemeProvider>
      <SeasonProvider>
        <MemoryRouter>
          <Navbar variant="home" siteName="Vinsensius Arka" />
        </MemoryRouter>
      </SeasonProvider>
    </ThemeProvider>
  );

  const privacyLinks = screen.getAllByRole('link', { name: /Privacy Policy/i });
  expect(privacyLinks.length).toBeGreaterThanOrEqual(1);
  expect(privacyLinks[0]).toHaveAttribute('href', '/privacy-policy');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/components/layout/Layout.test.jsx`
Expected: FAIL with "Unable to find an element with the text: /Privacy Policy/i"

- [ ] **Step 3: Implement Privacy Policy link in `Navbar.jsx`**

- In `Navbar.jsx`: In desktop `.nav-links`, after `Contact`, add:
  ```jsx
  <li>
    <Link to="/privacy-policy" className="nav-privacy-link">
      Privacy Policy
    </Link>
  </li>
  ```
- In mobile `.menu-links`, after `Contact`, add:
  ```jsx
  <li>
    <Link to="/privacy-policy" onClick={closeMenu}>
      Privacy Policy
    </Link>
  </li>
  ```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/components/layout/Layout.test.jsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Navbar.jsx test/components/layout/Layout.test.jsx
git commit -m "feat(nav): add Privacy Policy links to desktop and mobile navigation header"
```

---

### Task 8: Comprehensive Integration, Test Suite & Production Build Verification

**Files:**
- Test: All files in `test/`
- Build: `dist/`

- [ ] **Step 1: Run full unit test suite**

Run: `npx vitest run`
Expected: PASS with 9+ test files and 35+ tests passing.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: SUCCESS with zero warnings, zero module resolution errors, and clean bundle generation.

- [ ] **Step 3: Final verification commit**

```bash
git commit --allow-empty -m "chore: verify Sub-Project 1 test suite and production build"
```
