/**
 * DECORATIVE CRYSTAL BACKGROUND SVGS
 * Module: js/components/crystal-backgrounds.js
 * Injects the inline SVG structure for #bgContactCrystal
 * so index.html stays clean while preserving full sub-element DOM access for GSAP animations.
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  const CONTACT_CRYSTAL_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%" class="cyber-cluster-svg" overflow="visible">
      <defs>
        <!-- Linear Gradients for 3D Horizon Liquid Chrome Crystalline Fracture Facets -->
        <linearGradient id="contact-g-shard-orange-intense" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.94" />
          <stop offset="28%" stop-color="#94a3b8" stop-opacity="0.82" />
          <stop offset="47%" stop-color="#04070d" stop-opacity="0.92" />
          <stop offset="51%" stop-color="#ffffff" stop-opacity="0.96" />
          <stop offset="74%" stop-color="#99f6e4" stop-opacity="0.82" />
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.72" />
        </linearGradient>

        <linearGradient id="contact-g-shard-violet-radiant" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#04070d" stop-opacity="0.92" />
          <stop offset="35%" stop-color="#1e293b" stop-opacity="0.84" />
          <stop offset="52%" stop-color="#c4b5fd" stop-opacity="0.82" />
          <stop offset="68%" stop-color="#ffffff" stop-opacity="0.92" />
          <stop offset="100%" stop-color="#475569" stop-opacity="0.82" />
        </linearGradient>

        <linearGradient id="contact-g-shard-magenta-flare" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f8fafc" stop-opacity="0.9" />
          <stop offset="30%" stop-color="#7dd3fc" stop-opacity="0.82" />
          <stop offset="48%" stop-color="#090d16" stop-opacity="0.9" />
          <stop offset="55%" stop-color="#e2e8f0" stop-opacity="0.86" />
          <stop offset="80%" stop-color="#c4b5fd" stop-opacity="0.82" />
          <stop offset="100%" stop-color="#0b1120" stop-opacity="0.9" />
        </linearGradient>

        <linearGradient id="contact-g-shard-amber-gold" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.94" />
          <stop offset="34%" stop-color="#cbd5e1" stop-opacity="0.82" />
          <stop offset="49%" stop-color="#04070d" stop-opacity="0.88" />
          <stop offset="53%" stop-color="#ffffff" stop-opacity="0.95" />
          <stop offset="78%" stop-color="#99f6e4" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#1e293b" stop-opacity="0.65" />
        </linearGradient>
      </defs>

      <g id="contact-crystal-formation">
        <!-- SHARD A: UPPER NEEDLE CRYSTAL (Level 1 + Sub-Facet A) -->
        <g class="shard-group crystal-needle-upper">
          <polygon class="crystal-facet" points="160,50 250,135 190,170"
            fill="url(#contact-g-shard-orange-intense)" stroke="#99f6e4" stroke-width="1.4" />
          <polygon class="crystal-facet shard-sub-facet sub-facet-a" points="160,50 190,170 120,130"
            fill="url(#contact-g-shard-violet-radiant)" stroke="#c4b5fd" stroke-width="1.3" />
        </g>

        <!-- SHARD B: LATERAL SPIKE (Level 1 + Sub-Facet B) -->
        <g class="shard-group crystal-spike-right">
          <polygon class="crystal-facet" points="250,135 430,175 320,225"
            fill="url(#contact-g-shard-amber-gold)" stroke="#ffffff" stroke-width="1.5" />
          <polygon class="crystal-facet shard-sub-facet sub-facet-b" points="430,175 355,275 320,225"
            fill="url(#contact-g-shard-magenta-flare)" stroke="#7dd3fc" stroke-width="1.4" />
          <polygon class="crystal-facet" points="250,135 320,225 255,230"
            fill="url(#contact-g-shard-violet-radiant)" stroke="#c4b5fd" stroke-width="1.2" />
        </g>

        <!-- SHARD C: CENTRAL FRACTURED CORE MONOLITH (Level 1 + Sub-Facet C) -->
        <g class="shard-group crystal-core-monolith">
          <polygon class="crystal-facet" points="190,170 250,135 255,230 205,245"
            fill="url(#contact-g-shard-magenta-flare)" stroke="#cbd5e1" stroke-width="1.3" />
          <polygon class="crystal-facet" points="205,245 255,230 320,225 270,320"
            fill="url(#contact-g-shard-orange-intense)" stroke="#99f6e4" stroke-width="1.4" />
          <polygon class="crystal-facet shard-sub-facet sub-facet-c" points="190,170 205,245 155,265"
            fill="url(#contact-g-shard-violet-radiant)" stroke="#c4b5fd" stroke-width="1.2" />
        </g>

        <!-- SHARD D: LOWER DAGGER CRYSTAL (Level 1 + Sub-Facets D1 & D2) -->
        <g class="shard-group crystal-dagger-lower">
          <polygon class="crystal-facet shard-sub-facet sub-facet-d1" points="205,245 155,265 175,440"
            fill="url(#contact-g-shard-violet-radiant)" stroke="#c4b5fd" stroke-width="1.4" />
          <polygon class="crystal-facet" points="205,245 270,320 175,440"
            fill="url(#contact-g-shard-orange-intense)" stroke="#99f6e4" stroke-width="1.5" />
          <polygon class="crystal-facet shard-sub-facet sub-facet-d2" points="270,320 355,275 255,385"
            fill="url(#contact-g-shard-magenta-flare)" stroke="#7dd3fc" stroke-width="1.2" />
          <polygon class="crystal-facet" points="270,320 255,385 175,440"
            fill="url(#contact-g-shard-amber-gold)" stroke="#cbd5e1" stroke-width="1.2" />
        </g>

        <!-- DETACHED FLOATING CRYSTAL SPLINTERS (Level 3: 5 Splinters that lock seamlessly into the crystal body at 0,0) -->
        <g class="floating-splinters">
          <polygon class="crystal-facet splinter-piece splinter-1" points="160,50 320,105 250,135"
            fill="url(#contact-g-shard-amber-gold)" stroke="#ffffff" stroke-width="1.2" />
          <polygon class="crystal-facet splinter-piece splinter-2" points="120,130 190,170 155,265"
            fill="url(#contact-g-shard-violet-radiant)" stroke="#c4b5fd" stroke-width="1.2" />
          <polygon class="crystal-facet splinter-piece splinter-3" points="320,225 355,275 270,320"
            fill="url(#contact-g-shard-orange-intense)" stroke="#99f6e4" stroke-width="1.2" />
          <polygon class="crystal-facet splinter-piece splinter-4" points="250,135 320,105 430,175"
            fill="url(#contact-g-shard-magenta-flare)" stroke="#7dd3fc" stroke-width="1.2" />
          <polygon class="crystal-facet splinter-piece splinter-5" points="155,265 120,330 175,440"
            fill="url(#contact-g-shard-amber-gold)" stroke="#99f6e4" stroke-width="1.2" />
        </g>
      </g>
    </svg>
  `;

  function renderCrystalBackgrounds() {
    const contactCrystal = document.getElementById('bgContactCrystal');
    if (contactCrystal) {
      contactCrystal.innerHTML = CONTACT_CRYSTAL_SVG;
    }
  }

  window.Portfolio.crystalBackgrounds = {
    renderCrystalBackgrounds
  };
})(window, document);

