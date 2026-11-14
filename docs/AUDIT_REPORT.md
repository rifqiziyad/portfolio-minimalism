# AUDIT REPORT — Web Profile (`portfolio-minimalism`)

Audit kode dan performa *production-grade* terhadap proyek **Web Profile — RIFQI ZIYAD IMTINAN** (Vanilla HTML/CSS/JS + GSAP 3.12.5 + Lenis 1.1.20, tanpa bundler/framework). Laporan ini disusun murni berdasarkan inspeksi statis kode sumber dan struktur direktori tanpa memodifikasi kode aplikasi.

---

## Ringkasan Eksekutif & Inventori Kode

| Aspek | Kondisi Saat Ini | Status |
| :--- | :--- | :--- |
| **Stack & Build** | Static Vanilla HTML/CSS/JS (`0` build config / bundler / minifier), CDN GSAP `3.12.5` & Lenis `1.1.20` | ⚠️ Perlu Optimasi |
| **Jejak Aset Kode** | `10,152` baris total (seluruh file HTML, CSS, JS di repo); `325,560 bytes` pada `index.html`, `data/portfolio-data.js`, `css/*.css` & `js/**/*.js` unminified (`14` `<link rel="stylesheet">`, `27` `<script>` di `index.html`) | 🔴 Terfragmentasi |
| **CWV — LCP** | Terhambat full-screen preloader (`z-index: 10000`), animasi masuk `#heroImageBox` dari `opacity: 0` (`1.4s`), render-blocking Google Fonts CSS, & 4 blocking scripts | 🔴 High Risk |
| **CWV — INP** | Forced synchronous reflow (`offsetTop`, `getBoundingClientRect()`, `getComputedTextLength()`), layout write pada scroll/mousemove (`left`/`top`), animasi `drop-shadow` + `backdrop-filter`, event listener leak | 🔴 High Risk |
| **CWV — CLS** | Kontainer CSR kosong tanpa `min-height`, fallback `@font-face` (`local('sans-serif')`), dan beberapa `<img>` dinamis tanpa atribut `width`/`height` | 🟡 Medium Risk |
| **Technical SEO** | Tidak ada `<h1>` di `#viewHome`, tidak ada OG/Twitter Card/Canonical/JSON-LD, tidak ada `robots.txt` & `sitemap.xml`, konten utama kosong sebelum eksekusi JS | 🔴 Critical Gap |
| **Aksesibilitas** | Dialog lightbox & mobile drawer tanpa focus trap, SVG skills tidak fokusabel keyboard, `cursor: none !important` global, nol aturan `:focus-visible` & `prefers-reduced-motion`, kontras teks di bawah standar | 🔴 Critical Gap |
| **Code Quality** | API overwrite di `carousel.js`, `innerHTML` tanpa escaping lengkap, `23,218 bytes` CSS/JS timeline mati + SVG yatim + `style.css` lama + route `/all-project` tanpa tautan masuk | 🟡 Perlu Pembersihan |

---

## 🔴 [HIGH PRIORITY]

### H1. `[CWV — LCP]` Preloader Penuh-Layar (`z-index: 10000`) & Hero Intro (`opacity: 0`) Menunda Paint LCP
- **(a) Lokasi File & Baris Kode:**
  - `index.html` baris `46–61`, `115–117`
  - `css/preloader.css` baris `9–28`
  - `js/components/preloader.js` baris `59–88`, `119–171`, `240–278`
  - `js/animations/hero.js` baris `96–120`
- **(b) Akar Masalah & Dampak:**
  - `#loadingOverlay` (`100vw × 100vh`, `background-color: #000000`, `z-index: 10000`) menutupi seluruh halaman dan menahan visual utama sampai `document.fonts.ready` dan `window.load` selesai (dengan safety timeout `1800ms` di `preloader.js:277`), lalu baru menjalankan exit timeline (`0.65s` di `preloader.js:163`).
  - Saat preloader keluar (`preloader.js:133`), `window.Portfolio.hero.playIntro()` baru memicu `hero.js:98-120` di mana elemen kandidat LCP `#heroImageBox` (`#heroProfileImg`, `assets/my-photo.webp`) sebelumnya di-set `opacity: 0; scale: 1.45` dan baru bertransisi ke `opacity: 1` selama `1.4s` (`delay: 0.1s`).
  - Browser hanya mencatat LCP ketika elemen kandidat terbesar benar-benar ter-paint dan terlihat (`opacity > 0`). Komposisi preloader + animasi fade-in dari `0` secara langsung memperburuk metrik LCP meskipun gambar hero (`145K`) sudah tersedia di cache.
  - Selain itu, `applySyneWithTransition()` (`preloader.js:65-67`) membaca `titleEl.offsetWidth` tepat sebelum dan sesudah `titleEl.classList.add('is-syne-loaded')`, memicu *forced synchronous layout* di awal pemuatan.
