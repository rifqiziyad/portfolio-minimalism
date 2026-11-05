/**
 * GLOBAL PARALLAX & ANIMATIONS ORCHESTRATOR (FACADE MODULE)
 * Module: js/animations/parallax.js
 * Orchestrates modular feature animation submodules:
 *   - js/animations/project-info.js     (Info panel DOM & staggered text reveal)
 *   - js/animations/project-showcase.js (Horizontal sticky pinning & image wipe)
 *   - js/animations/outline-text.js     (Background outline text parallax)
 *   - js/animations/archive-parallax.js (Archive page card zoom parallax)
 *   - js/animations/scroll-reveal.js    (Batched scroll reveals)
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  function initParallaxAnimations(container) {
    const scope = container || document;
    const app = window.Portfolio;

    // 1. Horizontal Project Showcase on Home #project
    const isHomeShowcaseInScope =
      scope === document ||
      scope.id === 'viewHome' ||
      !!scope.querySelector('#project.project-showcase-section, #portfolio.project-showcase-section');

    if (isHomeShowcaseInScope && app.projectShowcase && typeof app.projectShowcase.initProjectShowcaseScroll === 'function') {
      app.projectShowcase.initProjectShowcaseScroll(scope);
    }

    // 2. Background Outline Texts Parallax (Timeline, Skills, Education, Projects)
    if (app.outlineText && typeof app.outlineText.initOutlineTextParallax === 'function') {
      app.outlineText.initOutlineTextParallax(scope);
    }

    // 3. Archive Project Cards Zoom Parallax (/all-project)
    if (app.archiveParallax && typeof app.archiveParallax.initArchiveParallax === 'function') {
      app.archiveParallax.initArchiveParallax(scope);
    }

    // 4. Viewport Scroll Reveals
    if (app.scrollReveal && typeof app.scrollReveal.initScrollReveal === 'function') {
      app.scrollReveal.initScrollReveal(scope);
    }
  }

  function cleanupProjectShowcase() {
    const app = window.Portfolio;
    if (app.projectShowcase && typeof app.projectShowcase.cleanupProjectShowcase === 'function') {
      app.projectShowcase.cleanupProjectShowcase();
    }
  }

  window.Portfolio.parallax = {
    initParallaxAnimations,
    cleanupProjectShowcase
  };
})(window, document);
