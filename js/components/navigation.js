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

    // 4. Navbar orange collision engine (Dual-layer clip-path)
    function initNavbarCollision() {
      const navInverted = document.getElementById('navInverted');
      if (!navInverted || !header) return;

      let targets = [];
      function refreshTargets() {
        targets = Array.from(
          document.querySelectorAll(
            '[data-nav-collision="true"], .project-img-frame, .bento-card'
          )
        );
      }

      refreshTargets();

      let ticking = false;

      function updateCollision() {
        ticking = false;
        const headerHeight = header.offsetHeight || 70;
        const windowWidth = window.innerWidth;
        const intersectingRects = [];

        for (let i = 0; i < targets.length; i++) {
          const el = targets[i];
          const rect = el.getBoundingClientRect();

          // Check vertical intersection with header band (0 to headerHeight)
          if (rect.bottom > 0 && rect.top < headerHeight) {
            const top = Math.max(0, rect.top);
            const bottom = Math.min(headerHeight, rect.bottom);
            const left = Math.max(0, rect.left);
            const right = Math.min(windowWidth, rect.right);

            if (right > left && bottom > top) {
              intersectingRects.push({
                left: Math.round(left),
                right: Math.round(right),
                top: Math.round(top),
                bottom: Math.round(bottom)
              });
            }
          }
        }

        if (intersectingRects.length === 0) {
          navInverted.style.clipPath = 'polygon(0 0, 0 0, 0 0, 0 0)';
        } else {
          const polyPoints = intersectingRects.map(
            (b) =>
              `${b.left}px ${b.top}px, ${b.right}px ${b.top}px, ${b.right}px ${b.bottom}px, ${b.left}px ${b.bottom}px, ${b.left}px ${b.top}px`
          );
          navInverted.style.clipPath = `polygon(${polyPoints.join(', ')})`;
        }
      }

      function requestUpdate() {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateCollision);
        }
      }

      if (lenis) {
        lenis.on('scroll', requestUpdate);
      }
      window.addEventListener('scroll', requestUpdate, { passive: true });
      window.addEventListener('resize', () => {
        refreshTargets();
        requestUpdate();
      });
      window.addEventListener('load', () => {
        refreshTargets();
        requestUpdate();
      });

      // Synchronize hover state between base links and inverted links
      const baseLinks = document.querySelectorAll('.nav-container-base .nav-link');
      const invertedLinks = document.querySelectorAll('.nav-inverted-wrapper .nav-link');
      baseLinks.forEach((link, idx) => {
        link.addEventListener('mouseenter', () => {
          if (invertedLinks[idx]) invertedLinks[idx].classList.add('is-hovered');
        });
        link.addEventListener('mouseleave', () => {
          if (invertedLinks[idx]) invertedLinks[idx].classList.remove('is-hovered');
        });
      });

      // Initial execution
      requestUpdate();
    }

    initNavbarCollision();
  }

  window.Portfolio.navigation = {
    initNavigation
  };
})(window, document);
