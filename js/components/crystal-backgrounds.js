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
        <!-- Sharp Bloom Laser Filter -->
        <filter id="contact-gem-shard-laser" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur1" />
          <feGaussianBlur stdDeviation="1.5" result="blur2" />
          <feMerge>
            <feMergeNode in="blur1" />
            <feMergeNode in="blur2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="contact-gem-shard-core" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

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

        <radialGradient id="contact-g-shard-star" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
          <stop offset="30%" stop-color="#99f6e4" stop-opacity="0.92" />
          <stop offset="68%" stop-color="#c4b5fd" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#7dd3fc" stop-opacity="0" />
        </radialGradient>
      </defs>

      <g id="contact-crystal-formation">
        <!-- FRACTURE CLEAVAGE LASER TRACES (Level 4) -->
        <g class="fracture-traces" stroke-linecap="round">
          <line class="outline-fracture" x1="160" y1="50" x2="430" y2="175" stroke="#99f6e4" stroke-width="1.1" stroke-dasharray="3 4" opacity="0.8" />
          <line class="outline-fracture" x1="430" y1="175" x2="175" y2="440" stroke="#c4b5fd" stroke-width="1.2" stroke-dasharray="4 5" opacity="0.8" />
          <line class="outline-fracture" x1="160" y1="50" x2="175" y2="440" stroke="#ffffff" stroke-width="1" stroke-dasharray="3 5" opacity="0.65" />
          <line class="outline-fracture" x1="335" y1="55" x2="250" y2="135" stroke="#7dd3fc" stroke-width="0.9" stroke-dasharray="2 3" opacity="0.75" />
          <line class="outline-fracture" x1="75" y1="220" x2="155" y2="265" stroke="#99f6e4" stroke-width="0.9" stroke-dasharray="2 3" opacity="0.75" />
        </g>

        <!-- SHARD A: UPPER NEEDLE CRYSTAL (Level 1 + Sub-Facet A + Attached Node) -->
        <g class="shard-group crystal-needle-upper">
          <polygon class="crystal-facet" points="160,50 250,135 190,170"
            fill="url(#contact-g-shard-orange-intense)" stroke="#99f6e4" stroke-width="1.4" />
          <polygon class="crystal-facet shard-sub-facet sub-facet-a" points="160,50 190,170 120,130"
            fill="url(#contact-g-shard-violet-radiant)" stroke="#c4b5fd" stroke-width="1.3" />
          <line x1="160" y1="50" x2="190" y2="170" stroke="#ffffff" stroke-width="1.6" filter="url(#contact-gem-shard-laser)" />
          <g class="shard-node" transform="translate(160, 50)">
            <circle r="14" fill="url(#contact-g-shard-star)" filter="url(#contact-gem-shard-core)" />
            <circle r="3.5" fill="#ffffff" />
            <circle r="7" fill="none" stroke="#99f6e4" stroke-width="1.2" />
          </g>
        </g>

        <!-- SHARD B: LATERAL SPIKE (Level 1 + Sub-Facet B + Attached Nodes) -->
        <g class="shard-group crystal-spike-right">
          <polygon class="crystal-facet" points="250,135 430,175 320,225"
            fill="url(#contact-g-shard-amber-gold)" stroke="#ffffff" stroke-width="1.5" />
          <polygon class="crystal-facet shard-sub-facet sub-facet-b" points="430,175 355,275 320,225"
            fill="url(#contact-g-shard-magenta-flare)" stroke="#7dd3fc" stroke-width="1.4" />
          <polygon class="crystal-facet" points="250,135 320,225 255,230"
            fill="url(#contact-g-shard-violet-radiant)" stroke="#c4b5fd" stroke-width="1.2" />
          <line x1="430" y1="175" x2="320" y2="225" stroke="#ffffff" stroke-width="1.5" filter="url(#contact-gem-shard-laser)" />
          <g class="shard-node" transform="translate(430, 175)">
            <circle r="15" fill="url(#contact-g-shard-star)" filter="url(#contact-gem-shard-core)" />
            <circle r="4" fill="#ffffff" />
            <circle r="8" fill="none" stroke="#7dd3fc" stroke-width="1.3" />
          </g>
          <g class="shard-node" transform="translate(320, 225)">
            <circle r="12" fill="url(#contact-g-shard-star)" />
            <circle r="3" fill="#ffffff" />
          </g>
        </g>

        <!-- SHARD C: CENTRAL FRACTURED CORE MONOLITH (Level 1 + Sub-Facet C + Attached Nodes) -->
        <g class="shard-group crystal-core-monolith">
          <polygon class="crystal-facet" points="190,170 250,135 255,230 205,245"
            fill="url(#contact-g-shard-magenta-flare)" stroke="#cbd5e1" stroke-width="1.3" />
          <polygon class="crystal-facet" points="205,245 255,230 320,225 270,320"
            fill="url(#contact-g-shard-orange-intense)" stroke="#99f6e4" stroke-width="1.4" />
          <polygon class="crystal-facet shard-sub-facet sub-facet-c" points="190,170 205,245 155,265"
            fill="url(#contact-g-shard-violet-radiant)" stroke="#c4b5fd" stroke-width="1.2" />
          <line x1="250" y1="135" x2="270" y2="320" stroke="#ffffff" stroke-width="1.4" opacity="0.85" />
          <g class="shard-node" transform="translate(250, 135)">
            <circle r="12" fill="url(#contact-g-shard-star)" />
            <circle r="3" fill="#ffffff" />
          </g>
          <g class="shard-node" transform="translate(205, 245)">
            <circle r="16" fill="url(#contact-g-shard-star)" filter="url(#contact-gem-shard-core)" />
            <circle r="4" fill="#ffffff" />
            <circle r="8" fill="none" stroke="#ffffff" stroke-width="1.4" />
          </g>
        </g>

        <!-- SHARD D: LOWER DAGGER CRYSTAL (Level 1 + Sub-Facets D1 & D2 + Attached Nodes) -->
        <g class="shard-group crystal-dagger-lower">
          <polygon class="crystal-facet shard-sub-facet sub-facet-d1" points="205,245 155,265 175,440"
            fill="url(#contact-g-shard-violet-radiant)" stroke="#c4b5fd" stroke-width="1.4" />
          <polygon class="crystal-facet" points="205,245 270,320 175,440"
            fill="url(#contact-g-shard-orange-intense)" stroke="#99f6e4" stroke-width="1.5" />
          <polygon class="crystal-facet shard-sub-facet sub-facet-d2" points="270,320 355,275 255,385"
            fill="url(#contact-g-shard-magenta-flare)" stroke="#7dd3fc" stroke-width="1.2" />
          <polygon class="crystal-facet" points="270,320 255,385 175,440"
            fill="url(#contact-g-shard-amber-gold)" stroke="#cbd5e1" stroke-width="1.2" />
          <line x1="205" y1="245" x2="175" y2="440" stroke="#f8fafc" stroke-width="1.6" filter="url(#contact-gem-shard-laser)" />
          <g class="shard-node" transform="translate(175, 440)">
            <circle r="15" fill="url(#contact-g-shard-star)" filter="url(#contact-gem-shard-core)" />
            <circle r="4" fill="#ffffff" />
            <circle r="8" fill="none" stroke="#c4b5fd" stroke-width="1.3" />
          </g>
          <g class="shard-node" transform="translate(270, 320)">
            <circle r="11" fill="url(#contact-g-shard-star)" />
            <circle r="3" fill="#ffffff" />
          </g>
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

