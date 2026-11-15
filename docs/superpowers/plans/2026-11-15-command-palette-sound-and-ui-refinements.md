# Command Palette, Sound Effects, and UI Refinements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement zero-dependency Web Audio micro-interactions, Command Palette (Ctrl+K), exact Favicon monogram matching in BrandLogo, modern sidebar collapse toggle, Skill icons sync with preset picker, and fix the typewriter flicker and project card buttons.

**Architecture:** Context-driven audio synthesis (`SoundContext.jsx`) and Command Palette modal (`CommandPalette.jsx`) without adding any external npm dependencies. CSS and SVG centering adjustments for skills and brand emblems.

**Tech Stack:** React 19, Vite 6, Web Audio API, Vitest, Testing Library, Native HTML5/CSS3.

**Spec:** [docs/superpowers/specs/2026-11-15-command-palette-sound-and-ui-refinements-design.md](file:///D:/Project/Website/vinsensiusarko/docs/superpowers/specs/2026-11-15-command-palette-sound-and-ui-refinements-design.md)

## Global Constraints

- Zero new external runtime npm dependencies (no cmdk, no howler.js).
- Web Audio API must synthesize audio pulses in-memory (0 external audio asset downloads).
- Default audio state must be muted (`isMuted: true`) with localStorage sync for browser autoplay compliance.
- All tests must pass with 100% pass rate (`npx vitest run`).
- Production build must succeed cleanly (`npm run build`).

## Review Focus

1. **Typewriter Empty State:** When deleting to empty string, text must not flash `roles[0]` and height must not collapse.
2. **Audio Autoplay & Context Suspension:** Calling audio methods on an uninitialized or suspended AudioContext must gracefully resume or fail silently without crashing.
3. **Command Palette Keyboard Traps:** Palette must trap focus, handle Escape to close, and clamp arrow key navigation to item bounds.
4. **SVG Centering in Skill Boxes:** Preset tech icons must align dead-center without margin offsets on both public and admin views.
5. **Brand Logo Visual Match:** Monogram must visually represent the geometric origami "V" from `/assets/favicon.ico`.

---

### Task 1: Typewriter Bug Fix, Availability Badge Removal & Project Details Button Removal

**Files:**
- Modify: `src/components/sections/HeroSection.jsx`
- Modify: `src/components/sections/ProjectsSection.jsx`
- Modify: `test/features/animations/ScrollRevealIntegration.test.jsx`
- Modify: `test/components/sections/ProjectsSection.test.jsx`

**Interfaces:**
- `HeroSection`: Accepts `{ siteSettings, contactSettings }`. Renders typewriter without text flashing and without availability badge.
- `ProjectsSection`: Accepts `{ projects }`. Project cards are clickable; no `.project-detail-trigger` button in button row.

- [ ] **Step 1: Write the failing tests**

Update `test/features/animations/ScrollRevealIntegration.test.jsx` and `test/components/sections/ProjectsSection.test.jsx` to assert:
- `HeroSection` does not render `.availability-status-badge`.
- `HeroSection` typeWriter element displays smooth text without jumping.
- `ProjectsSection` does not contain `.project-detail-trigger` button, but clicking the card still opens the modal.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/features/animations/ScrollRevealIntegration.test.jsx test/components/sections/ProjectsSection.test.jsx`
Expected: FAIL due to availability badge assertion and details button assertion.

- [ ] **Step 3: Write minimal implementation**

In `src/components/sections/HeroSection.jsx`:
- Remove `.availability-status-badge` JSX.
- Refactor typewriter logic:
  - Initialize `displayText` with `roles[0] || 'Web Developer'`.
  - Pause for 1800ms when `displayText === currentRole`, then delete letter-by-letter.
  - When `displayText === ''`, pause 350ms, then switch `isDeleting = false` and advance `roleIndex`.
  - In JSX: `<span className="typeWriter">{displayText || '\u00A0'}</span>`.
In `src/components/sections/ProjectsSection.jsx`:
- Remove `<button className="btn btn-color-2 btn-sm project-detail-trigger">Details</button>`.
- Keep the card `onClick` and `.project-img-wrapper` clickability intact.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/features/animations/ScrollRevealIntegration.test.jsx test/components/sections/ProjectsSection.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/HeroSection.jsx src/components/sections/ProjectsSection.jsx test/features/animations/ScrollRevealIntegration.test.jsx test/components/sections/ProjectsSection.test.jsx
git commit -m "fix(ui): fix typewriter flicker, remove availability badge, and remove project details button"
```

---

### Task 2: BrandLogo Matching Favicon & Admin Sidebar Collapse Modernization

**Files:**
- Create: `public/assets/favicon.png` (extracted from `favicon.ico`)
- Modify: `src/components/common/BrandLogo.jsx`
- Modify: `src/pages/admin/AdminPage.jsx`
- Modify: `src/styles/admin.css`
- Modify: `test/components/common/BrandLogo.test.jsx`

**Interfaces:**
- `BrandLogo`: Accepts `{ size, className }`. Renders the exact favicon geometric origami "V" logo.
- `AdminPage`: Sidebar collapse button styled with modern pill/circle tab, smooth transition, and clean positioning.

- [ ] **Step 1: Write the failing tests**

Update `test/components/common/BrandLogo.test.jsx` to test `BrandLogo` rendering the favicon monogram emblem with appropriate sizing.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/components/common/BrandLogo.test.jsx`

- [ ] **Step 3: Write minimal implementation**

- Copy extracted `favicon.png` from scratch to `public/assets/favicon.png`.
- Update `src/components/common/BrandLogo.jsx` to render the geometric origami "V" monogram matching the favicon.
- In `src/styles/admin.css`:
  - Style `.admin-shell .sidebar-collapse-btn` in expanded mode: clean circle button (`width: 2rem; height: 2rem; border-radius: 50%`) with hover glow and smooth rotation.
  - Style `.admin-shell .admin-sidebar.collapsed .sidebar-collapse-btn`: floating interactive pill tab on sidebar border (`right: -13px; width: 26px; height: 26px; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.15);`), with smooth `transform: scale(1.12)` on hover.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/components/common/BrandLogo.test.jsx test/pages/admin/AdminPage.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add public/assets/favicon.png src/components/common/BrandLogo.jsx src/pages/admin/AdminPage.jsx src/styles/admin.css test/components/common/BrandLogo.test.jsx
git commit -m "feat(branding): match BrandLogo to favicon and modernize sidebar collapse toggle"
```

