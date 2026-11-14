# Laporan Audit Kode & Performa (Production-Grade) — Web Profile Portfolio

**Scope & Baseline Audit:** Audit mendalam ini mengevaluasi kondisi codebase **aktual pasca-refaktor single-page** (commit `c5fed4d` telah menghapus arsitektur SPA `router.js` / `all-project` serta file dead code historis `timeline.js` & `404.html`). Dokumen lama pada [`docs/AUDIT_REPORT.md`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/docs/AUDIT_REPORT.md) berasal dari kondisi pra-refaktor dan tidak digunakan sebagai sumber temuan di laporan ini; seluruh metrik, lokasi baris kode, dan temuan di bawah ini diverifikasi langsung pada file aktif di root workspace saat ini.

---

## Ringkasan Eksekutif & Inventori Aktual

| Dimensi Audit | Fakta Terukur di Codebase Saat Ini | Status Utama |
| :--- | :--- | :--- |
| **Arsitektur Rendering** | Pure Client-Side Rendering (CSR) pada [`index.html`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html) (`356` baris) yang me-mount konten dinamis dari [`data/portfolio-data.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/data/portfolio-data.js) ke kontainer kosong via IIFE `window.Portfolio` | **Perlu Perbaikan (LCP/SEO/CLS)** |
| **Jejak Kode Sumber** | `37` file aktif (`index.html`, `1` file data, `14` file CSS, `21` file JS internal) dengan total **`8.007` baris** / **`257.404` bytes** unminified | **Perlu Bundling & Minifikasi** |
| **Request Jaringan Kritis** | **`14`** tag `<link rel="stylesheet">`, **`25`** tag `<script>` (`4` blocking + `21` `defer`), plus Google Fonts render-blocking CSS & preload `v24` | **Risiko LCP & Waterfall** |
| **Aset Media (`assets/`)** | Total **`3,3 MB`** WebP + SVG; gambar terbesar mencapai **`249 KB`** (`2880×1628`) dan hero `my-photo.webp` **`145 KB`** (`1000×962`) | **Perlu Responsive Sizing (`srcset`)** |
| **Technical SEO** | **`0` elemen `<h1>`**, teks hero tersembunyi di `aria-hidden="true"`, `0` Open Graph / Twitter Card / `canonical` / JSON-LD, tidak ada `robots.txt` & `sitemap.xml` | **Kritis (High Priority)** |
| **Aksesibilitas (WCAG 2.1)** | **`0` aturan `:focus-visible`**, **`0` aturan `@media (prefers-reduced-motion: reduce)`**, shard skill SVG tanpa akses keyboard, modal tanpa focus trap, `cursor: none !important` global, serta elemen dengan rasio kontras `1.61:1` – `3.74:1` | **Kritis (High Priority)** |
| **GPU & Main-Thread** | **`37` deklarasi `will-change`** permanen di CSS, forced reflow per kata di `formatTextLines()`, `getBoundingClientRect()` di setiap event scroll, dan animasi scrub `filter: drop-shadow(...)` di atas SVG `<feGaussianBlur>` | **Risiko INP & Frame Drop** |

---

## 1. [HIGH PRIORITY] — [DONE]

> Status: Seluruh temuan `[HIGH-1]` sampai `[HIGH-5]` telah diimplementasikan (`[DONE]`).
> - `[DONE]` **[HIGH-1]** — Preloader blocking & hidden hero LCP dihilangkan; hero `#heroImageBox` & `#heroProfileImg` tampil langsung (`opacity: 1`).
> - `[DONE]` **[HIGH-2]** — Font di-self-host (`assets/fonts/*.woff2` + `css/fonts.css`), Critical CSS inline + bundle `css/bundle.min.css` & `js/bundle.min.js` (`scripts/build-assets.mjs`), plus `defer` + `sha384` SRI pada CDN GSAP/Lenis.
> - `[DONE]` **[HIGH-3]** — DOM read/write batching pada `formatTextLinesBatch()` & `fitSkillTextsToTriangles()`, cached metrics pada Scroll-Spy & showcase desktop, `transform: translate3d(...)` untuk `.project-vline-right`, dan debounce `150ms` listener `resize`.
> - `[DONE]` **[HIGH-4]** — Single `<h1 class="sr-only">`, canonical URL, Open Graph, Twitter Card, JSON-LD, pre-rendered fallback HTML (`#careerTable`, `#educationTable`, `<noscript>` di `#portfolioList`), `robots.txt`, dan `sitemap.xml`.
> - `[DONE]` **[HIGH-5]** — Dukungan `prefers-reduced-motion`, perbaikan kontras WCAG AA, `:focus-visible`, focus trap + `aria-hidden` + `inert` di modal carousel & mobile drawer, serta akses keyboard + `aria-pressed` di shard SVG Skills *(catatan: `cursor: none !important` di `css/cursor.css` dipertahankan sesuai desain awal atas permintaan user)*.

Temuan pada kelompok ini berdampak langsung terhadap metrik Core Web Vitals (**LCP** dan **INP**), keterindeksan **SEO**, serta hambatan akses (**A11y**) bagi pengguna keyboard/screen reader.

---

### [HIGH-1] [DONE] CWV (LCP): Preloader Full-Screen Memblokir Viewport & Gambar LCP Disembunyikan dengan `opacity: 0` hingga Animasi Intro Selesai

- **(a) Lokasi File & Baris Kode:**
  - [`index.html`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L46-L51) (`#loadingOverlay`)
  - [`index.html`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L103) (`#heroProfileImg` — elemen LCP utama `width="1000" height="962" fetchpriority="high" loading="eager"`)
  - [`css/preloader.css`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/preloader.css#L9-L28) (`.loading-overlay` fixed `100vw × 100vh`, `z-index: 10000`, `background-color: #000000`)
  - [`js/components/preloader.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/components/preloader.js#L119-L171), [`L180-L278`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/components/preloader.js#L180-L278)
  - [`js/animations/hero.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/animations/hero.js#L96-L144)
  - [`js/main.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/main.js#L77-L80)

- **(b) Akar Masalah & Dampak:**
  - Meskipun `#heroProfileImg` sudah memakai `fetchpriority="high" loading="eager"`, elemen `.loading-overlay` menutupi seluruh viewport secara solid (`z-index: 10000`) dan mengunci scroll saat startup. `initPreloader()` menunggu seluruh gambar non-lazy (termasuk `assets/logo.svg` serta slide pertama pada `#portfolioList` yang diset `loading="eager"` di [`js/renderers/portfolio.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/renderers/portfolio.js#L70)), `document.fonts.ready`, dan event `window load` (dengan safety timeout `1800ms` di `preloader.js:277`), kemudian menjalankan animasi exit berdurasi `0.65s` (`preloader.js:163`).
  - Sebelum overlay terbuka, `hero.js:98-100` men-set `#heroImageBox` (pembungkus gambar LCP), `#heroFrontendInner`, dan `#heroDeveloperInner` ke `opacity: 0` dengan timeline `paused: isPreloaderActive` (`hero.js:108`), `delay: 0.1` (`hero.js:110`), dan durasi animasi foto `1.4s` (`hero.js:118`) yang baru dijalankan oleh `playIntro()` (`preloader.js:133`). Dalam pengukuran CrUX/Lighthouse, elemen yang tertutupi overlay atau masih `opacity: 0` belum dihitung sebagai LCP selesai hingga benar-benar tampil ke pengguna — menambah penalti buatan ±`1–2+` detik pada LCP.

- **(c) Solusi Teknis Konkret:**
  - Hilangkan `#loadingOverlay` blocking pada initial load (atau tampilkan indikator non-blocking yang tidak menutupi area hero), dan pastikan `#heroImageBox`, `#heroProfileImg`, serta teks hero langsung dirender dengan `opacity: 1` pada first paint (`hero.js:98-100`).
  - Bila menginginkan animasi masuk pada hero, terapkan gerakan `transform: translate3d(...)` / `scale(...)` ringan tanpa pernah menurunkan `opacity` gambar LCP ke `0` atau menundanya di balik `paused` preloader.

---

### [HIGH-2] [DONE] CWV (LCP & FCP) + Keamanan: Render-Blocking Google Fonts, Preload `v24` Rapuh, 4 Blocking `<script>` Tanpa `defer`/SRI, & Waterfall 39 Asset CSS/JS

- **(a) Lokasi File & Baris Kode:**
  - [`index.html`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L16-L24) (Google Fonts `preconnect`, `<link rel="preload" ... syne/v24/...woff2">`, dan `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?...">`)
  - [`index.html`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L27-L40) (`14` tag `<link rel="stylesheet">` terpisah)
  - [`index.html`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L323-L330) (`4` blocking `<script>`: `gsap.min.js`, `ScrollTrigger.min.js` di `cdnjs.cloudflare.com`, `lenis.min.js` di `cdn.jsdelivr.net`, dan `data/portfolio-data.js` tanpa `defer` maupun atribut `integrity`/`crossorigin`)
  - [`index.html`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L333-L353) (`21` `<script defer>` lokal terpisah)

- **(b) Akar Masalah & Dampak:**
  - Tag `<link href="https://fonts.googleapis.com/css2?..." rel="stylesheet">` di baris `22-24` memblokir rendering halaman terhadap domain eksternal. Sementara itu, `<link rel="preload">` di baris `19-21` men-hardcode URL hash font Google Fonts `v24`; jika Google Fonts memperbarui revisi/hash font atau browser meminta subset berbeda berdasar UA, file font terunduh dua kali atau gagal cocok sehingga membuang bandwidth kritis.
  - Sebanyak `14` stylesheet lokal di baris `27-40` memaksa browser melakukan banyak round-trip (terutama pada HTTP/1.1 atau koneksi high-latency) sebelum CSSOM selesai dibangun.
  - Empat skrip di baris `323-330` tanpa `defer` memblokir penyelesaian parser HTML dan menunda event `DOMContentLoaded` / `load`. Selain itu, ketiadaan Subresource Integrity (`integrity="sha384-..."`) pada skrip pihak ketiga dari CDN publik membuat aplikasi rentan terhadap risiko manipulasi file CDN (*supply-chain risk*).

- **(c) Solusi Teknis Konkret:**
  - Self-host file `.woff2` (`Syne`, `Inter`, `Space Grotesk`) di `assets/fonts/` dengan `@font-face { font-display: swap; }` lokal, dan preload hanya 1–2 file font lokal di atas fold agar stabil serta bebas render-blocking stylesheet pihak ketiga.
  - Tambahkan atribut `defer`, `integrity`, dan `crossorigin="anonymous"` pada `gsap.min.js`, `ScrollTrigger.min.js`, dan `lenis.min.js` (atau bundel seluruh vendor ke produksi), serta tambahkan `defer` pada `data/portfolio-data.js` karena seluruh konsumen eksekusinya juga `defer` (`js/main.js`).
  - Terapkan bundler (seperti Vite atau esbuild) untuk menggabungkan & me-minify `14` CSS menjadi 1 stylesheet (plus Critical CSS inline untuk header/hero) dan menggabungkan modul JS internal.

---

### [HIGH-3] [DONE] CWV (INP & Main-Thread): Forced Synchronous Reflow (`formatTextLines`, SVG `getComputedTextLength`, Scroll-Spy) & Listener `resize` Tanpa Debounce

- **(a) Lokasi File & Baris Kode:**
  - [`js/core/renderer.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/core/renderer.js#L38-L62) (`formatTextLines()`: write `containerEl.innerHTML` -> baca `getBoundingClientRect().top`/`offsetTop` tiap `.temp-word` -> write ulang `containerEl.innerHTML`)
  - [`js/animations/scroll-reveal.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/animations/scroll-reveal.js#L26-L47), [`L60-L66`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/animations/scroll-reveal.js#L60-L66) (memanggil `formatTextLines()` berulang untuk `.education-row` dan `.career-row` saat startup & resize)
  - [`js/animations/skills.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/animations/skills.js#L14-L45) (`fitSkillTextsToTriangles()`: write `textEl.setAttribute('font-size', ...)` -> read ulang `textEl.getComputedTextLength()` dalam loop semua shard SVG)
  - [`js/components/navigation.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/components/navigation.js#L109-L141), [`L169-L185`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/components/navigation.js#L169-L185), [`L288-L306`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/components/navigation.js#L288-L306) (`updateActiveNav` memanggil `getBoundingClientRect()` & `offsetHeight` pada setiap tick `lenis.on('scroll')`)
  - [`js/animations/project-showcase.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/animations/project-showcase.js#L132), [`L167`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/animations/project-showcase.js#L167), [`L208-L212`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/animations/project-showcase.js#L208-L212), [`L398`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/animations/project-showcase.js#L398) (`vlineRight.style.left`, `lastTextSpan.offsetWidth`, dan `frame.style.display = 'none'`/`''` di dalam `renderFrame` scrub)
  - 4 listener `resize` tanpa debounce/throttle: [`js/components/navigation.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/components/navigation.js#L300), [`js/animations/parallax.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/animations/parallax.js#L69), [`js/animations/project-showcase.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/animations/project-showcase.js#L398), [`js/animations/project-mobile.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/animations/project-mobile.js#L397)
  - [`js/components/preloader.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/components/preloader.js#L65-L67) (`oldWidth = titleEl.offsetWidth` -> add class -> `newWidth = titleEl.offsetWidth`)

- **(b) Akar Masalah & Dampak:**
  - `formatTextLines()` memecah teks menjadi span `.temp-word`, menyuntikkannya ke DOM, langsung membaca metrik layout tiap kata dalam loop, lalu menulis ulang `innerHTML` dengan `.text-line-mask` — memicu *Forced Synchronous Layout* berantai untuk seluruh baris Career dan Education di fase boot (`main.js` -> `parallax.js` -> `scroll-reveal.js`) dan tiap kali window di-resize.
  - Pada runtime scroll, `navigation.js:128-140` memanggil `target.getBoundingClientRect()` dan `target.offsetHeight` bagi section maupun link di setiap callback scroll (`navigation.js:289`), sementara `project-showcase.js:132, 167, 209` memodifikasi properti layout `style.left` & `style.display` sekaligus membaca `offsetWidth` di tengah `renderFrame`. Pada perangkat berspesifikasi menengah/rendah, antrean kalkulasi layout ulang di tiap frame memblokir main-thread sehingga menaikkan *Total Blocking Time (TBT)* dan latensi input (**INP**).
  - Empat listener `resize` langsung mengeksekusi ulang kalkulasi/DOM teardown pada setiap pixel perubahan ukuran jendela (hanya `scroll-reveal.js:27-28` yang di-debounce `150ms`).

- **(c) Solusi Teknis Konkret:**
  - Pada `renderer.js`, pisahkan fase penulisan `.temp-word` (semua container) dari fase pembacaan `offsetTop`/`getBoundingClientRect()` (*batch read/write*) atau gunakan `Intl.Segmenter` + estimasi off-DOM tanpa manipulasi `innerHTML` berulang; batasi `fitSkillTextsToTriangles()` pada `skills.js` agar membaca seluruh panjang teks terlebih dulu sebelum menerapkan atribut `font-size`.
  - Di `navigation.js`, cache array `{ id, top, height }` section serta metrik `{ left, width }` link hanya saat init, `ScrollTrigger.refresh`, dan debounced `resize`, lalu pada listener `scroll` hanya lakukan komparasi numerik terhadap `scrollY` (dengan flag `rAF`).
  - Di `project-showcase.js`, cache lebar `lastTextSpan` di dalam `measureMetrics()`, ganti `vlineRight.style.left` menjadi GPU `transform: translate3d(...)`, dan ganti `frame.style.display` dengan `visibility: hidden` + `pointer-events: none`.
  - Bungkus keempat handler `resize` (`navigation.js`, `parallax.js`, `project-showcase.js`, `project-mobile.js`) dengan `debounce` (`120–150ms`) atau gabungkan ke dalam satu observer resize terpusat.

---

### [HIGH-4] [DONE] Technical SEO: Halaman Aktif Kehilangan Elemen `<h1>`, Headline Hero Tersembunyi (`aria-hidden`), Konten CSR Kosong pada Raw HTML, & Meta/Crawling Tidak Lengkap

- **(a) Lokasi File & Baris Kode:**
  - [`index.html`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L1-L15) (Hanya ada `<title>`, `<meta name="description">`, `<meta name="keywords">`, dan favicon; tidak ada `canonical`, Open Graph `og:*`, Twitter Card `twitter:*`, maupun JSON-LD)
  - [`index.html`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L94-L117) (`#heroLayerTop` berisi `<span ...>FRONTEND</span>` & `#heroLayerBottom` berisi `<span ...>DEVELOPER</span>`, keduanya dibungkus `aria-hidden="true"`)
  - [`index.html`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L132), [`L151`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L151), [`L169`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L169), [`L187`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L187), [`L207`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L207) (Semua section utama memakai `<h2 class="section-main-title">` tanpa ada `<h1>` satu pun, lalu lompat ke `<h3>` di [`L216-L254`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L216-L254), [`L291`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L291), [`js/renderers/career.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/renderers/career.js#L35), [`js/renderers/education.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/renderers/education.js#L30))
  - [`index.html`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L139), [`L156`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L156), [`L174`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L174), [`L192`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L192) (Kontainer CSR kosong `#portfolioList`, `#careerTable`, `#skillsCrystalStage`, `#educationTable`)
  - Root proyek: tidak ditemukan `robots.txt` maupun `sitemap.xml`

- **(b) Akar Masalah & Dampak:**
  - Ketika halaman SPA `all-project` (yang sebelumnya menampung `<h1>`) dihapus saat refaktor, halaman utama `index.html` menjadi tidak memiliki elemen **`<h1>` sama sekali**. Selain itu, judul utama Hero ("FRONTEND DEVELOPER") tidak menggunakan tag heading dan justru disematkan di dalam container `aria-hidden="true"`, sehingga bot pencarian dan pembaca layar kehilangan hierarki topik utama halaman.
  - Seluruh portofolio proyek, pengalaman kerja, skills, dan pendidikan bergantung 100% pada eksekusi JS (`portfolio-data.js` + `renderer.js`), sehingga HTML awal hampir kosong di bagian isi.
  - Ketiadaan `<link rel="canonical">`, tag `og:*` & `twitter:*`, schema JSON-LD `Person`/`ProfilePage`, serta absennya `robots.txt` dan `sitemap.xml` mengurangi relevansi rich snippets, kontrol URL kanonik, dan pratinjau tautan saat dibagikan di media sosial/rekruter. Sebaliknya, `<meta name="keywords">` sudah usang dan tidak memberi nilai SEO modern.

- **(c) Solusi Teknis Konkret:**
  - Sediakan satu `<h1>` tunggal yang jelas di section Hero (mis. menjadikan wrapper teks hero atau elemen `<h1 class="sr-only">Rifqi Ziyad Imtinan — Frontend Developer</h1>` bila layer grafis tetap dekoratif, sehingga screen reader dan crawler langsung menemukan `<h1>` tanpa duplikasi pembacaan).
  - Tambahkan `<link rel="canonical" href="https://...">`, meta `og:title`, `og:description`, `og:type`, `og:url`, `og:image` (minimal `1200×630px`), `twitter:card="summary_large_image"`, JSON-LD `<script type="application/ld+json">` untuk profil `Person`, serta hapus `<meta name="keywords">`.
  - Buat `robots.txt` dan `sitemap.xml` di root deploy, dan tambahkan tahap *static pre-rendering* saat build (atau fallback HTML statis) agar data `portfolio`, `career`, dan `education` sudah ada di dokumen HTML awal sebelum JS berjalan.

---

### [HIGH-5] [DONE] Aksesibilitas (WCAG 2.1 Level A/AA): Focus Trap Modal & Drawer Absen, Shard SVG Tidak Bisa Diakses Keyboard, `cursor: none !important` Global, Zero `prefers-reduced-motion`/`focus-visible`, & Kontras Gagal AA

- **(a) Lokasi File & Baris Kode:**
  - [`css/cursor.css`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/cursor.css#L2-L6) (`@media (pointer: fine) { html, body, *, *::before, *::after, a, button, input, select, textarea { cursor: none !important; } }`)
  - [`index.html`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L78-L81) & [`js/components/navigation.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/components/navigation.js#L38-L59) (`#mobileToggle` tidak memiliki `aria-expanded` / `aria-controls="navMenu"`; drawer tidak punya mekanisme tutup `Escape` maupun focus management)
  - [`index.html`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L284-L320) & [`js/components/carousel.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/components/carousel.js#L298-L320), [`L600-L643`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/components/carousel.js#L600-L643) (Modal lightbox `role="dialog" aria-modal="true"` tidak memindahkan fokus saat dibuka, tidak memiliki focus trap `Tab`/`Shift+Tab`, dan tidak mengembalikan fokus ke tombol pemicu saat ditutup)
  - [`js/renderers/skills.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/renderers/skills.js#L272-L323) & [`js/animations/skills.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/animations/skills.js#L496-L505) (`<g class="skill-tri-shard">` interaktif saat klik/hover hanya mengikat `mouseenter`/`mouseleave`/`click` tanpa `role="button"`, `tabindex="0"`, `aria-label`, atau `keydown`)
  - Global seluruh file CSS & JS: **`0` aturan `:focus-visible`** dan **`0` aturan `prefers-reduced-motion`**
  - Pelanggaran rasio kontras WCAG AA (`>= 4.5:1` teks normal) di latar `#070707`:
    - [`css/variables.css`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/variables.css#L10) + [`css/footer.css`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/footer.css#L8): `--text-muted: #606066` pada `#070707` memiliki rasio kontras **`3.23:1`**
    - [`css/portfolio.css`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/portfolio.css#L238): `.project-spec-label` menggunakan `rgba(255, 255, 255, 0.4)` pada `#070707` -> rasio **`3.74:1`**
    - [`css/portfolio.css`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/portfolio.css#L152): `.project-title-layer-dim .project-title-item` (tombol navigasi proyek interaktif) menggunakan `rgba(255, 255, 255, 0.18)` -> rasio **`1.61:1`**

- **(b) Akar Masalah & Dampak:**
  - `cursor: none !important` di semua elemen menghapus kursor sistem bagi seluruh pengguna desktop (termasuk pengguna dengan tremor/disabilitas motorik atau magnifier OS yang mengandalkan kursor pointer/text native), sementara `#cursor-dot` baru tampil setelah `mousemove` (`cursor.js:27-30`) dan ukurannya hanya `6×6px` (`cursor.css:12-13`).
  - Pengguna keyboard tidak memiliki indikator fokus yang konsisten (`:focus-visible`), terjebak saat melintasi dialog `#portfolioCarouselModal` (fokus Tab lolos ke elemen belakang modal dan saat modal ditutup fokus hilang di `document.body`), tidak mendapatkan status `aria-expanded` pada `#mobileToggle`, serta tidak bisa mengeksplorasi keahlian di kristal `#skillsCrystalStage`.
  - Pengguna dengan sensitivitas gerak (*vestibular disorder*) tetap menerima paralaks horizontal/vertikal penuh dan scrub GSAP karena tidak ada dukungan `@media (prefers-reduced-motion: reduce)`.
  - Teks beropasitas rendah (`1.61:1` hingga `3.74:1`) gagal memenuhi standar keterbacaan WCAG 2.1 AA.

- **(c) Solusi Teknis Konkret:**
  - Hapus aturan `cursor: none !important` pada seluruh selector (`*`) dan kembalikan kursor native (atau jadikan `#cursor-dot` murni elemen dekoratif mengikuti pointer tanpa menyembunyikan kursor bawaan OS).
  - Tambahkan `:focus-visible { outline: 2px solid var(--accent-orange); outline-offset: 3px; }` di [`css/global.css`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/global.css).
  - Lengkapi `#mobileToggle` dengan `aria-controls="navMenu"` & `aria-expanded`, tambahkan dukungan tombol `Escape` untuk menutup menu mobile, serta implementasikan fokus trap lengkap (`Tab`/`Shift+Tab`, simpan `lastFocusedElement`, kembalikan fokus setelah tutup) + toggle `inert` pada `<main>` di `carousel.js`.
  - Jadikan setiap `.skill-tri-shard` aksesibel (`role="button"`, `tabindex="0"`, `aria-label`, event `keydown` `Enter`/` ` + `focus`/`blur`), serta tambahkan `role="img"` / `aria-label` deskriptif pada `#skillsCrystalSvg`.
  - Terapkan `@media (prefers-reduced-motion: reduce)` di CSS dan cek `window.matchMedia('(prefers-reduced-motion: reduce)').matches` di `main.js` / `scroll.js` untuk menonaktifkan Lenis smooth wheel, paralaks, dan intro transform besar.
  - Perbaiki token/opasitas kontras: naikkan `--text-muted` ke minimal `#8E8E96` (`>= 4.5:1`), `.project-spec-label` ke `rgba(255, 255, 255, 0.62)`, dan `.project-title-layer-dim .project-title-item` ke minimal `rgba(255, 255, 255, 0.48)` (rasio `>= 4.5:1`).

---

## 2. [MEDIUM PRIORITY] — [DONE]

> Status: Seluruh temuan `[MEDIUM-1]` sampai `[MEDIUM-4]` telah diimplementasikan (`[DONE]`).
> - `[DONE]` **[MEDIUM-1]** — Reservasi dimensi `.skills-crystal-stage` (`aspect-ratio: 1000 / 960`) & `.project-showcase-mount` (`min-height: 100vh`), perbaikan `@font-face 'SyneFallback'` (menghapus `local('sans-serif')` invalid + menambahkan metrik override), serta penambahan `width="72" height="46" decoding="async"` pada thumbnail carousel.
> - `[DONE]` **[MEDIUM-2]** — Crop hero ke `3:4` (`480w` `53 KB` & `720w` `68 KB`) + `srcset`/`sizes`, resize cover/galeri proyek maks `1600px` beserta varian `800w`/`1200w`, metadata `imageWidth`/`imageHeight`/`imageSrcset` aktual di `data/portfolio-data.js`, dan rename seluruh file asset ke *kebab-case* tanpa spasi.
> - `[DONE]` **[MEDIUM-3]** — Penghapusan scrub `filter: drop-shadow(...)` dari `skills.js` & `contact.js` (diganti CSS `radial-gradient` `::before` compositor-only), penggantian `.noise-overlay` `<feTurbulence>` dengan tile statis `assets/noise-tile.webp`, dan pembersihan `will-change` statis/non-compositor (`clip-path`, `width`, `filter`, modal/reveal idle).
> - `[DONE]` **[MEDIUM-4]** — Pembaruan `cursor.js` ke `rAF` + `transform: translate3d(...)` + event delegation (`mouseover`/`mouseout` & class `.is-hovering`), serta hardening utilitas `escapeHtml`, `escapeAttr`, dan `sanitizeUrl` di `renderer.js` dan seluruh renderer/carousel.

Temuan pada kelompok ini berisiko menimbulkan **CLS**, membebani bandwidth & decoder gambar, menciptakan *paint/compositing overhead* pada GPU, serta melemahkan keandalan event/DOM injection.

---

### [MEDIUM-1] [DONE] CWV (CLS): Kontainer CSR Kosong Tanpa Reserved Height, Definisi Font Fallback Invalid `local('sans-serif')`, & Thumbnail Carousel Tanpa Dimensi

- **(a) Lokasi File & Baris Kode:**
  - [`index.html`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L139) (`#portfolioList`), [`L156`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L156) (`#careerTable`), [`L174`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L174) (`#skillsCrystalStage`), [`L192`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L192) (`#educationTable`)
  - [`css/preloader.css`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/preloader.css#L3-L7) (`@font-face { font-family: 'SyneFallback'; src: local('Arial Black'), local('Impact'), local('sans-serif'); size-adjust: 135%; }`)
  - [`js/components/preloader.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/components/preloader.js#L59-L88) (`applySyneWithTransition`)
  - [`js/components/carousel.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/components/carousel.js#L198) (`<img src="${src}" alt="Thumbnail ${idx + 1}" loading="lazy">`)
  - [`index.html`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L307) (`#carouselMainImg` memakai `src="" width="1200" height="800"`)

- **(b) Akar Masalah & Dampak:**
  - Keempat blok utama `#portfolioList`, `#careerTable`, `#skillsCrystalStage`, dan `#educationTable` tidak memiliki isi HTML statis maupun `min-height` / `aspect-ratio` cadangan di CSS; ketika DOM dirender oleh JS `defer` setelah parsing HTML, tinggi halaman mendadak meluas dari hampir nol ke ribuan pixel — berisiko menimbulkan CLS besar dan membuat anchor scroll hash (`#skills`, `#contact` pada [`js/main.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/main.js#L63-L72)) bergeser sebelum `ScrollTrigger.refresh()` stabil.
  - Pada `@font-face 'SyneFallback'`, nilai `local('sans-serif')` tidak valid menurut spesifikasi CSS Fonts karena `local()` hanya mencocokkan nama PostScript/full font lokal spesifik, bukan keyword famili generik. Apabila mesin klien tidak memasang Arial Black/Impact (mis. banyak distro Linux/Android), aturan `local()` gagal seluruhnya dan jatuh ke system font dengan ukuran tak disesuaikan hingga `Syne` selesai dimuat (*FOUT* / pergeseran teks).
  - Elemen `<img>` thumbnail galeri yang dibuat oleh `carousel.js:198` tidak mencantumkan atribut `width` dan `height`.

- **(c) Solusi Teknis Konkret:**
  - Tambahkan `aspect-ratio: 1000 / 960` / `min-height` proporsional di CSS pada `#skillsCrystalStage` dan kontainer placeholder CSR lainnya (atau pre-render HTML statis saat build).
  - Hapus `local('sans-serif')` dari `@font-face`, gunakan metrik font-face override yang valid (`size-adjust`, `ascent-override`, `descent-override`) terhadap font terpasang seperti `Arial` / `Roboto` / `Helvetica Neue`, lalu preload `Syne` lokal.
  - Tambahkan `width="72" height="46" decoding="async"` pada template `<img>` di `carousel.js:198`.

---

### [MEDIUM-2] [DONE] Optimasi Media: Hero & Cover Project Oversized (`2880px` / `145–249 KB`), Aspect Ratio Tidak Selaras, & Nama File Mengandung Spasi

- **(a) Lokasi File & Baris Kode:**
  - [`index.html`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L103) + [`css/hero.css`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/hero.css#L63-L82) (`assets/my-photo.webp` berukuran asli `1000×962`, `145 KB`, dimuat ke box lebar `clamp(260px, 32vw, 460px)` dengan `aspect-ratio: 3/4`)
  - [`js/renderers/portfolio.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/renderers/portfolio.js#L79) & [`data/portfolio-data.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/data/portfolio-data.js#L21-L135):
    - `assets/smartbox/s1.webp`: `2880×1628`, `249 KB` (dan `s2.webp` `170 KB`, `s4.webp` `153 KB`, `s3.webp` `140 KB`, `s5.webp` `132 KB`)
    - `assets/ignica/Screenshot 2023-09-13 at 09.32.34.webp`: `2880×1632`, `79 KB` (plus `Screenshot 2023-09-13 at 09.33.01.webp` `249 KB`, `ignica.com_(iPad Air).webp` `129 KB`)
    - `assets/btn/Screenshot 2025-04-25 at 16.07.25.webp`: `2852×1624`, `91 KB` (plus `16.09.24.webp` `155 KB`)
    - `assets/cimb/c1.webp`: `2880×1624`, `123 KB` (plus `c3.webp` `149 KB`, `c5.webp` `128 KB`)
    - `assets/kasumi/home page.webp`: `2880×1518`, `53 KB` (plus `form recruitment.webp` `131 KB`)
    - `assets/bni/bni1.webp`: `1600×900`, `58 KB`
    - `assets/hibank/1745218296927.webp`: `1270×796`, `56 KB`

- **(b) Akar Masalah & Dampak:**
  - Foto Hero (`1000×962`, mendekati `1:1`, `145 KB`) melebihi lebar render `32vw` (`~460px` maksimal di desktop, `~260–360px` di mobile) dan berbeda rasio dari container `aspect-ratio: 3/4` di `hero.css:75`, sehingga sekitar separuh byte tidak terpakai pada layar 1x/mobile dan bagian kiri-kanan terpotong oleh `object-fit: cover`.
  - Seluruh cover project di `portfolio.js:79` menempelkan `width="1200" height="800"` (rasio `3:2`) secara hardcoded, padahal mayoritas asset berdimensi `~2880×1624` (`~16:9`) dengan ukuran file hingga `249 KB`. Mendekode beberapa bitmap beresolusi `2880px` ke GPU memakan memori VRAM besar (khususnya di iOS/Android) dan memperlambat transfer jaringan. Beberapa nama file juga memakai spasi literal (`Screenshot ...`, `home page.webp`).

- **(c) Solusi Teknis Konkret:**
  - Potong dan ekspor ulang `my-photo` ke rasio `3:4` dengan beberapa varian lebar (`srcset="... 480w, ... 720w, ... 960w"`), serta optimasi kompresi WebP/AVIF agar target ukuran hero `< 60 KB`.
  - Turunkan resolusi maksimal gambar galeri proyek ke `1600px` lebar (plus `800w` & `1200w` via `srcset`/`sizes`), simpan `width`/`height` aktual masing-masing proyek di `portfolio-data.js`, dan ubah seluruh nama file asset menjadi *kebab-case* tanpa spasi.

---

### [MEDIUM-3] [DONE] Beban GPU Paint & Compositing: Interpolasi Scrub `filter: drop-shadow(...)`, Dual SVG `<feGaussianBlur>`, Noise `<feTurbulence>`, `backdrop-filter`, & 37 Deklarasi `will-change`

- **(a) Lokasi File & Baris Kode:**
  - [`js/animations/skills.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/animations/skills.js#L261-L272) & [`js/animations/contact.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/animations/contact.js#L45-L56) (Scrub tween `filter: drop-shadow(...)` pada `#skillsCrystalStage` dan `#bgContactCrystal`)
  - [`js/components/crystal-backgrounds.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/components/crystal-backgrounds.js#L17-L33) (Filter SVG `#contact-gem-shard-laser` dengan dual `feGaussianBlur` & `#contact-gem-shard-core` `stdDeviation="7"`)
  - [`css/global.css`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/global.css#L75-L85) (`.noise-overlay` full-viewport `fixed` `100vw × 100vh` `z-index: 999` berisi SVG `<feTurbulence numOctaves="3">`)
  - [`css/contact.css`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/contact.css#L53-L55) (`.bento-card` memakai `backdrop-filter: blur(6px)` di atas `.bg-contact-crystal`) dan [`css/carousel.css`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/carousel.css#L39-L40), [`L169-L170`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/carousel.css#L169-L170) (`backdrop-filter: blur(20px)` & `blur(12px)`)
  - `37` deklarasi `will-change` statis tersebar di `12` file CSS: `carousel.css` (`7`), `portfolio.css` (`7`, termasuk `will-change: left` di [`L77`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/portfolio.css#L77) & `will-change: clip-path` di [`L315`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/portfolio.css#L315)), `portfolio-mobile.css` (`5`), `hero.css` (`4`), `preloader.css` (`4`, termasuk `will-change: clip-path` di [`L76`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/preloader.css#L76)), `global.css` (`2`), `skills.css` (`2`), `contact.css` (`2`), `cursor.css` (`1`), `header.css` (`1`), `career.css` (`1`), `education.css` (`1`).

- **(b) Akar Masalah & Dampak:**
  - Menganimasikan `filter: drop-shadow(...)` setiap frame saat user men-scroll di atas SVG kompleks berisi banyak `<polygon>` dan `<feGaussianBlur>` memicu rasterisasi shadow ulang secara kontinu. Selain itu, `.bento-card` memakai `backdrop-filter: blur(6px)` di atas layer `#bgContactCrystal` yang ikut bergerak & ter-filter, menggandakan beban *render pass* kompositor.
  - Memasang `37` aturan `will-change` secara permanen — termasuk pada elemen tak terlihat (`carousel-modal`, `loading-overlay`) dan properti non-compositor (`left`, `clip-path`) — mengonsumsi memori GPU secara berlebih dan berpotensi menimbulkan *jank* pada mobile Safari/Android.

- **(c) Solusi Teknis Konkret:**
  - Hapus interpolasi `filter: drop-shadow(...)` dari timeline GSAP `skills.js` & `contact.js`; gantikan efek pendar dengan layer CSS `radial-gradient` terpisah di belakang SVG dan animasikan hanya properti `opacity` & `transform` (compositor-only).
  - Ganti `.noise-overlay` data-URI `<feTurbulence>` dengan tile pattern PNG/WebP statis berukuran kecil (mis. `128×128px`) ber-`background-repeat: repeat`.
  - Hapus `will-change: left`, `will-change: clip-path`, serta deklarasi `will-change` permanen pada `.reveal` & modal; terapkan `will-change` secara dinamis hanya saat animasi berlangsung (atau biarkan GSAP mengelola layer compositing otomatis via `force3D: true`).

---

### [MEDIUM-4] [DONE] Efisiensi Event & Hardening DOM Rendering: Kursor `mousemove` Memicu Mutasi `left`/`top` + Sanitasi `escapeAttr` Parsial

- **(a) Lokasi File & Baris Kode:**
  - [`js/components/cursor.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/components/cursor.js#L20-L48) (`dot.style.left = ...`, `dot.style.top = ...`, plus `querySelectorAll('a, button').forEach`)
  - [`js/core/renderer.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/core/renderer.js#L18-L20) (`escapeAttr` hanya memfilter `"`)
  - [`js/renderers/portfolio.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/renderers/portfolio.js#L54-L162), [`js/renderers/career.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/renderers/career.js#L27-L53), [`js/renderers/education.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/renderers/education.js#L23-L48), [`js/renderers/skills.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/renderers/skills.js#L273-L303), [`js/components/carousel.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/components/carousel.js#L198)

- **(b) Akar Masalah & Dampak:**
  - `cursor.js:24-25` memperbarui `left` dan `top` pada setiap event `mousemove` tanpa `requestAnimationFrame` maupun GPU `transform: translate3d(...)`, sehingga menimbulkan kalkulasi layout & paint ekstra ketika pointer digerakkan cepat. Selain itu, binding `mouseenter`/`mouseleave` dilakukan di boot via `querySelectorAll('a, button')` sehingga elemen yang dibuat dinamis (seperti `.carousel-thumb-item` di modal) tidak terdeteksi.
  - Fungsi `escapeAttr` di `renderer.js:18-20` hanya me-replace karakter `"`, dan sebagian besar isi HTML di renderer disuntikkan mentah ke `innerHTML` tanpa `escapeHtml()` maupun sanitasi protokol `linkUrl`. Saat ini aman karena data lokal statis (`portfolio-data.js`), tetapi berisiko DOM-based XSS jika sumber data diperluas ke CMS/query string.

- **(c) Solusi Teknis Konkret:**
  - Ganti pembaruan posisi `cursor.js` dengan `dot.style.transform = \`translate3d(\${mouseX}px, \${mouseY}px, 0) translate(-50%, -50%)\`` yang di-coalesce ke 1 pembaruan per `requestAnimationFrame`, dan gunakan event delegation (`mouseover`/`mouseout` pada `document` dengan `closest('a, button, [role="button"]')`).
  - Lengkapi utilitas `escapeHtml` & `escapeAttr` (escape `&`, `<`, `>`, `"`, `'`) dan validasi skema `linkUrl` (whitelist `https:`, `http:`, `mailto:`, atau path relatif) di semua renderer serta `carousel.js`.

---

## 3. [LOW PRIORITY] — [DONE]

> Status: Seluruh temuan `[LOW-1]` sampai `[LOW-3]` telah diimplementasikan (`[DONE]`).
> - `[DONE]` **[LOW-1]** — Penghapusan token CSS tak terpakai (`--bg-card-hover`, `--accent-red`, `--accent-amber` di `css/variables.css`), class utilitas yatim (`.reveal-left`, `.reveal-right` di `css/global.css`), dan komentar historis `timeline.js` di `js/animations/contact.js`.
> - `[DONE]` **[LOW-2]** — Konsolidasi aturan layout/tipografi/responsive `career` & `education` pada `css/career.css` + helper bersama `renderTimelineRows()` di `js/core/renderer.js`, serta sentralisasi SVG panah duotone via `<symbol id="icon-shard-arrow">` & `<use href="#icon-shard-arrow"/>`.
> - `[DONE]` **[LOW-3]** — Bundling & code-splitting via **esbuild** ([package.json](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/package.json) + [scripts/build-assets.mjs](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/scripts/build-assets.mjs)) dengan full AST minification & mangling: `css/bundle.min.css` (`34.8 KB`), `js/bundle.min.js` core (`63.6 KB`), `js/chunk-showcase.min.js` (`6.0 KB`), `js/chunk-mobile.min.js` (`7.3 KB`), `js/chunk-carousel.min.js` (`10.0 KB` lazy-loaded on-demand) beserta cache-busting content hash (`?v=<sha256>`) di `index.html`.

Temuan pada kelompok ini berfokus pada kebersihan kode, pemeliharaan CSS/JS jangka panjang, penghapusan sisa token tak terpakai, serta efisiensi bundling/code-splitting.

---

### [LOW-1] [DONE] Dead Code Tersisa: Token CSS & Class Utility Tak Terpakai serta Komentar Historis Pra-Refaktor

- **(a) Lokasi File & Baris Kode:**
  - [`css/variables.css`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/variables.css#L6), [`L14-L15`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/variables.css#L14-L15) (`--bg-card-hover`, `--accent-red`, `--accent-amber` tidak direferensikan oleh selector mana pun)
  - [`css/global.css`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/global.css#L160-L166) (`.reveal-left` dan `.reveal-right` memiliki 0 pemanggil di HTML maupun JS)
  - [`js/animations/contact.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/animations/contact.js#L4) (Komentar JSDoc masih merujuk `js/animations/timeline.js` yang sudah dihapus)
  - [`index.html`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L10-L11) (`<meta name="keywords">` usang)

- **(b) Akar Masalah & Dampak:**
  - Meskipun refaktor besar sebelumnya sudah membersihkan router SPA dan file mati, sisa variabel tema, class helper CSS, serta referensi komentar modul yang sudah dihapus menambah noise kognitif bagi pengembang dan menimbulkan asumsi keliru bahwa token/animasi tersebut masih aktif dipakai.

- **(c) Solusi Teknis Konkret:**
  - Hapus `--bg-card-hover`, `--accent-red`, `--accent-amber` dari `variables.css` serta `.reveal-left`/`.reveal-right` dari `global.css` jika tidak masuk rencana desain aktif.
  - Perbarui komentar di `js/animations/contact.js:4` dan hapus `<meta name="keywords">` dari `index.html`.

---

### [LOW-2] [DONE] Duplikasi Kode: CSS & DOM Renderer `career` vs `education` Identik serta Duplikasi SVG Panah Inline

- **(a) Lokasi File & Baris Kode:**
  - [`css/career.css`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/career.css#L21-L100) vs [`css/education.css`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/education.css#L21-L100) (Struktur layout 3 kolom `grid-template-columns: minmax(130px, 1fr) minmax(220px, 1.8fr) 2.4fr`, padding, border, hover, dan tipografi berulang hampir 1:1)
  - [`js/renderers/career.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/renderers/career.js#L14-L59) vs [`js/renderers/education.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/renderers/education.js#L14-L54)
  - [`index.html`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L302), [`L312`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L312) vs [`js/renderers/portfolio.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/renderers/portfolio.js#L134) (Markup SVG panah duotone beserta `<defs><mask>` disalin ulang di 3 tempat)

- **(b) Akar Masalah & Dampak:**
  - Perubahan kecil pada grid, jarak antar-kolom, atau breakpoint tabel 3-kolom mengharuskan penyuntingan sinkron pada 2 file CSS dan 2 renderer JS terpisah sehingga rawan inkonsistensi visual. Duplikasi ikon SVG `<mask>` inline juga memperbesar ukuran HTML/JS tanpa guna.

- **(c) Solusi Teknis Konkret:**
  - Konsolidasikan style tabel 3 kolom menjadi satu modul class bersama (mis. `.timeline-table`, `.timeline-row`, `.timeline-period`, `.timeline-title`, `.timeline-subtitle`, `.timeline-desc`) dan satu fungsi renderer generik `renderTimelineTable(containerId, items, mapping)` di `js/renderers/`.
  - Pindahkan definisi ikon panah ke `<symbol id="icon-shard-arrow">` terpusat (atau helper template tunggal) dan panggil dengan `<use href="#icon-shard-arrow" />`.

---

### [LOW-3] [DONE] Peluang Code-Splitting, Dynamic Imports, & Cache Busting untuk Produksi

- **(a) Lokasi File & Baris Kode:**
  - [`index.html`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L27-L40), [`L333-L353`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/index.html#L333-L353)
  - [`js/animations/parallax.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/animations/parallax.js#L20-L42) (Mengorkestrasi antara [`js/animations/project-showcase.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/animations/project-showcase.js) `446` baris dan [`js/animations/project-mobile.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/animations/project-mobile.js) `641` baris)
  - [`js/components/carousel.js`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/js/components/carousel.js) (`745` baris) & [`css/carousel.css`](file:///Users/rifqiziyadimtinan/Documents/Programming/portfolio-minimalism/css/carousel.css) (`316` baris)

- **(b) Akar Masalah & Dampak:**
  - Karena aplikasi menggunakan pola IIFE sinkron tanpa ES Modules (`<script type="module">`) maupun bundler, seluruh skrip — termasuk controller modal `carousel.js` (`745` baris) yang belum tentu dibuka oleh pengunjung serta kedua modul viewport eksklusif (`project-showcase.js` desktop + `project-mobile.js` mobile) — selalu diunduh dan di-parse pada initial page load.
  - Nama asset CSS/JS bersifat statis tanpa content hash, membatasi strategi caching `Cache-Control: public, max-age=31536000, immutable` pada CDN/reverse proxy.

- **(c) Solusi Teknis Konkret:**
  - Pertimbangkan konversi bertahap ke ES Modules (`type="module"`) dengan bundler ringan (Vite / Rollup):
    1. Gunakan dynamic `import()` on-demand untuk `carousel.js` & `carousel.css` ketika tombol galeri/thumbnail pertama kali diklik atau di-hover.
    2. Muat kondisional antara controller desktop (`project-showcase.js`) vs mobile (`project-mobile.js`) sesuai media query awal (`window.matchMedia('(max-width: 768px)')`).
    3. Aktifkan output filename berbasis hash (`[name].[hash].js/css`) agar cache browser optimal pasca-rilis.

---

## Matriks Prioritas Tindak Lanjut Rekomendasi

| Fase | Fokus Utama | Item Terkait | Status | Estimasi Dampak Produksi |
| :--- | :--- | :--- | :--- | :--- |
| **Fase 1 (Quick Wins)** | Perbaikan SEO & A11y Kritis + Unblock LCP | `[HIGH-1]`, `[HIGH-4]`, `[HIGH-5]` | `[DONE]` | LCP turun signifikan, lolos struktur heading `<h1>`, kepatuhan WCAG keyboard/kontras/reduced-motion, indeksabilitas SEO & Social Share |
| **Fase 2 (CWV Tuning)** | Self-host Fonts + Defer CDN/Data + Debounce Resize/Batch DOM Reads | `[HIGH-2]`, `[HIGH-3]`, `[MEDIUM-1]`, `[MEDIUM-4]` | `[DONE]` | Eliminasi render-blocking CSS font & script parser block, stabilisasi INP saat scroll/resize, minim CLS |
| **Fase 3 (Asset & GPU)** | Optimasi resolusi `assets/` (`srcset`) + Hapus scrub `drop-shadow` & berlebihnya `will-change` | `[MEDIUM-2]`, `[MEDIUM-3]` | `[DONE]` | Payload halaman & memori VRAM turun drastis pada perangkat mobile, scroll lebih stabil 60fps |
| **Fase 4 (Maintainability & Build)** | Bundling esbuild + Code-Splitting + Konsolidasi Career/Education + Cache Busting | `[LOW-1]`, `[LOW-2]`, `[LOW-3]` | `[DONE]` | Pengurangan payload JS awal (`129 KB -> 63.6 KB`), penghapusan duplikasi & dead code tersisa, cache-busting `?v=<hash>` |
