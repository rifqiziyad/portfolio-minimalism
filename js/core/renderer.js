/**
 * DYNAMIC DOM RENDERER ORCHESTRATOR
 * Module: js/core/renderer.js
 * Coordinates all modular section renderers (works, timeline, skills, education)
 * from window.PortfolioData before animations and GSAP ScrollTriggers initialize.
 */

(function (window) {
  'use strict';

  window.Portfolio = window.Portfolio || {};
  const renderer = window.Portfolio.renderer || (window.Portfolio.renderer = {});

  function renderAll() {
    const data = window.PortfolioData;
    if (!data) return;

    if (typeof renderer.renderPortfolio === 'function') {
      renderer.renderPortfolio(data.portfolio || data.works);
    } else if (typeof renderer.renderWorks === 'function') {
      renderer.renderWorks(data.portfolio || data.works);
    }

    if (typeof renderer.renderTimeline === 'function') {
      renderer.renderTimeline(data.timeline);
    }

    if (typeof renderer.renderSkills === 'function') {
      renderer.renderSkills(data.skills);
    }

    if (typeof renderer.renderEducation === 'function') {
      renderer.renderEducation(data.education);
    }
  }

  renderer.renderAll = renderAll;
})(window);
