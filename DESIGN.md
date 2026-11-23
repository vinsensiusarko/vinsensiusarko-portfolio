# DESIGN.md — Vinsensius Arka Portfolio Design System

- **Brand:** Vinsensius Arka (Web & Mobile Developer: Flutter, Laravel, Java, React)
- **Visual Direction:** Editorial Craft / Modern Studio
- **Dial:** `ENERGY 2 / RHYTHM 3 / MOTION 2`
- **Component Foundation:** Tailwind CSS v4 + shadcn/ui (Radix UI primitives, JSX, `@tabler/icons-react`)

## Typography
- **Display / Headings:** `Bricolage Grotesque` (500, 600, 700). Expressive studio character without falling into generic Inter/Space Grotesk defaults.
- **Body / UI:** `Plus Jakarta Sans` (400, 500, 600, 700). Clean readability across English and Indonesian copy.
- **Monospace Metadata:** `JetBrains Mono` (400, 500). Reserved strictly for compact technical indicators (`Ctrl K`, gallery counter `1 / 3`, code snippets).

## Color Palette (2 Neutral Cores + 1 Deliberate Seasonal Accent)
- **Light Mode (Warm Alabaster & Deep Ink):**
  - Canvas `--background`: `#FAF9F6`
  - Surface `--card`: `#FFFFFF`
  - Muted `--muted`: `#F2F0EB`
  - Ink `--foreground`: `#141413`
  - Secondary Ink `--muted-foreground`: `#57534E` (WCAG AA > 6.5:1)
  - Hairline `--border`: `#E5E2DC`
  - Primary CTA `--primary`: `#141413` / `--primary-foreground`: `#FAF9F6`
- **Dark Mode (Deep Charcoal Ink & Warm Bone):**
  - Canvas `--background`: `#0E1012`
  - Surface `--card`: `#16191D`
  - Muted `--muted`: `#1E2228`
  - Bone `--foreground`: `#F4F3EE`
  - Secondary Bone `--muted-foreground`: `#9CA3AF` (WCAG AA > 6.5:1)
  - Hairline `--border`: `#272C34`
  - Primary CTA `--primary`: `#F4F3EE` / `--primary-foreground`: `#0E1012`
- **4 Seasonal Accent Palettes (`html[data-season="..."]`):**
  - `spring`: `#BE185D` (light) / `#F472B6` (dark)
  - `summer`: `#B45309` (light) / `#FBBF24` (dark)
  - `autumn`: `#C2410C` (light) / `#FB923C` (dark)
  - `winter`: `#0369A1` (light) / `#38BDF8` (dark)

## Radius, Elevation, Glass & Motion
- **Radius hierarchy:** `--radius: 0.625rem`. `rounded-2xl` hero portrait frame, `rounded-xl` cards & dialogs, `rounded-lg` buttons & inputs, `rounded-full` strictly for compact status dots and floating dock icon buttons.
- **Elevation:** Flat 1px hairline borders by default; subtle shadow only on floating overlays (`Dialog`, `Popover`, `Sheet`, `FloatingActions`) and hovered project cards.
- **Glassmorphism dose cap:** Maximum 1 element (`Navbar` when scrolled: `backdrop-blur-md bg-background/85`).
- **Motion:** Purposeful scroll-reveal (`useScrollReveal`), Radix overlay transitions, and calm `SeasonalCanvas` particles, all disabled under `prefers-reduced-motion: reduce`.

## Icons
- **UI Chrome:** `@tabler/icons-react` (consistent 1.75px stroke weight, intentional choice over default Lucide).
- **Brand & Tech Stack Icons:** Preserved via `SkillIcon` (custom Flutter/Dart SVGs, Font Awesome 6 brand icons, uploaded PNG/SVG, `BrandLogo`).
