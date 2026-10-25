/**
 * FEATURED PORTFOLIO DOM RENDERER
 * Module: js/renderers/portfolio.js
 * Injects project items and visual mockups into #portfolioList.
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};
  window.Portfolio.renderer = window.Portfolio.renderer || {};

  function renderPortfolio(projects) {
    const container = document.getElementById('portfolioList') || document.getElementById('worksList');
    if (!container || !Array.isArray(projects)) return;

    const html = projects
      .map((item, index) => {
        const isReversed = index % 2 === 1;
        const layoutClass = isReversed ? 'project-layout-reversed' : 'project-layout-normal';
        const infoRevealClass = isReversed ? 'reveal-right' : 'reveal-left';

        const infoMarkup = `
          <div class="project-info reveal ${infoRevealClass}">
            <div class="project-meta">
              <span class="project-category">${item.category}</span>
              <span class="project-tag">${item.tag}</span>
            </div>
            <h3 class="project-title">${item.title}</h3>
            <p class="project-desc">${item.description}</p>
            <div class="project-details">
              <div class="detail-row">
                <span class="detail-label">YEAR</span>
                <span class="detail-val">${item.year}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">STACK</span>
                <span class="detail-val">${item.stack}</span>
              </div>
            </div>
            <div class="project-link-wrap">
              <a href="${item.linkUrl || '#contact'}" class="project-link">
                <span>${item.linkText || 'INQUIRE DETAILS'}</span>
                <span class="arrow">↗</span>
              </a>
            </div>
          </div>
        `;

        const visualMarkup = `
          <div class="project-visual reveal reveal-scale">
            <div class="project-img-frame" data-gallery-project="${index}" role="button" tabindex="0" aria-label="View gallery for ${item.title}">
              <img src="${item.image}" alt="${item.imageAlt || item.title}" class="project-img" loading="lazy">
              <div class="project-gallery-badge">
                <span class="badge-dot"></span>
                <span>VIEW GALLERY ↗</span>
              </div>
            </div>
          </div>
        `;

        return `
          <article class="project-item ${layoutClass}" id="${item.id}">
            ${isReversed ? visualMarkup + infoMarkup : infoMarkup + visualMarkup}
          </article>
        `;
      })
      .join('');

    container.innerHTML = html;
  }

  // Primary API and backward-compatible alias
  window.Portfolio.renderer.renderPortfolio = renderPortfolio;
  window.Portfolio.renderer.renderWorks = renderPortfolio;
})(window, document);