- **(c) Solusi Teknis Konkret:**
  1. Hilangkan preloader full-screen blocking pada *first load*, atau jadikan transisi ringan non-blocking yang tidak menutupi `#heroProfileImg`.
  2. Biarkan `#heroImageBox` ter-render pada `opacity: 1` secara default di HTML/CSS (hindari `gsap.set('#heroImageBox', { opacity: 0 })` di above-the-fold hero); cukup animasikan properti transform ringan seperti *subtle scale settle* tanpa menyembunyikan LCP candidate.
  3. Pertahankan `fetchpriority="high" loading="eager"` pada `#heroProfileImg`.

---

### H2. `[CWV — LCP / Bundle]` Render-Blocking External Fonts, Preload Versioned Rapuh, & Waterfall 14 CSS + 27 Script Tanpa Bundling / SRI
- **(a) Lokasi File & Baris Kode:**
  - `index.html` baris `17–40` (Google Fonts CSS + preload + 14 `<link rel="stylesheet">`)
  - `index.html` baris `359–391` (4 synchronous `<script>` + 23 `<script defer>`)
- **(b) Akar Masalah & Dampak:**
  - `<link href="https://fonts.googleapis.com/css2?..." rel="stylesheet">` (`index.html:22-24`) merupakan request eksternal yang *render-blocking*.
  - `<link rel="preload" href="https://fonts.gstatic.com/s/syne/v24/8vIS7w4qzmVxsWxjBZRjr0FKM_24vg6jTY_vDE5YfqU.woff2">` (`index.html:19-21`) meng-hardcode URL hash versi `v24` dari Google Fonts; jika Google Fonts memperbarui versi/subset, browser akan mengunduh font dua kali dan memicu warning unused preload.
  - Tanpa bundler/minifier, browser harus memproses `14` request CSS terpisah dan `27` request JS (`325,560 bytes` unminified HTML/CSS/JS). Empat script pada baris `359–366` (`gsap.min.js`, `ScrollTrigger.min.js`, `lenis.min.js`, `data/portfolio-data.js`) dimuat secara sinkron tanpa `defer` dan tanpa atribut keamanan `integrity` (Subresource Integrity) / `crossorigin="anonymous"`, memblokir parser HTML sebelum mencapai `DOMContentLoaded`.
- **(c) Solusi Teknis Konkret:**
  1. Self-host file `.woff2` (Syne, Inter, Space Grotesk) di direktori `/fonts` proyek dengan `@font-face { font-display: swap; }` lokal serta `<link rel="preload" as="font" type="font/woff2" crossorigin>` yang deterministik.
  2. Gunakan bundler (mis. Vite / Rollup / esbuild) untuk menggabungkan dan me-minify CSS menjadi satu bundle kritis (`dist/app.min.css`) + mengekstrak *critical above-the-fold CSS*, serta menggabungkan 23 modul aplikasi JS menjadi `dist/app.min.js`.
  3. Tambahkan `defer`, `crossorigin="anonymous"`, dan `integrity="sha384-..."` pada script CDN eksternal (atau bundle langsung via npm).

---

### H3. `[CWV — INP]` Synchronous Forced Reflow & Layout Thrashing di Text-Splitting, SVG Fitting, ScrollSpy, dan Showcase Scroll
- **(a) Lokasi File & Baris Kode:**
  - `js/animations/project-info.js` baris `40–86`, `152–154`, `197–201`
  - `js/animations/scroll-reveal.js` baris `20–68`, `70–91`, `142–145`
  - `js/animations/skills.js` baris `14–80`, `150–153`
  - `js/animations/project-showcase.js` baris `131–168`, `386–398`
  - `js/animations/project-mobile.js` baris `390–397`
  - `js/components/navigation.js` baris `151–207`, `254–324`
- **(b) Akar Masalah & Dampak:**
  - **Text-line splitter berulang (`project-info.js` & `scroll-reveal.js`)**: `formatTextLines()` menulis `containerEl.innerHTML` per kata (`<span class="temp-word">`), lalu mengiterasi seluruh node untuk membaca `el.offsetTop` (`project-info.js:59`) atau `el.getBoundingClientRect()` (`scroll-reveal.js:40`), lalu menulis ulang `containerEl.innerHTML`. Fungsi ini dipanggil saat inisialisasi seluruh baris Career/Education, setiap pergantian project aktif (`project-info.js:153`), dan setiap event `resize` di `project-showcase.js:386-398` & `project-mobile.js:390-397` **tanpa debounce**.
  - **SVG text width measurement (`skills.js:14-80`)**: Loop `fitSkillTextsToTriangles()` pada `22` shard memanggil `textEl.getComputedTextLength()`, mengubah atribut `font-size`, lalu memanggil `getComputedTextLength()` kembali di loop yang sama — dipanggil saat inisialisasi dan dipanggil ulang ketika `document.fonts.ready` resolve (`skills.js:150-153`).
  - **ScrollSpy pada setiap frame scroll (`navigation.js:151-324`)**: `updateActiveNav()` dipanggil pada setiap callback scroll Lenis/window (`navigation.js:320-324`). Di dalamnya, `getElementAbsoluteMetrics()` membaca `target.getBoundingClientRect()` + `target.offsetHeight` (`L158-L162`), membaca metrik link `getLinkMetrics()`, dan pada hampir setiap scroll step men-spawn tween baru `gsap.to(indicator, { x, width, ... })` (`L309-L316`). Mengubah properti layout `width` pada scroll handler menyumbang kerja main-thread berkelanjutan dan *input delay* saat interaksi bersamaan dengan scroll.
  - **Reflow di tengah scroll render (`project-showcase.js:131-168`)**: `renderFrame()` menulis `vlineRight.style.left` (`L132`, properti layout) dan `frame.style.display` (`L209-L212`), lalu pada fase exit membaca `lastTextSpan.offsetWidth` (`L167`) di dalam frame yang sama — memicu sinkronisasi layout sebelum browser siap me-render frame.
