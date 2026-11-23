# Design Spec: Foundation (Tailwind v4 + shadcn/ui) & Landing Page UI Rework

- **Date:** 2026-11-23
- **Status:** Draft for User Review
- **Scope:** Spec 1 of 2 (Foundation + Design System + Landing Page & Public Pages)
- **Follow-up Scope (Out of Scope for Spec 1):** Spec 2 will cover the full Admin Panel rework (Login, App Shell/Sidebar, Overview, and all 8 Admin Tabs).
- **Antislop Mode:** `after` (build and verify first, then run numbered antislop audit in `anti-slop/audit-001-2026-11-23.md`, apply user-approved fixes, and complete the Delivery Gate).

---

## 1. Shared Understanding & Goals

### Intended Outcome
Upgrade `vinsensiusarko-portfolio` from ~4,900 lines of legacy vanilla CSS (`global.css`, `mediaqueries.css`, `variables.css`) to a cohesive, accessible, designer-crafted **Tailwind CSS v4 + shadcn/ui** architecture, starting with the complete Design System foundation and full rework of all public-facing pages (`HomePage`, `PrivacyPolicyPage`, `NotFoundPage`, `Navbar`, `Footer`, `CommandPalette`, `ProjectModal`, `FloatingActions`).

### Preserved Features & Constraints
- **Stack remains pure JavaScript (JSX):** React 19, Vite 6, React Router 7, Firebase 11, Vitest 3 (`components.json` configured with `"tsx": false`).
- **All existing user-facing features stay fully functional:**
  - Light & Dark theme toggle (`ThemeContext` via `data-theme="dark"`).
  - 4 Seasonal themes (`spring`, `summer`, `autumn`, `winter`) + `SeasonalCanvas` particle background (refined opacity/calmness, toggleable, respects `prefers-reduced-motion`).
  - Hero typewriter effect (`Web Developer`, `Mobile Developer`).
  - Experience & Skills with `SkillIcon` (Font Awesome brands, custom SVG Flutter/Dart, uploaded PNG/SVG, `BrandLogo` for Arko CMS) and zero-flicker `localStorage` caching + stable React keys.
  - Projects search, category tabs (`All`, `Mobile App`, `Web App`, `Web Portal`, `Backend API`), initial 6-item cap with `Show More Projects` / `Show Less` (smooth scroll back to `#projects`), and `ProjectModal` multi-image gallery (prev/next arrows, keyboard navigation, thumbnail strip). No redundant "Details" button on cards.
  - Contact section with full non-truncated email (`me@vinsensiusarka.id`) + one-click clipboard copy toast, plus social links.
  - Command Palette (`Ctrl+K` / `Cmd+K`), Micro-Interaction Sound Effects toggle, WhatsApp quick chat, Back-to-Top button, Privacy Policy page, and 404 page.
- **Admin Panel safety during Spec 1:** `/admin` and all 8 Admin tabs must remain visually and functionally intact while `admin.css` coexists alongside Tailwind v4 until Spec 2.

### Success Criteria
1. Tailwind CSS v4 + `shadcn/ui` CLI initialized cleanly with `@/*` path aliases and reusable UI primitives in `src/components/ui/`.
2. `DESIGN.md` created at repo root defining the complete **Editorial Craft** design direction and tokens.
3. All public pages and shared public components migrated off `global.css`, `mediaqueries.css`, and `variables.css`.
4. All 25+ Vitest test files (93+ tests) pass 100%, `npm run build` succeeds cleanly, and `/admin` remains unbroken.
5. Antislop `after` audit produced in `anti-slop/audit-001-2026-11-23.md`, approved fixes completed, and Delivery Gate passes cleanly.

---

## 2. Design Direction (`DESIGN.md` Specification)

> **Design Read:** Reading this as: Personal software developer portfolio (Web & Mobile: Flutter, Laravel, Java, React) for technical recruiters, engineering leads, and freelance clients, in an **Editorial Craft / Modern Studio** visual language, dial **ENERGY 2 / RHYTHM 3 / MOTION 2**.

