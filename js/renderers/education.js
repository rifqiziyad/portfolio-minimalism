/**
 * EDUCATION & CERTIFICATIONS DOM RENDERER
 * Module: js/renderers/education.js
 * Injects formal education degrees and programs into #educationTable.
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};
  window.Portfolio.renderer = window.Portfolio.renderer || {};

  function renderEducation(education) {
    const container = document.getElementById('educationTable');
    if (!container || !Array.isArray(education)) return;

    const html = education
      .map((item, index) => {
        const delayClass = index > 0 ? ` delay-${index}` : '';

        return `
          <div class="education-row reveal reveal-up${delayClass}">
            <span class="education-index">${item.index}</span>
            <div class="education-main">
              <div class="education-meta-top">
                <span class="education-program-tag">${item.programTag}</span>
                <span class="education-period">${item.period}</span>
              </div>
              <h3 class="education-degree">${item.degree}</h3>
              <p class="education-school">${item.school}</p>
              <p class="education-desc">${item.description}</p>
            </div>
            <span class="education-arrow">→</span>
          </div>
        `;
      })
      .join('');

    container.innerHTML = html;
  }

  window.Portfolio.renderer.renderEducation = renderEducation;
})(window, document);

