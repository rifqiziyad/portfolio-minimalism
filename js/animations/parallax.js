/**
 * GLOBAL PARALLAX & SCROLL REVEALS
 * Module: js/animations/parallax.js
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  function initParallaxAnimations() {
    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

    if (hasGSAP) {
      // 1. BACKGROUND OUTLINED TEXTS PARALLAX (DEVELOPER, FORM, ARCHIVE, STACK, CONNECT)
      gsap.utils.toArray('.bg-outline-text').forEach((text) => {
        const speed = parseFloat(text.getAttribute('data-parallax')) || 0.2;
        const parent = text.closest('section') || text.parentElement;
        if (!parent) return;

        gsap.to(text, {
          y: () => parent.offsetHeight * speed,
          ease: 'none',
          scrollTrigger: {
            trigger: parent,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8,
            invalidateOnRefresh: true
          }
        });
      });

      // 2. THE ARCHIVE PROJECT IMAGES ZOOM + VERTICAL PARALLAX
      gsap.utils.toArray('.project-item').forEach((item) => {
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
              scale: 1.14 ,
              transformOrigin: 'left top',
              ease: 'none',
              scrollTrigger: {
                trigger: item,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
              }
            }
          );
        }
      });

      // 3. SCROLL REVEAL VIA GSAP BATCH
      ScrollTrigger.batch('.reveal', {
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

      // Refresh ScrollTrigger to calculate exact initial trigger positions
      ScrollTrigger.refresh();
      window.addEventListener('load', () => {
        ScrollTrigger.refresh();
      });
    } else {
      // Graceful fallback to native IntersectionObserver if GSAP is not available
      const revealElements = document.querySelectorAll('.reveal');
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