### Three Dials
- **ENERGY 2 (Balanced):** Confident studio presence without noisy neon glows or gimmicks.
- **RHYTHM 3 (Varied):** Each section uses a distinct editorial composition (asymmetric hero split, left-anchored editorial narrative about, tonal 2-column skill index, toolbar + showcase project grid, 2-column split contact) so sections never repeat the same centered template.
- **MOTION 2 (Purposeful):** Subtle scroll-reveal transitions (`useScrollReveal`), crisp Radix overlay transitions, gentle image hover framing, and calm `SeasonalCanvas` particles, all disabled under `prefers-reduced-motion: reduce`.

### Typography (Google Fonts loaded in `index.html`)
- **Display / Headings:** `Bricolage Grotesque` (weights 500, 600, 700). Reason: distinctive contemporary studio personality with crisp geometric warmth, avoiding default Inter/Space Grotesk/Poppins sameness.
- **Body / UI Controls:** `Plus Jakarta Sans` (weights 400, 500, 600, 700). Reason: high legibility at 14px-16px across both English and Indonesian UI copy.
- **Monospace Metadata:** `JetBrains Mono` (weights 400, 500). Reason: strictly reserved for compact technical tokens (`Ctrl K`, gallery counter `1 / 3`, code snippets in Privacy Policy), never used for hero or section headings.

### Color Palette (2 Neutral Cores + 1 Deliberate Seasonal Accent)
- **Light Mode (Warm Alabaster & Deep Ink):**
  - `--background`: `#FAF9F6` (warm paper canvas, avoids sterile flat white)
  - `--card`: `#FFFFFF`
  - `--muted`: `#F2F0EB`
  - `--foreground`: `#141413` (contrast > 16:1 on background)
  - `--muted-foreground`: `#57534E` (contrast > 6.5:1 on background, exceeds WCAG AA)
  - `--border`: `#E5E2DC`
  - `--primary`: `#141413` / `--primary-foreground`: `#FAF9F6`
- **Dark Mode (Deep Charcoal Ink & Warm Bone):**
  - `--background`: `#0E1012`
  - `--card`: `#16191D`
  - `--muted`: `#1E2228`
  - `--foreground`: `#F4F3EE` (contrast > 16:1)
  - `--muted-foreground`: `#9CA3AF` (contrast > 6.5:1)
  - `--border`: `#272C34`
  - `--primary`: `#F4F3EE` / `--primary-foreground`: `#0E1012`
- **Seasonal Accent Tokens (`html[data-season="..."]`):**
  Mapped cleanly into `--season-accent`, `--season-surface`, `--season-foreground`, and `--season-border`, all verified for WCAG AA contrast:
  - `spring`: `#BE185D` (light) / `#F472B6` (dark)
  - `summer`: `#B45309` (light) / `#FBBF24` (dark)
  - `autumn`: `#C2410C` (light) / `#FB923C` (dark)
  - `winter`: `#0369A1` (light) / `#38BDF8` (dark)
- **Usage Restraint:** Primary CTAs use `--primary` (Ink/Bone). The seasonal accent is reserved for deliberate focal cues: active nav indicator, active season switcher state, active filter/focus highlight, and subtle section eyebrow marker.

### Radius, Elevation, Glass & Icon Policy
- **Radius hierarchy:** `--radius: 0.625rem` (`rounded-2xl` for the hero portrait frame, `rounded-xl` for cards and dialogs, `rounded-lg` for buttons and inputs, `rounded-full` strictly for compact status dots and floating action icon dock buttons). Never pill-everything.
- **Elevation:** Flat 1px hairline borders by default; subtle elevation shadows only on overlays (`Dialog`, `Popover`, `Sheet`, `FloatingActions`) and hovered project cards.
- **Glassmorphism dose cap:** Maximum 1 surface: scrolled sticky `Navbar` (`backdrop-blur-md bg-background/85`).
- **Icons:** `@tabler/icons-react` for UI chrome inside shadcn components (clean, uniform 1.75px stroke weight, intentional alternative to default Lucide), while `SkillIcon` retains custom Flutter/Dart SVGs, Font Awesome 6 brand icons, uploaded PNG/SVG assets, and `BrandLogo`.

---

## 3. Technical Architecture & Admin Coexistence

### Dependencies & Tooling
- **Styling & Utilities:** `tailwindcss`, `@tailwindcss/vite`, `clsx`, `tailwind-merge`, `class-variance-authority`, `@tabler/icons-react`, `sonner`, `cmdk`.
- **Radix Primitives (installed via `npx shadcn@latest add`):**
  `button`, `badge`, `card`, `dialog`, `command`, `popover`, `sheet`, `input`, `separator`, `tooltip`, `switch`, `sonner`, `alert`, `skeleton`.
