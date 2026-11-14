/**
 * CAREER & EXPERIENCE DOM RENDERER
 * Module: js/renderers/career.js
 * Delegates 3-column monochrome rendering to shared Portfolio.utils.renderTimelineRows.
 */

(function (window) {
  'use strict';

  window.Portfolio = window.Portfolio || {};
  window.Portfolio.renderer = window.Portfolio.renderer || {};

  function renderCareer(career) {
    const utils = window.Portfolio.utils;
    if (!utils || typeof utils.renderTimelineRows !== 'function') return;

    utils.renderTimelineRows('careerTable', career, {
      rowClass: 'career-row',
      yearColClass: 'career-col-year',
      yearClass: 'career-year',
      titleColClass: 'career-col-company',
      titleClass: 'career-company-name',
      subtitleClass: 'career-role',
      descColClass: 'career-col-desc',
      descClass: 'career-desc',
      titleKey: 'company',
      subtitleKey: 'role',
      subtitleFallback: 'FRONTEND DEVELOPER'
    });
  }

  window.Portfolio.renderer.renderCareer = renderCareer;
})(window);
