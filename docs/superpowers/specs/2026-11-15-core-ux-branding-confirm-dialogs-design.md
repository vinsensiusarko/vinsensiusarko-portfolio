# Specification: Sub-Project 1 — Core UX, Branding "Arko", Confirmation Dialogs & Collapsible Sidebar

- **Status**: Draft / Under Review
- **Author**: Antigravity & Vinsensius Arko
- **Date**: 2026-11-15
- **Path**: Architectural (Sub-Project 1 of 4)

---

## 1. Context & User Intent

The user requested an extensive upgrade to their portfolio website ([vinsensiusarka.id](https://vinsensiusarka.id)) and CMS dashboard, including:
1. Simplifying the Project Grid with a **Show More** toggle to avoid an overly long scroll.
2. Replacing all browser native dialogs (`window.confirm()`, `alert()`) with a **modern theme-adaptive confirmation dialog** (especially for delete actions, logout, and reset defaults).
3. Adding a **collapsible sidebar** in the Admin panel for a cleaner, compact workspace on desktop.
4. Updating the CMS brand text from **"Arka CMS" to "Arko"** and replacing the lightning bolt icon with a **geometric "V" monogram logo** matching the website's favicon.
5. Fixing **Project Thumbnail upload centering** in the dropzone and cards.
6. Fixing the **Flutter icon** in the Admin panel where entering `fa-brands fa-flutter` resulted in a blank/invisible icon due to Font Awesome Free limitations.
7. Adding a **Privacy Policy** link to the header/navbar navigation.

Due to the breadth of the original request (which also covers multi-image project galleries, drag-and-drop reordering, scroll animations, and visitor analytics), the work is decomposed into four focused sub-projects. This document specifies **Sub-Project 1: Core UX, Branding, Confirmation Dialogs & Collapsible Sidebar**.

---

## 2. Sub-Project Decomposition

- **Sub-Project 1 (This Spec)**: Core UX, Branding "Arko", Theme-Adaptive Confirmation Dialogs, Collapsible Admin Sidebar, Project Grid Show More, Centering Fixes, Universal Flutter Icon, and Header Privacy Policy Link.
- **Sub-Project 2**: Project Multi-Image Detail Gallery (carousel/lightbox in Quick View Modal) & Drag-and-Drop Reordering for Projects and Skills.
- **Sub-Project 3**: Modern Scroll-Reveal Animations (Intersection Observer), Micro-Interactions, and Visual Polish.
- **Sub-Project 4**: Visitor Analytics Dashboard in Admin Panel (page views, popular projects), Performance Optimization, and Security Hardening.

---

## 3. Detailed Architecture & Design (Sub-Project 1)

### 3.1 Universal Theme-Adaptive Confirmation Dialog (`ConfirmContext` & `useConfirm`)

#### Problem
The admin panel currently relies on native browser `window.confirm()` in `AdminProjectsTab.jsx`, `AdminSkillsTab.jsx`, `AdminPrivacyTab.jsx`, `AdminPage.jsx` (logout), and `AdminDatabaseTab.jsx`. These native dialogs cannot be styled, do not match the Light/Dark theme tokens, and degrade the user experience.

#### Architecture
- **File**: `src/context/ConfirmContext.jsx`
- **Hook**: `useConfirm()`
- **API**:
  ```typescript
  interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    icon?: string;
  }

  function useConfirm(): (options: ConfirmOptions) => Promise<boolean>;
  ```
- **State Machine**:
  - `confirm(options)` returns a new `Promise<boolean>` and sets internal state `{ isOpen: true, options, resolve }`.
  - When user clicks **Confirm**: resolves `true`, sets `isOpen: false`.
  - When user clicks **Cancel**, backdrop, or presses `Escape`: resolves `false`, sets `isOpen: false`.
- **UI & Modal Component**:
  - Rendered in a high z-index overlay (`z-index: 12000`).
  - Smooth scale-in transition (`transform: scale(0.95)` to `scale(1)` with opacity).
  - Variant-based icon accents:
    - `danger`: Red/Rose gradient badge (e.g. `fa-solid fa-triangle-exclamation` or `fa-solid fa-trash`).
    - `warning`: Amber badge.
    - `info`: Emerald/Blue badge.
  - Full theme compliance with existing CSS variables (`--bg-card`, `--border-color`, `--text-primary`, `--text-muted`, `--radius-lg`, `--shadow-xl`).
- **Scope of Replacement**:
  - Logout action in `AdminPage.jsx`.
  - Project deletion in `AdminProjectsTab.jsx`.
  - Skill deletion in `AdminSkillsTab.jsx`.
  - Privacy Policy template reset in `AdminPrivacyTab.jsx`.
  - Database reset / seeder in `AdminDatabaseTab.jsx`.

---

### 3.2 Collapsible Admin Sidebar

#### Problem
On desktop viewports, the Admin sidebar occupies 260px fixed width at all times, limiting workspace real-estate on medium laptops.

#### Architecture
- **State**: `sidebarCollapsed` in `AdminPage.jsx`, initialized from `localStorage.getItem('admin_sidebar_collapsed') === 'true'`.
- **Toggle Mechanism**:
  - Dedicated collapse button at the top of the sidebar / next to brand: `<button className="sidebar-collapse-btn" title="Collapse Sidebar">` with smooth rotating chevron (`fa-solid fa-chevron-left`).
  - Click toggles state and updates `localStorage`.
- **Styling (`src/styles/admin.css`)**:
  - When collapsed:
    - Sidebar width transitions from `260px` to `72px`.
    - Brand text `"Arko"` fades out, leaving only the centered Monogram "V" logo.
    - Menu item labels and badges hide with `opacity: 0; pointer-events: none;`.
    - Menu icons are centered with large clickable hitboxes (`height: 2.75rem; justify-content: center;`).
    - Tooltips on hover: Native `title` attribute or floating CSS tooltip displaying tab title.
    - Footer email hides, keeping the sign-out icon button centered.
    - `.admin-main` left margin shifts from `260px` to `72px` with smooth easing (`transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`).
  - Mobile behavior (< 1024px) remains an off-canvas drawer toggle, untouched by the desktop collapsed state.

---

### 3.3 Brand Identity Update: "Arko" & Monogram "V" Logo

#### Problem
The CMS displays "Arka CMS" with a generic `fa-solid fa-bolt` icon. The user requested changing the text to **"Arko"** and replacing the icon with a logo matching the website favicon (monogram "V" for *Vinsensius*).

#### Architecture
- **Component**: `src/components/common/BrandLogo.jsx`
  - Clean, sharp SVG vector icon representing a stylized geometric letter "V".
  - Uses CSS variables / gradients (`url(#vLogoGradient)` with primary & accent colors).
  - Configurable `size` prop (default `28px`).
- **CMS Brand Usage**:
  - Replaces `<i className="fa-solid fa-bolt"></i>` in:
    - Sidebar brand (`BrandLogo` + `"Arko"`)
    - Admin topbar and splash screen
    - `AdminLogin.jsx` header
    - Skeleton loader (`AdminDashboardSkeleton`)
- **Text Update**:
  - Replace all occurrences of `"Arka CMS"` with `"Arko"` in `AdminPage.jsx`, `AdminLogin.jsx`, and title tags.

---

### 3.4 Project Grid "Show More / Show Less"

#### Problem
Currently, all 9 projects render at once, which elongates the landing page and will grow unwieldy as more projects are added.

#### Architecture
- **Component**: `src/components/sections/ProjectsSection.jsx`
- **Initial Limit**: `INITIAL_LIMIT = 6` (2 full rows in the desktop 3-column grid).
- **State**:
  - `const [isExpanded, setIsExpanded] = useState(false);`
  - Auto-reset `setIsExpanded(false)` whenever category tab filter or search query changes.
- **Computed List**:
  - `const visibleProjects = isExpanded ? filteredProjects : filteredProjects.slice(0, INITIAL_LIMIT);`
- **Controls**:
  - If `filteredProjects.length > INITIAL_LIMIT`:
    - Render a prominent, modern action container below the grid.
    - Button text:
      - Collapsed: `Show More Projects (${filteredProjects.length - INITIAL_LIMIT} more)` with `<i className="fa-solid fa-chevron-down"></i>`.
      - Expanded: `Show Less` with `<i className="fa-solid fa-chevron-up"></i>`.
    - Clicking toggles `isExpanded`.
    - When clicking "Show Less", smoothly scrolls the viewport back to `#projects` heading so the user isn't disoriented.

---

### 3.5 Fix Centered Project Thumbnail Uploads & Card Previews

#### Problem
Uploaded thumbnails in the admin dropzone and project cards can appear off-center or misaligned depending on aspect ratio.

#### Architecture
- **CSS Corrections (`src/styles/admin.css`)**:
  - `.admin-shell .dropzone-preview`: Ensure `display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;`.
  - `.admin-shell .dropzone-preview img`: Add `margin: 0 auto; display: block; object-position: center center; object-fit: contain;`.
  - `.admin-shell .admin-project-thumb`: Ensure flex centering (`align-items: center; justify-content: center;`) with `overflow: hidden;`.
  - `.admin-shell .admin-project-thumb img`: Maintain `object-fit: contain; object-position: center; margin: 0 auto;`.

---

### 3.6 Universal Flutter Icon Support (Public & Admin)

#### Problem
Font Awesome 6.5 Free does not have a `fa-brands fa-flutter` glyph. When users enter `fa-brands fa-flutter` in the Admin panel, the icon renders as blank/invisible.

#### Architecture
- **Component**: `src/components/common/SkillIcon.jsx`
  - Shared component for both public site (`ExperienceSection.jsx`) and admin panel (`AdminSkillsTab.jsx`).
  - Logic:
    ```javascript
    const isFlutter =
      String(skill?.name || '').toLowerCase() === 'flutter' ||
      String(skill?.iconClass || '').toLowerCase().includes('flutter') ||
      skill?.iconType === 'svg';
    ```
  - If `isFlutter` is true, render the official Flutter SVG vector icon (scaled to container).
  - Otherwise, render `<i className={`${skill?.iconClass || 'fa-solid fa-code'} skill-icon`}></i>`.
- **Admin Skills List & Modal**:
  - Use `SkillIcon` in the skills list items and in the live modal preview so users immediately see the Flutter badge rendered crisp and colored.

---

### 3.7 Header Navigation: Privacy Policy Link

#### Problem
The Privacy Policy page is currently only linked in the footer.

#### Architecture
- **Component**: `src/components/layout/Navbar.jsx`
- **Desktop Navigation**:
  - Add `<li><Link to="/privacy-policy" className="...">Privacy Policy</Link></li>` to the desktop navigation list.
- **Mobile Drawer**:
  - Add `<li><Link to="/privacy-policy" onClick={closeMenu}>Privacy Policy</Link></li>` to the mobile hamburger drawer list.
- **Active State**:
  - Highlight the link when the current location is `/privacy-policy`.

---

## 4. Testing & Verification Plan

1. **Unit Tests (`test/context/ConfirmContext.test.jsx`)**:
   - Verify `ConfirmProvider` renders children.
   - Verify calling `confirm()` opens dialog with custom title and message.
   - Verify clicking Cancel resolves `false` and closes dialog.
   - Verify clicking Confirm resolves `true` and closes dialog.
   - Verify pressing `Escape` resolves `false`.
2. **Unit Tests (`test/components/sections/ProjectsSection.test.jsx`)**:
   - Verify initial display caps at 6 projects when fallback projects list has 9.
   - Verify clicking "Show More Projects" displays all 9 projects and changes button text to "Show Less".
   - Verify clicking "Show Less" collapses back to 6.
   - Verify changing category filter resets expansion.
3. **Unit Tests (`test/components/common/SkillIcon.test.jsx` & `BrandLogo.test.jsx`)**:
   - Verify Flutter SVG renders when `iconClass="fa-brands fa-flutter"` or `name="Flutter"`.
   - Verify standard Font Awesome icons render when another class is provided.
   - Verify `BrandLogo` renders SVG element with "V" path.
4. **Integration & Build Verification**:
   - Run `npx vitest run` to ensure all unit tests pass.
   - Run `npm run build` to guarantee production build succeeds with zero bundle/chunk errors.

---

## 5. Review & Approval Gate

This specification defines the exact scope, component breakdown, and contracts for Sub-Project 1. Once approved, the `writing-plans` skill will be invoked to produce the step-by-step implementation plan.
