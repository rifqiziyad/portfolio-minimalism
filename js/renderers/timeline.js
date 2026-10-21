/**
 * PRODUCTION TIMELINE DOM RENDERER
 * Module: js/renderers/timeline.js
 * Injects experience cards, dynamic SVG track, and interval illustrations into #timelineStream.
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};
  window.Portfolio.renderer = window.Portfolio.renderer || {};

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

  window.Portfolio.renderer.renderTimeline = renderTimeline;
})(window, document);

