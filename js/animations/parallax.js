/**
 * GLOBAL PARALLAX & SCROLL REVEALS
 * Module: js/animations/parallax.js
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  function initParallaxAnimations(container) {
    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

    if (hasGSAP) {
      const scope = container || document;

      // 1. BACKGROUND OUTLINED TEXTS PARALLAX (PORTFOLIO, TIMELINE, SKILLS, EDUCATION, PROJECTS)
      const outlineTexts = scope.querySelectorAll('.bg-outline-text');
      outlineTexts.forEach((text) => {
        const parent = text.closest('section') || text.parentElement;
        if (!parent || parent.offsetParent === null) return;

        const speed = parseFloat(text.getAttribute('data-parallax')) || 0.2;

        gsap.fromTo(
          text,
          { y: 0 },
          {
            y: () => parent.offsetHeight * speed,
            ease: 'none',
            scrollTrigger: {
              trigger: parent,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8,
              invalidateOnRefresh: true
            }
          }
        );
      });

      // 2. THE ARCHIVE PROJECT IMAGES ZOOM + VERTICAL PARALLAX
      const projectItems = scope.querySelectorAll('.project-item');
      projectItems.forEach((item) => {
        if (item.offsetParent === null) return;
        const img = item.querySelector('.project-img');
        if (img) {
          gsap.fromTo(
            img,
            {
              yPercent: -12,
              scale: 1.0,
              transformOrigin: 'left top'
            },
            {
              yPercent: 4,
              scale: 1.14,
              transformOrigin: 'left top',
              ease: 'none',
              scrollTrigger: {
                trigger: item,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true
              }
            }
          );
        }
      });

      // 3. SCROLL REVEAL VIA GSAP BATCH
      const revealTargets = Array.from(scope.querySelectorAll('.reveal:not(.revealed)')).filter(
        (el) => el.offsetParent !== null
      );
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
      // Graceful fallback to native IntersectionObserver if GSAP is not available
      const scope = container || document;
      const revealElements = scope.querySelectorAll('.reveal');
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

  window.Portfolio.parallax = {
    initParallaxAnimations
  };
})(window, document);
