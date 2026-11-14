# 🚀 Vinsensius Arka — Personal Portfolio & Headless CMS (React 19 + 4-Season Engine)

[![Website](https://img.shields.io/badge/Website-vinsensiusarka.id-38bdf8?style=for-the-badge&logo=google-chrome&logoColor=white)](https://vinsensiusarka.id)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite 6](https://img.shields.io/badge/Vite-6.0-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Admin Panel](https://img.shields.io/badge/Admin%20Panel-Protected-6366f1?style=for-the-badge&logo=firebase&logoColor=white)](https://vinsensiusarka.id/admin)
[![Firebase Hosting](https://img.shields.io/badge/Hosted%20On-Firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088ff?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/vinsensiusarko/vinsensiusarko.github.io/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](LICENSE)

A modern, high-performance developer portfolio and serverless headless Content Management System (CMS) built with **React 19**, **Vite 6**, **React Router v7**, and **Firebase v11 (Cloud Firestore & Authentication)**, featuring an interactive **4-Season Animation & Theme Engine** (🌸 Semi / Spring, ☀️ Panas / Summer, 🍂 Gugur / Autumn, ❄️ Dingin / Winter).

---

## 🌟 Key Highlights

- **🌸☀️🍂❄️ 4-Season Interactive Animation & Theme Engine:**
  - **Auto-Detect by Month (`Auto`)** or manual override for **Semi (Spring — Sakura Petals)**, **Panas (Summer — Golden Fireflies)**, **Gugur (Autumn — Maple Leaves)**, and **Dingin (Winter — Snowflakes)**.
  - **60fps HTML5 Canvas 2D Particle Engine** (`SeasonalCanvas.jsx`) with automatic mobile particle reduction, tab visibility pause, `prefers-reduced-motion` support, and a toggleable particle switch.
  - **Dynamic Seasonal Color Accents** (`variables.css`) that seamlessly adapt to both **Light** and **Dark** modes.
- **⚡ React 19 + Vite 6 Modular Architecture:** Code-split vendor & Firebase chunks, instant static fallback data (`fallbackData.js`) merged with real-time Cloud Firestore snapshots (`usePortfolioData.js`), and Vitest + React Testing Library test coverage.
- **🔍 Project Explorer & Case Study Modal:** Real-time search bar, category filter chips (`All`, `Mobile App`, `Web App`, `Web Portal`, `Backend API`), and an accessible Quick View modal (`Esc` to close).
- **💼 Unified React 19 Serverless Admin CMS (`/admin`):** Protected admin dashboard integrated directly into the React SPA for full CRUD over projects, skills, biography, profile photos, CV/resume, privacy policy, and social contact links.
- **🖼️ Zero Cloud Storage Base64 Engine:** In-browser HTML5 Canvas image processor (`imageCompressor.js`) that auto-resizes and converts uploaded images to high-efficiency `.webp` Base64 strings (~40 KB) stored directly in Firestore.
- **🛡️ 1-Click Database Seeder & JSON Backup/Restore:** Built-in migration tool to seed initial portfolio data or export/import full JSON database backups.

---

## 🛠️ Tech Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend Framework** | React 19, React Router v7, Vite 6 |
| **Styling & Animation** | Modern CSS3 (4-Season Custom Properties, Light/Dark Themes), HTML5 2D Canvas Particle Engine, Font Awesome 6 |
| **Backend & Cloud** | Google Firebase v11 (Cloud Firestore, Firebase Authentication, Firebase Hosting) |
| **Testing** | Vitest 3, React Testing Library, JSDOM |
| **CI / CD & Deployment** | GitHub Actions (`npm ci && npm run build` -> Firebase Hosting), Firebase CLI |

---

## 📂 Directory Structure

```text
vinsensiusarko/
├── .github/
│   └── workflows/                      # GitHub Actions CI/CD (Vite Build + Firebase Deploy)
├── public/
│   ├── assets/
│   │   ├── docs/                       # Curriculum Vitae (PDF)
│   │   └── images/                     # Project screenshots, avatars, icons
│   ├── .nojekyll                       # Disables GitHub Pages Jekyll processing
│   ├── robots.txt                      # Search engine crawl directives
│   ├── sitemap.xml                     # Search engine XML sitemap
│   └── site.webmanifest                # Progressive Web App manifest
├── src/
│   ├── components/
│   │   ├── layout/                     # Navbar, Footer, FloatingActions
│   │   └── sections/                   # HeroSection, AboutSection, ExperienceSection, ProjectsSection, ProjectModal, ContactSection
│   ├── context/                        # ThemeContext (Light/Dark) & SeasonContext (Spring/Summer/Autumn/Winter)
│   ├── data/                           # Static fallback data (projects, skills, settings, privacy policy)
│   ├── features/
│   │   └── season/                     # seasonConfig, SeasonalCanvas (2D Particle Engine), SeasonSwitcher
│   ├── hooks/                          # usePortfolioData, usePrivacyPolicy, useScrollReveal
│   ├── pages/
│   │   ├── admin/                      # Unified React 19 Admin CMS (/admin) & 6 management tabs
│   │   ├── HomePage.jsx                # Public Portfolio Page (/)
│   │   ├── PrivacyPolicyPage.jsx       # Dynamic Privacy Policy Page (/privacy-policy)
│   │   └── NotFoundPage.jsx            # Custom 404 Page
│   ├── services/                       # Modular Firebase v11 initialization (app, db, auth)
│   ├── styles/                         # variables.css (4-Season + Theme tokens), global.css, mediaqueries.css, admin.css
│   ├── utils/                          # formatDescription.js, imageCompressor.js
│   ├── App.jsx                         # Root router & providers
│   └── main.jsx                        # React 19 entry point
├── index.html                          # Vite entry HTML with SEO & JSON-LD structured data
├── firebase.json                       # Firebase Hosting config (public: "dist", SPA rewrites & headers)
├── firestore.rules                     # Cloud Firestore security rules
├── package.json                        # Scripts & dependencies
└── vite.config.js                      # Vite 6 & Vitest configuration
```

---

## 🚀 Getting Started & Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
- **Public Portfolio:** `http://localhost:5173/`
- **Privacy Policy:** `http://localhost:5173/privacy-policy`
- **Admin CMS Dashboard:** `http://localhost:5173/admin`

### 3. Run Unit & Integration Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Vinsensius Arka**
- Website: [vinsensiusarka.id](https://vinsensiusarka.id)
- Email: [me@vinsensiusarka.id](mailto:me@vinsensiusarka.id)
- LinkedIn: [vinsensiusarka](https://www.linkedin.com/in/vinsensiusarka/)
- GitHub: [@vinsensiusarko](https://github.com/vinsensiusarko)
