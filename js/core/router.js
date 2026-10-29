/**
 * CLIENT-SIDE SPA ROUTER MODULE (React-like Navigation with Vanilla JS & History API)
 * Module: js/core/router.js
 * Enables seamless view swapping between Landing Page (Home) and Archive (All Projects)
 * without full page reloads, accompanied by 60fps kinetic GSAP transitions.
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  const TITLES = {
    home: 'RIFQI ZIYAD IMTINAN — Frontend Developer',
    portfolio: 'ALL PROJECTS — RIFQI ZIYAD IMTINAN'
  };

  let currentViewId = 'home';
  let isTransitioning = false;
  let homeSavedScrollY = 0;

  function getLenis() {
    return window.Portfolio.scroll ? window.Portfolio.scroll.getLenis() : null;
  }

  function getScrollY() {
    return window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  function updateBrowserUrl(view, targetAnchor) {
    try {
      const isFileProtocol = window.location.protocol === 'file:';
      let targetUrl = '';

      if (view === 'portfolio') {
        targetUrl = isFileProtocol ? 'portfolio.html' : 'portfolio.html';
      } else {
        targetUrl = isFileProtocol ? 'index.html' : 'index.html';
        if (targetAnchor && targetAnchor !== '#hero' && targetAnchor !== '#') {
          targetUrl += targetAnchor.startsWith('#') ? targetAnchor : '#' + targetAnchor;
        }
      }

      if (window.location.pathname.endsWith(targetUrl) && !targetAnchor) {
        return;
      }

      window.history.pushState({ view, targetAnchor: targetAnchor || null }, TITLES[view] || document.title, targetUrl);
    } catch (err) {
      // Graceful fallback for restricted file:// security sandbox environments
      console.warn('[SPA Router] History pushState suppressed:', err.message);
    }
  }

  function switchView(targetView, targetAnchor, updateHistory = true) {
    if (isTransitioning) return;

    const viewHome = document.getElementById('viewHome');
    const viewPortfolio = document.getElementById('viewPortfolio');
    const backToTop = document.getElementById('backToTop');

    if (!viewHome || !viewPortfolio) return;

    // If already in target view
    if (currentViewId === targetView) {
      if (targetAnchor) {
        scrollToAnchor(targetAnchor);
      }
      return;
    }

    isTransitioning = true;
    const isGoingToPortfolio = targetView === 'portfolio';
    const fromEl = isGoingToPortfolio ? viewHome : viewPortfolio;
    const toEl = isGoingToPortfolio ? viewPortfolio : viewHome;

    // Save scroll position when leaving home view
    if (!isGoingToPortfolio) {
      // Coming back to home
    } else {
      homeSavedScrollY = getScrollY();
    }

    // Update document title
    document.title = TITLES[targetView] || TITLES.home;

    // Update Back to Top target
    if (backToTop) {
      backToTop.setAttribute('href', isGoingToPortfolio ? '#portfolio' : '#hero');
    }

    // Update History state
    if (updateHistory) {
      updateBrowserUrl(targetView, targetAnchor);
    }

    const lenis = getLenis();

    // GSAP Kinetic Brutalist Fade & Slide Transition
    if (typeof gsap !== 'undefined') {
      gsap.to(fromEl, {
        opacity: 0,
        y: isGoingToPortfolio ? -24 : 24,
        duration: 0.28,
        ease: 'power2.inOut',
        onComplete: () => {
          fromEl.style.display = 'none';
          fromEl.classList.remove('is-active');

          toEl.style.display = 'block';
          toEl.classList.add('is-active');
          currentViewId = targetView;

          // Scroll orchestration
          if (isGoingToPortfolio) {
            if (lenis) {
              lenis.scrollTo(0, { immediate: true });
            } else {
              window.scrollTo(0, 0);
            }
          } else {
            // Returning to home
            if (targetAnchor) {
              scrollToAnchor(targetAnchor, true);
            } else if (homeSavedScrollY > 0) {
              if (lenis) {
                lenis.scrollTo(homeSavedScrollY, { immediate: true });
              } else {
                window.scrollTo(0, homeSavedScrollY);
              }
            } else {
              if (lenis) {
                lenis.scrollTo(0, { immediate: true });
              } else {
                window.scrollTo(0, 0);
              }
            }
          }

          // Animate new view in
          gsap.fromTo(
            toEl,
            {
              opacity: 0,
              y: isGoingToPortfolio ? 30 : -20
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease: 'power2.out',
              clearProps: 'transform,opacity',
              onComplete: () => {
                isTransitioning = false;

                // Recalibrate GSAP ScrollTrigger
                if (typeof ScrollTrigger !== 'undefined') {
                  ScrollTrigger.refresh();
                }

                // Notify navigation controller to refresh active nav links
                if (window.Portfolio.navigation && typeof window.Portfolio.navigation.syncActiveState === 'function') {
                  window.Portfolio.navigation.syncActiveState();
                }
              }
            }
          );
        }
      });
    } else {
      // Fallback for non-GSAP environments
      fromEl.style.display = 'none';
      fromEl.classList.remove('is-active');
      toEl.style.display = 'block';
      toEl.classList.add('is-active');
      currentViewId = targetView;
      isTransitioning = false;
      if (isGoingToPortfolio) {
        window.scrollTo(0, 0);
      } else if (targetAnchor) {
        scrollToAnchor(targetAnchor, true);
      }
    }
  }

  function scrollToAnchor(targetAnchor, immediate = false) {
    if (!targetAnchor || targetAnchor === '#') return;
    const cleanId = targetAnchor.startsWith('#') ? targetAnchor : '#' + targetAnchor;
    const targetEl = document.querySelector(cleanId);
    if (!targetEl) return;

    const scrollService = window.Portfolio.scroll;
    if (scrollService && !immediate) {
      scrollService.scrollTo(targetEl, { offset: -70, duration: 1.2 });
    } else {
      const top = targetEl.getBoundingClientRect().top + getScrollY() - 70;
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(top, { immediate: immediate });
      } else {
        window.scrollTo({ top, behavior: immediate ? 'auto' : 'smooth' });
      }
    }
  }

  // Intercept navigation link clicks across the entire document
  function setupLinkInterception() {
    document.addEventListener('click', (e) => {
      // Find nearest anchor tag
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Ignore external links, mailto, tel, target="_blank"
      if (href.startsWith('mailto:') || href.startsWith('tel:') || link.getAttribute('target') === '_blank') {
        return;
      }

      // 1. Click to All Projects Archive (e.g. "EXPLORE ALL PROJECTS ↗" or nav link)
      if (link.hasAttribute('data-spa-link') && link.getAttribute('data-spa-link') === 'portfolio') {
        e.preventDefault();
        switchView('portfolio', null, true);
        return;
      }

      if (href === 'portfolio.html' || href.endsWith('/portfolio.html')) {
        e.preventDefault();
        switchView('portfolio', null, true);
        return;
      }

      // 2. Click to Brand Logo ("RIFQI")
      if (link.classList.contains('nav-brand')) {
        if (currentViewId === 'portfolio') {
          e.preventDefault();
          switchView('home', '#hero', true);
          return;
        }
      }

      // 3. Click to Home sections from Portfolio view (e.g. href="index.html#timeline" or href="#timeline")
      if (currentViewId === 'portfolio') {
        if (href.includes('index.html#') || href.startsWith('#')) {
          const hashIndex = href.indexOf('#');
          const anchor = hashIndex !== -1 ? href.slice(hashIndex) : '#hero';

          if (anchor === '#portfolio') {
            // Stay in portfolio view, scroll to top of archive
            e.preventDefault();
            const lenis = getLenis();
            if (lenis) lenis.scrollTo(0, { duration: 1 });
            else window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }

          e.preventDefault();
          switchView('home', anchor, true);
          return;
        }

        if (href === 'index.html' || href === '/' || href === './') {
          e.preventDefault();
          switchView('home', '#hero', true);
          return;
        }
      }
    });
  }

  // Listen to browser Back / Forward buttons (Popstate)
  function setupPopstateListener() {
    window.addEventListener('popstate', (e) => {
      const state = e.state;
      if (state && state.view) {
        switchView(state.view, state.targetAnchor || null, false);
      } else {
        // Derive from URL
        const isPortfolioUrl = window.location.pathname.includes('portfolio.html') ||
          window.location.search.includes('view=portfolio') ||
          window.location.hash === '#portfolio-archive';

        switchView(isPortfolioUrl ? 'portfolio' : 'home', window.location.hash || null, false);
      }
    });
  }

  // Initial routing detection on page load
  function initRouter() {
    setupLinkInterception();
    setupPopstateListener();

    const viewHome = document.getElementById('viewHome');
    const viewPortfolio = document.getElementById('viewPortfolio');
    if (!viewHome || !viewPortfolio) return;

    // Check if user landed on portfolio view via URL params, pathname, or sessionStorage redirect
    const urlParams = new URLSearchParams(window.location.search);
    const hasViewPortfolioParam = urlParams.get('view') === 'portfolio';
    const isPortfolioPath = window.location.pathname.includes('portfolio.html');
    const hasPortfolioHash = window.location.hash === '#portfolio-archive';
    const hasSessionRedirect = sessionStorage.getItem('spa_redirect') === 'portfolio';

    if (hasSessionRedirect) {
      sessionStorage.removeItem('spa_redirect');
    }

    if (hasViewPortfolioParam || isPortfolioPath || hasPortfolioHash || hasSessionRedirect) {
      currentViewId = 'portfolio';
      viewHome.style.display = 'none';
      viewHome.classList.remove('is-active');

      viewPortfolio.style.display = 'block';
      viewPortfolio.classList.add('is-active');
      document.title = TITLES.portfolio;

      const backToTop = document.getElementById('backToTop');
      if (backToTop) backToTop.setAttribute('href', '#portfolio');

      // Replace initial history state so back button works reliably
      try {
        window.history.replaceState({ view: 'portfolio' }, TITLES.portfolio, window.location.href);
      } catch (e) {}
    } else {
      currentViewId = 'home';
      viewPortfolio.style.display = 'none';
      viewPortfolio.classList.remove('is-active');

      viewHome.style.display = 'block';
      viewHome.classList.add('is-active');
      document.title = TITLES.home;

      try {
        window.history.replaceState({ view: 'home' }, TITLES.home, window.location.href);
      } catch (e) {}
    }
  }

  window.Portfolio.router = {
    initRouter,
    navigateTo: switchView,
    getCurrentView: () => currentViewId
  };
})(window, document);

