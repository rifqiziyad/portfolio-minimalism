# Dokumentasi Tema Warna & Design System: 3D Chiseled Horizon Liquid Chrome

> **Cakupan (Scope)**: Dokumen ini mencatat spesifikasi pembaruan **khusus palet warna, token CSS, gradien teks display, efek cahaya (`glow`/`shadow`), dan gradien SVG** agar seluruh section selaras dengan estetika **3D Chiseled Horizon Liquid Chrome** pada logo brand `RIFQI` ([assets/logo.svg](../assets/logo.svg)). Struktur layout, animasi GSAP, serta arsitektur komponen UI tidak diubah (*tanpa revamp UI*).

---

## 1. Konsep & Filosofi Palet Warna

Tema **3D Chiseled Horizon Liquid Chrome** memadukan **pantulan cakrawala krom kontras tinggi (*High-Contrast Horizon Chrome*: `#ffffff` ↔ `#04070d` ↔ `#ffffff`)** di atas kanvas *deep obsidian* dengan **refraksi iridesen dingin**:
1. **Horizon Specular Break (`#ffffff` ↔ `#94a3b8` ↔ `#04070d` ↔ `#ffffff`)**: Menciptakan kesan lekukan logam cair 3D yang memantulkan garis cakrawala gelap dan kilau spesular tajam.
2. **Iridescent Mint, Ice & Lavender (`#99f6e4`, `#7dd3fc`, `#c4b5fd`)**: Memberikan bias holografik halus seperti pantulan prisma (*HOLO GLOW / SLICK / Chronic*) yang terikat langsung pada logo `RIFQI`.
3. **Interaksi Dual-Tone Glow**: Mengganti aksen monokrom datar sebelumnya dengan *Icy Mint Chrome* (`#99f6e4`) dan pendaran *Lavender* (`#c4b5fd`) agar link, tombol, badge `@handle`, dan elemen aktif tetap kontras.

---

## 2. Pemetaan Token Warna (`css/variables.css` & `index.html`)

| Token CSS | Nilai Awal (Flat Chrome) | Nilai Terbaru (Horizon Liquid Chrome) | Fungsi Visual |
| :--- | :--- | :--- | :--- |
| `--bg-primary` | `#070708` | `#070708` | Latar utama *Deep Obsidian Carbon* |
| `--bg-secondary` | `#0e1013` | `#0c0e14` | Latar sekunder *Deep Midnight Obsidian* |
| `--bg-card` | `#14161b` | `#12151e` | Permukaan kartu *Matte Anodized Metal* |
| `--text-primary` | `#f8fafc` | `#f8fafc` | Teks utama *Crisp Specular White* |
| `--text-secondary` | `#b4bcc8` | `#b8c2d0` | Teks sekunder *Cool Silver Mist* |
| `--text-muted` | `#7e8794` | `#7e899b` | Teks redup *Muted Cool Slate* |
| `--chrome-mint` | — | `#99f6e4` | Bias refraksi *Icy Mint Chrome* |
| `--chrome-ice` | — | `#7dd3fc` | Bias refraksi *Ice Blue Chrome* |
| `--chrome-lavender` | — | `#c4b5fd` | Bias refraksi *Lavender Chrome* |
| `--accent-orange` *(alias aksen utama)* | `#e2e8f0` | `#99f6e4` | Aksen interaktif utama (*Icy Mint Chrome*) |
| `--accent-orange-glow` | `rgba(226, 232, 240, 0.35)` | `rgba(153, 246, 228, 0.35)` | Pendaran aksen utama |
| `--chrome-gradient` | `linear-gradient(135deg, ...)` | Horizon Mirror Multi-Stop Chrome (`180deg`) | Gradien permukaan logam cair |
| `--chrome-text-gradient` | — | Horizon Mirror Text Gradient (`180deg`) | Gradien tipografi display (`FRONTEND`, H2, Preloader) |
| `--chrome-rim-border` | — | `linear-gradient(135deg, #ffffff 0%, #94a3b8 30%, #99f6e4 65%, #c4b5fd 100%)` | Gradien tepi *iridescent bevel* |
| `--chrome-glow` | `rgba(226, 232, 240, 0.25)` | `rgba(153, 246, 228, 0.25)` | Pendaran *Iridescent Mint Glow* |
| `--border-subtle` | `rgba(226, 232, 240, 0.08)` | `rgba(203, 213, 225, 0.09)` | Garis grid tipis |
| `--border-medium` | `rgba(226, 232, 240, 0.16)` | `rgba(203, 213, 225, 0.18)` | Border kartu & pembatas |
| `--border-strong` | `rgba(248, 250, 252, 0.34)` | `rgba(248, 250, 252, 0.36)` | Garis tegas (*Specular Edge*) |
| `--border-accent` | `rgba(226, 232, 240, 0.65)` | `rgba(153, 246, 228, 0.65)` | Border aktif/hover (*Mint Chrome Rim*) |

