/**
 * NAVIGATION CONTROLLER (Header Scroll, Mobile Drawer, Stepper Progress & Smooth Anchor Scrolling)
 * Module: js/components/navigation.js
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  function clamp01(value) {
    return Math.min(1, Math.max(0, value));
  }

  function initNavigation() {
    const header = document.getElementById('header');
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    const scrollService = window.Portfolio.scroll;
    const lenis = scrollService ? scrollService.getLenis() : null;

    // 1. Header scroll state & direction-aware compact controller (is-scrolled, is-compact)
    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    let directionAnchorY = lastScrollY;
    const DIRECTION_THRESHOLD = 8;

    function handleHeaderScroll() {
      if (!header) return;
      const scrollY = Math.max(0, window.pageYOffset || document.documentElement.scrollTop || 0);

      if (scrollY > 40) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
        header.classList.remove('is-compact');
        directionAnchorY = scrollY;
        lastScrollY = scrollY;
        return;
      }

      if (header.classList.contains('is-menu-open')) {
        header.classList.remove('is-compact');
        lastScrollY = scrollY;
        directionAnchorY = scrollY;
        return;
      }

      const deltaFromAnchor = scrollY - directionAnchorY;
      if (scrollY > 50 && deltaFromAnchor > DIRECTION_THRESHOLD) {
        header.classList.add('is-compact');
        directionAnchorY = scrollY;
      } else if (deltaFromAnchor < -DIRECTION_THRESHOLD) {
        header.classList.remove('is-compact');
        directionAnchorY = scrollY;
      }

      // Reset anchor when direction reverses so reversal triggers cleanly after threshold
      if ((scrollY > lastScrollY && deltaFromAnchor < 0) || (scrollY < lastScrollY && deltaFromAnchor > 0)) {
        directionAnchorY = lastScrollY;
      }
      lastScrollY = scrollY;
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
        if (isActive) {
          header.classList.remove('is-compact');
        }
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
          if (targetId === '#contact' && window.innerWidth > 768) {
            const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            scrollService.scrollTo(maxScroll, {
              duration: 1.4
            });
            return;
          }
          scrollService.scrollTo(targetElement, {
            offset: -70,
            duration: 1.4
          });
        }
      });
    });

    // 4. Real-time Scroll Spy: Cumulative Sequential Outline-to-Fill & Connector Stepper
    function initScrollSpy() {
      const sectionIds = ['project', 'career', 'skills', 'education', 'contact'];
      const navList = navMenu ? navMenu.querySelector('.nav-list') : null;
      if (!navList) return;

      const connectorFills = Array.from(navList.querySelectorAll('.nav-connector-fill'));
      const linkById = new Map();

      navLinks.forEach((link) => {
        const href = link.getAttribute('href') || '';
        const hashIdx = href.indexOf('#');
        if (hashIdx !== -1) {
          linkById.set(href.slice(hashIdx + 1), link);
        }
      });

      const sectionItems = [];
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        const link = linkById.get(id);
        if (el && link) {
          sectionItems.push({ id, element: el, link });
        }
      });

      if (!sectionItems.length) return;

      let cachedSectionMetrics = [];
      let cachedViewportHeight = window.innerHeight || 0;
      let cachedDocScrollHeight = document.documentElement.scrollHeight || 0;
      let scrollRafId = null;
      let navResizeTimer = null;

      const lastTextProgress = new Array(sectionItems.length).fill(-1);
      const lastLineProgress = new Array(connectorFills.length).fill(-1);

      function measureScrollSpyMetrics() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        cachedViewportHeight = window.innerHeight || 0;
        cachedDocScrollHeight = document.documentElement.scrollHeight || 0;

        cachedSectionMetrics = sectionItems.map((item) => {
          const spacer =
            item.element.parentElement && item.element.parentElement.classList.contains('pin-spacer')
              ? item.element.parentElement
              : null;
          const target = spacer || item.element;
          const rect = target.getBoundingClientRect();
          return {
            id: item.id,
            link: item.link,
            top: rect.top + scrollY,
            height: target.offsetHeight || rect.height
          };
        });
      }

      function applyStepperProgress(activeIdx, rawProgress) {
        const lastIdx = cachedSectionMetrics.length - 1;

        for (let i = 0; i < cachedSectionMetrics.length; i++) {
          const item = cachedSectionMetrics[i];
          const hasConnector = i < connectorFills.length;
          let textProgress = 0;
          let lineProgress = 0;

          if (activeIdx === -1) {
            item.link.classList.remove('is-active', 'is-passed');
          } else if (i < activeIdx) {
            textProgress = 1;
            lineProgress = 1;
            item.link.classList.remove('is-active');
            item.link.classList.add('is-passed');
          } else if (i === activeIdx) {
            if (i < lastIdx) {
              // Sequential estafet: 0-50% fills text, 50-100% fills trailing connector line
              textProgress = clamp01(rawProgress / 0.5);
              lineProgress = clamp01((rawProgress - 0.5) / 0.5);
            } else {
              // Final section (CONTACT) has no trailing connector
              textProgress = clamp01(rawProgress);
            }
            item.link.classList.add('is-active');
            item.link.classList.remove('is-passed');
          } else {
            item.link.classList.remove('is-active', 'is-passed');
          }

          const roundedText = Math.round(textProgress * 1000) / 1000;
          if (lastTextProgress[i] !== roundedText) {
            lastTextProgress[i] = roundedText;
            item.link.style.setProperty('--nav-progress', String(roundedText));
          }

          if (hasConnector) {
            const roundedLine = Math.round(lineProgress * 1000) / 1000;
            if (lastLineProgress[i] !== roundedLine) {
              lastLineProgress[i] = roundedLine;
              connectorFills[i].style.setProperty('--line-progress', String(roundedLine));
            }
          }
        }
      }

      function updateActiveNav(forcedSectionId) {
        if (!cachedSectionMetrics.length) {
          measureScrollSpyMetrics();
        }

        const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        const triggerPoint = scrollY + cachedViewportHeight * 0.35;

        let activeIdx = -1;
        let rawProgress = 0;

        if (typeof forcedSectionId === 'string' && forcedSectionId !== 'hero' && forcedSectionId !== '#hero') {
          const forcedClean = forcedSectionId.replace('#', '');
          const forcedIdx = cachedSectionMetrics.findIndex((sec) => sec.id === forcedClean);
          if (forcedIdx !== -1) {
            activeIdx = forcedIdx;
            rawProgress = forcedIdx === cachedSectionMetrics.length - 1 ? 1 : 0.5;
          }
        } else {
          const lastIdx = cachedSectionMetrics.length - 1;
          const isAtBottom = cachedViewportHeight + scrollY >= cachedDocScrollHeight - 12;

          if (isAtBottom) {
            activeIdx = lastIdx;
            rawProgress = 1;
          } else {
            const maxTriggerPoint = Math.max(1, cachedDocScrollHeight - cachedViewportHeight * 0.65);
            const contactSec = cachedSectionMetrics[lastIdx];
            const prevSec = lastIdx > 0 ? cachedSectionMetrics[lastIdx - 1] : null;
            const minContactTop = prevSec ? prevSec.top + Math.max(1, prevSec.height * 0.5) : 0;
            const effectiveContactTop = Math.max(
              minContactTop,
              Math.min(contactSec.top, maxTriggerPoint - Math.max(180, contactSec.height * 0.45))
            );

            for (let i = 0; i < cachedSectionMetrics.length; i++) {
              const sec = cachedSectionMetrics[i];
              const isLast = i === lastIdx;
              const isBeforeLast = i === lastIdx - 1;
              const effectiveTop = isLast ? effectiveContactTop : sec.top;
              const effectiveBottom = isLast
                ? Math.max(effectiveTop + 1, maxTriggerPoint)
                : isBeforeLast
                  ? effectiveContactTop
                  : sec.top + sec.height;

              if (triggerPoint >= effectiveTop && (isLast || triggerPoint < effectiveBottom)) {
                activeIdx = i;
                const effectiveHeight = Math.max(1, effectiveBottom - effectiveTop);
                rawProgress = clamp01((triggerPoint - effectiveTop) / effectiveHeight);
                break;
              }
            }
          }
        }

        applyStepperProgress(activeIdx, rawProgress);
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
            if (window.innerWidth > 768 && navMenu && navMenu.classList.contains('is-active')) {
              setMobileMenuOpen(false);
            }
            updateActiveNav();
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
      handleHeaderScroll();
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