- **(c) Solusi Teknis Konkret:**
  1. **ScrollSpy (`navigation.js`)**: Cache seluruh posisi top/height section dan koordinat navbar link dalam `ResizeObserver` / saat `ScrollTrigger.refresh`; gunakan `IntersectionObserver` atau cek angka tersimpan saat scroll; animasikan `.nav-indicator` menggunakan CSS `transform: translate3d(x, 0, 0) scaleX(...)` saja (bukan `width`).
  2. **Showcase (`project-showcase.js`)**: Ganti `vlineRight.style.left` menjadi `transform: translate3d(...)`, ganti toggle `display: none` di dalam scrub dengan `visibility: hidden` / `opacity: 0` + `pointer-events: none`, dan hitung `lastTextSpan.offsetWidth` sekali di `measureMetrics()` (bukan di dalam `renderFrame()`).
  3. **Text Splitter & SVG Fitter**: Berikan debounce `150ms` + pengecekan perubahan `innerWidth` pada listener `resize` di `project-showcase.js` & `project-mobile.js`; gunakan `canvas.getContext('2d').measureText()` atau animasi reveal per paragraf/kalimat yang sudah dibentuk renderer (`portfolio.js`) alih-alih injeksi DOM sementara `.temp-word` pada interaksi.

---

### H4. `[Technical SEO]` `#viewHome` Tidak Memiliki `<h1>`, Heading Hero Disembunyikan via `aria-hidden`, & Kekosongan Infrastruktur SEO
- **(a) Lokasi File & Baris Kode:**
  - `index.html` baris `1–25` (`<head>`), `108–146` (`#hero` & `<h2>PROJECT</h2>`), `160` (`<a id="timeline">`), `281–290` (`#viewPortfolio` `<h1>`)
  - `css/global.css` baris `52–54` (`.spa-view:not(.is-active) { display: none; }`)
  - `data/portfolio-data.js` baris `114`, `195`
  - Root proyek: `robots.txt` dan `sitemap.xml` tidak ada (terkonfirmasi via inspeksi direktori)
- **(b) Akar Masalah & Dampak:**
  - `#viewHome` (halaman aktif default) **tidak memiliki elemen `<h1>`**: teks hero `"FRONTEND"` dan `"DEVELOPER"` (`index.html:108-131`) ditulis sebagai `<span>` di dalam kontainer `aria-hidden="true"`, sehingga heading pertama yang terlihat oleh crawler dan screen reader adalah `<h2>PROJECT</h2>` (`index.html:146`). Satu-satunya `<h1>` justru berada di dalam `#viewPortfolio` (`index.html:288`) yang disembunyikan oleh CSS `display: none`.
  - Metadata `<head>` tidak memiliki tag Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`), Twitter Cards (`twitter:card`, dll.), `<link rel="canonical">`, maupun *Structured Data* JSON-LD (`Person` / `ProfilePage`).
  - Tidak ada `robots.txt` maupun `sitemap.xml` di root domain.
  - Konten inti (`#portfolioList`, `#careerTable`, `#skillsCrystalStage`, `#educationTable`) kosong pada HTML mentah dan bergantung sepenuhnya pada JS CSR (`js/core/renderer.js`), sehingga crawler non-JS / social link unfurler tidak melihat portofolio, riwayat karier, skill, atau pendidikan.
  - Terdapat elemen anchor kosong `<a id="timeline" class="sr-only" aria-hidden="true"></a>` (`index.html:160`) serta typo konten terindeks (`'jQuert'` pada `portfolio-data.js:114` dan `'Analisys'` pada `portfolio-data.js:195`).
- **(c) Solusi Teknis Konkret:**
  1. Jadikan headline hero utama sebagai `<h1>` yang dapat diakses crawler & screen reader (misalnya membungkus teks `"FRONTEND DEVELOPER"` atau menyediakan heading utama terstruktur tanpa `aria-hidden="true"` pada konten utama), serta turunkan heading `#viewPortfolio` atau pastikan masing-masing view semantik.
  2. Tambahkan `<link rel="canonical">`, meta Open Graph (`og:*`), Twitter Cards (`twitter:*`), JSON-LD `schema.org/Person`, `robots.txt`, dan `sitemap.xml`.
  3. Lakukan *static site generation* (SSG / pre-render build step) agar isi `#portfolioList`, `#careerTable`, dan `#educationTable` sudah tersedia langsung di HTML statis sebelum JS terhidrasi.
  4. Perbaiki typo `'jQuert'` -> `'jQuery'` (`data/portfolio-data.js:114`) dan `'Analisys'` -> `'Analysis'` (`data/portfolio-data.js:195`), serta hapus anchor yatim `index.html:160`.

