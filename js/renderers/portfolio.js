/**
 * FEATURED PORTFOLIO DOM RENDERER
 * Module: js/renderers/portfolio.js
 * Injects horizontal showcase into #portfolioList (Home)
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
   * Render Horizontal Scroll Showcase into #portfolioList (Home)
   */
  function renderProjectShowcaseTo(container, projects) {
    if (!container || !Array.isArray(projects) || projects.length === 0) return;

    const items = projects.map((item, idx) =>
      Object.assign({}, item, {
        originalIndex: typeof item.originalIndex === 'number' ? item.originalIndex : idx
      })
    );

    const total = items.length;
    const first = items[0];
    const parentSection = container.closest('.project-showcase-section');
    if (parentSection) {
      parentSection.style.setProperty('--portfolio-count', String(total));
    }

    // Build Title Track Items (used identically in Dim and Lit layers)
    const buildTitleItemsMarkup = (isLitLayer) =>
      items
        .map((item, idx) => {
          const activeClass = idx === 0 ? ' is-active' : '';
          if (isLitLayer) {
            return `
              <div class="project-title-item${activeClass}" data-index="${idx}" aria-hidden="true">
                <span class="project-title-text">${item.title}</span>
              </div>
            `;
          }
          return `
            <button type="button" class="project-title-item project-title-btn${activeClass}" data-index="${idx}" aria-label="Focus project ${item.title}">
              <span class="project-title-text">${item.title}</span>
            </button>
          `;
        })
        .join('');

    // Build Stacked Image Slides inside Column 3 Bottom Viewport
    const slidesMarkup = items
      .map((item, idx) => {
        const currentClass = idx === 0 ? ' is-current-frame' : '';
        return `
          <div class="project-slide-frame project-img-frame${currentClass}"
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
      <div class="project-sticky-stage" id="projectStickyStage">
        <!-- Architectural Hairline Grid Overlay (Fixed Center Line + Dynamic Right Spotlight Line) -->
        <div class="project-grid-overlay" aria-hidden="true">
          <div class="project-grid-vline project-vline-center" id="projectVlineCenter"></div>
          <div class="project-grid-vline project-vline-right" id="projectVlineRight"></div>
          <div class="project-grid-hline"></div>
        </div>

        <!-- Horizontal Sliding Title Band (Above 32% Midline: Full Stage Width with Dim Overflow & Lit Current Title) -->
        <div class="project-title-band" id="projectTitleBand">
          <!-- Layer 1: Dimmed Titles across full stage (visible in overflow before & after current frame) -->
          <div class="project-title-layer project-title-layer-dim">
            <div class="project-title-track" id="projectTrackDim">
              ${buildTitleItemsMarkup(false)}
            </div>
          </div>

          <!-- Layer 2: Lit Pure-White Titles (Illuminates strictly is-current-frame) -->
          <div class="project-title-layer project-title-layer-lit" id="projectLayerLit" aria-hidden="true">
            <div class="project-title-track" id="projectTrackLit">
              ${buildTitleItemsMarkup(true)}
            </div>
          </div>
        </div>

        <!-- Left Metadata & Description Panel (Columns 1-2, Below 32% Midline) -->
        <div class="project-info-panel">
          <div class="project-info-inner" id="projectInfoInner">
            <div class="project-info-meta">
              <span class="project-info-index" id="projectActiveIndex">01 // ${formatIndex(total)}</span>
              <span class="project-info-category" id="projectActiveCategory">${first.category}</span>
            </div>
            <p class="project-info-desc" id="projectActiveDesc">${first.description}</p>
            <div class="project-info-specs">
              <div class="project-spec-item">
                <span class="project-spec-label">YEAR</span>
                <span class="project-spec-val" id="projectActiveYear">${first.year}</span>
              </div>
              <div class="project-spec-item">
                <span class="project-spec-label">STACK</span>
                <span class="project-spec-val" id="projectActiveStack">${first.stack}</span>
              </div>
            </div>
            <div class="project-info-actions">
              <button type="button" class="project-gallery-trigger" id="projectGalleryTrigger">
                <span>INSPECT GALLERY</span>
                <span class="arrow">↗</span>
              </button>
              <a href="${first.linkUrl || '#'}"
                 class="project-live-link"
                 id="projectActiveLink"
                 ${first.linkUrl ? '' : 'style="display:none;"'}
                 ${first.linkUrl && first.linkUrl.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>
                <span id="projectActiveLinkText">${first.linkText || 'Live Demo'}</span>
                <span class="arrow">↗</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Center-Right Active Project Image Viewport (Column 3: 50% to 75%, Below 50% Midline) -->
        <div class="project-image-viewport" id="projectImageViewport">
          ${slidesMarkup}
        </div>

        <!-- Bottom Architectural Status Bar -->
        <div class="project-bottom-bar">
          <div class="project-bottom-left">
            <a href="/all-project" class="project-explore-link" data-spa-link="portfolio">
              <span>EXPLORE ALL PROJECTS</span>
              <span class="arrow">↗</span>
            </a>
          </div>
          <div class="project-bottom-right">
            <span class="project-bottom-title" id="projectBottomTitle">${first.title}</span>
            <span class="project-bottom-counter" id="projectBottomCounter">
              <strong id="projectCounterCurrent">01</strong>
              <span class="project-counter-sep">|</span>
              <span id="projectCounterTotal">${formatIndex(total)}</span>
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
      renderProjectShowcaseTo(homeContainer, projects);
    }
    if (fullContainer) {
      renderProjectListTo(fullContainer, projects);
    }
  }

  window.Portfolio.renderer.renderPortfolio = renderPortfolio;
})(window, document);
