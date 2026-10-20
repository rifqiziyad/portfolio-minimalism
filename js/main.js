/**
 * VISCERA-INSPIRED BRUTALIST PORTFOLIO
 * Author: Rifqi Ziyadi Mtinan
 * Architecture: Layered Modular JavaScript (Compatible with both file:// and HTTP servers)
 * Entry Point: js/main.js
 */

(function (window, document) {
  'use strict';

  function bootstrap() {
    const app = window.Portfolio || {};

    // 0. Render Dynamic Content from PortfolioData Module & Background Crystal SVGs
    if (app.renderer && typeof app.renderer.renderAll === 'function') {
      app.renderer.renderAll();
    }

    if (app.crystalBackgrounds && typeof app.crystalBackgrounds.renderCrystalBackgrounds === 'function') {
      app.crystalBackgrounds.renderCrystalBackgrounds();
    }

    // 1. Dynamic Cursor Blob & Glow
    if (app.cursor && typeof app.cursor.initCursor === 'function') {
      app.cursor.initCursor();
    }

    // 2. Lenis Smooth Scroll & GSAP Ticker Sync
    if (app.scroll && typeof app.scroll.initScroll === 'function') {
      app.scroll.initScroll();
    }

    // 3. GSAP ScrollTrigger Parallax & Entrance Choreographies
    if (app.vision && typeof app.vision.initVisionAnimations === 'function') {
      app.vision.initVisionAnimations();
    }

    if (app.parallax && typeof app.parallax.initParallaxAnimations === 'function') {
      app.parallax.initParallaxAnimations();
    }

    // 4. Navigation, Mobile Drawer & Smooth Anchor Links
    if (app.navigation && typeof app.navigation.initNavigation === 'function') {
      app.navigation.initNavigation();
    }

    // 5. Timeline Dynamic Perimeter Docking & Crystal Shatter Choreography
    if (app.timeline && typeof app.timeline.initTimelineChoreography === 'function') {
      app.timeline.initTimelineChoreography();
    }

    // 6. Capabilities Interactive Crystal Assembly & Hover Repulsion
    if (app.skills && typeof app.skills.initSkillsCrystalAnimation === 'function') {
      app.skills.initSkillsCrystalAnimation();
    }

    // 7. Contact Crystal Assembly & Reverse Shatter Choreography
    if (app.contact && typeof app.contact.initContactCrystalAnimation === 'function') {
      app.contact.initContactCrystalAnimation();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})(window, document);
