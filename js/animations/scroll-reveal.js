/**
 * SCROLL REVEAL CONTROLLER
 * Module: js/animations/scroll-reveal.js
 * Batched viewport entrance reveals with GSAP ScrollTrigger & IntersectionObserver fallback
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  function initScrollReveal(scope) {
    const targetScope = scope || document;
    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

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
  }

  window.Portfolio.scrollReveal = {
    initScrollReveal
  };
})(window, document);

