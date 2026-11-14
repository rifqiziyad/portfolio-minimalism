/**
 * DYNAMIC DOM RENDERER ORCHESTRATOR & SHARED UTILITIES
 * Module: js/core/renderer.js
 * Provides shared UI helpers (window.Portfolio.utils) and coordinates
 * section renderers (works, career, skills, education) from window.PortfolioData.
 */

(function (window) {
  'use strict';

  window.Portfolio = window.Portfolio || {};
  const renderer = window.Portfolio.renderer || (window.Portfolio.renderer = {});

  function formatIndex(num) {
    return num < 10 ? `0${num}` : `${num}`;
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(str) {
    return escapeHtml(str);
  }

  function sanitizeUrl(url, allowHash = true) {
    const raw = String(url ?? '').trim();
    if (!raw) return '#';
    if (allowHash && raw.startsWith('#')) return raw;
    if (raw.startsWith('//')) return '#';
    const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw);
    if (!hasScheme) return raw;
    return /^(https?:|mailto:)/i.test(raw) ? raw : '#';
  }

  function prefersReducedMotion() {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  function buildMaskedLinesHtml(lines) {
    return lines
      .map((line) => `<span class="text-line-mask"><span class="text-line-inner">${line}</span></span>`)
      .join('');
  }

  function extractMeasuredLines(entry) {
    const { wordEls, raw, threshold, fallbackLength } = entry;
    const lines = [];
    let currentWords = [];
    let currentTop = -1;

    wordEls.forEach((el) => {
      const top = entry.useBoundingRect ? el.getBoundingClientRect().top || el.offsetTop : el.offsetTop;
      if (currentTop !== -1 && Math.abs(top - currentTop) > threshold) {
        if (currentWords.length) lines.push(currentWords.join(' '));
        currentWords = [];
      }
      currentWords.push(el.textContent);
      currentTop = top;
    });
    if (currentWords.length) {
      lines.push(currentWords.join(' '));
    }

    // Fallback when element height is temporarily unmeasurable before layout
    if (lines.length <= 1 && raw.length > fallbackLength) {
      const fallbackLines = raw.match(/[^,;:.!?]+[,;:.!?]+(\s|$)|[^,;:.!?]+$/g) || [raw];
      return fallbackLines.map((l) => l.trim()).filter(Boolean);
    }

    return lines;
  }

  /**
   * Batches DOM writes and layout reads across multiple containers to avoid forced reflows.
   * Each entry accepts { containerEl, text, options }.
   */
  function formatTextLinesBatch(items) {
    if (!Array.isArray(items) || !items.length) return;

    const prepared = [];

    // Pass 1 (Write): inject temporary word spans across all containers
    items.forEach((item) => {
      const containerEl = item && item.containerEl;
      if (!containerEl) return;

      const options = item.options || {};
      const raw =
        item.text !== undefined
          ? String(item.text || '')
          : containerEl.getAttribute('data-raw-text') || containerEl.textContent || '';

      if (!raw.trim()) {
        containerEl.innerHTML = '';
        return;
      }

      const words = raw.trim().split(/\s+/);
      containerEl.innerHTML = words.map((w) => `<span class="temp-word">${w}</span>`).join(' ');

      prepared.push({
        containerEl,
        raw,
        wordEls: containerEl.querySelectorAll('.temp-word'),
        useBoundingRect: Boolean(options.useBoundingRect),
        threshold: options.threshold !== undefined ? options.threshold : 4,
        fallbackLength: options.fallbackLength !== undefined ? options.fallbackLength : 65
      });
    });

    // Pass 2 (Read): measure word coordinates in a single layout pass
    const results = prepared.map((entry) => ({
      containerEl: entry.containerEl,
      lines: extractMeasuredLines(entry)
    }));

    // Pass 3 (Write): commit final masked line DOM
    results.forEach(({ containerEl, lines }) => {
      containerEl.innerHTML = buildMaskedLinesHtml(lines);
    });
  }

  /**
   * Splits text into individual visual lines matching client-rendered wrapping
   * and wraps each line in .text-line-mask > .text-line-inner.
   */
  function formatTextLines(containerEl, text, options = {}) {
    if (!containerEl) return;
    formatTextLinesBatch([{ containerEl, text, options }]);
  }

  const loadedScripts = new Map();

  function loadScriptOnce(src) {
    if (!src) return Promise.resolve();
    if (loadedScripts.has(src)) return loadedScripts.get(src);

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (err) => {
        loadedScripts.delete(src);
        reject(err);
      };
      document.head.appendChild(script);
    });

    loadedScripts.set(src, promise);
    return promise;
  }

  function renderTimelineRows(containerId, items, config) {
    const container = document.getElementById(containerId);
    if (!container || !Array.isArray(items)) return;

    const {
      rowClass,
      yearColClass,
      yearClass,
      titleColClass,
      titleClass,
      subtitleClass,
      descColClass,
      descClass,
      titleKey,
      subtitleKey,
      subtitleFallback = ''
    } = config;

    container.innerHTML = items
      .map((item, index) => {
        const period = item.period || '';
        const title = item[titleKey] || '';
        const subtitle = item[subtitleKey] || subtitleFallback;
        const description = item.description || '';

        return `
          <div class="${rowClass}" data-index="${index}">
            <div class="${yearColClass}">
              <span class="text-line-mask">
                <span class="text-line-inner ${yearClass}">${escapeHtml(period)}</span>
              </span>
            </div>
            <div class="${titleColClass}">
              <h3 class="${titleClass}" data-raw-text="${escapeAttr(title)}">
                <span class="text-line-mask">
                  <span class="text-line-inner">${escapeHtml(title)}</span>
                </span>
              </h3>
              <p class="${subtitleClass}" data-raw-text="${escapeAttr(subtitle)}">
                <span class="text-line-mask">
                  <span class="text-line-inner">${escapeHtml(subtitle)}</span>
                </span>
              </p>
            </div>
            <div class="${descColClass}">
              <p class="${descClass}" data-raw-text="${escapeAttr(description)}">
                <span class="text-line-mask">
                  <span class="text-line-inner">${escapeHtml(description)}</span>
                </span>
              </p>
            </div>
          </div>
        `;
      })
      .join('');
  }

  window.Portfolio.utils = {
    formatIndex,
    escapeHtml,
    escapeAttr,
    sanitizeUrl,
    renderTimelineRows,
    loadScriptOnce,
    formatTextLines,
    formatTextLinesBatch,
    prefersReducedMotion
  };

  function renderAll() {
    const data = window.PortfolioData;
    if (!data) return;

    if (typeof renderer.renderPortfolio === 'function') {
      renderer.renderPortfolio(data.works);
    }

    if (typeof renderer.renderCareer === 'function') {
      renderer.renderCareer(data.career);
    }

    if (typeof renderer.renderSkills === 'function') {
      renderer.renderSkills(data.skills);
    }

    if (typeof renderer.renderEducation === 'function') {
      renderer.renderEducation(data.education);
    }
  }

  renderer.renderAll = renderAll;
})(window);
