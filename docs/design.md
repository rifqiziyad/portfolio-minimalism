# Design System Specification (`docs/design.md`)

> **Status**: Single Source of Truth untuk seluruh pengembangan antarmuka, komponen baru, maupun halaman/section baru pada proyek ini.  
> Setiap perubahan UI atau penambahan halaman **wajib mematuhi** token, tipografi, geometri, hierarki lapis, dan aturan visual pada dokumen ini agar tetap konsisten dengan desain sistem **Monolith Architectural Grid** & **3D Chiseled Horizon Liquid Chrome**.

---

## 1. Filosofi Visual & Identitas Tema

1. **Monolith Architectural Grid**:
   - Kanvas obsidian gelap pekat (`#070708`), pembatas hairline `1px` tipis, tata letak asimetris/terstruktur, dan **sudut tajam `border-radius: 0`** di seluruh kartu, frame media, modal, dan tombol.
   - Tekstur film grain tipis (`.noise-overlay`, `opacity: 0.028` menggunakan `assets/noise-tile.webp`).
2. **3D Chiseled Horizon Liquid Chrome**:
   - Mengacu langsung pada estetika wordmark `RIFQI` ([assets/logo.svg](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/assets/logo.svg)): kontras cakrawala logam cair tajam (`#ffffff` ↔ `#04070d` ↔ `#ffffff`) dengan bias refraksi holografik dingin (*Icy Mint* `#99f6e4`, *Ice Blue* `#7dd3fc`, *Lavender Chrome* `#c4b5fd`).
3. **Clean Minimal Surface (Tanpa Ornamen Cyber/HUD Lama)**:
   - Elemen dekoratif **tidak boleh** memakai garis putus-putus laser (`.fracture-traces`), garis `<line>` bercahaya, atau titik/bulatan cahaya node (`.shard-node`).

---

## 2. Design Tokens (`css/variables.css` & Inline Critical CSS `index.html`)

Selalu gunakan CSS Custom Properties dari [css/variables.css](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/variables.css). **Dilarang** meng-hardcode hex warna aksen atau latar baru di luar palet berikut:

### A. Surface & Teks

| Token CSS | Nilai | Kegunaan |
| :--- | :--- | :--- |
| `--bg-primary` | `#070708` | Latar kanvas utama (`html`, `body`, `.section-career`, `.section-education`, `.project-sticky-stage`, `.site-footer`, `.nav-menu`) |
| `--bg-secondary` | `#0c0e14` | Latar permukaan sekunder (*Deep Midnight Obsidian*) |
| `--bg-card` | `#12151e` | Permukaan kartu & bingkai foto (`.hero-image-box`, komponen card solid) |
| `--text-primary` | `#f8fafc` | Teks utama kontras tinggi |
| `--text-secondary` | `#b8c2d0` | Subjudul sekunder, caption, deskripsi pendukung |
| `--text-muted` | `#7e899b` | Teks redup, metadata pasif, footer |

### B. Iridescent Liquid Chrome & Aksen Interaktif

| Token CSS | Nilai | Kegunaan |
| :--- | :--- | :--- |
| `--chrome-mint` | `#99f6e4` | Aksen primer iridesen (*Icy Mint Chrome*), hover card, preloader percentage, highlight interaktif |
| `--chrome-ice` | `#7dd3fc` | Bias refraksi faset kristal & tepi *Ice Blue Chrome* |
| `--chrome-lavender` | `#c4b5fd` | Bias sekunder (*Lavender Chrome*), outline watermark, teks peran/subjudul redup, ambient shadow sekunder |
| `--accent-orange` | `#99f6e4` | Alias semantik aksen interaktif utama (link aktif, `:focus-visible`, hover trigger, `::selection`) — **tetap gunakan token ini atau `--chrome-mint`** |
| `--accent-orange-glow` | `rgba(153, 246, 228, 0.35)` | Pendaran aksen interaktif utama |
| `--chrome-glow` | `rgba(153, 246, 228, 0.25)` | Pendaran halus permukaan krom |

### C. Gradien Resmi