- **Vite Configuration (`vite.config.js`):**
  - Register `tailwindcss()` from `@tailwindcss/vite` alongside `react()`.
  - Configure `resolve.alias`: `'@': path.resolve(__dirname, './src')`.
  - Keep `manualChunks` (`vendor`, `firebase`) and Vitest config intact.
- **Path Aliases (`jsconfig.json`):**
  Map `"@/*": ["./src/*"]` so shadcn CLI and IDE navigation resolve imports identically.
- **shadcn Configuration (`components.json`):**
  - Initialized via `npx shadcn@latest init` with Radix primitives (`--base radix`), `"rsc": false`, `"tsx": false`
  - `"tailwind": { "config": "", "css": "src/styles/index.css", "baseColor": "stone", "cssVariables": true }`
  - `"iconLibrary": "tabler"`
  - `"aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui", "lib": "@/lib", "hooks": "@/hooks" }`

### CSS Architecture & Admin Coexistence Strategy
- **Single Public Stylesheet (`src/styles/index.css`):**
  - `@import "tailwindcss";`
  - `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));` so existing `ThemeContext` (`html[data-theme="dark"]`) drives Tailwind `dark:` and shadcn semantic tokens automatically without rewriting `ThemeContext`.
  - `@theme inline { ... }` exposing shadcn tokens (`--color-background`, `--color-foreground`, `--color-card`, `--color-primary`, `--color-muted`, `--color-border`, `--color-season-accent`, `--color-season-surface`, `--color-season-foreground`, `--color-season-border`, `--font-sans`, `--font-display`, `--font-mono`).
  - `@layer base` rules for smooth scroll, base cursor pointer on enabled interactive controls, `focus-visible` ring, scroll-reveal utility transitions (`.reveal-on-scroll`, `.revealed`, honoring `prefers-reduced-motion`), and typewriter cursor blink.
- **Entry Point (`src/main.jsx`):**
  - Replace legacy imports (`global.css`, `mediaqueries.css`, `variables.css`) with `import './styles/index.css';`.
- **Admin Panel Isolation (`AdminPage.jsx` + `src/styles/admin.css`):**
  - `admin.css` is already imported inside `AdminPage.jsx` and scoped under `.admin-shell`.
  - In `src/styles/admin.css`, ensure explicit base typography/padding/button resets inside `.admin-shell` are not overridden by Tailwind v4 Preflight (unlayered styles in `admin.css` naturally win over Tailwind `@layer base` in CSS cascade, preserving Admin Panel layout 100% until Spec 2 migrates Admin to shadcn/ui).
  - `src/styles/confirm.css` remains imported by `ConfirmContext.jsx` so confirm dialogs in Admin Panel stay intact.

---

## 4. Component-by-Component Public Pages Design

### App Shell (`src/App.jsx`)
- Wrap routes inside `<TooltipProvider delayDuration={200}>`.
- Mount shadcn `<Toaster position="bottom-right" richColors closeButton />` (from `@/components/ui/sonner`) once at app root.

### Navigation & Global Overlays
1. **`Navbar.jsx`:**
   - Single responsive `<header>` (`sticky top-0 z-40`), transparent at top, `bg-background/85 backdrop-blur-md border-b border-border` when `scrolled` is true.
   - Desktop (`md:flex`): Left `BrandLogo` + siteName (`font-display font-semibold`); Center `<nav>` with `.nav-links` containing real anchors (`#about`, `#experience`, `#projects`, `#contact`) and `<Link to="/privacy-policy">` (or simplified home/projects/contact links + `Back to Portfolio` button when `variant="policy"`). Active section highlighted with bottom seasonal accent hairline.
   - Right controls: Command Palette trigger (`Button variant="outline" size="sm"` with search icon + `<kbd className="font-mono">Ctrl K</kbd>`), `<SeasonSwitcher />`, Theme toggle (`Button variant="ghost" size="icon"` with Sun/Moon Tabler icon).
   - Mobile (`md:hidden`): Compact action strip (Search icon button, `SeasonSwitcher`, Theme toggle, and Hamburger button triggering shadcn `<Sheet>`).
   - Mobile Drawer (`<Sheet>` + `<SheetContent side="right">`): Contains `<SheetTitle>` ("Navigation"), full list of navigation links with >= 44px tap targets (`min-h-11`), Escape dismissal, and auto-close on link click.
