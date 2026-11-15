# Design Specification: Command Palette, Micro-Interaction Sound Effects, and UI Refinements

**Date:** 2026-11-15  
**Scope:** Sub-Project 1 (Command Palette, Web Audio System, Hero Polish, Project Button Removal, and Skill Icon Synchronization)  
**Status:** Approved & Ready for Implementation  

---

## 1. Problem Statement & User Intent
The user requested seven key refinements and additions:
1. **Typewriter Effect Fix**: When deleting letters between roles ("Mobile Developer" and "Web Developer"), a glitch occurs because `displayText || roles[0]` falls back to the full first role string as soon as `displayText` becomes empty. This causes a jarring visual flicker.
2. **Remove Availability Badge**: The "Available for New Opportunities" status badge above the hero greeting is deemed unnecessary and should be removed cleanly.
3. **Remove Project Card "Details" Button**: The extra "Details" button in `.project-btn-container` creates visual clutter. The card and the thumbnail image with "Quick View" badge already trigger the project detail gallery modal.
4. **Skill Icons Synchronization & Centering**:
   - In `AdminSkillsTab.jsx`, skill rows lack the rounded `.skill-icon-box` styling seen on the public website.
   - SVG icons have hardcoded margins (`margin: 0.15rem 0.2rem 0`) causing off-center misalignment.
   - Adding/editing skills relies on typing arbitrary FontAwesome strings without guidance. A curated preset icon picker is needed so popular technologies (Flutter, React, Java, PHP, Laravel, Node, Git, MySQL, etc.) can be selected with one click.
5. **Command Palette (`Ctrl + K` / `Cmd + K`) & Sound Effects**:
   - Provide a keyboard-first command palette for fast section navigation, season switching, theme toggling, and project filtering.
   - Implement zero-dependency Web Audio API micro-interactions (soft clicks, modal swoosh, season chime) with a toggleable mute state (default: muted) stored in `localStorage`.
6. **BrandLogo Matching Favicon**:
   - The monogram logo next to "Arko" in the Admin sidebar and login currently renders a generic rounded gradient box with a plain "V". It must be updated to match the exact geometric origami V emblem from `/assets/favicon.ico` / `/assets/favicon.png`.
7. **Admin Sidebar Collapse Arrow Redesign**:
   - The collapse/expand arrow button currently looks awkward and unappealing, especially in collapsed mode where it is a tiny cut-off 22px circle on the border. It should be redesigned into a sleek, modern pill/circle toggle with smooth hover animation, scale feedback, and proper positioning.

---

## 2. Technical Architecture & Component Structure

```
src/
├── context/
│   ├── SoundContext.jsx             # Web Audio API synthesizer + mute toggle state (localStorage)
│   ├── SeasonContext.jsx
│   └── ConfirmContext.jsx
├── components/
│   ├── common/
│   │   ├── CommandPalette.jsx       # Global Ctrl+K command modal with search & keyboard navigation
│   │   └── SkillIcon.jsx            # Centered icon renderer with universal SVG & FontAwesome support
│   ├── layout/
│   │   ├── Navbar.jsx               # Quick search button (triggers Ctrl+K palette)
│   │   └── FloatingActions.jsx      # Audio Mute/Unmute toggle button
│   └── sections/
│       ├── HeroSection.jsx          # Typewriter fix (no flicker) & availability badge removal
│       └── ProjectsSection.jsx      # Removal of .project-detail-trigger button
└── pages/
    └── admin/
        └── tabs/
            └── AdminSkillsTab.jsx   # Curated preset icon picker & synchronized .skill-icon-box
```

---

## 3. Detailed Component Specifications

### 3.1 Hero Section Typewriter Bug Fix & Badge Removal
- **File:** `src/components/sections/HeroSection.jsx`
- **Typewriter Logic:**
  - Initialize `displayText` with `roles[0]` (e.g., "Web Developer").
  - On complete typing (`displayText === currentRole`), pause for 1800ms, then set `isDeleting = true`.
  - On deleting: slice `displayText` by `-1` every 40ms.
  - On reaching empty string (`displayText === ''`): pause 350ms, then set `isDeleting = false` and advance `roleIndex`.
  - In JSX: replace `<span className="typeWriter">{displayText || roles[0]}</span>` with `<span className="typeWriter">{displayText || '\u00A0'}</span>`. This prevents any fallback text flash while preserving line height.
- **Badge Removal:**
  - Delete `.availability-status-badge` container and update `test/features/animations/ScrollRevealIntegration.test.jsx`.

### 3.2 Projects Section Details Button Removal
- **File:** `src/components/sections/ProjectsSection.jsx`
- Remove `<button className="btn btn-color-2 btn-sm project-detail-trigger">... Details</button>`.
- The parent `<article className="project-card">` and `.project-img-wrapper` remain interactive and open `handleOpenProject(proj)`.

