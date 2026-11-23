# Spec 2: Full Rework Admin Panel dengan Tailwind CSS v4 + shadcn/ui

**Date:** 2026-11-23  
**Status:** Draft for User Review  
**Scope Classification:** Architectural  
**Depends On:** Spec 1 (`docs/superpowers/specs/2026-11-23-landing-page-shadcn-rework-design.md`, completed at `6551562`)  
**Antislop Mode:** Mode 2 (`after`) with mandatory Delivery Gate

---

## 1. Goal & Principles

Rework the entire Admin Panel (`AdminLogin`, `AdminPage` Shell, `ConfirmContext`, `AdminShimmer`, and all 8 Admin Tabs) onto the Editorial Craft design system defined in `DESIGN.md` using Tailwind CSS v4, shadcn/ui (Radix primitives, pure JSX), and `@tabler/icons-react`. Upon completion, retire all ~115 KB of legacy CSS (`admin.css`, `confirm.css`, `global.css`, `mediaqueries.css`, `variables.css`) so `src/styles/index.css` becomes the single stylesheet for the entire application.

### Core Design Decisions (Approved)
1. **Single Cohesive Spec (All 8 Tabs + Shell):** Complete the full Admin Panel migration in one spec and retire all legacy stylesheets cleanly at the end.
2. **Neutral Studio Ink + Semantic Status Only:** Inherit Warm Alabaster (`#FAF9F6`) light mode, Deep Charcoal Ink (`#0E1012`) dark mode, 1px hairline borders, and `Bricolage Grotesque` / `Plus Jakarta Sans` / `JetBrains Mono` typography from `DESIGN.md`. Do **not** apply seasonal accents (`--accent-season`) to CMS chrome; keep navigation, primary buttons, and active borders neutral ink so semantic statuses (success, warning, destructive) and real content previews (project covers, analytics bars, OpenGraph canvas) stand out cleanly.
3. **Grouped Navigation & Contextual Metrics:** Organize the 8 admin destinations into 4 clear groups (`Content`, `Insights`, `Site Settings`, `System`). Remove the repetitive 3-card `.stats-grid` banner previously duplicated above every tab, and move those figures into contextual locations (sidebar item count badges and tab-relevant headers/summaries).
4. **Lean Editorial Studio Shell (Approach A):** Build the collapsible desktop rail and mobile drawer directly on existing shadcn primitives (`Sheet`, `Tooltip`, `Button`, `Badge`, `Separator`) plus only the essential additional primitives (`alert-dialog`, `label`, `textarea`, `select`, `tabs`, `progress`). Keep `AdminAnalyticsTab` dependency-free (no external chart library).
5. **100% Feature & Data Parity:** Preserve all Firebase Auth/Firestore reads & writes, `localStorage` persistence (`admin_sidebar_collapsed`, `admin_active_tab`, `portfolio_skills_cache`), Canvas Base64 image compression, multi-screenshot gallery, drag-and-drop reordering, PDF CV Base64 upload, 1200x630 OpenGraph Canvas generator, and JSON backup/restore/seed workflows.

---

## 2. Foundation Primitives & Shared Admin Utilities

### 2.1 Additional shadcn/ui Primitives
Built on top of the 14 existing components in `src/components/ui/`:
- `alert-dialog.jsx`: Accessible destructive/warning confirmation dialogs for `ConfirmContext`.
- `label.jsx`: Semantic accessible form labels.
- `textarea.jsx`: Multiline inputs for bio, descriptions, and privacy policy sections.
- `select.jsx`: Native-feeling Radix select for project category, skill category, and skill level.
- `tabs.jsx`: Structured tab panels where helpful without breaking button-role test contracts.
- `progress.jsx`: Clean token-driven progress/distribution bars for Analytics and DB health.

