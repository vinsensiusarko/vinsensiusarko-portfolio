# Desain Spesifikasi: Migrasi Portfolio ke React 19 + Vite & Sistem Animasi 4 Musim (Tahap 1)

**Tanggal:** 15 November 2026  
**Project:** Vinsensius Arka Portfolio (`vinsensiusarko`)  
**Tech Stack:** React 19, Vite, React Router v7, Firebase Modular SDK (Firestore), Vanilla CSS3 & CSS Variables, HTML5 Canvas API  

---

## 1. Tujuan & Cakupan (Scope)

### 1.1 Tujuan Utama
1. Memigrasikan halaman publik website portfolio Vinsensius Arka dari arsitektur statis vanilla HTML/JS ke ekosistem modern **React 19 + Vite** dengan struktur folder yang modular, rapi, dan mudah dirawat (*maintainable*).
2. Menambahkan fitur baru yang unik berupa **Sistem Animasi & Tema 4 Musim** (**Semi / Spring**, **Panas / Summer**, **Gugur / Autumn**, **Dingin / Winter**) yang menggabungkan efek partikel HTML5 Canvas 60fps dengan aksen warna tema dinamis serta kontrol interaktif di Navbar.
3. Mempertahankan 100% kompatibilitas data real-time **Google Cloud Firestore** dan ketersediaan **Admin Dashboard CMS (`/admin`)** tanpa downtime.

### 1.2 Pembagian Tahap (Phased Migration)
- **Tahap 1 (Spesifikasi Ini):**
  - Setup project **React 19 + Vite + React Router v7**.
  - Migrasi penuh halaman **Public Portfolio (`/`)**, **Privacy Policy (`/privacy-policy`)**, dan **Not Found (`*` / `/404`)** ke komponen React.
  - Implementasi penuh **Sistem Animasi 4 Musim** (`SeasonContext`, `SeasonalCanvas`, `SeasonSwitcher`, dan variabel aksen CSS).
  - Integrasi real-time **Firebase Firestore Modular SDK** beserta data statis fallback (`fallbackData.js`).
  - Memindahkan aplikasi Admin eksisting ke `public/admin/` agar tetap ter-deploy utuh ke `dist/admin/` dan berfungsi normal di route `/admin`.
  - Pembaruan konfigurasi `firebase.json` dan pipeline CI/CD GitHub Actions (`npm ci && npm run build`).
- **Tahap 2 (Masa Depan / Di Luar Spesifikasi Ini):**
  - Migrasi aplikasi Admin Dashboard (`/admin`) ke komponen React terintegrasi.

---

## 2. Arsitektur & Struktur Folder