| Token CSS | Definisi & Kegunaan |
| :--- | :--- |
| `--chrome-gradient` | `linear-gradient(180deg, #ffffff 0%, #f1f5f9 18%, #94a3b8 32%, #04070d 44%, #0b1120 48%, #ffffff 50%, #e2e8f0 57%, #99f6e4 69%, #c4b5fd 80%, #ffffff 89%, #1e293b 100%)` — Permukaan logam cair kontras tinggi |
| `--chrome-text-gradient` | `linear-gradient(180deg, #ffffff 0%, #e2e8f0 24%, #94a3b8 42%, #090d16 48%, #ffffff 52%, #99f6e4 70%, #c4b5fd 84%, #f8fafc 100%)` — Khusus tipografi display (`H2` `.section-main-title`, `.hero-title-inner`, `.loading-outline-title::after`) |
| `--chrome-rim-border` | `linear-gradient(135deg, #ffffff 0%, #94a3b8 30%, #99f6e4 65%, #c4b5fd 100%)` — Gradien tepi *iridescent bevel* |

### D. Border Hairline

| Token CSS | Nilai | Kegunaan |
| :--- | :--- | :--- |
| `--border-subtle` | `rgba(203, 213, 225, 0.09)` | Pemisah halus (footer top border, mobile nav top border) |
| `--border-medium` | `rgba(203, 213, 225, 0.18)` | Border standar antar-komponen |
| `--border-strong` | `rgba(248, 250, 252, 0.36)` | Garis tepi tegas / *specular edge* |
| `--border-accent` | `rgba(153, 246, 228, 0.65)` | Border status aktif / hover |

> **Critical CSS ([index.html](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L49))**: Jika membuat halaman HTML terpisah, `<head>` wajib menyertakan inline `:root` untuk `--bg-main:#070708;--text-main:#f8fafc;--text-muted:#7e899b` serta `@font-face` agar bebas *Flash of Unstyled Content (FOUC)*.

---

## 3. Tipografi ([css/fonts.css](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/fonts.css) & [css/global.css](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/global.css))

Seluruh font bersifat **self-hosted variable WOFF2** (`assets/fonts/*.woff2`, `font-display: swap`). Jangan memuat font eksternal dari Google Fonts CDN.

| Peran | Token | Font & Weight | Gaya Wajib |
| :--- | :--- | :--- | :--- |
| **Display / Heading** | `--font-display` | `'Syne'`, `600`–`800` | Uppercase, `letter-spacing: -0.04em` s/d `-0.02em`, `line-height: 0.85`–`1.25` |
| **Body Copy** | `--font-body` | `'Inter'`, `300`–`700` | Kalimat normal, `line-height: 1.6`–`1.65`, lebar baca ideal `max-width: 58ch` |
| **Metadata / Mono / CTA** | `--font-mono` | `'Space Grotesk'`, `500`–`700` | Uppercase, `letter-spacing: 0.05em`–`0.12em`, `font-size: 0.6875rem`–`1rem` |

### Pola Tipografi Khusus
1. **Judul Section `H2` (`.section-main-title`)**:
   - `font-family: var(--font-display)`, `font-weight: 800`, `font-size: clamp(2rem, 5vw, 4.5rem)`, `letter-spacing: -0.03em`, `text-transform: uppercase`, `line-height: 1`.
   - Wajib menerapkan `--chrome-text-gradient` dengan `background-clip: text`, `-webkit-text-fill-color: transparent`, dan `filter: drop-shadow(0 4px 18px rgba(2, 3, 7, 0.85))`.
   - **Penting**: Jangan menaruh `text-shadow` pada elemen yang menggunakan `-webkit-text-fill-color: transparent` + `background-clip: text` karena dapat merender bayangan solid di atas gradien. Selalu gunakan `filter: drop-shadow(...)`.
2. **Watermark Latar Raksasa (`.bg-outline-text`)**:
   - `font-family: var(--font-display)`, `font-weight: 800`, `font-size: clamp(6.5rem, 22vw, 28rem)`, `line-height: 0.8`, `color: transparent`, `-webkit-text-stroke: 1.5px rgba(196, 181, 253, 0.13)`, `pointer-events: none`, `user-select: none`, `z-index: 0`.
