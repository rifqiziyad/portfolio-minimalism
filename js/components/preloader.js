/**
 * FULL-SCREEN LOADING OVERLAY CONTROLLER
 * Module: js/components/preloader.js
 * Tracks real-time browser asset loading (DOM images, web fonts, window load),
 * drives the bottom-to-top white fill on 'PLEASE WAIT' and percentage counter,
 * and smoothly transitions out into the Hero intro animation.
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  let active = false;

  function isActive() {
    return active;
  }

  function initPreloader(options = {}) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    document.documentElement.style.overflow = '';
    active = false;
    if (typeof options.onReveal === 'function') {
      options.onReveal();
    }
  }

  window.Portfolio.preloader = {
    initPreloader,
    isActive
  };
})(window, document);
