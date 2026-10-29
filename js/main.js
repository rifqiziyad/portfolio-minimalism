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

    // 3. Navigation, Mobile Drawer & Smooth Anchor Links
    if (app.navigation && typeof app.navigation.initNavigation === 'function') {
      app.navigation.initNavigation();
    }

    // 4. The Monolith Shard Lightbox Carousel for Selected Works
    if (app.carousel && typeof app.carousel.initCarousel === 'function') {
      app.carousel.initCarousel();
    }

    // 5. Client-Side SPA Router (View Swapping, Scoped GSAP Contexts & History Management)
    if (app.router && typeof app.router.initRouter === 'function') {
      app.router.initRouter();
    } else {
      // Direct fallback if router is not present
      if (app.hero && typeof app.hero.initHeroAnimations === 'function') {
        app.hero.initHeroAnimations();
      }
      if (app.parallax && typeof app.parallax.initParallaxAnimations === 'function') {
        app.parallax.initParallaxAnimations();
      }
      if (app.timeline && typeof app.timeline.initTimelineChoreography === 'function') {
        app.timeline.initTimelineChoreography();
      }
      if (app.skills && typeof app.skills.initSkillsCrystalAnimation === 'function') {
        app.skills.initSkillsCrystalAnimation();
      }
      if (app.contact && typeof app.contact.initContactCrystalAnimation === 'function') {
        app.contact.initContactCrystalAnimation();
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})(window, document);