3. **Hero Display**:
   - Teks utama (`.hero-title-inner`): `--chrome-text-gradient` + `filter: drop-shadow(0 10px 35px rgba(2, 3, 7, 0.88))`.
   - Teks outline (`.hero-giant-outline`): `-webkit-text-stroke: 1.5px rgba(196, 181, 253, 0.38)`.

---

## 4. Layout, Grid, Spacing & Z-Index Contract

### A. Kontainer & Ritme Spasial
- **`--max-width`**: `1440px`
- **`--header-height`**: `72px`
- **Padding Horizontal `.container` & `.nav-container`**: `clamp(1.25rem, 4vw, 3.5rem)`
- **Padding Vertikal `.section`**:
  - Standar: `padding-top: clamp(5rem, 12vw, 10rem); padding-bottom: clamp(5rem, 12vw, 10rem);`
  - Timeline Padat (`.section-career`, `.section-education`): `padding-top: clamp(2.5rem, 5vw, 5rem); padding-bottom: clamp(2.5rem, 5vw, 4.5rem);`
- **Header Section (`.section-header`)**: `margin-bottom: clamp(3rem, 6vw, 6rem); padding-bottom: 1.5rem;`

### B. Breakpoint Resmi
Gunakan hanya breakpoint berikut agar responsivitas konsisten di semua halaman:
- `max-width: 992px` — Penyesuaian bento grid (3 kolom → 2 kolom) dan lebar stage kristal.
- `max-width: 900px` — Tabel timeline 3 kolom (`.career-row`, `.education-row`) kolaps menjadi 1 kolom vertikal.
- `max-width: 768px` — Batas utama **Desktop vs Mobile**: navigasi desktop berubah ke drawer fullscreen, cursor custom disembunyikan (`#cursor-dot`), showcase project beralih ke mode mobile slider, sticky curtain contact dinonaktifkan.
- `max-width: 640px` — Bento grid menjadi 1 kolom penuh & spacing timeline mobile diperketat.
- `max-width: 480px` — Penyesuaian skala kristal untuk layar ponsel kecil.

### C. Kontrak Lapisan (`z-index`) & Scroller
| `z-index` | Elemen | Catatan |
| :--- | :--- | :--- |
| `0` | `.bg-outline-text`, `.carousel-backdrop` | Watermark outline & backdrop modal |
| `1` | `.hero-image-wrapper`, `.bg-contact-crystal`, `.carousel-scanline` | Lapis visual latar belakang |
| `2` | `.career-table`, `.skills-crystal-stage`, `.contact-container`, `.bento-card` | Konten interaktif standar |
| `3` | `.section-header`, `.section-education` (desktop), `.site-footer`, `.project-image-viewport` | Sticky curtain section & footer |
| `4` | `.hero-text-layer`, `.project-grid-overlay` | Teks hero di atas foto & hairline grid |
| `5` | `.project-sticky-stage`, `.project-title-band`, `.carousel-stage` | Stage dengan background opaque (`var(--bg-primary)`) |
| `100`–`101` | `.site-header` (`mix-blend-mode: difference`), `.mobile-toggle` | Navbar fixed transparan adaptif |
| `999` | `.noise-overlay` | Tekstur grain global |
| `9999` | `.carousel-modal` | Modal lightbox fullscreen |
| `10000` | `#cursor-dot`, `.loading-overlay` | Kursor kustom & preloader awal |

