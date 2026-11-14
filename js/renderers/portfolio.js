/**
 * FEATURED PORTFOLIO DOM RENDERER
 * Module: js/renderers/portfolio.js
 * Injects horizontal showcase into #portfolioList.
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};
  window.Portfolio.renderer = window.Portfolio.renderer || {};

  function formatIndex(num) {
    return window.Portfolio.utils ? window.Portfolio.utils.formatIndex(num) : num < 10 ? `0${num}` : `${num}`;
  }

  function formatSentenceMasks(text) {
    if (!text) return '';
    const { escapeHtml } = window.Portfolio.utils;
    const sentences = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [text];
    return sentences
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => `<span class="text-line-mask"><span class="text-line-inner">${escapeHtml(s)}</span></span>`)
      .join('');
  }

  /**
   * Render Horizontal Scroll Showcase into #portfolioList (Home)
   */
  function renderProjectShowcaseTo(container, projects) {
    if (!container || !Array.isArray(projects) || projects.length === 0) return;

    const { escapeHtml, escapeAttr, sanitizeUrl } = window.Portfolio.utils;

    const items = projects.map((item, idx) =>
      Object.assign({}, item, {
        originalIndex: typeof item.originalIndex === 'number' ? item.originalIndex : idx
      })
    );

    const total = items.length;
    const first = items[0];
    const firstSafeUrl = first.linkUrl ? sanitizeUrl(first.linkUrl, false) : '';
    const parentSection = container.closest('.project-showcase-section');
    if (parentSection) {
      parentSection.style.setProperty('--portfolio-count', String(total));
    }

    // Build Title Track Items (used identically in Dim and Lit layers)
    const buildTitleItemsMarkup = (isLitLayer) =>
      items
        .map((item, idx) => {
          const activeClass = idx === 0 ? ' is-active' : '';
          const safeTitle = escapeHtml(item.title);
          if (isLitLayer) {
            return `
              <div class="project-title-item${activeClass}" data-index="${idx}" aria-hidden="true">
                <span class="project-title-text">${safeTitle}</span>
              </div>
            `;
          }
          return `
            <button type="button" class="project-title-item project-title-btn${activeClass}" data-index="${idx}" aria-label="Focus project ${escapeAttr(item.title)}">
              <span class="project-title-text">${safeTitle}</span>
            </button>
          `;
        })
        .join('');

    // Build Stacked Image Slides inside Column 3 Bottom Viewport
    const slidesMarkup = items
      .map((item, idx) => {
        const currentClass = idx === 0 ? ' is-current-frame' : '';
        const loadingAttr = idx === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
        const imgW = item.imageWidth || 1600;
        const imgH = item.imageHeight || 900;
        const safeSrc = escapeAttr(sanitizeUrl(item.image, false));
        const srcsetAttr = item.imageSrcset
          ? ` srcset="${escapeAttr(item.imageSrcset)}" sizes="(max-width: 768px) 92vw, 48vw"`
          : '';
        return `
          <div class="project-slide-frame project-img-frame${currentClass}"
               data-slide-index="${idx}"
               data-gallery-project="${item.originalIndex}"
               style="z-index: ${idx + 1};"
               role="button"
               tabindex="0"
               aria-label="View gallery for ${escapeAttr(item.title)}">
            <img src="${safeSrc}"${srcsetAttr} alt="${escapeAttr(item.imageAlt || item.title)}" class="project-img" ${loadingAttr} decoding="async" width="${imgW}" height="${imgH}">
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
            <p class="project-info-desc" id="projectActiveDesc">${formatSentenceMasks(first.description)}</p>
            <div class="project-info-specs">
              <div class="project-spec-item text-line-mask">
                <div class="text-line-inner project-spec-inner">
                  <span class="project-spec-label">YEAR</span>
                  <span class="project-spec-val" id="projectActiveYear">${escapeHtml(first.year)}</span>
                </div>
              </div>
              <div class="project-spec-item text-line-mask">
                <div class="text-line-inner project-spec-inner">
                  <span class="project-spec-label">STACK</span>
                  <span class="project-spec-val" id="projectActiveStack">${escapeHtml(first.stack)}</span>
                </div>
              </div>
            </div>
            <div class="project-info-actions text-line-mask">
              <div class="text-line-inner project-actions-inner">
                <button type="button" class="project-gallery-trigger" id="projectGalleryTrigger">
                  <span>INSPECT GALLERY</span>
                  <span class="arrow" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" overflow="visible"><defs><mask id="arrow-right-duotone-c0" maskUnits="userSpaceOnUse" x="-2" y="-2" width="28" height="28"><rect x="-2" y="-2" width="28" height="28" fill="#fff"/><polygon points="6.19,10.69 2.25,10.69 1.81,13.31 3.56,13.31" fill="#000"/><polygon points="17.81,13.31 21.75,13.31 22.19,10.69 20.44,10.69" fill="#000"/></mask></defs><defs><mask id="arrow-right-duotone-c1" maskUnits="userSpaceOnUse" x="-2" y="-2" width="28" height="28"><rect x="-2" y="-2" width="28" height="28" fill="#fff"/><polygon points="16.47,6.62 13.69,3.83 11.53,5.38 12.76,6.62" fill="#000"/><polygon points="14.62,15.53 11.83,18.31 13.38,20.47 14.62,19.24" fill="#000"/></mask></defs><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="butt" stroke-linejoin="miter"><path d="M4 12L20 12" mask="url(#arrow-right-duotone-c0)"/><path d="M14 6L18.939 10.939L18.939 13.061L14 18" mask="url(#arrow-right-duotone-c1)"/></g></svg>
                  </span>
                </button>
                <a href="${escapeAttr(firstSafeUrl || '#')}"
                   class="project-live-link"
                   id="projectActiveLink"
                   ${firstSafeUrl ? '' : 'style="display:none;"'}
                   ${firstSafeUrl && firstSafeUrl.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>
                  <span id="projectActiveLinkText">${escapeHtml(first.linkText || 'Live Demo')}</span>
                  <span class="arrow">↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Center-Right Active Project Image Viewport (Column 3: 50% to 75%, Below 50% Midline) -->
        <div class="project-image-viewport" id="projectImageViewport">
          ${slidesMarkup}
        </div>

        <!-- Bottom Architectural Status Bar -->
        <div class="project-bottom-bar">
          <div class="project-bottom-right">
            <span class="project-bottom-title" id="projectBottomTitle">${escapeHtml(first.title)}</span>
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

  function renderPortfolio(projects) {
    const homeContainer = document.getElementById('portfolioList');

    if (homeContainer) {
      renderProjectShowcaseTo(homeContainer, projects);
    }
  }

  window.Portfolio.renderer.renderPortfolio = renderPortfolio;
})(window, document);