---

### H5. `[Aksesibilitas]` Modal Lightbox, Mobile Drawer, SVG Interaktif, Global `cursor: none`, & Kontras Gagal Standar WCAG AA
- **(a) Lokasi File & Baris Kode:**
  - `js/components/carousel.js` baris `290–305`, `532–545`, `629–643` & `index.html` baris `320–356`
  - `js/components/navigation.js` baris `38–59` & `index.html` baris `78–91`
  - `js/renderers/skills.js` baris `273–312` & `js/animations/skills.js` baris `494–505`
  - `css/cursor.css` baris `2–6`
  - `css/variables.css` baris `10`; `css/footer.css` baris `8`; `css/portfolio.css` baris `379`, `465`; `css/career.css` baris `85`; `css/education.css` baris `85`
  - Seluruh direktori `css/` & `js/core/scroll.js` (0 aturan `:focus-visible` dan 0 dukungan `prefers-reduced-motion`)
- **(b) Akar Masalah & Dampak:**
  - **Modal Lightbox (`carousel.js`)**: Walau memiliki handler `Escape` + panah kiri/kanan (`carousel.js:629-643`), `openGallery()` tidak memindahkan fokus keyboard ke dalam dialog modal, tidak mengimplementasikan *focus trap* (`Tab` keluar ke elemen halaman di balik backdrop), dan `finalizeClose()` (`L532-L544`) tidak mengembalikan fokus ke elemen pemicu (`activeSourceFrame`). Selain itu, `index.html:327` memakai `<h3 id="carouselProjectTitle">` tanpa parent `<h2>` di dialog.
  - **Mobile Drawer (`navigation.js:38-59`, `index.html:88`)**: Tombol `#mobileToggle` tidak mengatur `aria-expanded="true/false"` maupun `aria-controls="navMenu"`; drawer tidak bisa ditutup lewat `Escape`; toggle hanya memodifikasi `document.body.style.overflow` sementara halaman di-manage oleh Lenis (`lenis.stop()` tidak dipanggil), berbeda dengan `preloader.js` (`documentElement.overflow` + `lenis.stop()`) dan `carousel.js` (`body.overflow` + `lenis.stop()`).
  - **SVG Skills Interaktif (`skills.js:494-503`, `renderers/skills.js`)**: Ke-22 pecahan segitiga skill hanya memasang `mouseenter`/`mouseleave`/`click` pada `<g>` SVG tanpa `tabindex="0"`, `role="button"`, `aria-label`, atau `keydown` (`Enter`/`Space`) — tidak terjangkau oleh pengguna keyboard maupun screen reader.
  - **Global `cursor: none !important` & Ketiadaan `:focus-visible` / `prefers-reduced-motion`**: `css/cursor.css:2-6` memaksa `cursor: none !important` di semua elemen pada perangkat `@media (pointer: fine)`; apabila pengguna bernavigasi via `Tab` (atau cursor JS gagal berjalan), tidak ada `:focus-visible` ring di seluruh stylesheet. Selain itu tidak ada satu pun media query `prefers-reduced-motion: reduce` pada CSS maupun inisialisasi Lenis/GSAP.
  - **Kontras Warna Rendah**: `--text-muted: #606066` pada latar `--bg-primary: #070707` (`footer.css:8`), `rgba(255, 255, 255, 0.18)` (`portfolio.css:379`), `rgba(255, 255, 255, 0.4)` (`portfolio.css:465`), dan `rgba(255, 255, 255, 0.52)` (`career.css:85`, `education.css:85`) berada di bawah standar kontras WCAG AA `4.5:1` untuk teks berukuran normal/kecil.
- **(c) Solusi Teknis Konkret:**
  1. Pada `carousel.js`: simpan `document.activeElement` sebelum modal terbuka, pindahkan fokus ke `#carouselCloseBtn`, trap tombol `Tab`/`Shift+Tab` di dalam `#portfolioCarouselModal`, dan kembalikan fokus ke pemicu saat `finalizeClose()`; gunakan `<h2>` pada judul modal.
  2. Pada `navigation.js`: sinkronkan `aria-expanded` pada `#mobileToggle`, tambahkan `aria-controls="navMenu"`, tutup drawer dengan tombol `Escape`, serta satukan utilitas scroll-lock (`lenis.stop()`/`start()` + scroll gutter compensation).
  3. Tambahkan `tabindex="0"`, `role="button"`, `aria-label="Highlight capability: ..."`, serta keyboard handler (`Enter`/`Space`) pada setiap `.skill-shard-body`.
  4. Hapus `cursor: none !important` global pada elemen interaktif standar, tambahkan gaya fokus global (`a:focus-visible, button:focus-visible, [tabindex]:focus-visible { outline: 2px solid var(--accent-orange); outline-offset: 3px; }`), matikan Lenis/scroll animations saat `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, dan naikkan luminansi warna teks label/subjudul/footer minimal ke `#9a9aa3` / `rgba(255, 255, 255, 0.68)`.

