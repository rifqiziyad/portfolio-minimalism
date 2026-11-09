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

  function handleEducationResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const rows = document.querySelectorAll('.education-row');
      rows.forEach((row) => {
        const isRevealed = row.classList.contains('is-revealed');
        const schoolEl = row.querySelector('.education-school');
        const descEl = row.querySelector('.education-desc');
        if (schoolEl) formatTextLines(schoolEl);
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
   * Initializes staggered line-by-line masked reveals for the 3-column Education section
   * (identical timing, stagger, and easing to project-info description)
   */
  function initEducationReveal(scope) {
    const targetScope = scope || document;
    const rows = Array.from(targetScope.querySelectorAll('.education-row'));
    if (!rows.length) return;

    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

    rows.forEach((row) => {
      const schoolEl = row.querySelector('.education-school');
      const descEl = row.querySelector('.education-desc');

      if (schoolEl) formatTextLines(schoolEl);
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
      window.addEventListener('resize', handleEducationResize, { passive: true });
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

    // 2. Specialized Masked Line-Reveal for 3-Column Education Section
    initEducationReveal(targetScope);
  }

  window.Portfolio.scrollReveal = {
    initScrollReveal,
    initEducationReveal,
    formatTextLines
  };
})(window, document);

