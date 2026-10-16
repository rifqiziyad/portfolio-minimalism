/**
 * LIVE JAKARTA / INDONESIA (WIB / UTC+7) TIME CLOCK
 * Module: js/components/clock.js
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  function initClock() {
    const localTimeDisplay = document.getElementById('localTimeDisplay');
    if (!localTimeDisplay) return;

    const options = {
      timeZone: 'Asia/Jakarta',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };

    function updateLocalTime() {
      const now = new Intl.DateTimeFormat('en-GB', options).format(new Date());
      localTimeDisplay.textContent = `LOCAL TIME: ${now} WIB`;
    }

    updateLocalTime();
    setInterval(updateLocalTime, 1000);
  }

  window.Portfolio.clock = {
    initClock
  };
})(window, document);