---

### H6. `[Code Quality]` Public API Overwrite (`window.Portfolio.carousel`) & Event Listener Leak pada SPA Re-mount (`skills.js`)
- **(a) Lokasi File & Baris Kode:**
  - `js/components/carousel.js` baris `733–746`
  - `js/animations/skills.js` baris `494–542`
  - `js/animations/parallax.js` baris `70–73`
- **(b) Akar Masalah & Dampak:**
  - **`carousel.js` menimpa namespace publiknya sendiri**: Saat modul dimuat, baris `743–745` men-set `window.Portfolio.carousel = { initCarousel }`. Namun ketika `initCarousel()` dijalankan di `js/main.js:40`, baris `734–740` menimpa seluruh objek dengan `{ openGallery, closeGallery, nextSlide, prevSlide, goToSlide }`, menghapus method `initCarousel`. Jika bagian lain aplikasi memanggil ulang `window.Portfolio.carousel.initCarousel()`, akan terjadi `TypeError: initCarousel is not a function`.
  - **`skills.js` event listener leak & stale closure**: Pada baris `494–542`, flag `stage.dataset.hoverBound = 'true'` menahan binding listener pertama selamanya — sementara saat SPA router memanggil `homeContext.revert()` dan menginisialisasi ulang `initSkillsCrystalAnimation()`, closure `shardState` dan `activeClickIdx` yang baru tidak lagi terikat ke `hitEl`/`document.click`/`window.wheel`/`window.touchmove`/`window.scroll`. Selain itu listener `document` dan `window` tidak pernah dibersihkan melalui mekanisme cleanup.
  - Di `parallax.js:70-73`, `resizeModeListenerBound` mempertahankan closure `lastScope` selamanya tanpa fungsi unbind.
- **(c) Solusi Teknis Konkret:**
  1. Ganti assignment pada `js/components/carousel.js:734` dengan `Object.assign(window.Portfolio.carousel, { openGallery, closeGallery, nextSlide, prevSlide, goToSlide })`.
  2. Gunakan `AbortController` di dalam `initSkillsCrystalAnimation()` dan kembalikan cleanup callback ke `router.js` (`gsap.context().add(() => controller.abort())` atau cleanup hook eksplisit) untuk melepas seluruh listener secara deterministik ketika view di-unmount.

---

## 🟡 [MEDIUM PRIORITY]

### M1. `[CWV — CLS]` Kontainer CSR Kosong Tanpa `min-height`, Fallback Font Tidak Valid (`local('sans-serif')`), & Beberapa `<img>` Tanpa Dimensi
- **(a) Lokasi File & Baris Kode:**
  - `index.html` baris `153`, `171`, `189`, `207` (`#portfolioList`, `#careerTable`, `#skillsCrystalStage`, `#educationTable`)
  - `css/preloader.css` baris `3–7`
  - `js/renderers/portfolio.js` baris `230–232`
  - `js/components/carousel.js` baris `198`
- **(b) Akar Masalah & Dampak:**
  - Keempat kontainer data utama di `index.html` berawal sebagai `<div></div>` kosong tanpa aturan `min-height` cadangan; bila JS gagal atau terlambat tereksekusi setelah first paint, tinggi dokumen akan melompat saat data disuntikkan.
  - Pada `css/preloader.css:5`, deklarasi `@font-face { font-family: 'SyneFallback'; src: local('Arial Black'), local('Impact'), local('sans-serif'); size-adjust: 135%; }` menggunakan keyword generik CSS `sans-serif` di dalam `local()`, yang tidak valid dan diabaikan browser. Selain itu, pada perangkat yang tidak memiliki `Arial Black` atau `Impact` (seperti banyak distribusi Linux/Android), fallback jatuh ke font sistem dengan metrik lebar jauh lebih kecil, menyebabkan pergeseran ukuran teks saat font `Syne` selesai dimuat (`preloader.js:65-86`).
  - Tag `<img>` pada daftar arsip (`portfolio.js:231`) dan thumbnail carousel (`carousel.js:198`) tidak menyertakan atribut `width` dan `height` eksplisit.
- **(c) Solusi Teknis Konkret:**
  1. Pre-render HTML utama saat build-time atau tambahkan placeholder `min-height` / `aspect-ratio` pada kontainer showcase dan tabel section.
  2. Hapus `local('sans-serif')` dari `@font-face` dan sesuaikan descriptor `ascent-override`, `descent-override`, dan `line-gap-override` pada font fallback yang tersedia lintas OS, atau selesaikan dengan self-hosted `Syne` ber-preload.
  3. Tambahkan atribut `width` dan `height` sesuai aspek rasio asli pada `<img>` di `portfolio.js:231` dan `carousel.js:198`.

---