---

### Task 3: Skill Icons Centering Fix & Curated Preset Icon Picker

**Files:**
- Modify: `src/components/common/SkillIcon.jsx`
- Modify: `src/pages/admin/tabs/AdminSkillsTab.jsx`
- Modify: `src/styles/global.css`
- Modify: `src/styles/variables.css`
- Modify: `src/styles/admin.css`
- Modify: `test/components/common/SkillIcon.test.jsx`
- Modify: `test/pages/admin/AdminSkillsTab.test.jsx`

**Interfaces:**
- `SkillIcon`: Accepts `{ skill, size, className }`. Renders centered SVG or FontAwesome icon without off-center margins.
- `AdminSkillsTab`: Skill rows render `.skill-icon-box` matching public website. Modal includes preset chip picker for 20+ technologies.

- [ ] **Step 1: Write the failing tests**

Update `test/components/common/SkillIcon.test.jsx` and `test/pages/admin/AdminSkillsTab.test.jsx` to test:
- `SkillIcon` renders centered without off-center margin styles.
- `AdminSkillsTab` displays preset icon selector chips that populate form data on click.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/components/common/SkillIcon.test.jsx test/pages/admin/AdminSkillsTab.test.jsx`

- [ ] **Step 3: Write minimal implementation**

- In `src/styles/global.css` & `variables.css`: Remove `margin: 0.15rem 0.2rem 0` on `svg.skill-icon` and ensure `margin: 0; display: inline-flex; align-items: center; justify-content: center;`.
- In `src/styles/admin.css`: Add styles for `.admin-shell .skill-icon-box` and `.preset-icons-grid` / `.preset-icon-chip`.
- In `src/pages/admin/tabs/AdminSkillsTab.jsx`:
  - Replace raw icon wrapper in `renderSkillRow` with `<div className="skill-icon-box"><SkillIcon skill={skill} size="1.25rem" /></div>`.
  - Add curated preset icons list (Flutter, Dart, React, Vue, JS, TS, HTML5, CSS3, Python, Java, PHP, Laravel, Node.js, Git, MySQL, Docker, WordPress, Android, Firebase, Linux).
  - Add preset chip buttons in modal that populate `name`, `iconClass`, `category`, and `iconType` on click.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/components/common/SkillIcon.test.jsx test/pages/admin/AdminSkillsTab.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/common/SkillIcon.jsx src/pages/admin/tabs/AdminSkillsTab.jsx src/styles/global.css src/styles/variables.css src/styles/admin.css test/components/common/SkillIcon.test.jsx test/pages/admin/AdminSkillsTab.test.jsx
git commit -m "feat(skills): sync skill icon box styling with public web and add preset icon picker"
```

