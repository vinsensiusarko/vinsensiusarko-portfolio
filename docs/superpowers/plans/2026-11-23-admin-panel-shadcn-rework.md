# Spec 2 Implementation Plan: Full Rework Admin Panel dengan Tailwind CSS v4 + shadcn/ui

> **For agentic workers:** Follow TDD (write/update test, verify RED/GREEN), use `gap-*` (not `space-y-*`), `size-*`, semantic Tailwind v4 tokens from `src/styles/index.css` (Neutral Studio Ink + Semantic Status Only, no seasonal accents on CMS chrome), `@tabler/icons-react` for all UI chrome (`SkillIcon` preserved for tech brands), and zero em dashes (`—`) in UI copy.

**Goal:** Migrate the entire Admin Panel (`AdminLogin`, `AdminPage`, `ConfirmContext`, `AdminShimmer`, and all 8 Admin Tabs) onto Tailwind CSS v4 + shadcn/ui and retire all 5 legacy CSS files (~115 KB: `admin.css`, `confirm.css`, `global.css`, `mediaqueries.css`, `variables.css`).

**Spec:** `docs/superpowers/specs/2026-11-23-admin-panel-shadcn-rework-design.md`

**Tech Stack:** React 19 (pure JSX), Vite 6, React Router 7, Tailwind CSS v4, shadcn/ui (Radix UI), `@tabler/icons-react`, `sonner`, Firebase 11, Vitest 3 + React Testing Library.

---

## Task 1: Add Essential shadcn/ui Primitives & `AdminPageHeader`

**Files:**
- Create: `src/components/ui/alert-dialog.jsx`
- Create: `src/components/ui/label.jsx`
- Create: `src/components/ui/textarea.jsx`
- Create: `src/components/ui/select.jsx`
- Create: `src/components/ui/tabs.jsx`
- Create: `src/components/ui/progress.jsx`
- Create: `src/pages/admin/components/AdminPageHeader.jsx`

**Steps:**
1. Run `npx -y shadcn@latest add alert-dialog label textarea select tabs progress --dry-run` to inspect required npm packages (note: `radix-ui` unified package is already installed, so avoid child `npm install` `EALLOWSCRIPTS`).
2. Install any missing package dependencies directly via `npm install`, then run `npx -y shadcn@latest add alert-dialog label textarea select tabs progress --yes`.
3. Inspect all 6 newly generated files in `src/components/ui/`:
   - Replace any `lucide-react` icon imports (e.g., `ChevronDownIcon`, `ChevronUpIcon`, `CheckIcon` in `select.jsx`) with `@tabler/icons-react` (`IconChevronDown`, `IconChevronUp`, `IconCheck`).
   - Confirm all imports resolve cleanly in pure JSX (`cn`, `radix-ui`, etc.).
4. Create `src/pages/admin/components/AdminPageHeader.jsx` accepting `{ title, description, badge, actions }` using `Bricolage Grotesque` heading, muted description, optional contextual `Badge`, and responsive flex wrap for `actions`.
5. Run `npx vitest run; npm run build` to confirm clean baseline, then commit:
   `git commit -m "feat(admin): add shadcn form/dialog primitives and AdminPageHeader"`

---

## Task 2: Rework `ConfirmContext`, `AdminShimmer` & `AdminLogin`

**Files:**
- Modify: `src/context/ConfirmContext.jsx`
- Modify: `src/pages/admin/AdminShimmer.jsx`
- Modify: `src/pages/admin/AdminLogin.jsx`
- Modify: `test/pages/admin/AdminAnalyticsTab.test.jsx` (`role="alertdialog"`)

**Steps:**
1. Update `test/pages/admin/AdminAnalyticsTab.test.jsx` line 75/83 to expect `role="alertdialog"` (semantic Radix `AlertDialog` role) instead of `role="dialog"`.
2. Rewrite `src/context/ConfirmContext.jsx`:
   - Remove `import '../styles/confirm.css'`.
   - Render shadcn `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`.
   - Keep `const ok = await confirm({ title, message, confirmText, cancelText, variant })` promise API 100% identical, cleanly resolving `false` on Cancel or `onOpenChange(false)`.
   - Use `@tabler/icons-react` (`IconAlertTriangle`, `IconAlertCircle`, `IconInfoCircle`) with semantic styling (`danger` -> destructive button).
3. Rewrite `src/pages/admin/AdminShimmer.jsx`:
   - Replace custom `.admin-shimmer` CSS divs with shadcn `<Skeleton />` compositions while retaining `data-testid`s (`admin-stats-shimmer`, `admin-projects-shimmer`, `admin-skills-shimmer`, `admin-form-shimmer`, `admin-dashboard-skeleton`), structural marker classes tested by `AdminShimmer.test.jsx`, and `Verifying Admin Session...` copy.