### M2. `[CWV — LCP / Media Sizing]` Gambar Hero Tidak Menggunakan `srcset` & Rasio Asli (`1000×962`) Tidak Sama dengan Kontainer (`aspect-ratio: 3/4`)
- **(a) Lokasi File & Baris Kode:**
  - `index.html` baris `117` (`width="1000" height="962"`, `assets/my-photo.webp` = `145K`)
  - `css/hero.css` baris `63–82` (`.hero-image-box` max `460px`, `.image-inner` `aspect-ratio: 3/4`)
  - `data/portfolio-data.js` & `assets/*/*.webp` (aset gambar proyek hingga `249K` per file, misalnya `assets/smartbox/s1.webp` dan `assets/ignica/Screenshot 2023-09-13 at 09.33.01.webp`)
- **(b) Akar Masalah & Dampak:**
  - Foto hero beresolusi `1000×962` (`145 KB`), padahal lebar maksimal `.hero-image-box` adalah `460px` (`clamp(260px, 32vw, 460px)`) dan di-crop ke `aspect-ratio: 3/4`. Pengunjung mobile (`<= 390px`) mengunduh lebih dari 2x piksel lebar yang dibutuhkan serta ~25% area foto terpotong sia-sia oleh `object-fit: cover`.
  - Aset galeri di `assets/` (misalnya file `249K` di `assets/smartbox/` dan `assets/ignica/`) juga belum memiliki varian responsif (`srcset`/`sizes`).
- **(c) Solusi Teknis Konkret:**
  1. Crop `assets/my-photo.webp` agar sesuai proporsi `3:4` (`460×613` & `920×1226` untuk Retina `2x`) dan gunakan `<img srcset="assets/my-photo-480.webp 480w, assets/my-photo-920.webp 920w" sizes="(max-width: 768px) 320px, 460px">`.
  2. Terapkan kompresi ulang serta varian responsif `srcset` untuk aset galeri di folder `assets/`.

---

### M3. `[CWV — INP / Paint & GPU Memory]` Layer Berat (`backdrop-filter`, `<feGaussianBlur>`, `drop-shadow` Teranimasi, Noise SVG, & 50+ `will-change` Permanen)
- **(a) Lokasi File & Baris Kode:**
  - `css/carousel.css` baris `39–42`, `58`, `70`, `142`, `153`, `169–177`, `232`
  - `css/contact.css` baris `18–35`, `54–55`
  - `css/skills.css` baris `22–23`, `41`, `65`, `73–76`, `88–90`
  - `js/animations/skills.js` baris `264–271` & `js/animations/contact.js` baris `48–55`
  - `js/components/crystal-backgrounds.js` baris `179–190` (`<feGaussianBlur>`)
  - `css/global.css` baris `49`, `87–97` (`.noise-overlay`), `133`, `161`
  - `css/hero.css`, `css/header.css`, `css/career.css`, `css/education.css`, `css/portfolio.css`, `css/portfolio-mobile.css`, `css/preloader.css`, `css/cursor.css` (total `50+` deklarasi `will-change` statis di CSS)
- **(b) Akar Masalah & Dampak:**
  - Saat scroll melewati section `#skills` dan `#contact`, GSAP ScrollTrigger mengubah nilai CSS `filter: drop-shadow(...)` di setiap tick scroll (`skills.js:265-269`, `contact.js:49-53`) pada SVG besar (`22` shard / poligon) yang di dalamnya juga memakai SVG `<feGaussianBlur>` (`crystal-backgrounds.js:179-190`), sekaligus di `#contact` tertumpuk oleh `.bento-card { backdrop-filter: blur(6px); }` (`contact.css:54`). Animasi `drop-shadow` pada SVG kompleks memaksa rasterisasi ulang GPU/offscreen buffer setiap frame.
  - `.carousel-backdrop` menggunakan `backdrop-filter: blur(20px)` di atas seluruh viewport (`carousel.css:39-40`) dan `.carousel-nav-btn` memakai `blur(12px)` (`L169-L170`).
  - Puluhan selector memiliki `will-change` permanen di CSS (termasuk `.spa-view`, `.bg-outline-text`, `.reveal`, `.project-title-item`, `.bento-card`, `.skill-tri-shard`, dll.), memboroskan VRAM GPU walaupun elemen sedang diam.
  - `.noise-overlay` (`global.css:87-97`) merender filter SVG `<feTurbulence>` penuh `100vw × 100vh` secara fixed di `z-index: 999`.
- **(c) Solusi Teknis Konkret:**
  1. Ganti animasi scroll `filter: drop-shadow(...)` pada `skills.js` & `contact.js` dengan animasi `opacity` pada elemen glow / radial-gradient statis terpisah (yang di-composite langsung oleh GPU tanpa re-blur setiap frame).
  2. Hapus `will-change` permanen pada CSS untuk elemen yang animasinya hanya berjalan singkat (seperti `.reveal`, `.spa-view`, `.text-line-inner`); biarkan GSAP mengelola promosi layer saat animasi berlangsung.
  3. Ganti SVG `<feTurbulence>` full-viewport pada `.noise-overlay` dengan pattern raster WebP/PNG kecil (`128×128px`, `background-repeat: repeat`).

---