> **Catatan**: Critical inline CSS pada `<head>` di `index.html` (`--bg-main: #070708`, `--text-main: #f8fafc`, `--text-muted: #7e899b`) juga diselaraskan.

---

## 3. Rincian Implementasi per Section & File

### A. Fondasi Global, Preloader & Kursor
1. **`css/global.css`**:
   - `.bg-outline-text`: `-webkit-text-stroke: 1.5px rgba(196, 181, 253, 0.13);`.
   - `.section-main-title` (`PROJECT`, `CAREER`, `SKILLS`, `EDUCATION`, `GET IN TOUCH`): Menggunakan `--chrome-text-gradient` dengan `background-clip: text`, `-webkit-text-fill-color: transparent`, dan `filter: drop-shadow(0 4px 18px rgba(2, 3, 7, 0.85))`.
2. **`css/preloader.css`**:
   - `.loading-outline-title`: Stroke `rgba(196, 181, 253, 0.28)`.
   - `.loading-outline-title::after` (`PLEASE WAIT`): Menggunakan `--chrome-text-gradient` + stroke `1px rgba(255, 255, 255, 0.35)`.
   - `.loading-percentage`: Warna teks `var(--chrome-mint)`.
3. **`css/cursor.css`**:
   - `#cursor-dot`: Menggunakan `#99f6e4` agar pendaran kursor tetap tajam.

### B. Brand Logo & Hero Editorial (`assets/logo.svg`, `css/header.css`, `css/hero.css`)
1. **`assets/logo.svg`**:
   - Wordmark `RIFQI` kustom dengan efek **3D Chiseled Horizon Liquid Chrome**, *inner specular bevel*, pantulan *mint/ice/lavender*, dan starburst glint.
2. **`css/hero.css`**:
   - `.hero-title-inner` (`FRONTEND`): Menggunakan `--chrome-text-gradient` dengan `filter: drop-shadow(0 10px 35px rgba(2, 3, 7, 0.88))` (tanpa mengubah animasi GSAP `xPercent`/`opacity`).
   - `.hero-giant-outline` (`DEVELOPER`): `-webkit-text-stroke: 1.5px rgba(196, 181, 253, 0.38)`.
   - `.hero-image-box`: Border krom halus `rgba(226, 232, 240, 0.24)` dan bayangan dingin `0 30px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(153, 246, 228, 0.07)`.

### C. Interactive Skills Crystal & Contact Crystal (`js/renderers/skills.js`, `css/skills.css`, `js/components/crystal-backgrounds.js`)
1. **`js/renderers/skills.js` & `js/components/crystal-backgrounds.js`**:
   - Keempat gradien kristal (`*-g-shard-*`), `skills-g-glass-refract`, serta `contact-g-shard-star` ditingkatkan menjadi multi-stop **Horizon Chrome + Iridescent Mint/Ice/Lavender**.
   - Stroke faset, garis patahan, dan simpul kristal menggunakan variasi `#ffffff`, `#99f6e4`, `#7dd3fc`, `#c4b5fd`, dan `#cbd5e1`.
2. **`css/skills.css`**:
   - `.skills-crystal-stage::before`: Radial glow dual-tone (`rgba(153, 246, 228, 0.14)` → `rgba(196, 181, 253, 0.08)` → `transparent`).
   - `.skill-tri-shard.is-hovered .skill-shard-body` & `.is-active`: Dual-tone glow (`rgba(153, 246, 228, 0.85)` + `rgba(196, 181, 253, 0.7)`).

### D. Project Showcase, Career/Education & Contact (`css/portfolio.css`, `css/career.css`, `css/contact.css`)
1. **`css/portfolio.css`**: `.project-title-layer-lit .project-title-item` mendapat kilau halus `text-shadow: 0 0 24px rgba(153, 246, 228, 0.22)`; trigger aksi menggunakan `var(--accent-orange)` (`#99f6e4`).
2. **`css/career.css`**: `.career-row:hover, .education-row:hover` memakai sapuan gradien mint-lavender tipis; `.career-role, .education-degree` menggunakan `rgba(196, 181, 253, 0.68)`.
3. **`css/contact.css`**: `.bg-contact-crystal::before` memakai radial glow dual-tone mint-lavender; `.bento-card:hover` menggunakan border `--chrome-mint`, background `rgba(153, 246, 228, 0.05)`, dan box-shadow dual-tone mint-lavender.
