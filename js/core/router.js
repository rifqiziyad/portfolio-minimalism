/**
 * CLIENT-SIDE SPA ROUTER MODULE (React-like Navigation with Vanilla JS & History API)
 * Module: js/core/router.js
 * Routes:
 *   /              -> Home Landing Page (#viewHome)
 *   /all-project   -> Portfolio Archive (#viewPortfolio)
 * Features:
 *   - Clean path resolution with fallback for file:// protocol and static servers
 *   - Zero-baseline ScrollTrigger calibration protocol to guarantee 100% stable parallax
 *   - Precise scroll restoration on browser Back button
 *   - Isolated GSAP contexts (homeContext & portfolioContext) without memory leaks
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

  function getBasePath() {
    const path = window.location.pathname;
    if (path.endsWith('/index.html') || path.endsWith('/portfolio.html')) {
      const lastSlash = path.lastIndexOf('/');
      return path.substring(0, lastSlash);
    }
    if (path.includes('/all-project')) {
      return path.substring(0, path.indexOf('/all-project'));
    }
    if (path.length > 1 && path.endsWith('/')) {
      return path.slice(0, -1);
    }
    return path === '/' ? '' : path;
  }

  function getRouteUrl(view, targetAnchor) {
    const isFileProtocol = window.location.protocol === 'file:';
    if (isFileProtocol) {
      return view === 'portfolio' ? '#all-project' : (targetAnchor || '#home');
    }

    const base = getBasePath();
    if (view === 'portfolio') {
      return (base ? base : '') + '/all-project';
    } else {
      let url = (base ? base : '') + '/';
      if (targetAnchor && targetAnchor !== '#hero' && targetAnchor !== '#' && targetAnchor !== '#home') {
        url += targetAnchor.startsWith('#') ? targetAnchor : '#' + targetAnchor;
      }
      return url;
    }
  }

  function isPortfolioRoute() {
    const pathname = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;
    return pathname.includes('all-project') ||
      pathname.includes('portfolio.html') ||
      search.includes('view=portfolio') ||
      search.includes('route=all-project') ||
      hash === '#all-project' ||
      hash === '#portfolio' ||
      hash === '#portfolio-archive';
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
      const targetUrl = getRouteUrl(view, targetAnchor);
      window.history.pushState({ view, targetAnchor: targetAnchor || null }, TITLES[view] || document.title, targetUrl);
    } catch (err) {
      try {
        window.history.pushState({ view, targetAnchor: targetAnchor || null }, TITLES[view] || document.title, null);
      } catch (innerErr) {
        // Silent fallback
      }
    }
  }

  function ensureImagesLoadedAndCalibrated(container) {
    if (!container) return;
    const images = Array.from(container.querySelectorAll('img'));
    let pending = 0;
    images.forEach((img) => {
      if (!img.complete && img.getAttribute('loading') !== 'lazy') {
        pending++;
        const onDone = () => {
          pending--;
          if (pending === 0 && !isTransitioning) {
            const lenis = getLenis();
            if (lenis && typeof lenis.resize === 'function') lenis.resize();
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
          }
        };
        img.addEventListener('load', onDone, { once: true });
        img.addEventListener('error', onDone, { once: true });
      }
    });
  }

  function switchView(targetView, targetAnchor, updateHistory = true, isPopState = false) {
    if (isTransitioning) return;

    const viewHome = document.getElementById('viewHome');
    const viewPortfolio = document.getElementById('viewPortfolio');
    const backToTop = document.getElementById('backToTop');

    if (!viewHome || !viewPortfolio) return;

    // If already in target view
    if (currentViewId === targetView) {
      if (targetView === 'portfolio') {
        // Stay on /all-project without changing scroll position (as requested)
        return;
      }
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
      // Returning to home
    } else {
      homeSavedScrollY = getScrollY();
    }

    // Update document title & backToTop
    document.title = TITLES[targetView] || TITLES.home;
    if (backToTop) {
      backToTop.setAttribute('href', isGoingToPortfolio ? '#portfolio' : '#hero');
    }

    // Update History state
    if (updateHistory) {
      updateBrowserUrl(targetView, targetAnchor);
    }

    const lenis = getLenis();

    // GSAP Kinetic Brutalist Transition
    if (typeof gsap !== 'undefined') {
      gsap.to(fromEl, {
        opacity: 0,
        duration: 0.18,
        ease: 'power2.inOut',
        onComplete: () => {
          // 1. Unmount outgoing view animations & revert context
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
          void toEl.offsetHeight; // Force synchronous reflow so all child elements have valid dimensions and boxes

          // 3. ZERO-BASELINE RESET: Force scroll position to 0 before calculating triggers!
          window.scrollTo(0, 0);
          if (lenis) {
            lenis.scrollTo(0, { immediate: true });
            if (typeof lenis.resize === 'function') lenis.resize();
            if (typeof lenis.emit === 'function') lenis.emit();
          }

          // 4. Mount incoming view animations in fresh context AT SCROLL = 0
          if (isGoingToPortfolio) {
            mountPortfolioAnimations();
          } else {
            mountHomeAnimations(true);
          }

          // 5. Sort & refresh ScrollTrigger instances at baseline 0
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.sort();
            ScrollTrigger.refresh(true);
          }

          // 6. Apply destination scroll offset after pristine calibration
          if (!isGoingToPortfolio) {
            if (targetAnchor && targetAnchor !== '#hero' && targetAnchor !== '#') {
              const cleanId = targetAnchor.startsWith('#') ? targetAnchor : '#' + targetAnchor;
              const targetEl = document.querySelector(cleanId);
              if (targetEl) {
                if (lenis) {
                  if (typeof lenis.resize === 'function') lenis.resize();
                  lenis.scrollTo(targetEl, { offset: -70, immediate: true });
                  if (typeof lenis.emit === 'function') lenis.emit();
                } else {
                  window.scrollTo(0, Math.max(0, targetEl.offsetTop - 70));
                }
                if (typeof ScrollTrigger !== 'undefined') {
                  ScrollTrigger.update();
                }
              }
            } else if (isPopState && homeSavedScrollY > 0) {
              if (lenis) {
                if (typeof lenis.resize === 'function') lenis.resize();
                lenis.scrollTo(homeSavedScrollY, { immediate: true });
                if (typeof lenis.emit === 'function') lenis.emit();
              }
              window.scrollTo(0, homeSavedScrollY);
              if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.update();
              }
            }
          }

          // 7. Animate incoming view opacity in cleanly
          gsap.fromTo(
            toEl,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.28,
              ease: 'power2.out',
              clearProps: 'opacity',
              onComplete: () => {
                isTransitioning = false;

                // Ensure accurate position when a specific anchor was requested
                if (!isGoingToPortfolio && targetAnchor && targetAnchor !== '#hero' && targetAnchor !== '#') {
                  scrollToAnchor(targetAnchor, true);
                }

                // Sync active navigation link and indicator
                if (window.Portfolio.navigation && typeof window.Portfolio.navigation.syncActiveState === 'function') {
                  const sectionId = typeof targetAnchor === 'string' ? targetAnchor.replace('#', '') : null;
                  window.Portfolio.navigation.syncActiveState(sectionId);
                }

                if (typeof ScrollTrigger !== 'undefined') {
                  ScrollTrigger.refresh();
                }

                // Check for any uncompleted images
                ensureImagesLoadedAndCalibrated(toEl);
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

      window.scrollTo(0, 0);
      if (targetAnchor) {
        scrollToAnchor(targetAnchor, true);
        if (window.Portfolio.navigation && typeof window.Portfolio.navigation.syncActiveState === 'function') {
          const sectionId = typeof targetAnchor === 'string' ? targetAnchor.replace('#', '') : null;
          window.Portfolio.navigation.syncActiveState(sectionId);
        }
      }
    }
  }

  function scrollToAnchor(targetAnchor, immediate = false) {
    if (!targetAnchor || targetAnchor === '#') return;
    const cleanId = targetAnchor.startsWith('#') ? targetAnchor : '#' + targetAnchor;
    const targetEl = document.querySelector(cleanId);
    if (!targetEl) return;

    const scrollService = window.Portfolio.scroll;
    const lenis = getLenis();

    if (immediate) {
      if (lenis) {
        if (typeof lenis.resize === 'function') lenis.resize();
        lenis.scrollTo(targetEl, { offset: -70, immediate: true });
        if (typeof lenis.emit === 'function') lenis.emit();
      } else {
        window.scrollTo(0, Math.max(0, targetEl.offsetTop - 70));
      }
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.update();
      }
    } else {
      if (scrollService && typeof scrollService.scrollTo === 'function') {
        scrollService.scrollTo(targetEl, { offset: -70, duration: 1.2 });
      } else {
        window.scrollTo({
          top: Math.max(0, targetEl.offsetTop - 70),
          behavior: 'smooth'
        });
      }
    }
  }

  // Intercept navigation link clicks across the entire document
  function setupLinkInterception() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Ignore external links, mailto, tel, target="_blank"
      if (href.startsWith('mailto:') || href.startsWith('tel:') || link.getAttribute('target') === '_blank') {
        return;
      }

      // 1. Click to All Projects Archive (EXPLORE ALL PROJECTS ↗ or nav link)
      if (
        (link.hasAttribute('data-spa-link') && link.getAttribute('data-spa-link') === 'portfolio') ||
        href === '/all-project' ||
        href === 'all-project' ||
        href.endsWith('/all-project') ||
        href === 'portfolio.html' ||
        href.endsWith('/portfolio.html')
      ) {
        e.preventDefault();
        switchView('portfolio', null, true, false);
        return;
      }

      // 2. Click to Brand Logo ("RIFQI")
      if (link.classList.contains('nav-brand')) {
        if (currentViewId === 'portfolio') {
          e.preventDefault();
          switchView('home', null, true, false);
          return;
        }
      }

      // 3. Handling navigation links when currently in All Projects view
      if (currentViewId === 'portfolio') {
        // If clicking PORTFOLIO in navbar while on /all-project: stay without changing scroll
        if (href === '#portfolio' || href === '#portfolioArchive' || href.endsWith('#portfolio')) {
          e.preventDefault();
          return;
        }

        // If clicking other home sections (#timeline, #skills, #education, #contact)
        if (href.includes('#') || href.startsWith('#')) {
          const hashIndex = href.indexOf('#');
          const anchor = hashIndex !== -1 ? href.slice(hashIndex) : '#hero';
          e.preventDefault();
          switchView('home', anchor, true, false);
          return;
        }

        // If clicking home root links
        if (href === '/' || href === './' || href === 'index.html' || href.endsWith('/index.html')) {
          e.preventDefault();
          switchView('home', null, true, false);
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
        switchView(state.view, state.targetAnchor || null, false, true);
      } else {
        const isPortfolio = isPortfolioRoute();
        switchView(isPortfolio ? 'portfolio' : 'home', window.location.hash || null, false, true);
      }
    });
  }

  // Initial routing detection on page load
  function initRouter() {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    setupLinkInterception();
    setupPopstateListener();

    const viewHome = document.getElementById('viewHome');
    const viewPortfolio = document.getElementById('viewPortfolio');
    if (!viewHome || !viewPortfolio) return;

    // Check if user landed on portfolio view via URL params, pathname, or sessionStorage redirect
    const hasSessionRedirect = sessionStorage.getItem('spa_redirect') === '/all-project' ||
      sessionStorage.getItem('spa_redirect') === 'portfolio';

    if (hasSessionRedirect) {
      sessionStorage.removeItem('spa_redirect');
    }

    const isInitialPortfolio = hasSessionRedirect || isPortfolioRoute();

    if (isInitialPortfolio) {
      currentViewId = 'portfolio';
      viewHome.style.display = 'none';
      viewHome.classList.remove('is-active');

      viewPortfolio.style.display = 'block';
      viewPortfolio.classList.add('is-active');
      document.title = TITLES.portfolio;

      const backToTop = document.getElementById('backToTop');
      if (backToTop) backToTop.setAttribute('href', '#portfolio');

      const lenis = getLenis();
      window.scrollTo(0, 0);
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
        if (typeof lenis.resize === 'function') lenis.resize();
      }

      mountPortfolioAnimations();
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.sort();
        ScrollTrigger.refresh(true);
      }

      try {
        const targetUrl = getRouteUrl('portfolio', null);
        window.history.replaceState({ view: 'portfolio', targetAnchor: null }, TITLES.portfolio, targetUrl);
      } catch (e) {}

      ensureImagesLoadedAndCalibrated(viewPortfolio);
    } else {
      currentViewId = 'home';
      viewPortfolio.style.display = 'none';
      viewPortfolio.classList.remove('is-active');

      viewHome.style.display = 'block';
      viewHome.classList.add('is-active');
      document.title = TITLES.home;

      const backToTop = document.getElementById('backToTop');
      if (backToTop) backToTop.setAttribute('href', '#hero');

      const lenis = getLenis();
      if (lenis && typeof lenis.resize === 'function') lenis.resize();

      mountHomeAnimations(false);
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.sort();
        ScrollTrigger.refresh(true);
      }

      try {
        const targetUrl = getRouteUrl('home', window.location.hash || null);
        window.history.replaceState({ view: 'home', targetAnchor: window.location.hash || null }, TITLES.home, targetUrl);
      } catch (e) {}

      ensureImagesLoadedAndCalibrated(viewHome);

      // If landing directly on home with an anchor hash (e.g. index.html#skills)
      if (window.location.hash && window.location.hash !== '#hero' && window.location.hash !== '#' && window.location.hash !== '#all-project') {
        setTimeout(() => {
          scrollToAnchor(window.location.hash, true);
          if (window.Portfolio.navigation && typeof window.Portfolio.navigation.syncActiveState === 'function') {
            const sectionId = window.location.hash.replace('#', '');
            window.Portfolio.navigation.syncActiveState(sectionId);
          }
        }, 50);
      }
    }

    if (window.Portfolio.navigation && typeof window.Portfolio.navigation.syncActiveState === 'function') {
      window.Portfolio.navigation.syncActiveState();
    }
  }

  window.Portfolio.router = {
    initRouter,
    navigateTo: switchView,
    getCurrentView: () => currentViewId
  };
})(window, document);