### M4. `[CWV — INP]` Event `mousemove` Tanpa `requestAnimationFrame` Mengubah Properti Layout `left`/`top`
- **(a) Lokasi File & Baris Kode:**
  - `js/components/cursor.js` baris `20–49`
  - `css/cursor.css` baris `13–28`
- **(b) Akar Masalah & Dampak:**
  - `window.addEventListener('mousemove', ...)` di `cursor.js:20-31` langsung menulis `dot.style.left` dan `dot.style.top` pada setiap event pointer tanpa throttling/RAF, sementara CSS-nya justru mendeklarasikan `will-change: transform` (`cursor.css:27`) dan memakai `transition: opacity 0.3s, transform 0.2s` (`L26`). Penulisan `left`/`top` membebani tahap layout/composite secara berulang.
  - Listener hover (`L39-L48`) hanya dipasang sekali pada `document.querySelectorAll('a, button')` saat `DOMContentLoaded` tanpa event delegation, sehingga elemen yang dirender dinamis setelahnya atau tanpa tag `<a>`/`<button>` tidak konsisten terikat.
- **(c) Solusi Teknis Konkret:**
  1. Ubah positioning `#cursor-dot` agar mutlak menggunakan `transform: translate3d(x, y, 0)` (atau `gsap.quickTo`) yang disinkronkan di dalam `requestAnimationFrame` hanya saat pointer bergerak.
  2. Ganti binding statis `querySelectorAll('a, button')` dengan event delegation `mouseover`/`mouseout` di `document`.

---

### M5. `[Code Quality / Keamanan]` Interpolasi HTML Mentah via `innerHTML` Tanpa Escaping Lengkap
- **(a) Lokasi File & Baris Kode:**
  - `js/renderers/portfolio.js` baris `80`, `115–145`, `216–240`
  - `js/renderers/career.js` baris `14–16`, `33–53`
  - `js/renderers/education.js` baris `14–16`, `28–44`
  - `js/components/carousel.js` baris `198`
  - `js/animations/project-info.js` baris `49–85`
  - `js/animations/scroll-reveal.js` baris `30–66`
- **(b) Akar Masalah & Dampak:**
  - `career.js` dan `education.js` hanya menyediakan `escapeAttr()` untuk tanda kutip ganda (`"`), sedangkan isi teks (`title`, `description`, `school`, `stack`, `src`, `linkUrl`) disisipkan mentah ke template literal `innerHTML`. Begitu pula `formatTextLines()` memecah teks mentah dan menyisipkannya kembali ke `innerHTML`. Pola ini rapuh bila data mengandung karakter `<`/`&` dan membuka vektor XSS apabila `portfolio-data.js` kelak diisi dari sumber eksternal/API.
- **(c) Solusi Teknis Konkret:**
  1. Buat helper bersama `escapeHtml(str)` (meng-escape `&`, `<`, `>`, `"`, `'`) serta validator skema URL (`/^https?:\/\/|^assets\//i`), atau bangun node menggunakan `document.createElement` + `textContent`.

---

## 🟢 [LOW PRIORITY]

### L1. `[Code Quality — Dead Code]` File & Kode Yatim (Orphaned) Tanpa Pemanggil Runtime
- **(a) Lokasi File & Baris Kode:**
  - `style.css` baris `1–28` (`@import` entry point lama yang tidak direferensikan di `index.html`)
  - `css/timeline.css` (`291` baris, `5,608 bytes`)
  - `js/renderers/timeline.js` (`84` baris, `2,657 bytes`, merujuk `assets/cluster-apex.svg` & `assets/cluster-gem.svg`)
  - `js/animations/timeline.js` (`392` baris, `14,953 bytes`)
  - `assets/cluster-apex.svg` (`11K`), `assets/cluster-gem.svg` (`12K`), `arrow-right-duotone.svg` (`1.0K`, sudah di-inline di `portfolio.js:135`)
  - `js/components/crystal-backgrounds.js` baris `13–172` (`SHARD_RIGHT_SVG`, `SHARD_LEFT_SVG`) & `333–341` (`#bgShardRight`, `#bgShardLeft`)
  - `css/cursor.css` baris `8–11` (`#cursor-blob, #cursor-glow`)
  - `js/animations/scroll-reveal.js` baris `163–165` (`window.renderTimelinePath`), `js/components/carousel.js` baris `698` (`#worksList`), `js/renderers/career.js` baris `19`, `65` (`#timelineStream`, `renderTimeline`)
- **(b) Akar Masalah & Dampak:**
  - Total `23,218 bytes` kode CSS/JS legacy timeline (`css/timeline.css` `5,608 B` + `js/renderers/timeline.js` `2,657 B` + `js/animations/timeline.js` `14,953 B`), aset SVG tak terpakai (`cluster-apex.svg` `11K`, `cluster-gem.svg` `12K`, `arrow-right-duotone.svg` `1.0K`), `160` baris string template SVG mati (`SHARD_RIGHT_SVG`/`SHARD_LEFT_SVG`) yang masih ikut diunduh client di dalam `crystal-backgrounds.js`, serta `style.css` tersisa dari iterasi arsitektur lama tanpa dipakai saat runtime.