2. **`SeasonSwitcher.jsx`:**
   - Built with shadcn `<Popover>` (`PopoverTrigger` + `PopoverContent`).
   - Trigger: `Button variant="outline" size="sm"` displaying season icon/emoji + label (`aria-label="Select season (current: ...)"`), styled with subtle seasonal border tint.
   - Content: Header ("Season Theme" + `Badge` "Auto" when `isAutoSeason`), 2x2 grid of 4 season options (`role="menuitem"` preserving test compatibility and keyboard access), `<Separator />`, Particle Effects toggle row (`role="button"` / accessible toggle button with ON/OFF `Badge`), and "Auto by Calendar" reset button when overridden.
3. **`CommandPalette.jsx`:**
   - Built on shadcn `<Dialog>` + `<Command>` (`CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandSeparator`).
   - Retains full controlled/uncontrolled API (`isOpen`, `onOpen`, `onClose`, `customActions`), `Ctrl+K` / `Cmd+K` global shortcut, `Escape` dismissal, body scroll lock, clamped ArrowUp/ArrowDown + Enter keyboard navigation, sound effects (`useSound`), and all action groups (`Navigation`, `Projects`, `Preferences`, `Seasons`).

### Landing Page Sections (`HomePage.jsx`)
1. **`HeroSection.jsx` (`#profile`, Asymmetric 7/5 Editorial Split):**
   - Container `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 lg:pt-20 lg:pb-28`.
   - Left (`lg:col-span-7`):
     - Quiet greeting + inline active season text line (small non-pulsing colored dot marking live active season, no heavy pill badge above H1).
     - `<h1>` (`font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight`) displaying `siteSettings.name`.
     - Typewriter subtitle line (`text-xl sm:text-2xl text-muted-foreground font-medium`) preserving existing typewriter bug-free hook logic.
     - Action row (`flex flex-wrap gap-3 pt-2`): Primary `<Button asChild size="lg">` for `Download CV` (with `trackCvDownload()`), Secondary `<Button asChild variant="outline" size="lg">` for `Contact Info` (`href="#contact"`).
     - Social links row (`LinkedIn`, `GitHub`, `Instagram`, `Email`) as `<Button asChild variant="ghost" size="icon">` wrapped in `<Tooltip>`.
   - Right (`lg:col-span-5`):
     - Architectural portrait frame: `aspect-square max-w-[340px] lg:max-w-[380px] mx-auto rounded-2xl border border-border bg-card p-2` with subtle bottom-right seasonal accent corner line (zero neon radial blur orb). Image has `width="380" height="380" fetchPriority="high"` (never lazy).
2. **`AboutSection.jsx` (`#about`, Left-Anchored Editorial Narrative):**
   - Header aligned left (breaking centered-header monotony): quiet label ("About") + `<h2>About Me</h2>` (`font-display text-3xl sm:text-4xl font-bold`).
   - 12-column grid (`gap-10 lg:gap-14 items-start`):
     - Left (`lg:col-span-5`): Personal photo (`aspect-[4/5] w-full max-w-sm rounded-xl object-cover border border-border`, `loading="lazy"`).
     - Right (`lg:col-span-7`): Comfortable narrative bio (`text-base sm:text-lg leading-relaxed text-muted-foreground max-w-prose`), `<Separator className="my-6" />`, and 2 horizontal editorial metadata blocks (`Experience` with `siteSettings.expYears` / `expSub`, `Education` with `siteSettings.eduDegree` / `eduMajor`) separated cleanly without heavy card chrome.
