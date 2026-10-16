/**
 * NAVIGATION CONTROLLER (Header Scroll, Mobile Drawer & Smooth Anchor Scrolling)
 * Module: js/components/navigation.js
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  function initNavigation() {
    const header = document.getElementById('header');
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    const scrollService = window.Portfolio.scroll;
    const lenis = scrollService ? scrollService.getLenis() : null;

    // 1. Header scroll state controller (is-scrolled)
    function handleHeaderScroll() {
      if (!header) return;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollY > 50) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    if (lenis) {
      lenis.on('scroll', handleHeaderScroll);
    } else {
      window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    }

    // 2. Mobile menu drawer controller
    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        const isActive = mobileToggle.classList.toggle('is-active');
        navMenu.classList.toggle('is-active', isActive);
        if (header) {
          header.classList.toggle('is-menu-open', isActive);
        }
        document.body.style.overflow = isActive ? 'hidden' : '';
      });

      // Close menu when clicking any nav link
      navLinks.forEach((link) => {
        link.addEventListener('click', () => {
          mobileToggle.classList.remove('is-active');
          navMenu.classList.remove('is-active');
          if (header) {
            header.classList.remove('is-menu-open');
          }
          document.body.style.overflow = '';
        });
      });
    }

    // 3. Smooth anchor scrolling
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement && scrollService) {
          e.preventDefault();
          scrollService.scrollTo(targetElement, {
            offset: -70,
            duration: 1.4
          });
        }
      });
    });
  }

  window.Portfolio.navigation = {
    initNavigation
  };
})(window, document);