> **Aturan Scroller Tunggal ([css/global.css](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/global.css#L8-L45))**:  
> `html` memiliki `scrollbar-gutter: stable`, serta `html` & `body` hanya memakai `overflow-x: hidden; overflow-x: clip;`. **Jangan pernah** menambahkan `overflow-y: auto` atau `height: 100%` pada `body` agar sinkronisasi `Lenis` dan `GSAP ScrollTrigger` pin tidak terpecah menjadi dua scroller.

---

## 5. Pola Komponen Resmi

### A. Template Section Baru (HTML)
Setiap `<section>` baru di dalam `<main>` (atau halaman baru) harus mengikuti struktur dasar ini:

```html
<section class="section section-<nama>" id="<nama>">
  <div class="bg-outline-text bg-text-<nama>" data-parallax="0.10" aria-hidden="true">JUDUL</div>

  <div class="container <nama>-container">
    <div class="section-header reveal reveal-fade">
      <div class="section-title-wrap">
        <h2 class="section-main-title">JUDUL SECTION</h2>
      </div>
    </div>

    <!-- Konten section di sini (z-index >= 2) -->
  </div>
</section>
```

### B. Glass / Bento Card (`.bento-card`)
- **Geometry**: `border-radius: 0` (sudut tajam 90°).
- **Surface**: `background: rgba(20, 22, 27, 0.45); backdrop-filter: blur(6px); border: 1px solid rgba(226, 232, 240, 0.14); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);`.
- **Hover**:
  - `border-color: var(--chrome-mint);`
  - `background: rgba(153, 246, 228, 0.05);`
  - `box-shadow: 0 8px 32px 0 rgba(153, 246, 228, 0.14), 0 0 20px 0 rgba(196, 181, 253, 0.1);`
  - `transform: translateY(-4px);`
- Kartu non-interaktif (mis. `.bento-location`) memakai `cursor: default` dan menonaktifkan efek hover.

### C. Baris Timeline 3-Kolom (`.career-row` / `.education-row`)
- Grid desktop: `grid-template-columns: minmax(130px, 1fr) minmax(220px, 1.8fr) 2.4fr;`
- Garis pemisah atas & bawah: `1px solid rgba(255, 255, 255, 0.12)`
- Peran/gelar (kolom 2 subtitle): `Space Grotesk` uppercase, `rgba(196, 181, 253, 0.68)`
- Hover: `background: linear-gradient(90deg, rgba(153, 246, 228, 0.03) 0%, rgba(196, 181, 253, 0.03) 50%, transparent 100%);`

### D. Action Link, Tombol & Ikon
- **Tombol/Trigger Teks** (`.project-gallery-trigger`, `.project-live-link`, `.bento-action`): `Space Grotesk` (`600`/`700`), uppercase, tracking `0.1em`–`0.12em`, hover ke `var(--accent-orange)` (`#99f6e4`) dengan pergeseran panah halus.
- **Tombol Kontrol Modal** (`.carousel-close-btn`, `.carousel-nav-btn`): sudut `border-radius: 0`, latar `rgba(7, 7, 8, 0.85)`, border `1px solid rgba(255, 255, 255, 0.18)`, hover border & teks `var(--accent-orange)`.
- **Ikon Panah Standar**: Gunakan sprite SVG bersama `<svg><use href="#icon-shard-arrow"></use></svg>` ([index.html](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L150-L155)), putar `-45deg` untuk tautan eksternal/diagonal jika diperlukan.

### E. Media Frame & Image Skeleton Loading (`.img-skeleton`)
- Bungkus `<img>` raster dengan `.img-skeleton` agar menampilkan shimmer gelap (`#0b0c0e` → `#181b20` → `#0b0c0e`) sebelum selesai dimuat, dan `.img-skeleton.is-loaded { background-color: transparent; }` saat siap.
- Untuk gambar yang dirender dinamis via JavaScript, panggil `window.Portfolio.utils.bindImageSkeleton(container)` ([js/core/renderer.js](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/core/renderer.js)).
- **Pengecualian**: Jangan memasang `.img-skeleton` pada logo SVG transparan seperti `.brand-logo-wrap` agar tidak memunculkan kotak gelap di belakang logo.

### F. Elemen Kristal & SVG (`#skillsCrystalSvg`, `#bgContactCrystal`)
- Hanya gunakan `<polygon class="crystal-facet">` dengan `<linearGradient>` **Horizon Chrome** (`#ffffff` ↔ `#04070d` ↔ `#ffffff` dengan bias `#99f6e4`, `#7dd3fc`, `#c4b5fd`) dan stroke tepi `#99f6e4`, `#c4b5fd`, `#7dd3fc`, `#ffffff`, `#cbd5e1`.
- Ambient glow di belakang panggung kristal (`.skills-crystal-stage::before`, `.bg-contact-crystal::before`) menggunakan radial dual-tone halus:
  `radial-gradient(circle, rgba(153, 246, 228, 0.14) 0%, rgba(196, 181, 253, 0.08) 42%, rgba(153, 246, 228, 0) 68%)`.
- **Dilarang keras** menambahkan kembali `<line>` laser, `.outline-fracture`, maupun `<circle>` `.shard-node`.

---

## 6. Motion, Interaksi & Aksesibilitas

### A. Token Animasi ([css/variables.css](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/variables.css#L55-L59))
- `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` (standar transisi utama)
- `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)`
- `--transition-fast: 0.2s cubic-bezier(0.25, 1, 0.5, 1)` (hover warna, border, ikon)
- `--transition-smooth: 0.45s cubic-bezier(0.16, 1, 0.3, 1)` (pergeseran posisi, drawer)
- `--transition-slow: 0.8s cubic-bezier(0.16, 1, 0.3, 1)`

### B. Helper Animasi Bawaan
- **Scroll Reveal**: `.reveal` dipadukan dengan `.reveal-fade`, `.reveal-up`, atau `.reveal-scale` + opsional `.delay-1` / `.delay-2`.
- **Line Mask Text Reveal**: `.text-line-mask > .text-line-inner` untuk teks timeline yang masuk dari bawah masker `overflow: hidden`.

### C. Kepatuhan Aksesibilitas (Wajib)
- Setiap elemen interaktif harus mendukung fokus keyboard dengan `:focus-visible { outline: 2px solid var(--accent-orange); outline-offset: 3px; }`.
- Elemen dekoratif (`.bg-outline-text`, `.bg-contact-crystal`, `#cursor-dot`, `.noise-overlay`) wajib memakai `aria-hidden="true"`.
- Modul JS animasi wajib mengecek `window.Portfolio.utils.prefersReducedMotion()` sebelum menjalankan animasi GSAP/parallax, serta CSS menghormati `@media (prefers-reduced-motion: reduce)`.

---

## 7. Checklist Menambah Halaman atau Section Baru

Saat membuat page baru atau menambahkan section/modul baru:

1. **Daftarkan Stylesheet di 2 Tempat**:
   - Tambahkan `<link rel="stylesheet" href="css/<nama>.css">` di antara `<!-- BUILD:CSS_START -->` dan `<!-- BUILD:CSS_END -->` pada [index.html](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L109-L125) (atau halaman HTML baru).
   - Tambahkan `'css/<nama>.css'` ke array `CSS_FILES` di [scripts/build-assets.mjs](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/scripts/build-assets.mjs#L25-L41) agar terbundel ke `build/css/bundle.min.css`.
2. **Daftarkan Modul JS di 2 Tempat** *(jika ada skrip baru)*:
   - Tambahkan `<script defer src="js/..."></script>` di blok `<!-- BUILD:JS_START -->`..`<!-- BUILD:JS_END -->` ([index.html](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L507-L531)).
   - Tambahkan ke `CORE_JS_FILES` (atau `ASYNC_JS_CHUNKS`) di [scripts/build-assets.mjs](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/scripts/build-assets.mjs#L43-L71).
3. **Update Navigasi** *(jika menjadi section utama)*:
   - Tambahkan item `<li class="nav-item"><a href="#<nama>" class="nav-link"><LABEL></a></li>` pada `.nav-list` di `<header>`.
4. **Verifikasi Build**:
   - Jalankan `node --check` pada setiap berkas JS yang ditambah/diubah dan jalankan `npm run build` untuk memastikan aset produksi di `build/` terbentuk tanpa error.

---

## 8. Aturan Do & Don't Ringkas

- **DO**: Gunakan variabel di `css/variables.css`, `border-radius: 0`, hairline border `1px`, `--chrome-text-gradient` untuk judul section `H2`, serta dual-tone glow (`#99f6e4` + `#c4b5fd`) untuk state aktif/hover komponen utama.
- **DON'T**: Jangan memakai `border-radius` membulat pada kartu/tombol/modal, jangan memakai palet oranye lama (`#ff4500`) atau abu-abu datar kusam sebagai gradien hero/section, jangan memakai `text-shadow` pada teks `background-clip: text`, dan jangan menambahkan elemen garis laser/bulatan cahaya SVG.
