/**
 * HERO / EDITORIAL SECTION ANIMATIONS (Scroll Parallax + Entrance Choreography)
 * Module: js/animations/hero.js
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  let activeIntroTl = null;

  function playIntro() {
    if (activeIntroTl) {
      activeIntroTl.play();
    }
  }

  function initHeroAnimations(skipIntro = false) {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    const reducedMotion =
      window.Portfolio.utils &&
      typeof window.Portfolio.utils.prefersReducedMotion === 'function' &&
      window.Portfolio.utils.prefersReducedMotion();

    if (reducedMotion) {
      activeIntroTl = null;
      gsap.set('#heroImageWrapper, #heroImageBox, #heroFrontend, #heroDeveloper, #heroFrontendInner, #heroDeveloperInner', {
        opacity: 1,
        clearProps: 'transform,opacity'
      });
      return;
    }

    // 1. SCROLL PARALLAX: ACTIVE IMMEDIATELY FROM TOP SCROLL (scrollY = 0)
    // Controls the outer elements (#heroFrontend, #heroDeveloper, #heroImageWrapper)

    // FRONTEND text translates LEFT as you scroll down
    gsap.fromTo(
      '#heroFrontend',
      { xPercent: 30 },
      {
        xPercent: -150,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          invalidateOnRefresh: true
        }
      }
    );

    // DEVELOPER text translates RIGHT as you scroll down
    gsap.fromTo(
      '#heroDeveloper',
      { xPercent: -30 },
      {
        xPercent: 150,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          invalidateOnRefresh: true
        }
      }
    );

    // Central Portrait Photo scales up smoothly as you scroll past
    gsap.fromTo(
      '#heroImageWrapper',
      {
        scale: 0.7,
        transformOrigin: 'center center'
      },
      {
        scale: 1.5,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          invalidateOnRefresh: true
        }
      }
    );

    // Clean up any lingering first scroll listener from previous mount
    if (window._heroFirstScrollListener) {
      window.removeEventListener('scroll', window._heroFirstScrollListener);
      const scrollService = window.Portfolio.scroll;
      const lenis = scrollService ? scrollService.getLenis() : null;
      if (lenis) lenis.off('scroll', window._heroFirstScrollListener);
      window._heroFirstScrollListener = null;
    }

    // 2. ENTRANCE TRANSITION: ONLY WHEN PAGE IS FIRST OPENED AT THE TOP
    // Operates on the inner elements (#heroFrontendInner, #heroDeveloperInner, #heroImageBox)
    // so it never interferes with or delays the scroll parallax!
    const isAtTop = window.scrollY < 80;

    if (isAtTop && !skipIntro) {
      // Transform-only entrance without hiding LCP hero image (opacity remains 1 at first paint)
      gsap.set('#heroImageBox', { scale: 1.08, opacity: 1 });
      gsap.set('#heroFrontendInner', { xPercent: 24, opacity: 1 });
      gsap.set('#heroDeveloperInner', { xPercent: -24, opacity: 1 });

      const introTl = gsap.timeline({
        paused: false,
        defaults: { ease: 'expo.out' }
      });
      activeIntroTl = introTl;

      // 1. Central photo settles smoothly from 1.08x to 1.0x
      introTl.to('#heroImageBox', {
        scale: 1.0,
        duration: 0.85,
        ease: 'expo.out',
        clearProps: 'transform'
      });

      // 2. FRONTEND text glides in from RIGHT into its resting position
      introTl.to(
        '#heroFrontendInner',
        {
          xPercent: 0,
          duration: 0.85,
          ease: 'power3.out',
          clearProps: 'transform'
        },
        0
      );

      // 3. DEVELOPER text glides in from LEFT into its resting position
      introTl.to(
        '#heroDeveloperInner',
        {
          xPercent: 0,
          duration: 0.85,
          ease: 'power3.out',
          clearProps: 'transform'
        },
        0
      );

      // If user scrolls during the opening intro, gently speed up the intro completion
      const scrollService = window.Portfolio.scroll;
      const lenis = scrollService ? scrollService.getLenis() : null;
      const onFirstScroll = () => {
        if (introTl && introTl.isActive()) {
          introTl.timeScale(2.5);
        }
        window.removeEventListener('scroll', onFirstScroll);
        if (lenis) {
          lenis.off('scroll', onFirstScroll);
        }
        window._heroFirstScrollListener = null;
      };
      window._heroFirstScrollListener = onFirstScroll;
      window.addEventListener('scroll', onFirstScroll, { passive: true, once: true });
      if (lenis) {
        lenis.on('scroll', onFirstScroll);
      }
    } else {
      activeIntroTl = null;
      // If already scrolled down or skipIntro, ensure inner elements are fully visible and neutral
      gsap.set('#heroImageBox', { scale: 1.0, opacity: 1, clearProps: 'transform,opacity' });
      gsap.set('#heroFrontendInner', { xPercent: 0, opacity: 1, clearProps: 'transform,opacity' });
      gsap.set('#heroDeveloperInner', { xPercent: 0, opacity: 1, clearProps: 'transform,opacity' });
    }
  }

  window.Portfolio.hero = {
    initHeroAnimations,
    playIntro
  };
})(window, document);
