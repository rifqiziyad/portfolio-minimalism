/**
 * HERO / EDITORIAL SECTION ANIMATIONS (Scroll Parallax + Entrance Choreography)
 * Module: js/animations/hero.js
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  function initHeroAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    // 1. SCROLL PARALLAX: ACTIVE IMMEDIATELY FROM TOP SCROLL (scrollY = 0)
    // Controls the outer elements (#heroFrontend, #heroDeveloper, #heroImageWrapper)

    // FRONTEND text translates LEFT as you scroll down
    gsap.fromTo(
      '#heroFrontend',
      { xPercent: 30 },
      {
        xPercent: -250,
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

    // 2. ENTRANCE TRANSITION: ONLY WHEN PAGE IS FIRST OPENED AT THE TOP
    // Operates on the inner elements (#heroFrontendInner, #heroDeveloperInner, #heroImageBox)
    // so it never interferes with or delays the scroll parallax!
    const isAtTop = window.scrollY < 80;

    if (isAtTop) {
      // Initial setup for intro transition
      gsap.set('#heroImageBox', { scale: 1.45, opacity: 0 });
      gsap.set('#heroFrontendInner', { xPercent: 90, opacity: 0 });
      gsap.set('#heroDeveloperInner', { xPercent: -90, opacity: 0 });

      const introTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        delay: 0.1
      });

      // 1. Central photo zooms down from large (1.45x) to normal scale (1.0)
      introTl.to('#heroImageBox', {
        scale: 1.0,
        opacity: 1,
        duration: 1.4,
        ease: 'expo.out'
      });

      // 2. FRONTEND text slides in from RIGHT into its resting position
      introTl.to(
        '#heroFrontendInner',
        {
          xPercent: 0,
          opacity: 1,
          duration: 1.3,
          ease: 'power3.out'
        },
        '<0.08'
      );

      // 3. DEVELOPER text slides in from LEFT into its resting position
      introTl.to(
        '#heroDeveloperInner',
        {
          xPercent: 0,
          opacity: 1,
          duration: 1.3,
          ease: 'power3.out'
        },
        '<'
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
      };
      window.addEventListener('scroll', onFirstScroll, { passive: true, once: true });
      if (lenis) {
        lenis.on('scroll', onFirstScroll);
      }
    } else {
      // If already scrolled down, ensure inner elements are fully visible and neutral
      gsap.set('#heroImageBox', { scale: 1.0, opacity: 1 });
      gsap.set('#heroFrontendInner', { xPercent: 0, opacity: 1 });
      gsap.set('#heroDeveloperInner', { xPercent: 0, opacity: 1 });
    }
  }

  window.Portfolio.hero = {
    initHeroAnimations
  };

  // Backward compatibility alias
  window.Portfolio.vision = {
    initVisionAnimations: initHeroAnimations
  };
})(window, document);