3. **`ExperienceSection.jsx` (`#experience`, Tonal Structured Index):**
   - Full-bleed tonal section band (`bg-muted/40 border-y border-border py-20 lg:py-24`) to create clear vertical rhythm separation.
   - Left-aligned header ("Experience & Skills") with concise summary.
   - 2-column grid (`grid-cols-1 lg:grid-cols-2 gap-6`):
     - Card 1: `Programming Languages` (`<Card>` with `<CardHeader>` + `<CardContent>`).
     - Card 2: `Frameworks & Tools` (`<Card>` with `<CardHeader>` + `<CardContent>`).
   - Inside each card: 2-column compact skill list (`grid-cols-1 sm:grid-cols-2 gap-3`). Each `.skill-item` keeps the exact stable key `(skill.name || skill.id || '').toLowerCase().trim()`, icon box (`size-10 rounded-lg bg-muted border border-border flex items-center justify-center` rendering `<SkillIcon />`), skill name, and shadcn `<Badge>` (`Experienced` vs `Intermediate` semantic styling). Honest empty state per category if empty.
4. **`ProjectsSection.jsx` (`#projects`) & `ProjectModal.jsx`:**
   - Top toolbar: Left-aligned `<h2>Projects</h2>` paired with inline search `<Input>` (with search icon & clear button) and category filter tab bar (`role="tablist"`, `role="tab"`, `aria-selected`) built with clean accessible tab buttons styled in our design tokens.
   - Project Grid (`id="projects-grid"`, `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 reveal-stagger`):
     - Each project is an `<article>` wrapped in shadcn `<Card>` (`overflow-hidden flex flex-col cursor-pointer transition-colors hover:border-foreground/30 hover:shadow-md`).
     - Media header: fixed `aspect-[16/10]` container with blurred backdrop and `object-contain` main `<img>` (`loading="lazy"`) so both landscape web apps and vertical mobile screenshots display without cropping, paired with top-left category `<Badge>`.
     - Card body (`CardHeader` + `CardContent` + `CardFooter`): Title, rich formatted description (clamped cleanly to 3 lines), up to 4 tech `<Badge variant="secondary">` tags (+ `+N` badge), and footer actions (`GitHub` `<Button variant="outline" size="sm">`, `Live Demo` / `Play Store` `<Button size="sm">`, or `Coming Soon` `<Badge variant="outline">`). Clicking external links stops propagation and does not open modal.
   - Empty state: Centered structured empty box (icon + "No matching projects found" + helpful hint + `<Button variant="outline" onClick={resetFilters}>Reset Filters</Button>`).
   - Pagination toggle: Initial 6 items; `Show More Projects (N more)` / `Show Less` `<Button variant="outline">` with smooth scroll back to `#projects` on collapse.
   - **`ProjectModal.jsx`:** Rebuilt with shadcn `<Dialog>` (`DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`). Features 16:9 image stage, `Previous image` / `Next image` icon buttons, mono counter (`1 / 3`), keyboard `ArrowLeft`/`ArrowRight`/`Escape` support (ignoring inputs/textareas), clickable `Image Gallery Thumbnails` region, Live Project / Coming Soon `Badge`, full rich description, `Technologies Used` badge list, and action buttons (`GitHub Repository`, `Live Demo` / `Play Store`, `Close`).
5. **`ContactSection.jsx` (`#contact`, 2-Column Editorial Split):**
   - Left (`lg:col-span-5`): Section title `Contact Me`, concise direct invitation copy, and primary Email `<Card>` showing full non-truncated `me@vinsensiusarka.id` (`break-all sm:break-normal`) with `mailto:` action and Copy `<Button variant="outline" size="sm">` triggering shadcn `toast.success(...)` via Sonner.
   - Right (`lg:col-span-7`): Clean 2-column grid of social channel cards (`LinkedIn`, `GitHub`, `Instagram`, `Facebook`, `X / Twitter`), each an accessible `<a>` with brand icon, platform label, handle, and subtle hover affordance.
6. **`Footer.jsx` & `FloatingActions.jsx`:**
   - `Footer`: Compact single-row editorial footer (`max-w-6xl mx-auto`), `<Separator />` top divider, copyright on left, 5 real navigation links on right (or centered copyright when `variant="policy"`).
   - `FloatingActions`: Refined vertical stack fixed bottom-right (`fixed bottom-5 right-5 z-30 flex flex-col gap-2.5`) with `<Tooltip>` + circular `<Button size="icon">` controls: Sound toggle (`#sound-toggle-btn`, `pointer-events-auto`), Back-to-top (`#back-to-top-btn`, visible after `scrollY > 400`), and WhatsApp action (`<a>` styled as accessible icon button).

