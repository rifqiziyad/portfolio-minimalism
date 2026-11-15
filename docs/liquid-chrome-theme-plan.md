# Rencana Implementasi Tema Warna: Liquid Chrome (Dark Metallic)

> **Cakupan (Scope)**: Dokumen ini berisi rencana pembaruan **khusus palet warna, token CSS, efek cahaya (glow/shadow), dan gradien SVG** ke tema **Liquid Chrome / Cyber Y2K Metallic**. Struktur layout, tipografi, animasi GSAP, serta arsitektur komponen UI **tidak diubah** (*tanpa revamp UI*).

---

## 1. Konsep & Filosofi Palet Warna

Tema **Liquid Chrome / Dark Chrome Brutalism** menggantikan aksen warna hangat/neon saat ini (*Orange-Red `#ff4500`*, *Amber `#ffaa00`*, *Violet `#9333ea`*, dan *Magenta `#d946ef`*) dengan spektrum **logam cair monokromatik berpantul tinggi (*high-contrast specular mercury & brushed titanium*)** di atas permukaan *obsidian matte*.

### Karakteristik Visual Utama:
1. **Permukaan Dasar (*Matte Obsidian & Gunmetal*)**: Latar belakang tetap gelap pekat dengan sedikit nuansa *cool carbon* agar pantulan krom terlihat tajam dan kontras.
2. **Pantulan Spesular (*Specular Chrome Highlights*)**: Mengandalkan transisi kontras tinggi antara **Pure Specular White (`#ffffff`)**, **Liquid Silver (`#e2e8f0` – `#cbd5e1`)**, **Brushed Steel (`#64748b` – `#475569`)**, dan **Deep Gunmetal (`#1e293b` – `#0f172a`)**.
3. **Cahaya & Bayangan (*Mercury Glow*)**: Mengganti *orange/purple bloom* dengan pendaran perak dingin (*cool silver/mercury glow*).

---

## 2. Pemetaan Token Warna (`css/variables.css` & `index.html`)

Untuk menjaga kompatibilitas di seluruh stylesheet tanpa mengubah nama properti satu per satu di semua selector, variabel eksisting tetap dipertahankan dan dilengkapi dengan token semantik *chrome* baru:

| Token CSS | Nilai Saat Ini (Orange/Cyber) | Nilai Baru (Liquid Chrome) | Fungsi Visual |
| :--- | :--- | :--- | :--- |
| `--bg-primary` | `#070707` | `#070708` | Latar utama *Deep Obsidian Carbon* |
| `--bg-secondary` | `#0e0e0e` | `#0e1013` | Latar sekunder *Dark Gunmetal* |
| `--bg-card` | `#121212` | `#14161b` | Permukaan kartu *Matte Anodized Metal* |
| `--text-primary` | `#f5f5f7` | `#f8fafc` | Teks utama *Crisp Specular White* |
| `--text-secondary` | `#a0a0a5` | `#b4bcc8` | Teks sekunder *Brushed Aluminum* |
| `--text-muted` | `#8e8e96` | `#7e8794` | Teks redup *Muted Pewter* |
| `--accent-orange` *(alias aksen utama)* | `#ff4500` | `#e2e8f0` | Aksen interaktif utama (*Polished Chrome Silver*) |
| `--accent-orange-glow` | `rgba(255, 69, 0, 0.4)` | `rgba(226, 232, 240, 0.35)` | Pendaran aksen (*Mercury Specular Glow*) |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | `rgba(226, 232, 240, 0.08)` | Garis grid tipis |
| `--border-medium` | `rgba(255, 255, 255, 0.16)` | `rgba(226, 232, 240, 0.16)` | Border kartu & pembatas |
| `--border-strong` | `rgba(255, 255, 255, 0.3)` | `rgba(248, 250, 252, 0.34)` | Garis tegas (*Specular Edge*) |
| `--border-accent` | `rgba(255, 69, 0, 0.6)` | `rgba(226, 232, 240, 0.65)` | Border aktif/hover (*Chrome Rim*) |
| `--chrome-gradient` *(Baru)* | — | `linear-gradient(135deg, #ffffff 0%, #cbd5e1 35%, #475569 70%, #f1f5f9 100%)` | Gradien permukaan logam cair |

> **Catatan**: Critical inline CSS pada `<head>` di `index.html` (`--bg-main`, `--text-main`, `--text-muted`) juga akan diselaraskan dengan nilai di atas.

---

## 3. Rincian Perubahan per File

### A. Fondasi & Elemen Global
1. **`css/variables.css`**
   - Memperbarui nilai `:root` sesuai tabel pemetaan token di atas.
2. **`index.html` (Inline Critical CSS)**
   - Menyelaraskan `:root` inline (`--bg-main: #070708`, `--text-main: #f8fafc`, `--text-muted: #7e8794`).
3. **`css/global.css`**
   - `::selection`: Mengubah latar blok seleksi teks menjadi krom terang (`background: #e2e8f0; color: #070708`).
   - `.img-skeleton`: Menyesuaikan shimmer loading gambar ke gradasi *dark gunmetal* (`#0b0c0e` → `#181b20` → `#0b0c0e`).
4. **`css/cursor.css`**
   - `#cursor-dot`: Mengubah `background-color: #ff4500` menjadi `#e2e8f0` (atau `#ffffff` dengan `mix-blend-mode: difference`) agar selaras dengan estetika *mercury droplet*.

---