4. Rewrite `src/pages/admin/AdminLogin.jsx`:
   - Centered Neutral Studio Ink layout (`min-h-dvh bg-background`), top-right Light/Dark theme toggle (`min-h-11 min-w-11`), shadcn `Card`, `BrandLogo`, `h1` `Admin Portal`, inline `Alert variant="destructive"` for login error, `Label` + `Input` (`Email Address`, `Password`), full-width `Button` (`Sign In`, `IconLoader2` while loading), and `Back to Public Portfolio` link (`href="/"`).
5. Run `npx vitest run test/pages/admin/AdminPage.test.jsx test/pages/admin/AdminShimmer.test.jsx test/pages/admin/AdminAnalyticsTab.test.jsx` to verify GREEN, then commit:
   `git commit -m "feat(admin): migrate ConfirmContext, AdminShimmer, and AdminLogin to shadcn/ui"`

---

## Task 3: Rework `AdminPage.jsx` App Shell (Grouped Sidebar, Mobile `Sheet`, Topbar & `Sonner` Toast)

**Files:**
- Modify: `src/pages/admin/AdminPage.jsx`
- Modify: `test/pages/admin/AdminPage.test.jsx`

**Steps:**
1. Add behavioral tests in `test/pages/admin/AdminPage.test.jsx` covering the authenticated `AdminPage` shell (mocking `firebase/auth` `onAuthStateChanged` with a signed-in user):
   - Renders grouped sidebar sections (`Content`, `Insights`, `Site Settings`, `System`) with all 8 tab buttons.
   - Does NOT render the legacy global `.stats-grid` banner.
   - Persists active tab and sidebar collapse state to `localStorage`.
2. Rewrite `src/pages/admin/AdminPage.jsx`:
   - Remove `import '../../styles/admin.css'`.
   - Organize `TAB_GROUPS`:
     - `Content`: `projects` (with live `{projects.length}` badge), `skills` (with live `{skills.length}` badge).
     - `Insights`: `analytics`.
     - `Site Settings`: `profile`, `contact`, `privacy`, `seo`.
     - `System`: `database`.
   - Desktop collapsible rail (`hidden lg:flex`, `w-64` / `w-[68px]`, `admin_sidebar_collapsed` in `localStorage`) wrapped in `TooltipProvider`, showing `Tooltip` on nav buttons when collapsed.
   - Mobile drawer using shadcn `Sheet` (`side="left"`) triggered by topbar menu button (`min-h-11 min-w-11`).
   - Sticky topbar (`h-14 border-b border-border bg-background/95`) with active tab `h1` (`id="topbar-title"`), `View Live Site` link button, and Light/Dark toggle.
   - Delegate `showToast(message, type)` directly to `sonner`'s `toast.success` / `toast.error` / `toast.warning` / `toast.info`; remove custom `toasts` state and `#toast-container`.
   - Remove the global 3-card `.stats-grid` block.
   - Replace all Font Awesome sidebar/header icons with `@tabler/icons-react`.
3. Run `npx vitest run test/pages/admin/AdminPage.test.jsx` to verify GREEN, then commit:
   `git commit -m "feat(admin): rework AdminPage shell with grouped sidebar, Sheet drawer, and Sonner toasts"`

---

## Task 4: Rework `AdminProjectsTab.jsx`

**Files:**
- Modify: `src/pages/admin/tabs/AdminProjectsTab.jsx`