### Supporting Public Pages
- **`PrivacyPolicyPage.jsx`:** Rebuilt with `max-w-4xl mx-auto px-4 sm:px-6 py-12`, shadcn `<Badge>` metadata row, 3-column highlight `<Card>` grid, quick navigation TOC `<Card>`, clean numbered prose blocks (`#section-1` to `#section-11`), shadcn `<Alert>` for the "Strict Commitment" privacy notice, permission cards, third-party provider cards, data deletion instruction `<Card>`, developer contact `<Card>`, and bottom action `<Button>`s (`Back to Portfolio`, `Contact Developer`). Remove em dashes (`—`) from section 9 prose during migration.
- **`NotFoundPage.jsx`:** Clean centered editorial 404 layout preserving the `"Oops!"` heading, `"Halaman yang Anda cari tidak ditemukan."` copy, subtle monochrome geometric 404 mark, and shadcn `<Button asChild>` (`Back to Portfolio`).

---

## 5. Data Flow, UI States & Error Handling

- **Hooks & Contexts (Unchanged API):** `usePortfolioData`, `usePrivacyPolicy`, `useScrollReveal`, `ThemeContext`, `SeasonContext`, `SoundContext`, `ConfirmContext`.
- **Zero-Flicker Data Hydration:** `usePortfolioData` continues initializing synchronously from `localStorage` cache (`FALLBACK_*` if empty) and avoids redundant state updates via deep equality checks.
- **UI States Coverage (R-27):**
  - *Empty:* `ProjectsSection` (no filter/search match -> Reset Filters), `ExperienceSection` (empty category message), `CommandPalette` (no command match -> displays query).
  - *Loading:* Instant cache/fallback render on `HomePage`; shadcn `<Skeleton>` block on `PrivacyPolicyPage` if `loading` state is active without cached policy.
  - *Error:* Every `<img>` falls back cleanly on `onError`; clipboard copy failures show graceful feedback toast; Firestore listener errors log warning and retain cached/fallback data without blanking the UI.
- **Motion & Media Safety:**
  - `SeasonalCanvas` checks `prefers-reduced-motion` and uses refined lower particle density/opacity so text contrast (WCAG AA) is never compromised.
  - All `<img>` tags specify explicit dimensions or `aspect-*` containers to prevent Cumulative Layout Shift.

---

## 6. Testing, Verification & Antislop `after` Audit Plan

### Automated Testing (`Vitest` + React Testing Library)
1. **JSDOM Polyfills (`test/setup.js`):** Add minimal polyfills required by Radix UI / `cmdk` (`ResizeObserver`, `window.matchMedia`, `Element.prototype.scrollIntoView`, `Element.prototype.hasPointerCapture`) if absent in JSDOM.
2. **Test Suite Preservation & Targeted Updates:**
   - Keep all 25 test files (93+ tests) green.
   - Update `test/components/layout/Layout.test.jsx` to click the mobile menu button (`Toggle navigation menu`) to open the shadcn `<Sheet>` drawer before asserting the `Privacy Policy` link inside the mobile menu.
   - Add/verify tests for `Navbar`, `SeasonSwitcher`, `CommandPalette`, `ExperienceSection`, `ProjectsSection`, `ProjectModal`, `PrivacyPolicyPage`, `NotFoundPage`, and `AdminPage` coexistence.

### Verification & Antislop Mode `after` Protocol
1. Run `npm test` (100% passing) and `npm run build` (clean bundle, zero warnings/errors).
2. Visually and interactively verify in browser across:
   - Light Mode & Dark Mode
   - All 4 Seasons (`spring`, `summer`, `autumn`, `winter`)
   - Desktop (`1440px`) and Mobile (`390px`, zero horizontal overflow)
   - `/`, `/privacy-policy`, `/404`, and `/admin` (confirming Admin Panel is completely intact)
3. **Antislop Mode 2 (`after`) Audit:**
   - Audit the finished Spec 1 UI against all antislop rules (`antislop`, `antislop-ui`, `antislop-copywriting`, `antislop-human`, `antislop-layoutmobile`).
   - Save numbered findings with priorities (`HIGH` / `MEDIUM` / `LOW`) to `anti-slop/audit-001-2026-11-23.md`.
   - Present the findings list to the user, fix only the user-approved item numbers, and close Spec 1 with the mandatory **Delivery Gate PASS/FAIL report** backed by concrete click-through evidence.
