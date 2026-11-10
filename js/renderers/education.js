/**
 * EDUCATION & CERTIFICATIONS DOM RENDERER
 * Module: js/renderers/education.js
 * Injects 3-column monochrome education rows (Year | Institution + Degree | Description)
 * with text-line masks into #educationTable.
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};
  window.Portfolio.renderer = window.Portfolio.renderer || {};

  function escapeAttr(str) {
    return String(str || '').replace(/"/g, '&quot;');
  }

  function renderEducation(education) {
    const container = document.getElementById('educationTable');
    if (!container || !Array.isArray(education)) return;

    const html = education
      .map((item, index) => {
        return `
          <div class="education-row" data-index="${index}">
            <div class="education-col-year">
              <span class="text-line-mask">
                <span class="text-line-inner education-year">${item.period}</span>
              </span>
            </div>
            <div class="education-col-institution">
              <h3 class="education-school" data-raw-text="${escapeAttr(item.school)}">
                <span class="text-line-mask">
                  <span class="text-line-inner">${item.school}</span>
                </span>
              </h3>
              <p class="education-degree" data-raw-text="${escapeAttr(item.degree)}">
                <span class="text-line-mask">
                  <span class="text-line-inner">${item.degree}</span>
                </span>
              </p>
            </div>
            <div class="education-col-desc">
              <p class="education-desc" data-raw-text="${escapeAttr(item.description)}">
                <span class="text-line-mask">
                  <span class="text-line-inner">${item.description}</span>
                </span>
              </p>
            </div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = html;
  }

  window.Portfolio.renderer.renderEducation = renderEducation;
})(window, document);

