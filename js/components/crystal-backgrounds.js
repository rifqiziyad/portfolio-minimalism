/**
 * DECORATIVE CRYSTAL BACKGROUND SVGS
 * Module: js/components/crystal-backgrounds.js
 * Injects the inline SVG structures for #bgShardRight, #bgShardLeft, and #bgContactCrystal
 * so index.html stays clean while preserving full sub-element DOM access for GSAP animations.
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  const SHARD_RIGHT_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%" class="cyber-cluster-svg" overflow="visible">
      <g id="shattered-crystal-outline">
        <!-- FRACTURE CLEAVAGE LASER TRACES -->
        <g class="fracture-traces" stroke-linecap="round">
          <line class="outline-fracture" x1="160" y1="50" x2="430" y2="175" />
          <line class="outline-fracture" x1="430" y1="175" x2="175" y2="440" />
          <line class="outline-fracture" x1="160" y1="50" x2="175" y2="440" />
          <line class="outline-fracture" x1="335" y1="55" x2="250" y2="135" />
          <line class="outline-fracture" x1="75" y1="220" x2="155" y2="265" />
        </g>

        <!-- SHARD A: UPPER NEEDLE CRYSTAL -->
        <g class="shard-group crystal-needle-upper">
          <polygon class="outline-facet" points="160,50 250,135 190,170" />
          <polygon class="outline-facet shard-sub-facet sub-facet-a" points="160,50 190,170 120,130" />
          <line class="outline-ridge" x1="160" y1="50" x2="190" y2="170" />
          <g class="shard-node" transform="translate(160, 50)">
            <circle class="outline-vertex" r="5" />
            <circle class="outline-vertex-dot" r="1.5" />
          </g>
        </g>

        <!-- SHARD B: LATERAL SPIKE -->
        <g class="shard-group crystal-spike-right">
          <polygon class="outline-facet" points="250,135 430,175 320,225" />
          <polygon class="outline-facet shard-sub-facet sub-facet-b" points="430,175 355,275 320,225" />
          <polygon class="outline-facet" points="250,135 320,225 255,230" />
          <line class="outline-ridge" x1="430" y1="175" x2="320" y2="225" />
          <g class="shard-node" transform="translate(430, 175)">
            <circle class="outline-vertex" r="5" />
            <circle class="outline-vertex-dot" r="1.5" />
          </g>
          <g class="shard-node" transform="translate(320, 225)">
            <circle class="outline-vertex" r="4" />
          </g>
        </g>

        <!-- SHARD C: CENTRAL FRACTURED CORE MONOLITH -->
        <g class="shard-group crystal-core-monolith">
          <polygon class="outline-facet" points="190,170 250,135 255,230 205,245" />
          <polygon class="outline-facet" points="205,245 255,230 320,225 270,320" />
          <polygon class="outline-facet shard-sub-facet sub-facet-c" points="190,170 205,245 155,265" />
          <line class="outline-ridge" x1="250" y1="135" x2="270" y2="320" />
          <g class="shard-node" transform="translate(250, 135)">
            <circle class="outline-vertex" r="4" />
          </g>
          <g class="shard-node" transform="translate(205, 245)">
            <circle class="outline-vertex" r="6" />
            <circle class="outline-vertex-dot" r="2" />
          </g>
        </g>

        <!-- SHARD D: LOWER DAGGER CRYSTAL -->
        <g class="shard-group crystal-dagger-lower">
          <polygon class="outline-facet shard-sub-facet sub-facet-d1" points="205,245 155,265 175,440" />
          <polygon class="outline-facet" points="205,245 270,320 175,440" />
          <polygon class="outline-facet shard-sub-facet sub-facet-d2" points="270,320 355,275 255,385" />
          <polygon class="outline-facet" points="270,320 255,385 175,440" />
          <line class="outline-ridge" x1="205" y1="245" x2="175" y2="440" />
          <g class="shard-node" transform="translate(175, 440)">
            <circle class="outline-vertex" r="5" />
            <circle class="outline-vertex-dot" r="1.5" />
          </g>
          <g class="shard-node" transform="translate(270, 320)">
            <circle class="outline-vertex" r="4" />
          </g>
        </g>

        <!-- DETACHED FLOATING CRYSTAL SPLINTERS -->
        <g class="floating-splinters">
          <polygon class="outline-facet splinter-piece splinter-1" points="335,55 375,80 345,110" />
          <polygon class="outline-facet splinter-piece splinter-2" points="75,220 115,250 85,285" />
          <polygon class="outline-facet splinter-piece splinter-3" points="370,340 410,380 360,405" />
          <polygon class="outline-facet splinter-piece splinter-4" points="145,175 180,190 150,215" />
          <polygon class="outline-facet splinter-piece splinter-5" points="210,365 245,395 200,415" />
        </g>
      </g>
    </svg>
  `;

  const SHARD_LEFT_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%" class="cyber-cluster-svg" overflow="visible">
      <g id="crystal-shards-outline">
        <!-- FRACTURE CLEAVAGE LINES -->
        <g class="fracture-lines" stroke-linecap="round">
          <line class="outline-fracture" x1="80" y1="145" x2="340" y2="65" />
          <line class="outline-fracture" x1="340" y1="65" x2="395" y2="420" />
          <line class="outline-fracture" x1="80" y1="145" x2="395" y2="420" />
          <line class="outline-fracture" x1="115" y1="75" x2="80" y2="145" />
          <line class="outline-fracture" x1="375" y1="215" x2="415" y2="175" />
        </g>

        <!-- SHARD 1: TALL PRIMARY CRYSTAL OBELISK -->
        <g class="shard-group shard-primary">
          <polygon class="outline-facet" points="230,190 340,65 275,225" />
          <polygon class="outline-facet" points="275,225 340,65 375,215" />
          <polygon class="outline-facet shard-sub-facet sub-facet-p1" points="340,65 375,215 350,140" />
          <polygon class="outline-facet" points="230,190 275,225 295,310" />
          <polygon class="outline-facet shard-sub-facet sub-facet-p2" points="275,225 375,215 295,310" />

          <line class="outline-ridge" x1="340" y1="65" x2="275" y2="225" />
          <line class="outline-ridge" x1="275" y1="225" x2="295" y2="310" />

          <g class="shard-node" transform="translate(340, 65)">
            <circle class="outline-vertex" r="5" />
            <circle class="outline-vertex-dot" r="1.5" />
          </g>
          <g class="shard-node" transform="translate(275, 225)">
            <circle class="outline-vertex" r="6" />
            <circle class="outline-vertex-dot" r="2" />
          </g>
          <g class="shard-node" transform="translate(375, 215)">
            <circle class="outline-vertex" r="4" />
          </g>
        </g>

        <!-- SHARD 2: JAGGED SECONDARY SHARD -->
        <g class="shard-group shard-secondary">
          <polygon class="outline-facet" points="80,145 185,195 165,270" />
          <polygon class="outline-facet" points="80,145 165,270 115,315" />
          <polygon class="outline-facet shard-sub-facet sub-facet-s1" points="165,270 230,190 295,310" />
          <polygon class="outline-facet" points="165,270 115,315 220,335" />

          <line class="outline-ridge" x1="80" y1="145" x2="165" y2="270" />

          <g class="shard-node" transform="translate(80, 145)">
            <circle class="outline-vertex" r="5" />
            <circle class="outline-vertex-dot" r="1.5" />
          </g>
          <g class="shard-node" transform="translate(165, 270)">
            <circle class="outline-vertex" r="4" />
          </g>
        </g>

        <!-- SHARD 3: DOWNWARD JAGGED DAGGER SHARD -->
        <g class="shard-group shard-dagger">
          <polygon class="outline-facet shard-sub-facet sub-facet-dg1" points="295,310 380,270 395,420" />
          <polygon class="outline-facet" points="295,310 395,420 280,380" />
          <polygon class="outline-facet" points="220,335 295,310 280,380" />

          <line class="outline-ridge" x1="295" y1="310" x2="395" y2="420" />

          <g class="shard-node" transform="translate(395, 420)">
            <circle class="outline-vertex" r="5" />
            <circle class="outline-vertex-dot" r="1.5" />
          </g>
        </g>

        <!-- DETACHED FLOATING CRYSTAL SPLINTERS -->
        <g class="splinter-fragments">
          <polygon class="outline-facet splinter-piece splinter-1" points="115,75 160,105 130,135" />
          <polygon class="outline-facet splinter-piece splinter-2" points="415,175 450,210 395,235" />
          <polygon class="outline-facet splinter-piece splinter-3" points="150,380 195,425 175,365" />
          <polygon class="outline-facet splinter-piece splinter-4" points="355,235 390,255 360,280" />
          <polygon class="outline-facet splinter-piece splinter-5" points="250,375 285,410 240,425" />
        </g>
      </g>
    </svg>
  `;

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

        <!-- Linear Gradients for Crystalline Fracture Facets -->
        <linearGradient id="contact-g-shard-orange-intense" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff9900" stop-opacity="0.95" />
          <stop offset="45%" stop-color="#ff4500" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#7c3aed" stop-opacity="0.65" />
        </linearGradient>

        <linearGradient id="contact-g-shard-violet-radiant" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#581c87" stop-opacity="0.85" />
          <stop offset="50%" stop-color="#9333ea" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#c084fc" stop-opacity="0.95" />
        </linearGradient>

        <linearGradient id="contact-g-shard-magenta-flare" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.85" />
          <stop offset="40%" stop-color="#d946ef" stop-opacity="0.75" />
          <stop offset="100%" stop-color="#ff5500" stop-opacity="0.85" />
        </linearGradient>

        <linearGradient id="contact-g-shard-amber-gold" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stop-color="#ffdd00" stop-opacity="0.9" />
          <stop offset="60%" stop-color="#ff6a00" stop-opacity="0.7" />
          <stop offset="100%" stop-color="#a855f7" stop-opacity="0.4" />
        </linearGradient>

        <radialGradient id="contact-g-shard-star" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
          <stop offset="30%" stop-color="#ff8c00" stop-opacity="0.95" />
          <stop offset="70%" stop-color="#c084fc" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#ff4500" stop-opacity="0" />
        </radialGradient>
      </defs>

      <g id="contact-crystal-formation">
        <!-- FRACTURE CLEAVAGE LASER TRACES (Level 4) -->
        <g class="fracture-traces" stroke-linecap="round">
          <line class="outline-fracture" x1="160" y1="50" x2="430" y2="175" stroke="#ff8c00" stroke-width="1.1" stroke-dasharray="3 4" opacity="0.8" />
          <line class="outline-fracture" x1="430" y1="175" x2="175" y2="440" stroke="#a855f7" stroke-width="1.2" stroke-dasharray="4 5" opacity="0.8" />
          <line class="outline-fracture" x1="160" y1="50" x2="175" y2="440" stroke="#ffffff" stroke-width="1" stroke-dasharray="3 5" opacity="0.65" />
          <line class="outline-fracture" x1="335" y1="55" x2="250" y2="135" stroke="#ffaa00" stroke-width="0.9" stroke-dasharray="2 3" opacity="0.75" />
          <line class="outline-fracture" x1="75" y1="220" x2="155" y2="265" stroke="#c084fc" stroke-width="0.9" stroke-dasharray="2 3" opacity="0.75" />
        </g>

        <!-- SHARD A: UPPER NEEDLE CRYSTAL (Level 1 + Sub-Facet A + Attached Node) -->
        <g class="shard-group crystal-needle-upper">
          <polygon class="crystal-facet" points="160,50 250,135 190,170"
            fill="url(#contact-g-shard-orange-intense)" stroke="#ff7700" stroke-width="1.4" />
          <polygon class="crystal-facet shard-sub-facet sub-facet-a" points="160,50 190,170 120,130"
            fill="url(#contact-g-shard-violet-radiant)" stroke="#c084fc" stroke-width="1.3" />
          <line x1="160" y1="50" x2="190" y2="170" stroke="#ffffff" stroke-width="1.6" filter="url(#contact-gem-shard-laser)" />
          <g class="shard-node" transform="translate(160, 50)">
            <circle r="14" fill="url(#contact-g-shard-star)" filter="url(#contact-gem-shard-core)" />
            <circle r="3.5" fill="#ffffff" />
            <circle r="7" fill="none" stroke="#ff7700" stroke-width="1.2" />
          </g>
        </g>

        <!-- SHARD B: LATERAL SPIKE (Level 1 + Sub-Facet B + Attached Nodes) -->
        <g class="shard-group crystal-spike-right">
          <polygon class="crystal-facet" points="250,135 430,175 320,225"
            fill="url(#contact-g-shard-amber-gold)" stroke="#ffaa00" stroke-width="1.5" />
          <polygon class="crystal-facet shard-sub-facet sub-facet-b" points="430,175 355,275 320,225"
            fill="url(#contact-g-shard-magenta-flare)" stroke="#ff4500" stroke-width="1.4" />
          <polygon class="crystal-facet" points="250,135 320,225 255,230"
            fill="url(#contact-g-shard-violet-radiant)" stroke="#9333ea" stroke-width="1.2" />
          <line x1="430" y1="175" x2="320" y2="225" stroke="#ffdd00" stroke-width="1.5" filter="url(#contact-gem-shard-laser)" />
          <g class="shard-node" transform="translate(430, 175)">
            <circle r="15" fill="url(#contact-g-shard-star)" filter="url(#contact-gem-shard-core)" />
            <circle r="4" fill="#ffffff" />
            <circle r="8" fill="none" stroke="#ff4500" stroke-width="1.3" />
          </g>
          <g class="shard-node" transform="translate(320, 225)">
            <circle r="12" fill="url(#contact-g-shard-star)" />
            <circle r="3" fill="#ffffff" />
          </g>
        </g>

        <!-- SHARD C: CENTRAL FRACTURED CORE MONOLITH (Level 1 + Sub-Facet C + Attached Nodes) -->
        <g class="shard-group crystal-core-monolith">
          <polygon class="crystal-facet" points="190,170 250,135 255,230 205,245"
            fill="url(#contact-g-shard-magenta-flare)" stroke="#d946ef" stroke-width="1.3" />
          <polygon class="crystal-facet" points="205,245 255,230 320,225 270,320"
            fill="url(#contact-g-shard-orange-intense)" stroke="#ff5500" stroke-width="1.4" />
          <polygon class="crystal-facet shard-sub-facet sub-facet-c" points="190,170 205,245 155,265"
            fill="url(#contact-g-shard-violet-radiant)" stroke="#8b5cf6" stroke-width="1.2" />
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
            fill="url(#contact-g-shard-violet-radiant)" stroke="#a855f7" stroke-width="1.4" />
          <polygon class="crystal-facet" points="205,245 270,320 175,440"
            fill="url(#contact-g-shard-orange-intense)" stroke="#ff4500" stroke-width="1.5" />
          <polygon class="crystal-facet shard-sub-facet sub-facet-d2" points="270,320 355,275 255,385"
            fill="url(#contact-g-shard-magenta-flare)" stroke="#c084fc" stroke-width="1.2" />
          <polygon class="crystal-facet" points="270,320 255,385 175,440"
            fill="url(#contact-g-shard-amber-gold)" stroke="#ff7700" stroke-width="1.2" />
          <line x1="205" y1="245" x2="175" y2="440" stroke="#ffaa00" stroke-width="1.6" filter="url(#contact-gem-shard-laser)" />
          <g class="shard-node" transform="translate(175, 440)">
            <circle r="15" fill="url(#contact-g-shard-star)" filter="url(#contact-gem-shard-core)" />
            <circle r="4" fill="#ffffff" />
            <circle r="8" fill="none" stroke="#a855f7" stroke-width="1.3" />
          </g>
          <g class="shard-node" transform="translate(270, 320)">
            <circle r="11" fill="url(#contact-g-shard-star)" />
            <circle r="3" fill="#ffffff" />
          </g>
        </g>

        <!-- DETACHED FLOATING CRYSTAL SPLINTERS (Level 3: 5 Splinters that lock seamlessly into the crystal body at 0,0) -->
        <g class="floating-splinters">
          <polygon class="crystal-facet splinter-piece splinter-1" points="160,50 320,105 250,135"
            fill="url(#contact-g-shard-amber-gold)" stroke="#ffaa00" stroke-width="1.2" />
          <polygon class="crystal-facet splinter-piece splinter-2" points="120,130 190,170 155,265"
            fill="url(#contact-g-shard-violet-radiant)" stroke="#c084fc" stroke-width="1.2" />
          <polygon class="crystal-facet splinter-piece splinter-3" points="320,225 355,275 270,320"
            fill="url(#contact-g-shard-orange-intense)" stroke="#ff5500" stroke-width="1.2" />
          <polygon class="crystal-facet splinter-piece splinter-4" points="250,135 320,105 430,175"
            fill="url(#contact-g-shard-magenta-flare)" stroke="#d946ef" stroke-width="1.2" />
          <polygon class="crystal-facet splinter-piece splinter-5" points="155,265 120,330 175,440"
            fill="url(#contact-g-shard-amber-gold)" stroke="#ff7700" stroke-width="1.2" />
        </g>
      </g>
    </svg>
  `;

  function renderCrystalBackgrounds() {
    const shardRight = document.getElementById('bgShardRight');
    if (shardRight) {
      shardRight.innerHTML = SHARD_RIGHT_SVG;
    }

    const shardLeft = document.getElementById('bgShardLeft');
    if (shardLeft) {
      shardLeft.innerHTML = SHARD_LEFT_SVG;
    }

    const contactCrystal = document.getElementById('bgContactCrystal');
    if (contactCrystal) {
      contactCrystal.innerHTML = CONTACT_CRYSTAL_SVG;
    }
  }

  window.Portfolio.crystalBackgrounds = {
    renderCrystalBackgrounds
  };
})(window, document);