```text
vinsensiusarko/
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-11-15-react-migration-seasonal-design.md
├── public/                        # File statis yang disalin langsung ke dist/ saat build
│   ├── admin/                     # Aplikasi Admin CMS eksisting (tetap aktif di /admin)
│   ├── assets/                    # Gambar project, foto profil, CV PDF, favicon
│   ├── robots.txt
│   ├── site.webmanifest
│   └── sitemap.xml
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx         # Navigasi Desktop & Mobile Drawer + ThemeToggle + SeasonSwitcher
│   │   │   ├── Footer.jsx         # Footer copyright & link navigasi bawah
│   │   │   └── FloatingActions.jsx# Tombol mengambang WhatsApp & Back-to-Top
│   │   └── sections/
│   │       ├── HeroSection.jsx    # Profil Hero, efek ketik (Typewriter), tombol Download CV & Contact
│   │       ├── AboutSection.jsx   # Foto About, kartu Experience & Education, paragraf Bio
│   │       ├── ExperienceSection.jsx # Grid daftar Skills (Languages & Frameworks/Tools)
│   │       ├── ProjectsSection.jsx# Filter kategori chip, live search input, grid kartu project
│   │       ├── ProjectModal.jsx   # Modal Quick-View detail project + rich description parser
│   │       └── ContactSection.jsx # Kartu kontak (Email + Copy to clipboard, LinkedIn) & Toast
│   ├── context/
│   │   ├── ThemeContext.jsx       # State & persistensi Light / Dark Mode
│   │   └── SeasonContext.jsx      # State & persistensi 4 Musim (mode auto/manual + toggle partikel)
│   ├── features/
│   │   └── season/
│   │       ├── SeasonalCanvas.jsx # Komponen HTML5 Canvas untuk render partikel 4 musim (60fps)
│   │       ├── SeasonSwitcher.jsx # Popover/Dropdown UI pemilih musim di Navbar
│   │       └── seasonConfig.js    # Definisi konstanta musim, palet partikel, ikon, dan parameter gerak
│   ├── hooks/
│   │   ├── usePortfolioData.js    # Hook sinkronisasi real-time Firestore (projects, skills, settings)
│   │   ├── usePrivacyPolicy.js    # Hook sinkronisasi real-time Firestore (settings/privacy_policy)
│   │   └── useScrollReveal.js     # Hook IntersectionObserver untuk animasi reveal saat scroll
│   ├── pages/
│   │   ├── HomePage.jsx           # Halaman utama portfolio (/)
│   │   ├── PrivacyPolicyPage.jsx  # Halaman Privacy Policy (/privacy-policy)
│   │   └── NotFoundPage.jsx       # Halaman 404 kustom (*)
│   ├── services/
│   │   └── firebase.js            # Konfigurasi & inisialisasi Firebase App + Firestore Modular SDK
│   ├── data/
│   │   └── fallbackData.js        # Data statis default untuk projects, skills, profile, contact, privacy
│   ├── utils/
│   │   └── formatDescription.js   # Parser teks deskripsi project menjadi paragraf & daftar poin terstruktur
│   ├── styles/
│   │   ├── variables.css          # CSS Custom Properties (Light/Dark + 4 Variasi Musim)
│   │   ├── global.css             # Styling komponen utama, kartu, modal, navigasi, dan halaman policy
│   │   └── mediaqueries.css       # Breakpoints responsif (Desktop, Tablet <=1200px, Mobile <=768px)
│   ├── App.jsx                    # Root router (<Routes>) & penyedia Context (Theme & Season)
│   └── main.jsx                   # Entry point ReactDOM.createRoot
├── index.html                     # Template HTML utama Vite
├── vite.config.js                 # Konfigurasi Vite
├── firebase.json                  # Konfigurasi Firebase Hosting (public: "dist")
└── package.json                   # Dependensi & script npm (dev, build, preview, test)
```

---

## 3. Desain Sistem Animasi & Tema 4 Musim

### 3.1 Deteksi Otomatis & Persistensi (`SeasonContext.jsx`)
- **Mode Default (`auto`):** Menentukan musim aktif berdasarkan bulan kalender lokal perangkat saat pertama kali dibuka:
  - **Semi (`spring`):** Maret, April, Mei (bulan index `2, 3, 4`)
  - **Panas (`summer`):** Juni, Juli, Agustus (bulan index `5, 6, 7`)
  - **Gugur (`autumn`):** September, Oktober, November (bulan index `8, 9, 10`)
  - **Dingin (`winter`):** Desember, Januari, Februari (bulan index `11, 0, 1`)
- **Mode Manual:** Pengunjung dapat memilih musim secara eksplisit (`spring`, `summer`, `autumn`, `winter`) atau mengembalikannya ke `auto` melalui `<SeasonSwitcher />`.
- **Toggle Partikel (`particlesEnabled`):** Boolean (`true` secara default, atau `false` jika pengguna mengaktifkan `prefers-reduced-motion` di OS).
- **Penyimpanan Lokal (`localStorage`):**
  - `portfolio_season_mode`: `'auto' | 'spring' | 'summer' | 'autumn' | 'winter'`
  - `portfolio_particles_enabled`: `'true' | 'false'`
- **Sinkronisasi Atribut DOM:**
  - `document.documentElement.setAttribute('data-season', activeSeason)` dipasang setiap kali musim berubah agar variabel CSS langsung bereaksi secara instan.

### 3.2 Spesifikasi Visual & Fisika Tiap Musim (`seasonConfig.js` & `SeasonalCanvas.jsx`)

Komponen `<SeasonalCanvas />` dirender sebagai `<canvas>` *fixed* di latar layar (`position: fixed; inset: 0; pointer-events: none; z-index: 1` di bawah kartu konten interaktif atau di atas background utama) sehingga tidak pernah menghalangi klik pengguna.