**Steps:**
1. Read lines 251-931 of `src/pages/admin/tabs/AdminProjectsTab.jsx` completely before editing to ensure zero loss of form fields, gallery helpers, or Firestore batch logic.
2. Refactor UI onto shadcn `Card`, `Badge`, `Button`, `Dialog`, `Input`, `Label`, `Select`, `Textarea`, `Switch`, `Separator`, `AdminPageHeader`, and `@tabler/icons-react`:
   - Responsive card grid (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4`) with marker class `admin-project-card`, `aspect-[16/10]` cover preview, `#order` mono badge (`title="Display Order..."`), drag handle (`title="Drag to reorder"`), Up/Down reorder buttons, Edit & Delete actions.
   - Add/Edit modal in shadcn `Dialog` (`sm:max-w-3xl max-h-[90vh] overflow-y-auto`): fields for Title, Category, Order, Tech Stack, Description + live `.rich-*` preview box, GitHub URL, Demo URL, Demo Label, `isComingSoon` `Switch`, Cover Image Canvas dropzone + external URL input, and `Project Screenshot Gallery` (max 6) with `Set as Cover` and `title="Remove screenshot"` buttons.
   - Ensure zero em dashes (`—`) in UI copy.
3. Run `npx vitest run test/pages/admin/AdminProjectsTab.test.jsx` to verify GREEN, then commit:
   `git commit -m "feat(admin): rework AdminProjectsTab with shadcn Card, Dialog, and gallery controls"`

---

## Task 5: Rework `AdminSkillsTab.jsx`

**Files:**
- Modify: `src/pages/admin/tabs/AdminSkillsTab.jsx`

**Steps:**
1. Read lines 251-763 of `src/pages/admin/tabs/AdminSkillsTab.jsx` completely before editing.
2. Refactor UI onto shadcn `Card`, `Badge`, `Button`, `Dialog`, `Input`, `Label`, `Select`, `AdminPageHeader`, and `@tabler/icons-react` (preserving `SkillIcon` for brand/tech rendering):
   - 2-column layout (`grid-cols-1 lg:grid-cols-2 gap-6`): `Programming Languages` and `Frameworks & Tools`, each inside a `Card` with count badge.
   - Preserve `.skill-item-row`, `.skill-icon-box`, `title="Drag to reorder"`, `title="Click to toggle level"`, category-isolated DnD check, optimistic `setSkills`, and `portfolio_skills_cache` sync.
   - Add/Edit Skill modal in shadcn `Dialog`: `Preset Icons` chip grid, segmented `<Button type="button">` icon source switcher (`Font Awesome / Auto SVG` vs `Upload PNG / SVG`), `Upload Skill Icon` file input, `Pakai Asset Favicon Arko` shortcut, and live `SkillIcon` preview.
3. Run `npx vitest run test/pages/admin/AdminSkillsTab.test.jsx` to verify GREEN, then commit:
   `git commit -m "feat(admin): rework AdminSkillsTab with shadcn Cards, Dialog, and icon picker"`

---

## Task 6: Rework `AdminAnalyticsTab.jsx`

**Files:**
- Modify: `src/pages/admin/tabs/AdminAnalyticsTab.jsx`

**Steps:**
1. Refactor `src/pages/admin/tabs/AdminAnalyticsTab.jsx` onto shadcn `Card`, `Button`, `Progress`, `AdminPageHeader`, and `@tabler/icons-react`:
   - Neutral Studio Ink 4-card KPI grid (`Total Page Views`, `Unique Visitors`, `CV Resume Downloads`, `Mobile Traffic Share`) using muted icon chips (`bg-muted text-foreground`) and `font-mono tabular-nums` figures (no hardcoded neon colors).
   - Pure CSS/Flex 7-Day Traffic Trend bar chart (zero external chart libraries) with neutral ink bars, clear value/date labels, and honest empty state.
   - 3-column Audience Breakdown cards (`Device Breakdown`, `Browser Distribution`, `Operating Systems`) using shadcn `Progress` bars and `tabular-nums` counts/percentages.
   - Preserve `Seed Demo Data` and `Reset Analytics` `AlertDialog` confirmations and `AdminFormShimmer` / skeleton loading state.
2. Run `npx vitest run test/pages/admin/AdminAnalyticsTab.test.jsx` to verify GREEN, then commit:
   `git commit -m "feat(admin): rework AdminAnalyticsTab with neutral KPI cards and Progress bars"`

---

## Task 7: Rework `AdminProfileTab.jsx`, `AdminContactTab.jsx` & `AdminPrivacyTab.jsx` + Add Focused Unit Tests

**Files:**
- Modify: `src/pages/admin/tabs/AdminProfileTab.jsx`
- Modify: `src/pages/admin/tabs/AdminContactTab.jsx`
- Modify: `src/pages/admin/tabs/AdminPrivacyTab.jsx`
- Create: `test/pages/admin/AdminSettingsTabs.test.jsx`

**Steps:**
1. Read remaining lines of `AdminProfileTab.jsx` (201-605) and `AdminPrivacyTab.jsx` (201-450) in parallel.
2. Write focused tests in `test/pages/admin/AdminSettingsTabs.test.jsx` covering:
   - `AdminProfileTab` renders profile photo dropzones, identity/bio/experience/education fields, and CV PDF upload controls.
   - `AdminContactTab` renders direct channels (email, WhatsApp) and social URL fields, and saves to Firestore.
   - `AdminPrivacyTab` renders Preview link (`/privacy-policy`), Today date helper, Reset Defaults confirmation (`alertdialog`), and policy fields.
3. Refactor `AdminProfileTab.jsx`, `AdminContactTab.jsx`, and `AdminPrivacyTab.jsx` onto shadcn `Card`, `Separator`, `Label`, `Input`, `Textarea`, `Button`, `Badge`, `AdminPageHeader`, and `@tabler/icons-react`.
4. Run `npx vitest run test/pages/admin/AdminSettingsTabs.test.jsx` to verify GREEN, then commit:
   `git commit -m "feat(admin): rework Profile, Contact, and Privacy tabs with shadcn/ui and tests"`

---

## Task 8: Rework `AdminSeoTab.jsx` & `AdminDatabaseTab.jsx`

**Files:**
- Modify: `src/pages/admin/tabs/AdminSeoTab.jsx`
- Modify: `src/pages/admin/tabs/AdminDatabaseTab.jsx`

**Steps:**
1. Read remaining lines of `AdminSeoTab.jsx` (221-441) and `AdminDatabaseTab.jsx` (221-524) in parallel.
2. Refactor `AdminSeoTab.jsx`:
   - 12-column responsive layout (`grid-cols-1 xl:grid-cols-12 gap-6`), sticky live 1200x630 `<canvas>` preview pane on left with platform frame switcher (`Twitter / X`, `WhatsApp`, `LinkedIn`, preserving `.active` class on selected button).
   - Right control card with theme preset buttons (`Cyber Indigo`, `Midnight Navy`, `Sunset Plum`), form fields (`Headline / Author Name`, `Professional Role / Subtitle`, `Description`, `Website`, `Tech Stack`), `Switch` for `Include Avatar`, and `Download 1200×630 PNG`, `Copy Image`, `Save as Website SEO` buttons.
3. Refactor `AdminDatabaseTab.jsx`:
   - Firestore Health & contextual `Storage Mode: Base64 Direct` overview cards (`Projects`, `Skills`, `Profile`, `Contact`, `Privacy`).
   - Export & Preview card (`Download Full Backup`, `Preview Backup Data`) + shadcn `Dialog` for `Raw JSON Backup Preview` with monospace `<pre>` and `Copy JSON` button.
   - Restore & Seeder caution card (`Restore from JSON` file picker + `Run Initial Seeder`), both gated by `useConfirm()` `AlertDialog`.
4. Run `npx vitest run test/pages/admin/AdminSeoTab.test.jsx test/pages/admin/AdminDatabaseTab.test.jsx` to verify GREEN, then commit:
   `git commit -m "feat(admin): rework AdminSeoTab and AdminDatabaseTab with shadcn/ui"`

---

## Task 9: Retire Legacy CSS (~115 KB), Full Verification, Senior Code Review & Antislop Mode 2 Audit

**Files:**
- Delete: `src/styles/admin.css`
- Delete: `src/styles/confirm.css`
- Delete: `src/styles/global.css`
- Delete: `src/styles/mediaqueries.css`
- Delete: `src/styles/variables.css`
- Modify: `test/pages/admin/AdminPage.test.jsx`
- Create: `anti-slop/audit-002-2026-11-23.md`

**Steps:**
1. Search `src/` for any remaining references to `admin.css`, `confirm.css`, `global.css`, `mediaqueries.css`, or `variables.css` and confirm zero matches.
2. Delete all 5 legacy CSS files from `src/styles/`.
3. Update `test/pages/admin/AdminPage.test.jsx` to assert `src/styles/` contains only `index.css` and `.rich-*` utility rules remain in `index.css`.
4. Run full verification in one pass:
   - `npx vitest run` (all 27+ test files green)
   - `npm run build` (exit 0)
   - Em-dash scan across `src/pages/admin/` and `src/context/ConfirmContext.jsx`
   - `antislop-human/contrast-check.py` on Admin light/dark semantic token pairs
5. Commit legacy CSS retirement:
   `git commit -m "refactor(styles): retire legacy CSS stylesheets after Admin Panel shadcn migration"`
6. Spawn Whole-Branch Senior Code Reviewer subagent (`research`) to inspect the entire Spec 2 diff (`e4bf7a9..HEAD`) for bugs, accessibility issues, contrast/token leaks, DnD/Firestore edge cases, and shadcn rule violations; fix all Critical/Important findings via TDD.
7. Run **Antislop Mode 2 (`after`) Audit**, write numbered findings to `anti-slop/audit-002-2026-11-23.md`, present findings to the user and wait for their selection of finding numbers before applying audit fixes. After applying chosen fixes and re-verifying, output the mandatory 4-block **Delivery Gate PASS/FAIL** report.