---

### Task 4: Web Audio Micro-Interactions (`SoundContext.jsx`)

**Files:**
- Create: `src/context/SoundContext.jsx`
- Create: `test/context/SoundContext.test.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/layout/FloatingActions.jsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- `SoundProvider`: Context provider wrapping application.
- `useSound()`: Hook returning `{ isMuted, toggleMute, playClick, playModalOpen, playModalClose, playChime }`.
- `FloatingActions`: Contains audio mute/unmute toggle button with speaker icon.

- [ ] **Step 1: Write the failing tests**

Create `test/context/SoundContext.test.jsx`:
- Tests default muted state (`isMuted: true`).
- Tests `toggleMute()` toggles state and updates `localStorage`.
- Tests `playClick()`, `playModalOpen()`, `playModalClose()`, and `playChime()` invoke AudioContext methods safely or remain silent when muted.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/context/SoundContext.test.jsx`
Expected: FAIL with module not found.

- [ ] **Step 3: Write minimal implementation**

- Create `src/context/SoundContext.jsx`:
  - Synthesize Web Audio tones using OscillatorNode and GainNode with exponential ramp decay.
  - Safe AudioContext initialization on first user interaction.
  - Store mute preference in `localStorage.getItem('portfolio_sound_muted')`.
- Wrap `<App>` with `<SoundProvider>`.
- In `src/components/layout/FloatingActions.jsx`: Add Mute/Unmute audio button with `fa-volume-high` / `fa-volume-xmark` icon.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/context/SoundContext.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/context/SoundContext.jsx test/context/SoundContext.test.jsx src/App.jsx src/components/layout/FloatingActions.jsx src/styles/global.css
git commit -m "feat(audio): add web audio synthesizer context and sound toggle button"
```

---

### Task 5: Command Palette (`CommandPalette.jsx`)

**Files:**
- Create: `src/components/common/CommandPalette.jsx`
- Create: `test/components/common/CommandPalette.test.jsx`
- Modify: `src/components/layout/Navbar.jsx`
- Modify: `src/pages/HomePage.jsx`
- Modify: `src/styles/global.css`

**Interfaces:**
- `CommandPalette`: Modal triggered via `Ctrl + K` / `Cmd + K` or search trigger button in `Navbar`.
- Supports search, keyboard navigation (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`), section jumping, season/sound toggles, and project filters.

- [ ] **Step 1: Write the failing tests**

Create `test/components/common/CommandPalette.test.jsx`:
- Tests opening via `Ctrl + K` keydown.
- Tests typing in search input filters commands.
- Tests keyboard arrow down/up changes active selection.
- Tests pressing Enter triggers the active command action.
- Tests pressing Escape closes the palette.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/components/common/CommandPalette.test.jsx`
Expected: FAIL with module not found.

- [ ] **Step 3: Write minimal implementation**

- Create `src/components/common/CommandPalette.jsx` with full keyboard accessibility.
- Connect commands:
  - Sections: Hero, About, Experience, Projects, Contact, Privacy Policy, Admin.
  - Quick Actions: Spring, Summer, Autumn, Winter, Toggle Sound, Toggle Theme.
  - Filters: All, Web, Mobile, Desktop.
- In `src/components/layout/Navbar.jsx`: Add search button with `<kbd>Ctrl K</kbd>` badge.
- Mount `CommandPalette` in `HomePage.jsx` (and layout).
- Style `CommandPalette` in `src/styles/global.css` with sleek seasonal glassmorphism backdrop.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/components/common/CommandPalette.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/common/CommandPalette.jsx test/components/common/CommandPalette.test.jsx src/components/layout/Navbar.jsx src/pages/HomePage.jsx src/styles/global.css
git commit -m "feat(navigation): add accessible command palette with ctrl+k shortcut"
```

---

### Task 6: Full Integration Testing & Production Build Verification

**Files:**
- Verify: Full test suite (`npx vitest run`)
- Verify: Production build (`npm run build`)

- [ ] **Step 1: Run complete test suite**

Run: `npx vitest run`
Expected: 100% tests passing across all test files with 0 failures.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: Build succeeds with 0 errors and chunks generated cleanly.

- [ ] **Step 3: Commit any final integration refinements**

```bash
git commit --allow-empty -m "chore: verify full test suite and production build for sub-project 1"
```
