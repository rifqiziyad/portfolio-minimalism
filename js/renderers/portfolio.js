/**
 * FEATURED PORTFOLIO DOM RENDERER
 * Module: js/renderers/portfolio.js
 * Injects Santal-inspired horizontal showcase into #portfolioList (Home)
 * and vertical archive cards into #portfolioFullList (/all-project).
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};
  window.Portfolio.renderer = window.Portfolio.renderer || {};

  function formatIndex(num) {
    return num < 10 ? `0${num}` : `${num}`;
  }

  /**
   * Render Santal-inspired Horizontal Scroll Showcase into #portfolioList (Home)
   */
  function renderSantalHorizontalTo(container, projects) {
    if (!container || !Array.isArray(projects) || projects.length === 0) return;

    const items = projects.map((item, idx) =>
      Object.assign({}, item, {
        originalIndex: typeof item.originalIndex === 'number' ? item.originalIndex : idx
      })
    );

    const total = items.length;
    const first = items[0];
    const parentSection = container.closest('.santal-portfolio-section');
    if (parentSection) {
      parentSection.style.setProperty('--portfolio-count', String(total));
    }

    // Build Title Track Items (Single unified track: strictly 1 title at a time)
    const buildTitleItemsMarkup = () =>
      items
        .map((item, idx) => {
          const activeClass = idx === 0 ? ' is-active' : '';
          return `
            <button type="button" class="santal-title-item santal-title-btn${activeClass}" data-index="${idx}" aria-label="Focus project ${item.title}">
              <span class="santal-title-text">${item.title}</span>
            </button>
          `;
        })
        .join('');

    // Build Stacked Image Slides inside Column 3 Bottom Viewport
    const slidesMarkup = items
      .map((item, idx) => {
        const currentClass = idx === 0 ? ' is-current-frame' : '';
        return `
          <div class="santal-slide-frame project-img-frame${currentClass}"
               data-slide-index="${idx}"
               data-gallery-project="${item.originalIndex}"
               style="z-index: ${idx + 1};"
               role="button"
               tabindex="0"
               aria-label="View gallery for ${item.title}">
            <img src="${item.image}" alt="${item.imageAlt || item.title}" class="project-img" loading="eager">
            <div class="project-gallery-badge">
              <span class="badge-dot"></span>
              <span>View ↗</span>
            </div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div class="santal-sticky-stage" id="santalStickyStage">
        <!-- Architectural Hairline Grid Overlay (Fixed Center Line + Dynamic Right Spotlight Line) -->
        <div class="santal-grid-overlay" aria-hidden="true">
          <div class="santal-grid-vline santal-vline-center" id="santalVlineCenter"></div>
          <div class="santal-grid-vline santal-vline-right" id="santalVlineRight"></div>
          <div class="santal-grid-hline"></div>
        </div>

        <!-- Horizontal Sliding Title Band (Aligned directly above 55% image viewport: Strictly 1 Title) -->
        <div class="santal-title-band" id="santalTitleBand">
          <div class="santal-title-track" id="santalTrackLit">
            ${buildTitleItemsMarkup()}
          </div>
        </div>

        <!-- Left Metadata & Description Panel (Columns 1-2, Below 32% Midline) -->
        <div class="santal-info-panel">
          <div class="santal-info-inner" id="santalInfoInner">
            <div class="santal-info-meta">
              <span class="santal-info-index" id="santalActiveIndex">01 // ${formatIndex(total)}</span>
              <span class="santal-info-category" id="santalActiveCategory">${first.category}</span>
            </div>
            <p class="santal-info-desc" id="santalActiveDesc">${first.description}</p>
            <div class="santal-info-specs">
              <div class="santal-spec-item">
                <span class="santal-spec-label">YEAR</span>
                <span class="santal-spec-val" id="santalActiveYear">${first.year}</span>
              </div>
              <div class="santal-spec-item">
                <span class="santal-spec-label">STACK</span>
                <span class="santal-spec-val" id="santalActiveStack">${first.stack}</span>
              </div>
            </div>
            <div class="santal-info-actions">
              <button type="button" class="santal-gallery-trigger" id="santalGalleryTrigger">
                <span>INSPECT GALLERY</span>
                <span class="arrow">↗</span>
              </button>
              <a href="${first.linkUrl || '#'}"
                 class="santal-live-link"
                 id="santalActiveLink"
                 ${first.linkUrl ? '' : 'style="display:none;"'}
                 ${first.linkUrl && first.linkUrl.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>
                <span id="santalActiveLinkText">${first.linkText || 'Live Demo'}</span>
                <span class="arrow">↗</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Center-Right Active Project Image Viewport (Column 3: 50% to 75%, Below 50% Midline) -->
        <div class="santal-image-viewport" id="santalImageViewport">
          ${slidesMarkup}
        </div>

        <!-- Bottom Architectural Status Bar -->
        <div class="santal-bottom-bar">
          <div class="santal-bottom-left">
            <a href="/all-project" class="santal-explore-link" data-spa-link="portfolio">
              <span>EXPLORE ALL PROJECTS</span>
              <span class="arrow">↗</span>
            </a>
          </div>
          <div class="santal-bottom-right">
            <span class="santal-bottom-title" id="santalBottomTitle">${first.title}</span>
            <span class="santal-bottom-counter" id="santalBottomCounter">
              <strong id="santalCounterCurrent">01</strong>
              <span class="santal-counter-sep">|</span>
              <span id="santalCounterTotal">${formatIndex(total)}</span>
            </span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Vertical Archive Project List into #portfolioFullList (/all-project)
   */
  function renderProjectListTo(container, projects) {
    if (!container || !Array.isArray(projects)) return;

    const limitAttr = container.getAttribute('data-limit');
    const limit = limitAttr ? parseInt(limitAttr, 10) : null;

    const itemsWithIndex = projects.map((item, originalIndex) =>
      Object.assign({}, item, {
        originalIndex: typeof item.originalIndex === 'number' ? item.originalIndex : originalIndex
      })
    );

    const visibleProjects =
      limit && !isNaN(limit) && limit > 0 ? itemsWithIndex.slice(0, limit) : itemsWithIndex;

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
            ${
              item.linkUrl
                ? `
            <div class="project-link-wrap">
              <a href="${item.linkUrl}" class="project-link"${
                    item.linkUrl.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''
                  }>
                <span>${item.linkText || 'View Project'}</span>
                <span class="arrow">↗</span>
              </a>
            </div>`
                : ''
            }
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

        const itemId = container.id === 'portfolioFullList' ? `archive-${item.id}` : item.id;
        return `
          <article class="project-item ${layoutClass}" id="${itemId}">
            ${isReversed ? visualMarkup + infoMarkup : infoMarkup + visualMarkup}
          </article>
        `;
      })
      .join('');

    container.innerHTML = html;
  }

  function renderPortfolio(projects) {
    const homeContainer = document.getElementById('portfolioList');
    const fullContainer = document.getElementById('portfolioFullList');

    if (homeContainer) {
      renderSantalHorizontalTo(homeContainer, projects);
    }
    if (fullContainer) {
      renderProjectListTo(fullContainer, projects);
    }
  }

  window.Portfolio.renderer.renderPortfolio = renderPortfolio;
})(window, document);