**Installation & Hygiene Rules:**
- Run `npx -y shadcn@latest add <components> --dry-run` first; install any missing package dependencies directly via `npm install` (to avoid npm 11 `EALLOWSCRIPTS` errors), then add components via `npx -y shadcn@latest add <components> --yes`.
- Inspect every generated component in `src/components/ui/` and replace any `lucide-react` icons with `@tabler/icons-react` equivalents.
- Follow `shadcn/SKILL.md` rules: `gap-*` (never `space-y-*` / `space-x-*`), `size-*` for square dimensions, semantic tokens only (no raw `dark:` color overrides), `data-icon="inline-start"` / `"inline-end"` on button icons.

### 2.2 Shared Internal Component
- `src/pages/admin/components/AdminPageHeader.jsx`: Consistent header row rendered at the top of each Admin tab, accepting `title`, `description`, optional `meta` (contextual count/status pill), and `actions` slot (right-aligned buttons, wrapping cleanly on mobile).

---

## 3. Section 1: Login, App Shell, Confirm AlertDialog, Toast & Skeletons

### 3.1 `src/pages/admin/AdminLogin.jsx`
- Centered single-column layout (`min-h-dvh bg-background flex items-center justify-center p-4 sm:p-6`) with a discreet Light/Dark theme toggle button (`min-h-11 min-w-11`) in the top-right corner.
- Single `Card` (`w-full max-w-md`) containing `BrandLogo`, `h1` heading `Admin Portal` (`font-display`), short subtitle, inline `Alert variant="destructive"` for Firebase Auth errors, `Label` + `Input` for `Email Address` and `Password`, full-width `Button` (`Sign In` with `IconLoader2` spinner when authenticating), and link `Back to Public Portfolio` (`href="/"`).

### 3.2 `src/pages/admin/AdminPage.jsx`
- **Grouped Sidebar Navigation:**
  - **Content:** `Projects` (live count `Badge`), `Skills & Experience` (live count `Badge`).
  - **Insights:** `Visitor Analytics`.
  - **Site Settings:** `Profile & Bio`, `Contact & Socials`, `Privacy Policy`, `SEO & OpenGraph`.
  - **System:** `Backup & Database`.
- **Desktop Sidebar (`hidden lg:flex`):** Fixed collapsible rail (`w-64` expanded, `w-[68px]` collapsed), persisted in `localStorage` (`admin_sidebar_collapsed`). Uses `BrandLogo` + collapse toggle (`IconLayoutSidebarLeftCollapse` / `IconLayoutSidebarLeftExpand`). When collapsed, each navigation button wraps in a shadcn `Tooltip` showing the tab label. Footer displays `Signed in as` + truncated `user.email` + `Sign Out` button (`IconLogout`, triggers `useConfirm()`).
- **Mobile Navigation (`lg:hidden`):** Triggered from Topbar hamburger button (`min-h-11 min-w-11`, `aria-label="Toggle Menu"`), rendering the exact same grouped nav + user footer inside a shadcn `Sheet` (`side="left"`). Selecting any tab closes the sheet and persists `admin_active_tab`.
- **Sticky Topbar:** Clean `h-14 border-b border-border bg-background/95` bar displaying mobile menu button, active tab `h1` title (`id="topbar-title"`), `View Live Site` link button (`https://vinsensiusarka.id`, `IconExternalLink`), and Light/Dark theme toggle (`IconSun` / `IconMoon`).
- **Removal of Global 3-Card Stat Banner:** Delete the repeated `.stats-grid` block from `AdminPage.jsx`. Contextual metrics live in sidebar count badges and inside the relevant tabs (`Projects`, `Skills`, `Database`).
- **Toast Unification (`Sonner`):** Retain the `showToast(message, type = 'success')` callback prop passed to `AdminLogin` and all 8 tabs, delegating internally to `sonner`'s `toast.success`, `toast.error`, `toast.warning`, and `toast.info` (rendered by `<Toaster />` already mounted in `App.jsx`). Remove local `toasts` state and `#toast-container`.

