/**
 * FULL-SCREEN LOADING OVERLAY CONTROLLER
 * Module: js/components/preloader.js
 * Tracks real-time browser asset loading (DOM images, web fonts, window load),
 * drives the bottom-to-top white fill on 'PLEASE WAIT' and percentage counter,
 * and smoothly transitions out into the Hero intro animation.
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  let active = true;

  function isActive() {
    return active;
  }

  function initPreloader(options = {}) {
    const overlay = document.getElementById('loadingOverlay');
    const content = document.getElementById('loadingContent');
    const titleEl = document.getElementById('loadingTitle');
    const percentEl = document.getElementById('loadingPercentage');

    if (!overlay || !titleEl || !percentEl) {
      active = false;
      if (typeof options.onReveal === 'function') {
        options.onReveal();
      }
      return;
    }

    // Lock scroll while overlay is active
    document.documentElement.style.overflow = 'hidden';
    const scrollService = window.Portfolio.scroll;
    const lenis = scrollService && typeof scrollService.getLenis === 'function' ? scrollService.getLenis() : null;
    if (lenis && typeof lenis.stop === 'function') {
      lenis.stop();
    }

    const visualState = { value: 0 };
    let targetProgress = 0;
    let isExiting = false;
    let progressTween = null;

    function renderProgress(val) {
      const clamped = Math.max(0, Math.min(100, val));
      const rounded = Math.round(clamped);
      titleEl.style.setProperty('--load-progress', `${clamped.toFixed(2)}%`);
      percentEl.textContent = `${rounded}%`;
    }

    renderProgress(0);

    // Smooth width transition from initial fallback width (~60vw) to loaded Syne width (~100vw)
    let fontTransitionDone = false;

    function applySyneWithTransition() {
      if (fontTransitionDone || !titleEl) return;
      fontTransitionDone = true;

      if (titleEl.classList.contains('is-syne-loaded')) return;

      const oldWidth = titleEl.offsetWidth;
      titleEl.classList.add('is-syne-loaded');
      const newWidth = titleEl.offsetWidth;

      if (oldWidth > 0 && newWidth > 0 && oldWidth !== newWidth && typeof gsap !== 'undefined') {
        const scaleRatio = Math.min(1, Math.max(0.4, oldWidth / newWidth));
        // Instantly lock visual width to the initial fallback width, then smoothly expand to 100vw
        gsap.fromTo(
          titleEl,
          {
            scaleX: scaleRatio,
            opacity: 0.7,
            transformOrigin: '50% 50%'
          },
          {
            scaleX: 1,
            opacity: 1,
            duration: 0.85,
            ease: 'power3.out',
            clearProps: 'scaleX,opacity'
          }
        );
      }
    }

    if (document.fonts) {
      if (typeof document.fonts.check === 'function' && document.fonts.check('800 1rem Syne')) {
        titleEl.classList.add('is-syne-loaded');
        fontTransitionDone = true;
      } else {
        if (typeof document.fonts.load === 'function') {
          document.fonts.load('800 1rem Syne').then(applySyneWithTransition).catch(applySyneWithTransition);
        }
        if (document.fonts.ready) {
          document.fonts.ready.then(applySyneWithTransition).catch(applySyneWithTransition);
        }
        setTimeout(applySyneWithTransition, 800);
      }
    } else {
      titleEl.classList.add('is-syne-loaded');
      fontTransitionDone = true;
    }

    function unlockScroll() {
      document.documentElement.style.overflow = '';
      const currentLenis =
        window.Portfolio.scroll && typeof window.Portfolio.scroll.getLenis === 'function'
          ? window.Portfolio.scroll.getLenis()
          : null;
      if (currentLenis && typeof currentLenis.start === 'function') {
        currentLenis.start();
      }
    }

    function runExitTransition() {
      if (isExiting) return;
      isExiting = true;
      active = false;

      applySyneWithTransition();
      renderProgress(100);
      unlockScroll();

      // Trigger Hero entrance animation as overlay begins dissolving
      if (typeof options.onReveal === 'function') {
        options.onReveal();
      }
      if (window.Portfolio.hero && typeof window.Portfolio.hero.playIntro === 'function') {
        window.Portfolio.hero.playIntro();
      }

      if (typeof gsap !== 'undefined') {
        const tl = gsap.timeline({
          onComplete: () => {
            overlay.classList.add('is-hidden');
            if (typeof ScrollTrigger !== 'undefined') {
              ScrollTrigger.refresh();
            }
          }
        });

        if (content) {
          tl.to(
            content,
            {
              scale: 1.04,
              opacity: 0,
              duration: 0.5,
              ease: 'power3.inOut'
            },
            0
          );
        }

        tl.to(
          overlay,
          {
            opacity: 0,
            duration: 0.65,
            ease: 'expo.inOut'
          },
          0.08
        );
      } else {
        overlay.classList.add('is-hidden');
      }
    }

    function animateToTarget(nextTarget) {
      targetProgress = Math.max(targetProgress, Math.min(100, nextTarget));

      if (typeof gsap !== 'undefined') {
        if (progressTween) {
          progressTween.kill();
        }
        const delta = Math.abs(targetProgress - visualState.value);
        // Real-time fast interpolation so cached loads still visibly sweep 0% -> 100% smoothly
        const duration = targetProgress >= 100 ? Math.max(0.35, delta * 0.0045) : 0.25;

        progressTween = gsap.to(visualState, {
          value: targetProgress,
          duration: duration,
          ease: 'power2.out',
          onUpdate: () => {
            renderProgress(visualState.value);
          },
          onComplete: () => {
            renderProgress(visualState.value);
            if (targetProgress >= 100 && Math.round(visualState.value) >= 100) {
              runExitTransition();
            }
          }
        });
      } else {
        visualState.value = targetProgress;
        renderProgress(targetProgress);
        if (targetProgress >= 100) {
          runExitTransition();
        }
      }
    }

    // Collect only critical above-the-fold assets: eager images, hero photo, web fonts, and DOM readiness
    const criticalImages = Array.from(document.querySelectorAll('img')).filter((img) => {
      const src = img.getAttribute('src');
      if (!src || src.trim().length === 0) return false;
      const isLazy = img.getAttribute('loading') === 'lazy';
      return !isLazy;
    });

    // Total tasks = critical images + fonts + window load
    const totalTasks = Math.max(1, criticalImages.length + 2);
    let completedTasks = 0;

    function markTaskComplete() {
      completedTasks = Math.min(totalTasks, completedTasks + 1);
      const ratio = (completedTasks / totalTasks) * 100;
      animateToTarget(ratio);
    }

    // 1. Track critical images
    criticalImages.forEach((img) => {
      if (img.complete) {
        markTaskComplete();
      } else {
        const onDone = () => {
          img.removeEventListener('load', onDone);
          img.removeEventListener('error', onDone);
          markTaskComplete();
        };
        img.addEventListener('load', onDone, { once: true });
        img.addEventListener('error', onDone, { once: true });
      }
    });

    // 2. Track web fonts
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready
        .then(() => {
          applySyneWithTransition();
          markTaskComplete();
        })
        .catch(() => {
          applySyneWithTransition();
          markTaskComplete();
        });
    } else {
      applySyneWithTransition();
      markTaskComplete();
    }

    // 3. Track window load
    if (document.readyState === 'complete') {
      markTaskComplete();
    } else {
      window.addEventListener(
        'load',
        () => {
          // Ensure all tasks complete when browser fires window load
          completedTasks = totalTasks;
          animateToTarget(100);
        },
        { once: true }
      );
    }

    // Safety fallback in case a network resource stalls
    setTimeout(() => {
      if (!isExiting) {
        completedTasks = totalTasks;
        animateToTarget(100);
      }
    }, 1800);
  }

  window.Portfolio.preloader = {
    initPreloader,
    isActive
  };
})(window, document);