- **(c) Solusi Teknis Konkret:**
  1. Hapus `style.css`, `css/timeline.css`, `js/renderers/timeline.js`, `js/animations/timeline.js`, `assets/cluster-apex.svg`, `assets/cluster-gem.svg`, `arrow-right-duotone.svg`, serta `SHARD_RIGHT_SVG`/`SHARD_LEFT_SVG` (`crystal-backgrounds.js:13-172, 333-341`) beserta selector/fallback yatim di `cursor.css`, `scroll-reveal.js`, `carousel.js`, dan `career.js`.

---

### L2. `[Code Quality — Routing & Bundle Bloat]` Rute Archive `/all-project` Tanpa Tautan UI Masuk dari Home
- **(a) Lokasi File & Baris Kode:**
  - `index.html` baris `281–296` (`#viewPortfolio`), `404.html` baris `1–24`, `all-project/index.html` baris `1–15`, `portfolio.html` baris `1–14`
  - `js/core/router.js` (`575` baris, `20,037 bytes`, baris `58–86`, `408–454`)
  - `js/animations/archive-parallax.js` (`50` baris, `1,268 bytes`)
  - `js/animations/parallax.js` baris `81–84`
  - `js/renderers/portfolio.js` baris `172–257`
- **(b) Akar Masalah & Dampak:**
  - Hasil penelusuran referensi di seluruh `index.html`, `js/`, dan `data/` menunjukkan tidak ada tautan aktif dari halaman Home yang mengarah ke `/all-project` maupun `[data-spa-link="portfolio"]`. Namun demikian, pada setiap pemuatan awal, aplikasi tetap mengunduh seluruh `router.js` (`20,037 bytes`), `archive-parallax.js` (`1,268 bytes`), serta mengeksekusi `renderProjectListTo` (`portfolio.js:255-257`) yang merender daftar DOM tersembunyi ke dalam `#portfolioFullList` (`display: none`).
- **(c) Solusi Teknis Konkret:**
  1. Tentukan arsitektur final: bila `/all-project` memang ingin tetap tersedia, tampilkan kembali tautan `"EXPLORE ALL PROJECTS"` di `#project` dan render/load `#portfolioFullList` + `archive-parallax.js` secara *lazy* ketika route diakses; bila tidak lagi digunakan, pangkas `#viewPortfolio`, `archive-parallax.js`, dan logika redirect SPA untuk menyederhanakan router secara signifikan.

---

### L3. `[CSS & Code Quality]` Variabel CSS Tidak Terdefinisi (`--font-sans`, `--font-label`), Konflik Responsive `!important`, & Duplikasi Modul
- **(a) Lokasi File & Baris Kode:**
  - `css/variables.css` baris `22–24` (hanya mendefinisikan `--font-display`, `--font-body`, `--font-mono`)
  - `css/portfolio.css` baris `177` (`var(--font-label)`), `364`, `417`, `600` (`var(--font-sans)`), dan `638–715` (`@media (max-width: 768px)`)
  - `css/career.css` baris `96` (`var(--font-sans)`) & `css/education.css` baris `96` (`var(--font-sans)`)
  - `css/portfolio-mobile.css` baris `21`, `40`, `44`, `45`, `76`, `77`, `100`, `101`, `172` (9 aturan `!important`)
  - Duplikasi aturan 3-kolom identik antara `css/career.css` (`198` baris) dan `css/education.css` (`191` baris), renderer `js/renderers/career.js` vs `education.js`, `formatTextLines()` di `project-info.js` vs `scroll-reveal.js`, serta `document.fonts.check` di `index.html:52-61` vs `preloader.js:90-106`.
- **(b) Akar Masalah & Dampak:**
  - Enam aturan CSS memakai `var(--font-sans)` atau `var(--font-label)` yang tidak pernah dideklarasikan pada `:root` di `variables.css`, sehingga browser mengabaikannya atau mewarisi nilai parent secara tidak eksplisit.
  - Blok `@media (max-width: 768px)` lama di `portfolio.css:638-715` masih aktif dan menuntut 9 deklarasi `!important` di `portfolio-mobile.css` untuk menimpanya, memperumit spesifisitas CSS.
  - Duplikasi CSS/JS antar section identik (`career` vs `education`, `formatTextLines`) meningkatkan ukuran payload dan risiko bug inkonsisten saat salah satu diubah.
- **(c) Solusi Teknis Konkret:**
  1. Ganti semua referensi `--font-sans` -> `var(--font-body)` dan `--font-label` -> `var(--font-mono)` (atau tambahkan alias di `variables.css`).
  2. Hapus media query mobile lama di `portfolio.css:638-715` dan pisahkan aturan desktop ke `@media (min-width: 769px)` agar seluruh `!important` di `portfolio-mobile.css` dapat dihapus.
  3. Konsolidasikan `.career-table`/`.education-table` ke class shared (`.section-table` / `.section-row`) dan ekstrak `window.Portfolio.utils.formatTextLines` serta helper renderer 3-kolom bersama.