### 3.3 `src/context/ConfirmContext.jsx`
- Preserve the exact imperative hook signature: `const ok = await confirm({ title, message, confirmText, cancelText, variant, icon })`.
- Replace custom `.confirm-modal-overlay` markup and `confirm.css` import with shadcn `AlertDialog` (`AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`).
- Map `variant` cleanly:
  - `'danger'`: Destructive icon badge (`IconAlertTriangle`) + `Button` destructive styling on confirm action.
  - `'warning'`: Amber icon badge (`IconAlertCircle`) + neutral primary confirm action.
  - `'info'` (default): Muted icon badge (`IconInfoCircle`) + neutral primary confirm action.
- Ensure resolving `false` on Cancel or `onOpenChange(false)` cleanly resolves the pending promise without leaks.

### 3.4 `src/pages/admin/AdminShimmer.jsx`
- Rebuild all exported skeletons (`AdminStatsShimmer`, `AdminProjectsShimmer`, `AdminSkillsShimmer`, `AdminFormShimmer`, `AdminDashboardSkeleton`) using shadcn `<Skeleton />` and Tailwind layout classes.
- Preserve existing `data-testid` attributes (`admin-stats-shimmer`, `admin-projects-shimmer`, `admin-skills-shimmer`, `admin-form-shimmer`, `admin-dashboard-skeleton`), lightweight structural marker classes used by `AdminShimmer.test.jsx`, and `Verifying Admin Session...` copy in `AdminDashboardSkeleton`.

---

## 4. Section 2: Core Content & Insights Tabs

### 4.1 `src/pages/admin/tabs/AdminProjectsTab.jsx`
- **Header:** `AdminPageHeader` showing contextual count badge (`{projects.length} Projects`) and `+ Add Project` button (`IconPlus`).
- **Grid & Reordering:** `grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4`. Each item renders a shadcn `Card` with marker class `admin-project-card` (preserving DnD test selectors), `aspect-[16/10]` cover image via `resolveProjectImage`, `#order` mono badge (`title="Display Order..."`), category `Badge`, and drag handle (`IconGripVertical`, `title="Drag to reorder"`).
- **Drag Visuals & Keyboard/Button Reordering:** Clear `opacity-50` while dragging and `ring-2 ring-foreground` on drop target. Footer provides Up/Down reorder buttons (`IconArrowUp` / `IconArrowDown`, `min-h-9 min-w-9`), `Edit` button, and `Delete` button (`useConfirm()`).
- **Add/Edit Modal (`Dialog`):** `DialogContent` (`sm:max-w-3xl max-h-[90vh] overflow-y-auto`) with `Label`, `Input`, `Select` (category), `Textarea` (description with live `.rich-*` formatted preview), `Switch` (`isComingSoon`), Cover Image dropzone with Canvas Base64 compression size badge (`KB`) + external URL fallback, and `Project Screenshot Gallery` (up to 6 images with `Set as Cover` and `title="Remove screenshot"` buttons).

### 4.2 `src/pages/admin/tabs/AdminSkillsTab.jsx`
- **Header:** `AdminPageHeader` showing total skills count (`{skills.length} Skills`) and `+ Add Skill` button.
- **Two-Column Categorized Cards (`grid-cols-1 lg:grid-cols-2 gap-6`):**
  - Card 1: `Programming Languages` with count badge.
  - Card 2: `Frameworks & Tools` with count badge.
  - Each row preserves marker classes `skill-item-row` and `.skill-icon-box`, showing drag handle (`title="Drag to reorder"`), `SkillIcon` preview, skill name, clickable level toggle badge (`Experienced` / `Intermediate`, `title="Click to toggle level"`), `Edit`, and `Delete` buttons.
  - Preserve category-isolated drag-and-drop check, optimistic `setSkills` updates, and `localStorage` (`portfolio_skills_cache`) synchronization.
