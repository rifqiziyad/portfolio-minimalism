/**
 * BACKGROUND OUTLINE TEXT PARALLAX CONTROLLER
 * Module: js/animations/outline-text.js
 * Controls smooth vertical scroll parallax for .bg-outline-text across sections
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  function initOutlineTextParallax(scope) {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const targetScope = scope || document;
    const outlineTexts = targetScope.querySelectorAll('.bg-outline-text');

    outlineTexts.forEach((text) => {
      const parent = text.closest('section') || text.parentElement;
      if (!parent) return;

      const isProjectSection = parent.id === 'project' || parent.classList.contains('project-showcase-section');

      if (isProjectSection) {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
          // On mobile, the project section scrolls naturally without sticky pinning.
          // Trigger against the entire section so parallax travel matches Career, Skills, etc.
          const speed = parseFloat(text.getAttribute('data-parallax')) || 0.18;
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
        } else {
          // Dedicated parallax for Project header area: settles directly behind 'PROJECT' title like other sections
          const headerArea = parent.querySelector('.project-header-area') || parent;
          const speed = parseFloat(text.getAttribute('data-parallax')) || 0.18;
          gsap.fromTo(
            text,
            { y: 0 },
            {
              y: () => headerArea.offsetHeight * speed,
              ease: 'none',
              scrollTrigger: {
                trigger: headerArea,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.8,
                invalidateOnRefresh: true
              }
            }
          );
        }
      } else {
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
      }
    });
  }

  window.Portfolio.outlineText = {
    initOutlineTextParallax
  };
})(window, document);