| Musim | ID | Label UI | Visual & Bentuk Partikel Canvas | Gerakan Fisika | Aksen Warna Utama (Light / Dark) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Semi** | `spring` | 🌸 Semi | Kelopak bunga Sakura oval berlekuk (`#f472b6`, `#fb7185`, `#fbcfe8`) | Jatuh perlahan (`vy: 0.6–1.4`), ayunan horizontal sinusoidal (`vx` bergelombang), rotasi lembut | `#db2777` (Light) / `#f472b6` (Dark) |
| **Panas** | `summer` | ☀️ Panas | Bola cahaya hangat / kunang-kunang keemasan (`#fbbf24`, `#f59e0b`, `#38bdf8`) dengan *radial gradient glow* | Mengambang naik-turun perlahan (`vy: -0.3–0.5`), *opacity pulsing* seperti kunang-kunang / partikel cahaya matahari | `#d97706` (Light) / `#fbbf24` (Dark) |
| **Gugur** | `autumn` | 🍂 Gugur | Helai daun Maple/Gugur hangat (`#ea580c`, `#f97316`, `#d97706`, `#dc2626`) | Jatuh miring (`vy: 0.8–1.8`), ayunan angin lebih lebar, rotasi 360 derajat perlahan | `#ea580c` (Light) / `#fb923c` (Dark) |
| **Dingin** | `winter` | ❄️ Dingin | Butiran salju kristal bundar & bintang es halus (`#bae6fd`, `#e0f2fe`, `#ffffff`) | Jatuh vertikal tenang (`vy: 0.5–1.6`) dengan efek *depth parallax* (ukuran besar sedikit lebih cepat dari ukuran kecil) | `#0284c7` (Light) / `#38bdf8` (Dark) |

### 3.3 Optimasi Performa & Aksesibilitas Canvas
- **Jumlah Partikel Adaptif:** Maksimal `35` partikel di layar Desktop (`>768px`) dan `18` partikel di layar Mobile (`<=768px`) agar ringan di GPU smartphone.
- **Page Visibility Pause:** Ketika tab browser tidak aktif (`document.hidden === true`), loop `requestAnimationFrame` otomatis dihentikan sementara dan dilanjutkan saat tab kembali aktif.
- **Clean Unmount:** Menghapus event listener `resize` dan `visibilitychange` serta membatalkan `cancelAnimationFrame` saat komponen unmount.

### 3.4 Komponen `<SeasonSwitcher />`
- Berada di dalam `<Navbar />` berdampingan dengan tombol `<ThemeToggle />`.
- Menampilkan ikon musim aktif dan label singkat (misal: `🌸` di mobile, `🌸 Semi` di desktop) dengan badge indikator kecil jika mode `Auto` aktif.
- Ketika diklik, menampilkan menu *dropdown* mengambang (*glassmorphism card*) berisi:
  - Pilihan 4 musim: `🌸 Semi`, `☀️ Panas`, `🍂 Gugur`, `❄️ Dingin`.
  - Tombol `🔄 Otomatis (Sesuai Bulan)`.
  - Switch `✨ Efek Partikel: Aktif / Nonaktif`.
- Menutup otomatis saat pengguna klik di luar menu atau menekan tombol `Escape`.

---

## 4. Komponen Halaman, Alur Data, & Penanganan Error

### 4.1 Layanan Firebase & Hook Data (`src/services/firebase.js` & `src/hooks/`)
- Menggunakan konfigurasi proyek Firebase `vinsensiusarko` yang sudah ada.
- **`usePortfolioData()`**:
  - Menginisialisasi state awal dari `fallbackData.js` (memastikan 9 project, 11 skill, profil, dan kontak langsung tampil tanpa jeda).
  - Memasang listener `onSnapshot` pada:
    1. Koleksi `projects` (diurutkan berdasarkan `order` ascending).
    2. Koleksi `skills` (diurutkan berdasarkan `order` ascending).
    3. Dokumen `settings/site_settings` (nama, sapaan hero, foto hero, foto about, teks bio, tahun pengalaman, gelar pendidikan, CV base64/URL).
    4. Dokumen `settings/contact_settings` (email, nomor WhatsApp, link LinkedIn, GitHub, Instagram, Facebook, Twitter).
  - **Penanganan Error:** Jika listener Firestore gagal (misal karena adblocker atau koneksi terputus), mencetak peringatan halus di `console.warn` dan tetap mempertahankan data dari `fallbackData.js` tanpa merusak UI.
