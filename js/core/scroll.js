/**
 * CORE SCROLL ENGINE (Lenis Smooth Scroll & GSAP Synchronization)
 * Module: js/core/scroll.js
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  let lenisInstance = null;

  function initScroll() {
    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    const hasLenis = typeof Lenis !== 'undefined';

    if (hasGSAP) {
      gsap.registerPlugin(ScrollTrigger);
    }

    if (hasLenis) {
      lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.8
      });

      if (hasGSAP) {
        // Synchronize Lenis scroll with GSAP ScrollTrigger
        lenisInstance.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
          lenisInstance.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
      } else {
        function raf(time) {
          lenisInstance.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }
    }

    return lenisInstance;
  }

  function getLenis() {
    return lenisInstance;
  }

  function scrollTo(target, options = {}) {
    const defaultOptions = {
      offset: -70,
      duration: 1.4
    };
    const mergedOptions = Object.assign({}, defaultOptions, options);

    const targetEl = typeof target === 'string' ? document.querySelector(target) : target;
    if (!targetEl) return;

    if (lenisInstance) {
      lenisInstance.scrollTo(targetEl, mergedOptions);
    } else {
      const headerOffset = Math.abs(mergedOptions.offset || 70);
      const elementPosition = targetEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  window.Portfolio.scroll = {
    initScroll,
    getLenis,
    scrollTo
  };
})(window, document);
