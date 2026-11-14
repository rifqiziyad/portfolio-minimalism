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

  function escapeAttr(str) {
    return String(str || '').replace(/"/g, '&quot;');
  }

  /**
   * Splits text into individual visual lines matching client-rendered wrapping
   * and wraps each line in .text-line-mask > .text-line-inner.
   */
  function formatTextLines(containerEl, text, options = {}) {
    if (!containerEl) return;
    const raw =
      text !== undefined
        ? String(text || '')
        : containerEl.getAttribute('data-raw-text') || containerEl.textContent || '';

    if (!raw.trim()) {
      containerEl.innerHTML = '';
      return;
    }

    const words = raw.trim().split(/\s+/);
    containerEl.innerHTML = words
      .map((w) => `<span class="temp-word">${w}</span>`)
      .join(' ');

    const wordEls = containerEl.querySelectorAll('.temp-word');
    const lines = [];
    let currentWords = [];
    let currentTop = -1;
    const threshold = options.threshold !== undefined ? options.threshold : 4;
    const fallbackLength = options.fallbackLength !== undefined ? options.fallbackLength : 65;

    wordEls.forEach((el) => {
      const top = options.useBoundingRect ? el.getBoundingClientRect().top || el.offsetTop : el.offsetTop;
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
      containerEl.innerHTML = fallbackLines
        .map((l) => l.trim())
        .filter(Boolean)
        .map((line) => `<span class="text-line-mask"><span class="text-line-inner">${line}</span></span>`)
        .join('');
      return;
    }

    containerEl.innerHTML = lines
      .map((line) => `<span class="text-line-mask"><span class="text-line-inner">${line}</span></span>`)
      .join('');
  }

  window.Portfolio.utils = {
    formatIndex,
    escapeAttr,
    formatTextLines
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