- **Add/Edit Skill Modal (`Dialog`):**
  - `Preset Icons` quick-fill chip grid (`Button variant="outline" size="sm"`).
  - Icon source segmented switcher built with `<Button type="button">` (`Font Awesome / Auto SVG` and `Upload PNG / SVG`) to preserve button roles tested in `AdminSkillsTab.test.jsx`.
  - Upload pane includes file input (`Upload Skill Icon`, max 1 MB PNG/SVG/WebP), `Pakai Asset Favicon Arko` shortcut button, and live `SkillIcon` preview.

### 4.3 `src/pages/admin/tabs/AdminAnalyticsTab.jsx`
- **Header:** `AdminPageHeader` with `Visitor Analytics & Traffic Insights`, `Seed Demo Data` (`Button variant="outline" size="sm"`), and `Reset Analytics` (`Button variant="destructive" size="sm"`).
- **4 Neutral Editorial KPI Cards (`grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4`):**
  - `Total Page Views`, `Unique Visitors`, `CV Resume Downloads`, `Mobile Traffic Share`.
  - Hairline-bordered `Card`, muted neutral icon chip (`bg-muted text-foreground`), large `font-mono tabular-nums` KPI figure, and concise subtext. No hardcoded neon icon boxes.
- **7-Day Traffic Trend Card:** Dependency-free pure CSS/Flex vertical bar chart using neutral ink (`bg-foreground/85 hover:bg-foreground`), value label, date label (`font-mono`), and honest empty state when `dailyStats.length === 0`.
- **3 Audience Breakdown Cards (`grid-cols-1 lg:grid-cols-3 gap-4`):**
  - `Device Breakdown`, `Browser Distribution`, and `Operating Systems` rendered with shadcn `Progress` bars and `tabular-nums` counts + percentages. No hardcoded pink/neon colors.

---

## 5. Section 3: Settings & System Tabs + Legacy CSS Retirement

### 5.1 `src/pages/admin/tabs/AdminProfileTab.jsx`
- Single structured `Card` (or cohesive stacked cards) using `AdminFormShimmer` during initial load, divided cleanly by `Separator`:
  1. **Profile Photos:** 2-column dropzone grid (`Hero Portrait` & `About Portrait`) with live preview, Canvas Base64 compressed `KB` indicator, file trigger, and Remove button (`deleteField()`).
  2. **Identity & Hero Copy:** `Name`, `Hero Greeting`, `Typewriter Roles`, and `About Bio` (`Textarea`).
  3. **Experience & Education:** 2x2 responsive grid (`expYears`, `expSub`, `eduDegree`, `eduMajor`).
  4. **Resume / CV PDF:** PDF upload dropzone (750 KB Base64 limit) with active file status badge + fallback external CV URL input.

### 5.2 `src/pages/admin/tabs/AdminContactTab.jsx`
- Clean `Card` with `AdminFormShimmer` loading state, split into **Direct Channels** (Email, WhatsApp) and **Social Profiles** (LinkedIn, GitHub, Instagram, Facebook, X/Twitter) using `@tabler/icons-react` brand icons in labels and 2-column desktop grid.

### 5.3 `src/pages/admin/tabs/AdminPrivacyTab.jsx`
- `AdminPageHeader` with `Preview Page` (`Link to="/privacy-policy" target="_blank"`) and `Reset Defaults` (`useConfirm()`).
- Sectioned form separated by `Separator` and clear subheadings (`Page Header & Metadata` with `Today` date button, policy content sections, compliance contact details) using shadcn `Label`, `Input`, and `Textarea`.

