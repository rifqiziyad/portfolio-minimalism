/**
 * MINIMAL DOT CURSOR (Precision 1:1 Tracking)
 * Module: js/components/cursor.js
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  function initCursor() {
    const dot = document.getElementById('cursor-dot');
    if (!dot) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let isMoving = false;
    let rafId = null;

    function renderCursor() {
      rafId = null;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    }

    // Track real mouse position via rAF + GPU transform3d
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isMoving) {
        document.body.classList.add('has-cursor');
        isMoving = true;
      }

      if (rafId === null) {
        rafId = window.requestAnimationFrame(renderCursor);
      }
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      document.body.classList.remove('has-cursor');
      isMoving = false;
    });

    // Event delegation covers static + dynamically rendered interactive elements
    const INTERACTIVE_SELECTOR = 'a, button, [role="button"], .carousel-thumb-item, .project-slide-frame';
    document.addEventListener('mouseover', (e) => {
      if (e.target && typeof e.target.closest === 'function' && e.target.closest(INTERACTIVE_SELECTOR)) {
        dot.classList.add('is-hovering');
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target && typeof e.target.closest === 'function' ? e.target.closest(INTERACTIVE_SELECTOR) : null;
      if (!target) return;
      const related = e.relatedTarget && typeof e.relatedTarget.closest === 'function'
        ? e.relatedTarget.closest(INTERACTIVE_SELECTOR)
        : null;
      if (related !== target) {
        dot.classList.remove('is-hovering');
      }
    });
  }

  window.Portfolio.cursor = {
    initCursor
  };
})(window, document);
