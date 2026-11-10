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

  function escapeAttr(str) {
    return String(str || '').replace(/"/g, '&quot;');
  }

  function renderCareer(career) {
    const container = document.getElementById('careerTable') || document.getElementById('timelineStream');
    if (!container || !Array.isArray(career)) return;

    const html = career
      .map((item, index) => {
        const period = item.period || item.year || '';
        const company = item.company || item.heading || '';
        const role = item.role || 'FRONTEND DEVELOPER';
        const description = item.description || item.text || '';

        return `
          <div class="career-row" data-index="${index}">
            <div class="career-col-year">
              <span class="text-line-mask">
                <span class="text-line-inner career-year">${period}</span>
              </span>
            </div>
            <div class="career-col-company">
              <h3 class="career-company-name" data-raw-text="${escapeAttr(company)}">
                <span class="text-line-mask">
                  <span class="text-line-inner">${company}</span>
                </span>
              </h3>
              <p class="career-role" data-raw-text="${escapeAttr(role)}">
                <span class="text-line-mask">
                  <span class="text-line-inner">${role}</span>
                </span>
              </p>
            </div>
            <div class="career-col-desc">
              <p class="career-desc" data-raw-text="${escapeAttr(description)}">
                <span class="text-line-mask">
                  <span class="text-line-inner">${description}</span>
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
  // Backward compatibility
  window.Portfolio.renderer.renderTimeline = renderCareer;
})(window, document);