### 3.3 Skill Icons Centering & Admin Synchronization
- **Files:** `src/components/common/SkillIcon.jsx`, `src/pages/admin/tabs/AdminSkillsTab.jsx`, `src/styles/global.css`, `src/styles/admin.css`
- **Centering Fix:**
  - Reset `svg.skill-icon` margins to `0` and enforce `display: inline-flex; align-items: center; justify-content: center;`.
  - In `AdminSkillsTab.jsx`, wrap icons in `.skill-icon-box` matching public `ExperienceSection.jsx` styles.
- **Curated Preset Icon Picker:**
  - Provide 20+ preset tech chips in `AdminSkillsTab.jsx` (Flutter, Dart, React, Vue, JS, TS, HTML5, CSS3, Python, Java, PHP, Laravel, Node.js, Git, MySQL, Docker, WordPress, Android, Firebase, Linux).
  - Clicking a preset automatically fills `name`, `iconClass`, `category`, and `iconType`.
  - Live preview box updates instantly.

### 3.4 Web Audio Micro-Interactions (`SoundContext.jsx`)
- **File:** `src/context/SoundContext.jsx`
- **Architecture:** Zero external audio files. Uses standard `window.AudioContext || window.webkitAudioContext`.
- **Sounds Synthesized:**
  1. `playClick()`: Short sine pulse (800Hz -> 200Hz, 35ms, gain 0.1).
  2. `playModalOpen()`: Gentle ascending swell (300Hz -> 650Hz, 70ms, gain 0.12).
  3. `playModalClose()`: Soft descending tone (600Hz -> 250Hz, 60ms, gain 0.1).
  4. `playChime()`: Two-tone harmonic chime (C5 523Hz -> E5 659Hz, 120ms each, gain 0.15).
- **Mute State:**
  - State: `isMuted` (default: `true` to comply with browser autoplay policies).
  - Stored in `localStorage.getItem('portfolio_sound_muted')`.
  - Export hook: `useSound()`.

### 3.5 Command Palette (`CommandPalette.jsx`)
- **File:** `src/components/common/CommandPalette.jsx`
- **Keybindings:** Global `keydown` for `(e.metaKey || e.ctrlKey) && e.key === 'k'` and `Escape` to close.
- **Search & Navigation:**
  - Filter actions by query string.
  - Keyboard navigation with `ArrowUp`, `ArrowDown`, and `Enter`.
  - Accessible dialog (`role="dialog"`, `aria-modal="true"`).
- **Command Items:**
  - Navigation: Hero/Home, About, Experience & Skills, Projects, Contact, Privacy Policy, Admin Panel.
  - Actions: Switch Season (Spring, Summer, Autumn, Winter), Toggle Audio Sound, Toggle Theme.
  - Quick Filters: Filter projects by "Web", "Mobile", "Desktop", "All".

### 3.6 BrandLogo Matching Favicon Emblem
- **File:** `src/components/common/BrandLogo.jsx`
- Copy extracted 64x64 PNG from `favicon.ico` into `public/assets/favicon.png` so both raster and vector formats exist.
- Update `BrandLogo.jsx` to render the exact favicon image/vector representing the unique geometric origami "V" monogram, with crisp responsive sizing (`width: size, height: size`), alt label, and clean contrast.

### 3.7 Sidebar Collapse Arrow Redesign
- **Files:** `src/pages/admin/AdminPage.jsx`, `src/styles/admin.css`
- **Expanded state**: Sleek circle button (`width: 2rem; height: 2rem; border-radius: 50%`) with smooth hover background, high-contrast chevron icon, and subtle border.
- **Collapsed state**: Repositioned as a floating interactive pill tab on the sidebar border (`right: -13px; width: 26px; height: 26px; border-radius: 50%; background: var(--bg-card); box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1.5px solid var(--border-color);`), with smooth `transform: scale(1.12)` on hover, ensuring high visibility, easy clicking, and modern aesthetic.

---

## 4. Testing & Verification Plan
1. **Hero Section Test**: Verify typewriter initializes with `roles[0]`, deletes cleanly without popping full text back, and availability badge is removed.
2. **Projects Section Test**: Verify project card button container contains only GitHub and Demo links, and card click still triggers modal.
3. **Skill Icon & Admin Skills Test**: Verify preset chips set form fields, `.skill-icon-box` renders centered SVG and FontAwesome icons in admin rows.
4. **SoundContext Test**: Verify sound state initialization, mute toggle, localStorage sync, and silent execution when audio is muted or AudioContext is uninitialized.
5. **Command Palette Test**: Verify `Ctrl+K` opens modal, typing filters list, Arrow Down/Up selects items, Enter executes command, and Escape closes palette.
6. **Integration & Build**: Run `npx vitest run` across all test files and `npm run build` to ensure 0 errors.
