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

    // 4. Lazy On-Demand Carousel Loader & Prefetch
    let carouselReadyPromise = null;
    let carouselInitialized = false;

    function ensureCarouselReady() {
      if (carouselInitialized && app.carousel && typeof app.carousel.openGallery === 'function') {
        return Promise.resolve(app.carousel);
      }
      if (carouselReadyPromise) return carouselReadyPromise;

      if (app.carousel && typeof app.carousel.initCarousel === 'function') {
        app.carousel.initCarousel();
        carouselInitialized = true;
        return Promise.resolve(app.carousel);
      }

      const chunks = window.__PORTFOLIO_CHUNKS__ || {};
      const loadScriptOnce = app.utils && app.utils.loadScriptOnce;
      if (typeof loadScriptOnce !== 'function') {
        return Promise.resolve(null);
      }

      carouselReadyPromise = loadScriptOnce(chunks.carousel || 'js/chunk-carousel.min.js')
        .then(() => {
          if (app.carousel && typeof app.carousel.initCarousel === 'function' && !carouselInitialized) {
            app.carousel.initCarousel();
            carouselInitialized = true;
          }
          return app.carousel || null;
        })
        .catch(() => {
          carouselReadyPromise = null;
          return null;
        });

      return carouselReadyPromise;
    }

    app.ensureCarouselAndOpen = function (projectIdx, sourceFrame) {
      return ensureCarouselReady().then((carousel) => {
        if (carousel && typeof carousel.openGallery === 'function') {
          carousel.openGallery(projectIdx, 0, sourceFrame);
        }
      });
    };

    const portfolioMount = document.getElementById('portfolioList');
    if (portfolioMount) {
      const prefetchCarousel = () => { ensureCarouselReady(); };
      portfolioMount.addEventListener('pointerenter', prefetchCarousel, { once: true, passive: true });
      portfolioMount.addEventListener('focusin', prefetchCarousel, { once: true });

      portfolioMount.addEventListener('click', (e) => {
        if (carouselInitialized) return;
        const frame = e.target.closest('.project-img-frame');
        if (!frame) return;
        const idxAttr = frame.getAttribute('data-gallery-project');
        if (idxAttr === null) return;
        const projectIdx = parseInt(idxAttr, 10);
        if (!isNaN(projectIdx)) {
          app.ensureCarouselAndOpen(projectIdx, frame);
        }
      });

      portfolioMount.addEventListener('keydown', (e) => {
        if (carouselInitialized) return;
        if (e.key === 'Enter' || e.key === ' ') {
          const frame = e.target.closest('.project-img-frame');
          if (!frame) return;
          e.preventDefault();
          const idxAttr = frame.getAttribute('data-gallery-project');
          if (idxAttr === null) return;
          const projectIdx = parseInt(idxAttr, 10);
          if (!isNaN(projectIdx)) {
            app.ensureCarouselAndOpen(projectIdx, frame);
          }
        }
      });
    }

    // 5. Page Animations & ScrollTrigger Calibration
    if (app.hero && typeof app.hero.initHeroAnimations === 'function') {
      app.hero.initHeroAnimations(false);
    }
    if (app.parallax && typeof app.parallax.initParallaxAnimations === 'function') {
      app.parallax.initParallaxAnimations(document);
    }
    if (app.skills && typeof app.skills.initSkillsCrystalAnimation === 'function') {
      app.skills.initSkillsCrystalAnimation();
    }
    if (app.contact && typeof app.contact.initContactCrystalAnimation === 'function') {
      app.contact.initContactCrystalAnimation();
    }

    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.sort();
      ScrollTrigger.refresh(true);
    }

    // Scroll to anchor hash if URL contains one (e.g. index.html#skills)
    const initialHash = window.location.hash;
    if (initialHash && initialHash !== '#hero' && initialHash !== '#') {
      setTimeout(() => {
        if (app.scroll && typeof app.scroll.scrollTo === 'function') {
          app.scroll.scrollTo(initialHash, { offset: -70, duration: 1.0 });
        }
        if (app.navigation && typeof app.navigation.syncActiveState === 'function') {
          app.navigation.syncActiveState(initialHash.replace('#', ''));
        }
      }, 50);
    } else if (app.navigation && typeof app.navigation.syncActiveState === 'function') {
      app.navigation.syncActiveState();
    }

    // 6. Full-Screen Loading Overlay (Real-Time Asset Tracker & Smooth Reveal)
    if (app.preloader && typeof app.preloader.initPreloader === 'function') {
      app.preloader.initPreloader();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})(window, document);
