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

    // Track real mouse position
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;

      if (!isMoving) {
        document.body.classList.add('has-cursor');
        isMoving = true;
      }
    });

    window.addEventListener('mouseleave', () => {
      document.body.classList.remove('has-cursor');
      isMoving = false;
    });

    // Check interactive elements for subtle dot scaling
    const interactiveElements = document.querySelectorAll('a, button');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        dot.style.transform = 'translate(-50%, -50%) scale(1.6)';
      });

      el.addEventListener('mouseleave', () => {
        dot.style.transform = 'translate(-50%, -50%) scale(1)';
      });
    });
  }

  window.Portfolio.cursor = {
    initCursor
  };
})(window, document);
