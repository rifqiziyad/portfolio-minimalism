/**
 * VISION & SYSTEM SECTION ANIMATIONS (Scroll Parallax + Entrance Choreography)
 * Module: js/animations/vision.js
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  function initVisionAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const visionSection = document.getElementById('vision');
    if (!visionSection) return;

    // 1. SCROLL PARALLAX: ACTIVE IMMEDIATELY FROM TOP SCROLL (scrollY = 0)
    // Controls the outer elements (#visionTitle, #visionSystem, #visionImageWrapper)

    // VISION text translates LEFT as you scroll down
    gsap.fromTo(
      '#visionTitle',
      { xPercent: 15 },
      {
        xPercent: -150,
        ease: 'none',
        scrollTrigger: {
          trigger: visionSection,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          invalidateOnRefresh: true
        }
      }
    );

    // SYSTEM text translates RIGHT as you scroll down
    gsap.fromTo(
      '#visionSystem',
      { xPercent: -15 },
      {
        xPercent: 150,
        ease: 'none',
        scrollTrigger: {
          trigger: visionSection,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          invalidateOnRefresh: true
        }
      }
    );

    // Central Portrait Photo scales up smoothly as you scroll past
    gsap.fromTo(
      '#visionImageWrapper',
      {
        scale: 0.7,
        transformOrigin: 'center center'
      },
      {
        scale: 1.5,
        ease: 'none',
        scrollTrigger: {
          trigger: visionSection,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          invalidateOnRefresh: true
        }
      }
    );

    // 2. ENTRANCE TRANSITION: ONLY WHEN PAGE IS FIRST OPENED AT THE TOP
    // Operates on the inner elements (#visionTitleInner, #visionSystemInner, #visionImageBox)
    // so it never interferes with or delays the scroll parallax!
    const isAtTop = window.scrollY < 80;

    if (isAtTop) {
      // Initial setup for intro transition
      gsap.set('#visionImageBox', { scale: 1.45, opacity: 0 });
      gsap.set('#visionTitleInner', { xPercent: 90, opacity: 0 });
      gsap.set('#visionSystemInner', { xPercent: -90, opacity: 0 });

      const introTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        delay: 0.1
      });

      // 1. Central photo zooms down from large (1.45x) to normal scale (1.0)
      introTl.to('#visionImageBox', {
        scale: 1.0,
        opacity: 1,
        duration: 1.4,
        ease: 'expo.out'
      });

      // 2. VISION text slides in from RIGHT into its resting position
      introTl.to(
        '#visionTitleInner',
        {
          xPercent: 0,
          opacity: 1,
          duration: 1.3,
          ease: 'power3.out'
        },
        '<0.08'
      );

      // 3. SYSTEM text slides in from LEFT into its resting position
      introTl.to(
        '#visionSystemInner',
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
      gsap.set('#visionImageBox', { scale: 1.0, opacity: 1 });
      gsap.set('#visionTitleInner', { xPercent: 0, opacity: 1 });
      gsap.set('#visionSystemInner', { xPercent: 0, opacity: 1 });
    }
  }

  window.Portfolio.vision = {
    initVisionAnimations
  };
})(window, document);
