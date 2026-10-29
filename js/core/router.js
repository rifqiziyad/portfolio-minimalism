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
  let homeContext = null;
  let portfolioContext = null;
  let hasCompletedHeroIntro = false;

  function getLenis() {
    return window.Portfolio.scroll ? window.Portfolio.scroll.getLenis() : null;
  }

  function getScrollY() {
    const lenis = getLenis();
    if (lenis && typeof lenis.scroll === 'number') {
      return lenis.scroll;
    }
    return window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  function mountHomeAnimations(skipHeroIntro = false) {
    if (typeof gsap === 'undefined') return;
    const viewHome = document.getElementById('viewHome');
    if (!viewHome) return;

    if (homeContext) {
      homeContext.revert();
    }

    homeContext = gsap.context(() => {
      const app = window.Portfolio || {};
      if (app.hero && typeof app.hero.initHeroAnimations === 'function') {
        app.hero.initHeroAnimations(skipHeroIntro || hasCompletedHeroIntro);
        hasCompletedHeroIntro = true;
      }
      if (app.parallax && typeof app.parallax.initParallaxAnimations === 'function') {
        app.parallax.initParallaxAnimations(viewHome);
      }
      if (app.timeline && typeof app.timeline.initTimelineChoreography === 'function') {
        app.timeline.initTimelineChoreography();
      }
      if (app.skills && typeof app.skills.initSkillsCrystalAnimation === 'function') {
        app.skills.initSkillsCrystalAnimation();
      }
      if (app.contact && typeof app.contact.initContactCrystalAnimation === 'function') {
        app.contact.initContactCrystalAnimation();
      }
    }, viewHome);
  }

  function unmountHomeAnimations() {
    if (homeContext) {
      homeContext.revert();
      homeContext = null;
    }
  }

  function mountPortfolioAnimations() {
    if (typeof gsap === 'undefined') return;
    const viewPortfolio = document.getElementById('viewPortfolio');
    if (!viewPortfolio) return;

    if (portfolioContext) {
      portfolioContext.revert();
    }

    portfolioContext = gsap.context(() => {
      const app = window.Portfolio || {};
      if (app.parallax && typeof app.parallax.initParallaxAnimations === 'function') {
        app.parallax.initParallaxAnimations(viewPortfolio);
      }
    }, viewPortfolio);
  }

  function unmountPortfolioAnimations() {
    if (portfolioContext) {
      portfolioContext.revert();
      portfolioContext = null;
    }
  }

  function updateBrowserUrl(view, targetAnchor) {
    try {
      const isFileProtocol = window.location.protocol === 'file:';
      let targetUrl = '';

      if (isFileProtocol) {
        // When opened directly via file://, origin is null.
        // Changing hash is universally allowed and updates browser history without SecurityError!
        targetUrl = view === 'portfolio' ? '#portfolio' : (targetAnchor || '#home');
      } else {
        if (view === 'portfolio') {
          targetUrl = 'portfolio.html';
        } else {
          targetUrl = 'index.html';
          if (targetAnchor && targetAnchor !== '#hero' && targetAnchor !== '#') {
            targetUrl += targetAnchor.startsWith('#') ? targetAnchor : '#' + targetAnchor;
          }
        }
      }

      window.history.pushState({ view, targetAnchor: targetAnchor || null }, TITLES[view] || document.title, targetUrl);
    } catch (err) {
      // Fallback: update state without changing URL to prevent console noise
      try {
        window.history.pushState({ view, targetAnchor: targetAnchor || null }, TITLES[view] || document.title, null);
      } catch (innerErr) {
        // Silent
      }
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

    // GSAP Kinetic Brutalist Fade Transition
    if (typeof gsap !== 'undefined') {
      gsap.to(fromEl, {
        opacity: 0,
        duration: 0.22,
        ease: 'power2.inOut',
        onComplete: () => {
          // 1. Unmount outgoing view animations
          if (isGoingToPortfolio) {
            unmountHomeAnimations();
          } else {
            unmountPortfolioAnimations();
          }

          // 2. Swap DOM visibility
          fromEl.style.display = 'none';
          fromEl.classList.remove('is-active');

          toEl.style.display = 'block';
          toEl.classList.add('is-active');
          currentViewId = targetView;

          // 3. Inform Lenis about the new scroll height
          if (lenis && typeof lenis.resize === 'function') {
            lenis.resize();
          }

          // 4. Restore scroll offset BEFORE mounting triggers so ScrollTrigger calculates at destination
          if (isGoingToPortfolio) {
            if (lenis) {
              lenis.scrollTo(0, { immediate: true });
              if (typeof lenis.emit === 'function') lenis.emit();
            } else {
              window.scrollTo(0, 0);
            }
            mountPortfolioAnimations();
          } else {
            const targetPos = targetAnchor ? null : (homeSavedScrollY > 0 ? homeSavedScrollY : 0);
            if (targetAnchor) {
              scrollToAnchor(targetAnchor, true);
            } else {
              if (lenis) {
                lenis.scrollTo(targetPos, { immediate: true });
                if (typeof lenis.emit === 'function') lenis.emit();
              } else {
                window.scrollTo(0, targetPos);
              }
            }
            mountHomeAnimations(true);
          }

          // 5. Recalibrate dimensions & triggers after scroll restored
          if (lenis && typeof lenis.resize === 'function') {
            lenis.resize();
          }
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
          }

          // 6. Animate incoming view opacity in cleanly
          gsap.fromTo(
            toEl,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.32,
              ease: 'power2.out',
              clearProps: 'opacity',
              onComplete: () => {
                isTransitioning = false;

                if (lenis && typeof lenis.resize === 'function') {
                  lenis.resize();
                }
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
      if (isGoingToPortfolio) {
        unmountHomeAnimations();
      } else {
        unmountPortfolioAnimations();
      }
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
        if (immediate && typeof lenis.emit === 'function') {
          lenis.emit();
        }
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
          window.location.hash === '#portfolio' ||
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
    const hasPortfolioHash = window.location.hash === '#portfolio' || window.location.hash === '#portfolio-archive';
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

      const lenis = getLenis();
      if (lenis && typeof lenis.resize === 'function') lenis.resize();
      mountPortfolioAnimations();

      // Replace initial history state so back button works reliably
      try {
        const isFileProtocol = window.location.protocol === 'file:';
        window.history.replaceState({ view: 'portfolio' }, TITLES.portfolio, isFileProtocol ? null : window.location.href);
      } catch (e) {}
    } else {
      currentViewId = 'home';
      viewPortfolio.style.display = 'none';
      viewPortfolio.classList.remove('is-active');

      viewHome.style.display = 'block';
      viewHome.classList.add('is-active');
      document.title = TITLES.home;

      const lenis = getLenis();
      if (lenis && typeof lenis.resize === 'function') lenis.resize();
      mountHomeAnimations(false);

      try {
        const isFileProtocol = window.location.protocol === 'file:';
        window.history.replaceState({ view: 'home' }, TITLES.home, isFileProtocol ? null : window.location.href);
      } catch (e) {}
    }
  }

  window.Portfolio.router = {
    initRouter,
    navigateTo: switchView,
    getCurrentView: () => currentViewId
  };
})(window, document);

