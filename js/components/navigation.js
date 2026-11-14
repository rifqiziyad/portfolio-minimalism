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

    // 2. Mobile menu drawer controller (with ARIA state, inert background, Escape & resize close)
    const mainEl = document.getElementById('mainContent');
    const footerEl = document.querySelector('.site-footer');

    function setMobileMenuOpen(nextOpen) {
      if (!mobileToggle || !navMenu) return;
      const isActive = Boolean(nextOpen);
      mobileToggle.classList.toggle('is-active', isActive);
      mobileToggle.setAttribute('aria-expanded', String(isActive));
      navMenu.classList.toggle('is-active', isActive);
      if (header) {
        header.classList.toggle('is-menu-open', isActive);
      }
      document.body.style.overflow = isActive ? 'hidden' : '';
      if (mainEl) mainEl.inert = isActive;
      if (footerEl) footerEl.inert = isActive;
    }

    if (mobileToggle && navMenu) {
      mobileToggle.setAttribute('aria-expanded', 'false');

      mobileToggle.addEventListener('click', () => {
        const nextOpen = !mobileToggle.classList.contains('is-active');
        setMobileMenuOpen(nextOpen);
        if (nextOpen && navLinks.length) {
          navLinks[0].focus({ preventScroll: true });
        }
      });

      // Close menu when clicking any nav link
      navLinks.forEach((link) => {
        link.addEventListener('click', () => {
          setMobileMenuOpen(false);
        });
      });

      // Close menu on Escape key and return focus to toggle
      window.addEventListener('keydown', (e) => {
        if ((e.key === 'Escape' || e.key === 'Esc') && navMenu.classList.contains('is-active')) {
          e.preventDefault();
          setMobileMenuOpen(false);
          mobileToggle.focus({ preventScroll: true });
        }
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

    // 4. Real-time Scroll Spy for Active Section Navbar Link with Kinetic Indicator Bar
    function initScrollSpy() {
      const sectionIds = ['project', 'career', 'skills', 'education', 'contact'];
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

      let currentActiveId = null;
      let isLeaping = false;
      let cachedSectionMetrics = [];
      let cachedLinkMetrics = new Map();
      let cachedViewportHeight = window.innerHeight || 0;
      let cachedDocScrollHeight = document.documentElement.scrollHeight || 0;
      let cachedIsDesktop = window.innerWidth > 768;
      let scrollRafId = null;
      let navResizeTimer = null;

      function measureScrollSpyMetrics() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        cachedViewportHeight = window.innerHeight || 0;
        cachedDocScrollHeight = document.documentElement.scrollHeight || 0;
        cachedIsDesktop = window.innerWidth > 768;

        cachedSectionMetrics = sectionElements.map((sec) => {
          const spacer = sec.element.parentElement && sec.element.parentElement.classList.contains('pin-spacer')
            ? sec.element.parentElement
            : null;
          const target = spacer || sec.element;
          const rect = target.getBoundingClientRect();
          return {
            id: sec.id,
            element: sec.element,
            top: rect.top + scrollY,
            height: target.offsetHeight || rect.height
          };
        });

        const nextLinkMetrics = new Map();
        const listRect = navList.getBoundingClientRect();
        navLinks.forEach((link) => {
          const linkRect = link.getBoundingClientRect();
          nextLinkMetrics.set(link, {
            left: linkRect.left - listRect.left,
            width: linkRect.width
          });
        });
        cachedLinkMetrics = nextLinkMetrics;
      }

      function getLinkMetrics(link) {
        if (!link) return { left: 0, width: 0 };
        return cachedLinkMetrics.get(link) || { left: 0, width: 0 };
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
        if (!cachedSectionMetrics.length) {
          measureScrollSpyMetrics();
        }

        const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        const triggerPoint = scrollY + cachedViewportHeight * 0.35;

        let activeSection = null;
        let activeSectionProgress = 0;

        if (typeof forcedSectionId === 'string' && forcedSectionId !== 'hero' && forcedSectionId !== '#hero') {
          const forcedClean = forcedSectionId.replace('#', '');
          const forcedMatch = cachedSectionMetrics.find((sec) => sec.id === forcedClean);
          if (forcedMatch) {
            activeSection = forcedMatch;
            activeSectionProgress = 0;
          }
        } else {
          const isAtBottom = (cachedViewportHeight + scrollY) >= (cachedDocScrollHeight - 60);

          if (isAtBottom) {
            activeSection = cachedSectionMetrics[cachedSectionMetrics.length - 1];
            activeSectionProgress = 1;
          } else {
            for (let i = 0; i < cachedSectionMetrics.length; i++) {
              const sec = cachedSectionMetrics[i];
              if (triggerPoint >= sec.top && triggerPoint < sec.top + sec.height) {
                activeSection = sec;
                activeSectionProgress = sec.height > 0
                  ? Math.min(1, Math.max(0, (triggerPoint - sec.top) / sec.height))
                  : 0;
                break;
              }
            }
          }
        }

        const newActiveId = activeSection ? activeSection.id : null;
        const isDesktop = cachedIsDesktop;

        // Find active link element and toggle CSS classes
        let activeLink = null;
        navLinks.forEach((link) => {
          const href = link.getAttribute('href') || '';
          const isMatch =
            newActiveId && (href === `#${newActiveId}` || href.endsWith(`#${newActiveId}`));

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

      function scheduleNavUpdate() {
        if (scrollRafId !== null) return;
        scrollRafId = requestAnimationFrame(() => {
          scrollRafId = null;
          updateActiveNav();
        });
      }

      if (lenis) {
        lenis.on('scroll', scheduleNavUpdate);
      } else {
        window.addEventListener('scroll', scheduleNavUpdate, { passive: true });
      }

      // Sync cached bounds with ScrollTrigger refresh and font load
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.addEventListener('refresh', () => {
          measureScrollSpyMetrics();
          updateActiveNav();
        });
      }

      if (document.fonts && document.fonts.ready && document.fonts.status !== 'loaded') {
        document.fonts.ready.then(() => {
          measureScrollSpyMetrics();
          updateActiveNav();
        });
      }

      // Debounced window resize handler
      window.addEventListener(
        'resize',
        () => {
          clearTimeout(navResizeTimer);
          navResizeTimer = setTimeout(() => {
            measureScrollSpyMetrics();
            if (!cachedIsDesktop) {
              if (indicator && typeof gsap !== 'undefined') {
                gsap.set(indicator, { autoAlpha: 0 });
              }
            } else {
              if (navMenu && navMenu.classList.contains('is-active')) {
                setMobileMenuOpen(false);
              }
              updateActiveNav();
            }
          }, 150);
        },
        { passive: true }
      );

      // Expose navigation sync helper
      window.Portfolio.navigation.syncActiveState = (forcedId) => {
        measureScrollSpyMetrics();
        updateActiveNav(forcedId);
      };

      // Initial check on load
      measureScrollSpyMetrics();
      updateActiveNav();
    }

    initScrollSpy();
  }

  window.Portfolio.navigation = {
    initNavigation,
    syncActiveState: () => {}
  };
})(window, document);
