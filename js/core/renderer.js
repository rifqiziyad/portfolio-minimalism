/**
 * DYNAMIC DOM RENDERER
 * Module: js/core/renderer.js
 * Injects content from window.PortfolioData into semantic containers before animations run.
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  function renderWorks(works) {
    const container = document.getElementById('worksList');
    if (!container || !Array.isArray(works)) return;

    const html = works
      .map((item, index) => {
        const isReversed = index % 2 === 1;
        const layoutClass = isReversed ? 'project-layout-reversed' : 'project-layout-normal';
        const infoRevealClass = isReversed ? 'reveal-right' : 'reveal-left';

        const infoMarkup = `
          <div class="project-info reveal ${infoRevealClass}">
            <div class="project-meta">
              <span class="project-num">${item.num} / ${item.category}</span>
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
            <div class="project-img-frame">
              <img src="${item.image}" alt="${item.imageAlt || item.title}" class="project-img" loading="lazy">
              <div class="project-badge-float">${item.num}</div>
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

  function renderTimeline(timeline) {
    const container = document.getElementById('timelineStream');
    if (!container || !Array.isArray(timeline)) return;

    const intervals = [
      {
        id: 'prod-interval-1',
        class: 'interval-left',
        artId: 'prod-art-1',
        svg: 'assets/cluster-apex.svg',
        alt: 'Apex Crystal Shards',
        dockId: 'prod-dock-int-1',
        dotClass: ''
      },
      {
        id: 'prod-interval-2',
        class: 'interval-right',
        artId: 'prod-art-2',
        svg: 'assets/cluster-gem.svg',
        alt: 'Shattered Crystal Prism',
        dockId: 'prod-dock-int-2',
        dotClass: 'purple'
      }
    ];

    let itemsHtml = `
      <svg class="timeline-dynamic-track" id="prodTimelineTrackSvg" fill="none">
        <path id="prodTrackPathGlow" stroke="rgba(255, 69, 0, 0.22)" stroke-width="5" />
        <path id="prodTrackPath" stroke="rgba(255, 69, 0, 0.75)" stroke-width="2" stroke-dasharray="6 6" />
      </svg>
    `;

    timeline.forEach((card, index) => {
      const docksMarkup = (card.docks || [])
        .map(
          (d) =>
            `<div class="card-dock ${d.posClass}" id="${d.id}"><span class="dock-point ${d.dotClass}"></span></div>`
        )
        .join('');

      itemsHtml += `
        <div class="timeline-card-wrapper" id="${card.wrapId}">
          <div class="timeline-card reveal reveal-fade" id="${card.id}">
            ${docksMarkup}
            <div class="timeline-card-year">
              <span>${card.year}</span>
            </div>
            <h3 class="timeline-card-heading">${card.heading}</h3>
            <p class="timeline-card-text">${card.text}</p>
          </div>
        </div>
      `;

      if (intervals[index]) {
        const int = intervals[index];
        itemsHtml += `
          <div class="timeline-interval ${int.class}" id="${int.id}">
            <div class="interval-illustration" id="${int.artId}">
              <img src="${int.svg}" alt="${int.alt}" loading="lazy">
              <div class="flank-dock" id="${int.dockId}"><span class="dock-point ${int.dotClass}"></span></div>
            </div>
          </div>
        `;
      }
    });

    container.innerHTML = itemsHtml;
  }

  function renderSkills(skills) {
    const container = document.getElementById('skillsTable');
    if (!container || !Array.isArray(skills)) return;

    const html = skills
      .map((item, index) => {
        const delayClass = index > 0 ? ` delay-${index}` : '';
        const tagsMarkup = (item.tags || [])
          .map((t) => `<span class="tag">${t}</span>`)
          .join('');

        return `
          <div class="skill-row reveal reveal-up${delayClass}">
            <span class="skill-index">${item.index}</span>
            <div class="skill-main">
              <h3 class="skill-title">${item.title}</h3>
              <p class="skill-desc">${item.description}</p>
            </div>
            <div class="skill-tags">
              ${tagsMarkup}
            </div>
            <span class="skill-arrow">→</span>
          </div>
        `;
      })
      .join('');

    container.innerHTML = html;
  }

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

  function renderAll() {
    const data = window.PortfolioData;
    if (!data) return;

    renderWorks(data.works);
    renderTimeline(data.timeline);
    renderSkills(data.skills);
    renderEducation(data.education);
  }

  window.Portfolio.renderer = {
    renderAll,
    renderWorks,
    renderTimeline,
    renderSkills,
    renderEducation
  };
})(window, document);

