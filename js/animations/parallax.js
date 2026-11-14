/**
 * GLOBAL PARALLAX & ANIMATIONS ORCHESTRATOR (FACADE MODULE)
 * Module: js/animations/parallax.js
 * Orchestrates modular feature animation submodules:
 *   - js/animations/project-info.js     (Info panel DOM & staggered text reveal)
 *   - js/animations/project-showcase.js (Horizontal sticky pinning & image wipe)
 *   - js/animations/outline-text.js     (Background outline text parallax)
 *   - js/animations/scroll-reveal.js    (Batched scroll reveals)
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  let currentProjectMode = null; // 'mobile' | 'desktop' | null
  let lastScope = null;
  let resizeModeListenerBound = false;
  let breakpointResizeTimer = null;

  function initActiveProjectController(scope) {
    const app = window.Portfolio;
    const isMobile = window.innerWidth <= 768;
    const targetMode = isMobile ? 'mobile' : 'desktop';
    const chunks = window.__PORTFOLIO_CHUNKS__ || {};
    const loadScriptOnce = app.utils && app.utils.loadScriptOnce;

    currentProjectMode = targetMode;

    if (targetMode === 'mobile') {
      if (app.projectShowcase && typeof app.projectShowcase.cleanupProjectShowcase === 'function') {
        app.projectShowcase.cleanupProjectShowcase();
      }
      if (app.projectMobile && typeof app.projectMobile.initProjectMobileCarousel === 'function') {
        app.projectMobile.initProjectMobileCarousel(scope);
      } else if (typeof loadScriptOnce === 'function') {
        loadScriptOnce(chunks.mobile || 'js/chunk-mobile.min.js')
          .then(() => {
            if (currentProjectMode === 'mobile' && app.projectMobile && typeof app.projectMobile.initProjectMobileCarousel === 'function') {
              app.projectMobile.initProjectMobileCarousel(scope);
              if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
            }
          })
          .catch(() => {});
      }
    } else {
      if (app.projectMobile && typeof app.projectMobile.cleanupProjectMobile === 'function') {
        app.projectMobile.cleanupProjectMobile();
      }
      if (app.projectShowcase && typeof app.projectShowcase.initProjectShowcaseScroll === 'function') {
        app.projectShowcase.initProjectShowcaseScroll(scope);
      } else if (typeof loadScriptOnce === 'function') {
        loadScriptOnce(chunks.showcase || 'js/chunk-showcase.min.js')
          .then(() => {
            if (currentProjectMode === 'desktop' && app.projectShowcase && typeof app.projectShowcase.initProjectShowcaseScroll === 'function') {
              app.projectShowcase.initProjectShowcaseScroll(scope);
              if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
            }
          })
          .catch(() => {});
      }
    }
  }

  function onBreakpointCheck() {
    clearTimeout(breakpointResizeTimer);
    breakpointResizeTimer = setTimeout(() => {
      const isMobile = window.innerWidth <= 768;
      const nextMode = isMobile ? 'mobile' : 'desktop';
      if (currentProjectMode && nextMode !== currentProjectMode) {
        initActiveProjectController(lastScope || document);
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      }
    }, 150);
  }

  function initParallaxAnimations(container) {
    const scope = container || document;
    const app = window.Portfolio;

    // 1. Horizontal Project Showcase on #project (Desktop vs Mobile Dedicated Controller)
    const isHomeShowcaseInScope =
      scope === document ||
      !!scope.querySelector('#project.project-showcase-section');

    if (isHomeShowcaseInScope) {
      lastScope = scope;
      initActiveProjectController(scope);

      if (!resizeModeListenerBound) {
        window.addEventListener('resize', onBreakpointCheck, { passive: true });
        resizeModeListenerBound = true;
      }
    }

    // 2. Background Outline Texts Parallax
    if (app.outlineText && typeof app.outlineText.initOutlineTextParallax === 'function') {
      app.outlineText.initOutlineTextParallax(scope);
    }

    // 3. Viewport Scroll Reveals
    if (app.scrollReveal && typeof app.scrollReveal.initScrollReveal === 'function') {
      app.scrollReveal.initScrollReveal(scope);
    }
  }

  function cleanupProjectShowcase() {
    const app = window.Portfolio;
    if (app.projectShowcase && typeof app.projectShowcase.cleanupProjectShowcase === 'function') {
      app.projectShowcase.cleanupProjectShowcase();
    }
    if (app.projectMobile && typeof app.projectMobile.cleanupProjectMobile === 'function') {
      app.projectMobile.cleanupProjectMobile();
    }
    currentProjectMode = null;
  }

  window.Portfolio.parallax = {
    initParallaxAnimations,
    cleanupProjectShowcase
  };
})(window, document);
