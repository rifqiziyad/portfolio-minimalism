/**
 * SCROLL REVEAL CONTROLLER
 * Module: js/animations/scroll-reveal.js
 * Batched viewport entrance reveals with GSAP ScrollTrigger & IntersectionObserver fallback,
 * and staggered masked line-reveals for Education section.
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  let hasEducationResizeListener = false;
  let resizeTimer = null;

  /**
   * Splits text into visual lines matching rendered wrapping
   * Wraps each line in .text-line-mask > .text-line-inner
   */
  function formatTextLines(containerEl, text) {
    if (!containerEl) return;
    const raw = text !== undefined ? text : (containerEl.getAttribute('data-raw-text') || containerEl.textContent || '');
    if (!raw.trim()) {
      containerEl.innerHTML = '';
      return;
    }

    // 1. Temporarily place words in DOM to measure exact client-rendered line wrapping
    const words = raw.trim().split(/\s+/);
    containerEl.innerHTML = words
      .map((w) => `<span class="temp-word">${w}</span>`)
      .join(' ');

    const wordEls = containerEl.querySelectorAll('.temp-word');
    const lines = [];
    let currentWords = [];
    let currentTop = -1;

    wordEls.forEach((el) => {
      const top = el.offsetTop;
      if (currentTop !== -1 && Math.abs(top - currentTop) > 4) {
        if (currentWords.length) lines.push(currentWords.join(' '));
        currentWords = [];
      }
      currentWords.push(el.textContent);
      currentTop = top;
    });
    if (currentWords.length) {
      lines.push(currentWords.join(' '));
    }

    // Fallback if offsetTop is not measurable (e.g. 0 height before layout)
    if (lines.length <= 1 && raw.length > 70) {
      const fallbackLines = raw.match(/[^,;:.!?]+[,;:.!?]+(\s|$)|[^,;:.!?]+$/g) || [raw];
      containerEl.innerHTML = fallbackLines
        .map((l) => l.trim())
        .filter(Boolean)
        .map((line) => `<span class="text-line-mask"><span class="text-line-inner">${line}</span></span>`)
        .join('');
      return;
    }

    // Wrap each visual line into an overflow-hidden mask and inner reveal span
    containerEl.innerHTML = lines
      .map((line) => `<span class="text-line-mask"><span class="text-line-inner">${line}</span></span>`)
      .join('');
  }

  function handleMaskedRowsResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const rows = document.querySelectorAll('.education-row, .career-row');
      rows.forEach((row) => {
        const isRevealed = row.classList.contains('is-revealed');
        const titleEl = row.querySelector('.education-school, .career-company-name');
        const descEl = row.querySelector('.education-desc, .career-desc');
        if (titleEl) formatTextLines(titleEl);
        if (descEl) formatTextLines(descEl);

        const inners = row.querySelectorAll('.text-line-inner');
        if (typeof gsap !== 'undefined') {
          gsap.set(inners, {
            yPercent: isRevealed ? 0 : 110,
            opacity: isRevealed ? 1 : 0
          });
        }
      });
    }, 150);
  }

  /**
   * Initializes staggered line-by-line masked reveals for 3-column rows (Career & Education)
   * (identical timing, stagger, and easing to project-info description)
   */
  function initThreeColumnRowsReveal(scope, rowSelector, titleSelector, descSelector) {
    const targetScope = scope || document;
    const rows = Array.from(targetScope.querySelectorAll(rowSelector));
    if (!rows.length) return;

    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

    rows.forEach((row) => {
      const titleEl = row.querySelector(titleSelector);
      const descEl = row.querySelector(descSelector);

      if (titleEl) formatTextLines(titleEl);
      if (descEl) formatTextLines(descEl);

      const inners = Array.from(row.querySelectorAll('.text-line-inner'));
      if (!inners.length) return;

      if (hasGSAP) {
        gsap.set(inners, { yPercent: 110, opacity: 0 });

        ScrollTrigger.create({
          trigger: row,
          start: 'top 86%',
          once: true,
          onEnter: () => {
            row.classList.add('is-revealed');
            gsap.to(inners, {
              yPercent: 0,
              opacity: 1,
              duration: 0.38,
              stagger: 0.065,
              ease: 'power3.out'
            });
          }
        });
      } else {
        row.classList.add('is-revealed');
        inners.forEach((el) => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
      }
    });

    if (!hasEducationResizeListener) {
      window.addEventListener('resize', handleMaskedRowsResize, { passive: true });
      hasEducationResizeListener = true;
    }
  }

  function initScrollReveal(scope) {
    const targetScope = scope || document;
    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

    // 1. Generic .reveal elements batch
    if (hasGSAP) {
      const revealTargets = Array.from(targetScope.querySelectorAll('.reveal:not(.revealed)'));
      if (revealTargets.length) {
        ScrollTrigger.batch(revealTargets, {
          start: 'top 88%',
          once: true,
          onEnter: (batch) => {
            batch.forEach((el) => {
              el.classList.add('revealed');
            });
            if (typeof window.renderTimelinePath === 'function') {
              window.renderTimelinePath();
            }
          }
        });
      }
    } else {
      const revealElements = targetScope.querySelectorAll('.reveal');
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -40px 0px'
        }
      );

      revealElements.forEach((el) => {
        revealObserver.observe(el);
      });
    }

    // 2. Specialized Masked Line-Reveal for 3-Column Career & Education Sections
    initThreeColumnRowsReveal(targetScope, '.career-row', '.career-company-name', '.career-desc');
    initThreeColumnRowsReveal(targetScope, '.education-row', '.education-school', '.education-desc');
  }

  window.Portfolio.scrollReveal = {
    initScrollReveal,
    initCareerReveal: (scope) => initThreeColumnRowsReveal(scope, '.career-row', '.career-company-name', '.career-desc'),
    initEducationReveal: (scope) => initThreeColumnRowsReveal(scope, '.education-row', '.education-school', '.education-desc'),
    formatTextLines
  };
})(window, document);

