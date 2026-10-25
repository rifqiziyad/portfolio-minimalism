/**
 * DYNAMIC CURSOR BLOB & GLOW (Smooth Lerp Choreography)
 * Module: js/components/cursor.js
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  function initCursor() {
    const blob = document.getElementById('cursor-blob');
    const glow = document.getElementById('cursor-glow');
    const dot = document.getElementById('cursor-dot');

    if (!blob && !glow && !dot) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let blobX = mouseX;
    let blobY = mouseY;
    let glowX = mouseX;
    let glowY = mouseY;
    let isMoving = false;
    let isHoveringInteractive = false;

    // Track real mouse position
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isMoving) {
        document.body.classList.add('has-cursor');
        isMoving = true;
      }
    });

    window.addEventListener('mouseleave', () => {
      document.body.classList.remove('has-cursor');
      isMoving = false;
    });

    // Check interactive elements for cursor expansion (only clickable elements)
    const interactiveElements = document.querySelectorAll('a, button');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        isHoveringInteractive = true;
        if (blob) {
          blob.style.transform = 'translate(-50%, -50%) scale(1.25)';
          blob.style.filter = 'blur(45px)';
        }
        if (glow) {
          glow.style.transform = 'translate(-50%, -50%) scale(2.2)';
        }
        if (dot) {
          dot.style.transform = 'translate(-50%, -50%) scale(0.5)';
        }
      });

      el.addEventListener('mouseleave', () => {
        isHoveringInteractive = false;
        if (blob) {
          blob.style.transform = 'translate(-50%, -50%) scale(1)';
          blob.style.filter = 'blur(40px)';
        }
        if (glow) {
          glow.style.transform = 'translate(-50%, -50%) scale(1)';
        }
        if (dot) {
          dot.style.transform = 'translate(-50%, -50%) scale(1)';
        }
      });
    });

    // High-performance requestAnimationFrame loop with linear interpolation (Lerp)
    function renderCursor() {
      // Sharp central dot follows 1:1 instantaneously for clicking precision
      if (dot) {
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;
      }

      // Blob follows with smooth fluid lag
      const blobSpeed = isHoveringInteractive ? 0.09 : 0.065;
      blobX += (mouseX - blobX) * blobSpeed;
      blobY += (mouseY - blobY) * blobSpeed;

      // Inner glow is snappier
      const glowSpeed = 0.18;
      glowX += (mouseX - glowX) * glowSpeed;
      glowY += (mouseY - glowY) * glowSpeed;

      if (blob) {
        blob.style.left = `${blobX}px`;
        blob.style.top = `${blobY}px`;
      }

      if (glow) {
        glow.style.left = `${glowX}px`;
        glow.style.top = `${glowY}px`;
      }

      requestAnimationFrame(renderCursor);
    }

    // Only run cursor animation on non-touch devices
    if (window.matchMedia('(pointer: fine)').matches) {
      requestAnimationFrame(renderCursor);
    }
  }

  window.Portfolio.cursor = {
    initCursor
  };
})(window, document);
