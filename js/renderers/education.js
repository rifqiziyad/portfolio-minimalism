/**
 * EDUCATION & CERTIFICATIONS DOM RENDERER
 * Module: js/renderers/education.js
 * Delegates 3-column monochrome rendering to shared Portfolio.utils.renderTimelineRows.
 */

(function (window) {
  'use strict';

  window.Portfolio = window.Portfolio || {};
  window.Portfolio.renderer = window.Portfolio.renderer || {};

  function renderEducation(education) {
    const utils = window.Portfolio.utils;
    if (!utils || typeof utils.renderTimelineRows !== 'function') return;

    utils.renderTimelineRows('educationTable', education, {
      rowClass: 'education-row',
      yearColClass: 'education-col-year',
      yearClass: 'education-year',
      titleColClass: 'education-col-institution',
      titleClass: 'education-school',
      subtitleClass: 'education-degree',
      descColClass: 'education-col-desc',
      descClass: 'education-desc',
      titleKey: 'school',
      subtitleKey: 'degree'
    });
  }

  window.Portfolio.renderer.renderEducation = renderEducation;
})(window);