### B. Brand Logo (`assets/logo.svg` & `css/header.css`)
1. **`assets/logo.svg`**
   - Mengubah 4 `<linearGradient>` dan 1 `<radialGradient>` dari skema *orange/violet/magenta/amber* menjadi 4 faset **Liquid Chrome**:
     - `logo-g-orange` → **Specular Chrome** (`#ffffff` → `#cbd5e1` → `#475569`)
     - `logo-g-violet` → **Deep Gunmetal Reflection** (`#1e293b` → `#64748b` → `#e2e8f0`)
     - `logo-g-magenta` → **Liquid Mercury** (`#f8fafc` → `#94a3b8` → `#334155`)
     - `logo-g-amber` → **Polished Titanium** (`#ffffff` → `#94a3b8` → `#475569`)
     - `logo-g-star` → **Pure White/Silver Starburst** (`#ffffff` → `#cbd5e1` → `rgba(148, 163, 184, 0)`)
   - Mengubah seluruh `stroke` poligon dari `#ff7700`, `#c084fc`, `#d946ef`, `#ffaa00` menjadi spektrum tepi logam (`#ffffff`, `#cbd5e1`, `#94a3b8`, `#64748b`).
2. **`css/header.css`**
   - `.brand-logo-svg`: Mengubah `filter: drop-shadow(...)` dari ungu/oranye menjadi pendaran perak/krom (`rgba(226, 232, 240, 0.35)` dan saat hover `rgba(255, 255, 255, 0.75)`).

---

### C. Interactive Skills Crystal (`js/renderers/skills.js` & `css/skills.css`)
1. **`js/renderers/skills.js`**
   - Memperbarui definisi `<defs>` SVG pada `#skillsCrystalSvg` agar keempat gradien faset kristal (`skills-g-shard-orange-intense`, `skills-g-shard-violet-radiant`, `skills-g-shard-magenta-flare`, `skills-g-shard-amber-gold`) serta `skills-g-glass-refract` menggunakan palet **Liquid Chrome 3D** (kombinasi highlight `#ffffff`, midtone `#94a3b8` / `#cbd5e1`, dan shadow faset `#1e293b` / `#334155`).
   - Memperbarui warna `stroke` pada `baseDefs` (22 faset segitiga) dari warna pelangi neon menjadi variasi *metallic bevel* (`#e2e8f0`, `#cbd5e1`, `#94a3b8`, `#64748b`).
2. **`css/skills.css`**
   - `.skills-crystal-stage::before`: Mengubah radial ambient glow di belakang kristal dari `rgba(255, 85, 0, 0.24)` menjadi pendaran merkuri dingin `rgba(203, 213, 225, 0.16)`.
   - `.skill-tri-shard.is-hovered .skill-shard-body, .skill-tri-shard.is-active .skill-shard-body`: Mengubah `drop-shadow` hover/active dari oranye & ungu menjadi pantulan krom intens (`drop-shadow(0 0 22px rgba(255, 255, 255, 0.85)) drop-shadow(0 0 45px rgba(148, 163, 184, 0.65)) brightness(1.22)`).

---

### D. Background Crystal Cluster pada Contact (`js/components/crystal-backgrounds.js` & `css/contact.css`)
1. **`js/components/crystal-backgrounds.js`**
   - Mengubah gradien `<defs>` (`contact-g-shard-*`), garis patahan (`fracture-traces`), `stroke` poligon faset, dan titik simpul (`shard-node`) dari skema oranye/ungu menjadi **Liquid Chrome & Brushed Steel** yang senada dengan kristal pada bagian Skills dan Logo.
2. **`css/contact.css`**
   - `.bento-card:hover`: Mengubah background hover dari `rgba(255, 69, 0, 0.08)` dan box-shadow `rgba(255, 69, 0, 0.18)` menjadi kilau metalik tipis (`background: rgba(226, 232, 240, 0.06)`, `box-shadow: 0 8px 32px 0 rgba(226, 232, 240, 0.12)`).

---

### E. Komponen Interaktif Lainnya (Otomatis Mengikuti Token + Penyesuaian Halus)
File-file berikut sudah menggunakan `var(--accent-orange)` sehingga otomatis berubah mengikuti token baru, dengan pengecekan nilai RGBA yang masih hardcoded:
- **`css/portfolio.css`**: Hover pada `.project-gallery-trigger` dan `.project-live-link` otomatis berubah menjadi krom terang (`var(--accent-orange)`).
- **`css/carousel.css`**: Hover tombol close, navigasi slide, dan border thumbnail aktif otomatis menggunakan token aksen baru.
- **`css/footer.css`**: Hover pada tombol `BACK TO TOP` otomatis mengikuti token aksen baru.

---

## 4. Tahapan Eksekusi & Verifikasi

1. **Tahap 1 — Update Design Tokens**: Perbarui `css/variables.css`, `index.html` (inline critical `:root`), `css/global.css`, dan `css/cursor.css`.
2. **Tahap 2 — Update Aset & Renderer Kristal/Logo**: Perbarui gradien & stroke pada `assets/logo.svg`, `js/renderers/skills.js`, dan `js/components/crystal-backgrounds.js`.
3. **Tahap 3 — Update Efek Glow & Hover CSS**: Perbarui `css/header.css`, `css/skills.css`, dan `css/contact.css`.
4. **Tahap 4 — Build & Verifikasi**:
   - Jalankan `npm run build` untuk memperbarui bundle produksi (`build/css/bundle.min.css` dan `build/js/*.min.js`) serta `dist/`.
   - Verifikasi visual di browser untuk memastikan kontras teks tetap tajam (standar keterbacaan WCAG) di atas faset kristal krom dan seluruh efek hover berjalan mulus.
