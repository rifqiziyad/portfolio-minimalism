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

  function formatTextLines(containerEl, text) {
    if (window.Portfolio.utils && typeof window.Portfolio.utils.formatTextLines === 'function') {
      window.Portfolio.utils.formatTextLines(containerEl, text, {
        useBoundingRect: true,
        threshold: 3,
        fallbackLength: 60
      });
    }
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
   * Runs consistently across both desktop and mobile screens.
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
          start: 'top 88%',
          once: true,
          onEnter: () => {
            row.classList.add('is-revealed');
            const currentInners = row.querySelectorAll('.text-line-inner');
            gsap.to(currentInners, {
              yPercent: 0,
              opacity: 1,
              duration: 0.42,
              stagger: 0.055,
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

