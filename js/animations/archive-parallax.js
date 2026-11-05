/**
 * ARCHIVE PROJECT IMAGES ZOOM & PARALLAX CONTROLLER
 * Module: js/animations/archive-parallax.js
 * Controls subtle image scale and vertical drift for .project-item in /all-project
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  function initArchiveParallax(scope) {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const targetScope = scope || document;
    const projectItems = targetScope.querySelectorAll('.project-item');

    projectItems.forEach((item) => {
      const img = item.querySelector('.project-img');
      if (img) {
        gsap.fromTo(
          img,
          {
            yPercent: -10,
            scale: 1.25,
            transformOrigin: 'center center'
          },
          {
            yPercent: 6,
            scale: 1.0,
            transformOrigin: 'center center',
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
  }

  window.Portfolio.archiveParallax = {
    initArchiveParallax
  };
})(window, document);