### 5.4 `src/pages/admin/tabs/AdminSeoTab.jsx`
- 2-column responsive layout (`grid-cols-1 xl:grid-cols-12 gap-6`):
  - **Left (`xl:col-span-7`, sticky on `xl`):** Live 1200x630 `<canvas>` preview inside realistic social frame switcher (`Twitter / X`, `WhatsApp`, `LinkedIn`). Active switcher button retains the `active` class to preserve `AdminSeoTab.test.jsx`.
  - **Right (`xl:col-span-5`):** Theme preset buttons (`Cyber Indigo`, `Midnight Navy`, `Sunset Plum`), form fields (`Headline / Author Name`, `Professional Role / Subtitle`, `Description`, `Website`, `Tech Stack`), `Switch` for `Include Avatar`, and action buttons (`Download 1200×630 PNG`, `Copy Image`, `Save as Website SEO`).

### 5.5 `src/pages/admin/tabs/AdminDatabaseTab.jsx`
- **Firestore Health & Storage Overview:** Contextual status grid displaying live document counts (`Projects`, `Skills`), configuration presence (`Profile`, `Contact`, `Privacy`), and the **Storage Mode: Base64 Direct** badge placed where it is operationally meaningful.
- **Backup & Export Card:** `Download Full Backup` and `Preview Backup Data`. The `Raw JSON Backup Preview` modal migrates to shadcn `Dialog` (`sm:max-w-3xl`, scrollable monospace `<pre>`, `Copy JSON` button).
- **Restore & Seeder Card (Caution Surface):** `Restore from JSON` file picker + confirmation `AlertDialog`, and `Run Initial Seeder` + confirmation `AlertDialog`.

### 5.6 Legacy CSS Retirement
Once all Admin components are migrated and verified:
1. Grep `src/` to confirm zero imports of `admin.css`, `confirm.css`, `global.css`, `mediaqueries.css`, or `variables.css`.
2. Delete all 5 legacy stylesheets (~115 KB total):
   - `src/styles/admin.css`
   - `src/styles/confirm.css`
   - `src/styles/global.css`
   - `src/styles/mediaqueries.css`
   - `src/styles/variables.css`
3. Retain `src/styles/index.css` as the sole stylesheet in the repository.

---

## 6. Testing, Verification & Antislop Mode 2 Delivery Gate

### 6.1 Test Preservation & Targeted Updates
- **`test/pages/admin/AdminPage.test.jsx`:** Replace the Spec 1 coexistence check (`confirm.css` / `admin.css` scoped tokens) with assertions verifying zero legacy CSS files remain in `src/styles/` (only `index.css`), `.rich-*` rules remain intact in `index.css`, and add behavioral tests for `AdminPage` grouped sidebar & shell rendering.
- **`test/pages/admin/AdminAnalyticsTab.test.jsx`:** Update the confirmation dialog assertion from `getByRole('dialog')` to `getByRole('alertdialog')` to reflect semantic Radix `AlertDialog`.
- **All Other Test Suites (24+ files including `AdminProjectsTab`, `AdminSkillsTab`, `AdminSeoTab`, `AdminDatabaseTab`, `AdminShimmer`, and all Public UI tests):** Must pass 100% without regression.

### 6.2 Quality & Delivery Gates
1. **TDD per Task:** Write/update tests first, implement, verify green.
2. **Full Automated Verification:** `npx vitest run` (all tests green) + `npm run build` (clean production build).
3. **Whole-Branch Senior Code Review:** Review entire Spec 2 diff via subagent and resolve all Critical/Important findings via TDD.
4. **Antislop Mode 2 (`after`) Audit:**
   - Run `antislop-human/contrast-check.py` on all Admin semantic pairs (Light + Dark).
   - Inspect responsive mobile/desktop layout, keyboard focus, touch targets (`>= 44px` on primary mobile controls), zero em dashes in UI copy, honest loading/empty/error states, and shadcn/Tailwind hygiene.
   - Save numbered findings to `anti-slop/audit-002-2026-11-23.md`, wait for user selection of findings to fix, apply fixes, re-verify, and deliver the 4-block **Delivery Gate PASS/FAIL** report.