- **`usePrivacyPolicy()`**:
  - Menginisialisasi state awal kebijakan privasi dari `fallbackData.privacyPolicy`.
  - Memasang listener `onSnapshot` pada dokumen `settings/privacy_policy` saat halaman `/privacy-policy` dibuka.

### 4.2 Halaman & Fitur UI (`src/pages/` & `src/components/`)
1. **`HomePage.jsx` (`/`)**:
   - **`HeroSection`**: Foto avatar bundar, sapaan, nama, animasi teks ketik bergantian (*Typewriter hook/component*: `"Full-Stack Developer"`, `"Mobile App Developer"`, `"UI/UX Enthusiast"`), tombol Download CV, tombol Contact Info, dan ikon sosial media.
   - **`AboutSection`**: Foto profil About, kartu Experience & Education, dan deskripsi paragraf biografi.
   - **`ExperienceSection`**: Dua kotak kategori skill (*Languages* dan *Frameworks & Tools*) lengkap dengan ikon FontAwesome / SVG Flutter.
   - **`ProjectsSection` & `ProjectModal`**:
     - Filter chip kategori (`All`, `Mobile Application`, `Web Application`, `Web Portal`, `Backend API`).
     - Kotak pencarian *real-time* dengan tombol *clear* (`X`) dan tampilan *Empty State* + tombol *Reset Filter* jika tidak ada project yang cocok.
     - Kartu project dengan efek *blurred backdrop image*, badge *Quick View*, judul, deskripsi terformat, serta tombol GitHub / Live Demo / Play Store / Coming Soon.
     - Klik pada kartu membuka `<ProjectModal />` (mendukung tutup via tombol `X`, klik *backdrop*, atau tombol `Escape`).
   - **`ContactSection`**: Kartu Email (dengan tombol *Copy to Clipboard* + notifikasi Toast) dan kartu LinkedIn.
2. **`PrivacyPolicyPage.jsx` (`/privacy-policy`)**:
   - Menampilkan seluruh bagian Privacy Policy (Header & 3 Pill Badges, 3 Kartu Highlight, Quick Navigation TOC, 11 Pasal Kebijakan lengkap dengan grid Permission & kartu Third-Party SDKs, serta kartu Developer Contact).
   - Mendukung tombol *Back to Portfolio* menggunakan `<Link to="/">` dari React Router dan *smooth scroll* ke setiap pasal (`#section-1` s/d `#section-11`).
3. **`NotFoundPage.jsx` (`*`)**:
   - Tampilan halaman 404 yang selaras dengan tema aktif dan tombol kembali ke beranda (`/`).

---

## 5. Build Pipeline, Routing Firebase, & Pengujian

### 5.1 Konfigurasi Build & Hosting (`vite.config.js` & `firebase.json`)
- **`vite.config.js`**:
  - Menggunakan `@vitejs/plugin-react`.
  - Output direktori build: `dist`.
  - Isi folder `public/` (termasuk `public/admin/` dan `public/assets/`) otomatis disalin ke root `dist/`.
- **`firebase.json`**:
  - Mengubah `"public": "dist"`.
  - Mengatur `rewrites`:
    ```json
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
    ]
    ```
- **GitHub Actions CI/CD (`.github/workflows/firebase-hosting-merge.yml` & `pull-request.yml`)**:
  - Menambahkan step `uses: actions/setup-node@v4` (Node 20) dan `run: npm ci && npm run build` sebelum step `FirebaseExtended/action-hosting-deploy@v0`.

### 5.2 Strategi Pengujian & Verifikasi (Testing)
- **Unit & Component Tests (Vitest + React Testing Library):**
  - Menguji deteksi musim otomatis berdasarkan bulan dan pergantian musim di `SeasonContext`.
  - Menguji pemformatan deskripsi project (`formatDescription.js`).
  - Menguji filter kategori dan pencarian kata kunci pada `ProjectsSection`.
- **Build & Visual Verification:**
  - Memastikan `npm run build` berjalan dengan `0 errors` dan menghasilkan `dist/index.html` serta `dist/admin/index.html`.
  - Memverifikasi tampilan keempat musim (Semi, Panas, Gugur, Dingin) di Light & Dark Mode menggunakan headless browser.
