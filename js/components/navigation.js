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

    // 4. Real-time Scroll Spy for Active Section Navbar Link
    function initScrollSpy() {
      const sectionIds = ['portfolio', 'timeline', 'skills', 'education', 'contact'];
      const sectionElements = [];

      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          sectionElements.push({ id, element: el });
        }
      });

      if (!sectionElements.length) return;

      const isPortfolioPage = window.location.pathname.includes('portfolio.html');

      function updateActiveNav() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const viewportHeight = window.innerHeight;
        const triggerPoint = scrollY + viewportHeight * 0.35;

        let currentActiveId = null;

        // Check if user has reached the bottom of the page
        const isAtBottom = (window.innerHeight + scrollY) >= (document.documentElement.scrollHeight - 60);

        if (isAtBottom) {
          currentActiveId = sectionElements[sectionElements.length - 1].id;
        } else {
          sectionElements.forEach(({ id, element }) => {
            const top = element.offsetTop;
            const height = element.offsetHeight;
            if (triggerPoint >= top && triggerPoint < top + height) {
              currentActiveId = id;
            }
          });
        }

        navLinks.forEach((link) => {
          const href = link.getAttribute('href') || '';
          const isMatch =
            (currentActiveId && (href === `#${currentActiveId}` || href.endsWith(`#${currentActiveId}`))) ||
            (isPortfolioPage && currentActiveId === 'portfolio' && (href === '#portfolio' || href.includes('portfolio')));

          if (isMatch) {
            link.classList.add('is-active');
          } else {
            link.classList.remove('is-active');
          }
        });
      }

      if (lenis) {
        lenis.on('scroll', updateActiveNav);
      } else {
        window.addEventListener('scroll', updateActiveNav, { passive: true });
      }

      // Sync with ScrollTrigger refresh if available
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.addEventListener('refresh', updateActiveNav);
      }

      // Initial check on load
      updateActiveNav();
    }

    initScrollSpy();
  }

  window.Portfolio.navigation = {
    initNavigation
  };
})(window, document);
