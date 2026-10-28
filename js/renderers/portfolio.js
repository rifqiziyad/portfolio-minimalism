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
    const container = document.getElementById('portfolioList');
    if (!container || !Array.isArray(projects)) return;

    // Check optional data-limit attribute (e.g. data-limit="3" on index.html)
    const limitAttr = container.getAttribute('data-limit');
    const limit = limitAttr ? parseInt(limitAttr, 10) : null;

    // Map projects with originalIndex to ensure carousel modal indexes stay 100% matched
    const itemsWithIndex = projects.map((item, originalIndex) =>
      Object.assign({}, item, { originalIndex: typeof item.originalIndex === 'number' ? item.originalIndex : originalIndex })
    );

    const visibleProjects = (limit && !isNaN(limit) && limit > 0)
      ? itemsWithIndex.slice(0, limit)
      : itemsWithIndex;

    const html = visibleProjects
      .map((item, index) => {
        const isReversed = index % 2 === 1;
        const layoutClass = isReversed ? 'project-layout-reversed' : 'project-layout-normal';
        const infoRevealClass = isReversed ? 'reveal-right' : 'reveal-left';

        const infoMarkup = `
          <div class="project-info reveal ${infoRevealClass}">
            <div class="project-meta">
              <span class="project-category">${item.category}</span>
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
            ${item.linkUrl ? `
            <div class="project-link-wrap">
              <a href="${item.linkUrl}" class="project-link"${item.linkUrl.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>
                <span>${item.linkText || 'View Project'}</span>
                <span class="arrow">↗</span>
              </a>
            </div>` : ''}
          </div>
        `;

        const visualMarkup = `
          <div class="project-visual reveal reveal-scale">
            <div class="project-img-frame" data-gallery-project="${item.originalIndex}" role="button" tabindex="0" aria-label="View gallery for ${item.title}">
              <img src="${item.image}" alt="${item.imageAlt || item.title}" class="project-img" loading="lazy">
              <div class="project-gallery-badge">
                <span class="badge-dot"></span>
                <span>View ↗</span>
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

  window.Portfolio.renderer.renderPortfolio = renderPortfolio;
})(window, document);

