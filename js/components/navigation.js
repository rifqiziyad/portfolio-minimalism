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

        // If currently in portfolio view
        if (window.Portfolio.router && typeof window.Portfolio.router.getCurrentView === 'function') {
          if (window.Portfolio.router.getCurrentView() === 'portfolio') {
            if (targetId === '#portfolio') {
              // When user is on /all-project and clicks "PORTFOLIO", stay without changing scroll
              e.preventDefault();
              return;
            }
            // For other anchors (e.g. #timeline, #skills, etc.), navigate to home view and scroll to anchor
            e.preventDefault();
            window.Portfolio.router.navigateTo('home', targetId, true);
            return;
          }
        }

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

    // 4. Real-time Scroll Spy for Active Section Navbar Link with Kinetic Indicator Bar
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

      const navList = navMenu ? navMenu.querySelector('.nav-list') : null;
      if (!navList) return;

      // Single floating kinetic bar
      let indicator = navList.querySelector('.nav-indicator');
      if (!indicator) {
        indicator = document.createElement('span');
        indicator.className = 'nav-indicator';
        indicator.id = 'navIndicator';
        indicator.setAttribute('aria-hidden', 'true');
        navList.appendChild(indicator);
      }

      function isPortfolioView() {
        if (window.Portfolio.router && typeof window.Portfolio.router.getCurrentView === 'function') {
          return window.Portfolio.router.getCurrentView() === 'portfolio';
        }
        const path = window.location.pathname;
        return path.includes('all-project') || path.includes('portfolio.html') || window.location.search.includes('view=portfolio');
      }

      let currentActiveId = null;
      let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
      let isLeaping = false;

      function getLinkMetrics(link) {
        if (!link || !navList) return { left: 0, width: 0 };
        const linkRect = link.getBoundingClientRect();
        const listRect = navList.getBoundingClientRect();
        return {
          left: linkRect.left - listRect.left,
          width: linkRect.width
        };
      }

      function calculateIndicatorTarget(metrics, sectionProgress) {
        const compressProgress = Math.min(1, Math.max(0, sectionProgress / 0.85));
        const minRatio = 0.25;
        const currentWidthRatio = 1 - (1 - minRatio) * compressProgress;
        const targetW = metrics.width * currentWidthRatio;
        const targetX = metrics.left + (metrics.width - targetW);
        return { x: targetX, width: targetW };
      }

      function updateActiveNav(forcedSectionId) {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const viewportHeight = window.innerHeight;
        const triggerPoint = scrollY + viewportHeight * 0.35;
        const scrollDelta = scrollY - lastScrollY;
        const scrollDirection = scrollDelta >= 0 ? 1 : -1; // 1 = down, -1 = up
        lastScrollY = scrollY;

        let activeSection = null;
        let activeSectionProgress = 0;

        if (isPortfolioView()) {
          activeSection = { id: 'portfolio', element: document.getElementById('portfolioArchive') || document.getElementById('portfolio') };
          activeSectionProgress = 0;
        } else if (typeof forcedSectionId === 'string' && forcedSectionId !== 'hero' && forcedSectionId !== '#hero') {
          const forcedClean = forcedSectionId.replace('#', '');
          const forcedEl = document.getElementById(forcedClean);
          if (forcedEl) {
            activeSection = { id: forcedClean, element: forcedEl };
            activeSectionProgress = 0;
          }
        } else {
          // Check if user has reached the bottom of the page
          const isAtBottom = (window.innerHeight + scrollY) >= (document.documentElement.scrollHeight - 60);

          if (isAtBottom) {
            activeSection = sectionElements[sectionElements.length - 1];
            activeSectionProgress = 1;
          } else {
            for (let i = 0; i < sectionElements.length; i++) {
              const sec = sectionElements[i];
              const top = sec.element.offsetTop;
              const height = sec.element.offsetHeight;
              if (triggerPoint >= top && triggerPoint < top + height) {
                activeSection = sec;
                activeSectionProgress = Math.min(1, Math.max(0, (triggerPoint - top) / height));
                break;
              }
            }
          }
        }

        const newActiveId = activeSection ? activeSection.id : null;
        const isDesktop = window.innerWidth > 768;

        // Find active link element and toggle CSS classes
        let activeLink = null;
        navLinks.forEach((link) => {
          const href = link.getAttribute('href') || '';
          const isMatch =
            (newActiveId && (href === `#${newActiveId}` || href.endsWith(`#${newActiveId}`))) ||
            (isPortfolioView() && (href === '#portfolio' || href.includes('portfolio') || href.includes('all-project')));

          if (isMatch) {
            link.classList.add('is-active');
            activeLink = link;
          } else {
            link.classList.remove('is-active');
          }
        });

        // Desktop Kinetic Indicator Choreography
        if (!isDesktop || typeof gsap === 'undefined') {
          return;
        }

        // Case 1: Hero / Above all sections (Neutral state)
        if (!newActiveId || !activeLink) {
          if (currentActiveId !== null) {
            currentActiveId = null;
            isLeaping = false;
            gsap.to(indicator, {
              autoAlpha: 0,
              width: 0,
              duration: 0.32,
              ease: 'power2.in',
              overwrite: 'all'
            });
          }
          return;
        }

        const metrics = getLinkMetrics(activeLink);

        // Case 2: New section entered -> KINETIC THROW & BOUNCE LEAP!
        if (newActiveId !== currentActiveId) {
          const isFirstActivation = (currentActiveId === null);
          currentActiveId = newActiveId;
          isLeaping = true;

          // Calculate destination target dimensions based on real-time section progress
          // (If scrolling down: enters from top progress=0 -> lands full width)
          // (If scrolling up: enters from bottom progress~1 -> lands compressed/small in flight!)
          const target = calculateIndicatorTarget(metrics, activeSectionProgress);

          if (isFirstActivation) {
            // First entrance from hero: spring in directly at the link
            gsap.fromTo(
              indicator,
              {
                x: target.x,
                width: 0,
                autoAlpha: 0
              },
              {
                x: target.x,
                width: target.width,
                autoAlpha: 1,
                duration: 0.45,
                ease: 'back.out(1.8)',
                overwrite: 'all',
                onComplete: () => {
                  isLeaping = false;
                }
              }
            );
          } else {
            // Throw leap across from previous nav link to new nav link with elastic bounce!
            gsap.to(indicator, {
              x: target.x,
              width: target.width,
              autoAlpha: 1,
              duration: 0.45,
              ease: 'back.out(1.8)',
              overwrite: 'all',
              onComplete: () => {
                isLeaping = false;
              }
            });
          }
          return;
        }

        // Case 3: Scrolling within the same section -> DIRECTIONAL COMPRESSION & EXPANSION
        if (!isLeaping && metrics.width > 0) {
          const target = calculateIndicatorTarget(metrics, activeSectionProgress);

          gsap.to(indicator, {
            x: target.x,
            width: target.width,
            autoAlpha: 1,
            duration: 0.12,
            ease: 'power1.out',
            overwrite: 'auto'
          });
        }
      }

      if (lenis) {
        lenis.on('scroll', () => updateActiveNav());
      } else {
        window.addEventListener('scroll', () => updateActiveNav(), { passive: true });
      }

      // Sync with ScrollTrigger refresh if available
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.addEventListener('refresh', () => updateActiveNav());
      }

      // Window resize handler
      window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
          if (indicator) {
            gsap.set(indicator, { autoAlpha: 0 });
          }
        } else {
          updateActiveNav();
        }
      });

      // Expose to SPA router
      window.Portfolio.navigation.syncActiveState = updateActiveNav;

      // Initial check on load
      updateActiveNav();
    }

    initScrollSpy();
  }

  window.Portfolio.navigation = {
    initNavigation,
    syncActiveState: () => {}
  };
})(window, document);
