/**
 * CAREER & EXPERIENCE DOM RENDERER
 * Module: js/renderers/career.js
 * Injects 3-column monochrome career rows (Year | Company + Role | Description)
 * with text-line masks into #careerTable.
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};
  window.Portfolio.renderer = window.Portfolio.renderer || {};

  function renderCareer(career) {
    const container = document.getElementById('careerTable');
    if (!container || !Array.isArray(career)) return;

    const { escapeAttr, escapeHtml } = window.Portfolio.utils;

    const html = career
      .map((item, index) => {
        const period = item.period || '';
        const company = item.company || '';
        const role = item.role || 'FRONTEND DEVELOPER';
        const description = item.description || '';

        return `
          <div class="career-row" data-index="${index}">
            <div class="career-col-year">
              <span class="text-line-mask">
                <span class="text-line-inner career-year">${escapeHtml(period)}</span>
              </span>
            </div>
            <div class="career-col-company">
              <h3 class="career-company-name" data-raw-text="${escapeAttr(company)}">
                <span class="text-line-mask">
                  <span class="text-line-inner">${escapeHtml(company)}</span>
                </span>
              </h3>
              <p class="career-role" data-raw-text="${escapeAttr(role)}">
                <span class="text-line-mask">
                  <span class="text-line-inner">${escapeHtml(role)}</span>
                </span>
              </p>
            </div>
            <div class="career-col-desc">
              <p class="career-desc" data-raw-text="${escapeAttr(description)}">
                <span class="text-line-mask">
                  <span class="text-line-inner">${escapeHtml(description)}</span>
                </span>
              </p>
            </div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = html;
  }

  window.Portfolio.renderer.renderCareer = renderCareer;
})(window, document);
