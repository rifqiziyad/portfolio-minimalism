/**
 * DEDICATED MOBILE PROJECT HORIZONTAL CAROUSEL CONTROLLER (<= 768px)
 * Module: js/animations/project-mobile.js
 * Isolated mobile touch/drag horizontal carousel so desktop project-showcase.js is untouched.
 * Features:
 *   - Dead-center image viewport (84vw) with 1:1 horizontal finger swipe & GSAP snap
 *   - Synchronized horizontal sliding title band with centered spotlight clip-path
 *   - Staggered line-by-line info panel reveal via window.Portfolio.projectInfo
 *   - Free vertical page scrolling (no ScrollTrigger pinning or image zoom parallax)
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  let cleanupMobileCarouselController = null;

  function initProjectMobileCarousel(scope) {
    if (cleanupMobileCarouselController) {
      cleanupMobileCarouselController();
      cleanupMobileCarouselController = null;
    }

    const section = (scope || document).querySelector('#project.project-showcase-section, #portfolio.project-showcase-section');
    if (!section) return;

    const trackDim = section.querySelector('#projectTrackDim');
    const trackLit = section.querySelector('#projectTrackLit');
    const titleBand = section.querySelector('.project-title-band');
    const layerLit = section.querySelector('#projectLayerLit') || section.querySelector('.project-title-layer-lit');
    const vlineCenter = section.querySelector('#projectVlineCenter') || section.querySelector('.project-vline-center');
    const vlineRight = section.querySelector('#projectVlineRight') || section.querySelector('.project-vline-right');
    const hline = section.querySelector('#projectGridHline') || section.querySelector('.project-grid-hline');
    const imageViewport = section.querySelector('#projectImageViewport') || section.querySelector('.project-image-viewport');
    const slideFrames = Array.from(section.querySelectorAll('.project-slide-frame'));
    const slideImgs = slideFrames.map((frame) => frame.querySelector('.project-img'));
    const elGalleryBtn = section.querySelector('#projectGalleryTrigger');

    const data = window.PortfolioData;
    const projects = (data && (data.portfolio || data.works)) || [];
    const total = projects.length;

    if (!trackDim || !trackLit || total === 0) return;

    // Initialize shared Info Panel Controller for staggered sentence/line reveals
    const projectInfo = window.Portfolio.projectInfo;
    const projectInfoCtrl =
      projectInfo && typeof projectInfo.createController === 'function'
        ? projectInfo.createController(section, projects)
        : null;

    const playhead = { f: 0 };
    let snapTween = null;
    let entranceTrigger = null;
    let gridLinesTrigger = null;
    let entranceTween = null;
    let hasCompletedEntrance = false;
    let suppressNextClick = false;
    let suppressClickTimer = null;

    // Symmetric mobile column geometry: 8% left edge, 92% right edge (84% centered width)
    const LEFT_COL_RATIO = 0.08;
    const COL_WIDTH_RATIO = 0.84;

    function renderMobileSlide(rawF) {
      const f = typeof rawF === 'number' ? rawF : 0;
      const vw = window.innerWidth;

      // 1. Ensure symmetric hairline grid & spotlight clip-path stay centered (8% to 92%)
      if (vlineCenter) {
        vlineCenter.style.left = '8%';
      }
      if (vlineRight) {
        vlineRight.style.left = '92%';
        vlineRight.style.opacity = '1';
      }
      if (layerLit) {
        const litClip = 'inset(0 8% 0 8%)';
        layerLit.style.clipPath = litClip;
        layerLit.style.webkitClipPath = litClip;
      }
      if (imageViewport) {
        imageViewport.style.clipPath = 'none';
        imageViewport.style.webkitClipPath = 'none';
        if (hasCompletedEntrance) {
          imageViewport.style.transform = '';
        }
      }
      if (titleBand) {
        titleBand.style.transform = '';
      }

      // 2. Synchronized Horizontal Sliding Title Band
      const spotlightLeftPx = vw * LEFT_COL_RATIO;
      const colWidthPx = vw * COL_WIDTH_RATIO;
      const trackX = spotlightLeftPx - f * colWidthPx;
      const trackTransform = `translate3d(${trackX.toFixed(2)}px, 0, 0)`;

      if (hasCompletedEntrance) {
        trackDim.style.transform = trackTransform;
        trackDim.style.opacity = '1';
        trackLit.style.transform = trackTransform;
        trackLit.style.opacity = '1';
      }

      // 3. Horizontal Carousel Slides with Desktop-Parallax (Zoom & Pan)
      for (let i = 0; i < slideFrames.length; i++) {
        const frame = slideFrames[i];
        const img = slideImgs[i];
        const delta = i - f;

        if (Math.abs(delta) > 1.15) {
          frame.style.display = 'none';
          continue;
        }

        frame.style.display = '';

        let frameXPercent = 0;
        let imgXPercent = 0;
        let imgScale = 1.0;

        if (delta >= 1) {
          frameXPercent = 100.5;
          imgXPercent = -22;
          imgScale = 1.25;
        } else if (delta >= 0) {
          frameXPercent = delta * 100;
          imgXPercent = -22 * delta;
          imgScale = 1.0 + delta * 0.25;
        } else if (delta > -1) {
          frameXPercent = delta * 28;
          imgXPercent = -delta * 14;
          imgScale = 1.0;
        } else {
          frameXPercent = -28;
          imgXPercent = 14;
          imgScale = 1.0;
        }

        frame.style.transform = `translate3d(${frameXPercent.toFixed(2)}%, 0, 0)`;
        frame.style.opacity = '1';

        if (img) {
          img.style.transform = `translate3d(${imgXPercent.toFixed(2)}%, 0, 0) scale(${imgScale.toFixed(3)})`;
        }
      }

      // 4. Update Active Frame & Staggered Line-by-Line Info Panel
      const nearestIdx = Math.max(0, Math.min(total - 1, Math.round(f)));
      slideFrames.forEach((el, idx) => {
        el.classList.toggle('is-current-frame', idx === nearestIdx);
      });

      if (projectInfoCtrl) {
        projectInfoCtrl.setInfoOpacity(1, 0);
        projectInfoCtrl.updateActiveProjectInfo(nearestIdx);
      }
    }

    function animateToIndex(targetIdx, duration = 0.42) {
      const clampedIdx = Math.max(0, Math.min(total - 1, targetIdx));
      if (snapTween) {
        snapTween.kill();
        snapTween = null;
      }

      if (typeof gsap !== 'undefined') {
        snapTween = gsap.to(playhead, {
          f: clampedIdx,
          duration,
          ease: 'power3.out',
          onUpdate: () => {
            renderMobileSlide(playhead.f);
          },
          onComplete: () => {
            snapTween = null;
          }
        });
      } else {
        playhead.f = clampedIdx;
        renderMobileSlide(playhead.f);
      }
    }

    function openActiveGallery() {
      const activeIdx = projectInfoCtrl ? projectInfoCtrl.getCurrentActiveIndex() : Math.round(playhead.f);
      const idx = activeIdx >= 0 ? activeIdx : 0;
      const activeFrame = slideFrames[idx];
      if (window.Portfolio.carousel && typeof window.Portfolio.carousel.openGallery === 'function') {
        window.Portfolio.carousel.openGallery(idx, 0, activeFrame);
      } else if (typeof window.Portfolio.ensureCarouselAndOpen === 'function') {
        window.Portfolio.ensureCarouselAndOpen(idx, activeFrame);
      } else if (activeFrame) {
        activeFrame.click();
      }
    }

    // ─── Touch & Pointer Swipe Gesture State ───
    let isPointerDown = false;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let startF = 0;
    let startTime = 0;
    let axisLocked = null; // 'x' for carousel swipe, 'y' for vertical page scroll
    let wasDragged = false;

    function handleGestureStart(clientX, clientY) {
      if (entranceTween) {
        entranceTween.kill();
        entranceTween = null;
      }
      if (entranceTrigger) {
        entranceTrigger.kill();
        entranceTrigger = null;
      }
      if (gridLinesTrigger) {
        gridLinesTrigger.kill(true);
        gridLinesTrigger = null;
      }
      if (!hasCompletedEntrance) {
        hasCompletedEntrance = true;
        if (vlineRight) gsap.set(vlineRight, { clearProps: 'transform' });
        if (imageViewport) gsap.set(imageViewport, { clearProps: 'transform' });
        if (slideImgs[0]) gsap.set(slideImgs[0], { clearProps: 'transform' });
        gsap.set([trackDim, trackLit], { clearProps: 'x' });
        const infoInner = section.querySelector('#projectInfoInner');
        if (infoInner) {
          const inners = infoInner.querySelectorAll('.text-line-inner');
          if (inners.length) {
            gsap.set(inners, { yPercent: 0, opacity: 1, clearProps: 'transform,opacity' });
          }
        }
        playhead.f = Math.max(0, playhead.f);
        renderMobileSlide(playhead.f);
      }
      isPointerDown = true;
      startX = clientX;
      startY = clientY;
      lastX = clientX;
      startF = playhead.f;
      startTime = performance.now();
      axisLocked = null;
      wasDragged = false;
    }

    function handleGestureMove(clientX, clientY, originalEvent) {
      if (!isPointerDown) return;

      const dx = clientX - startX;
      const dy = clientY - startY;
      lastX = clientX;

      if (!axisLocked) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        // If vertical movement dominates, let the browser scroll vertically
        if (Math.abs(dy) > Math.abs(dx)) {
          axisLocked = 'y';
          isPointerDown = false;
          if (!snapTween && Math.abs(playhead.f - Math.round(playhead.f)) > 0.001) {
            animateToIndex(Math.round(playhead.f), 0.25);
          }
          return;
        }
        axisLocked = 'x';
        if (snapTween) {
          snapTween.kill();
          snapTween = null;
        }
        startF = playhead.f;
        startX = clientX;
      }

      if (axisLocked === 'x') {
        if (originalEvent && originalEvent.cancelable) {
          originalEvent.preventDefault();
        }
        if (Math.abs(dx) > 8) {
          wasDragged = true;
        }

        const vpWidth = (imageViewport && imageViewport.offsetWidth) || window.innerWidth * COL_WIDTH_RATIO;
        let nextF = startF - dx / vpWidth;

        // Subtle rubber-band resistance at first and last project
        if (nextF < 0) {
          nextF *= 0.28;
        } else if (nextF > total - 1) {
          nextF = (total - 1) + (nextF - (total - 1)) * 0.28;
        }

        playhead.f = nextF;
        renderMobileSlide(playhead.f);
      }
    }

    function handleGestureEnd() {
      if (!isPointerDown) return;
      isPointerDown = false;

      if (axisLocked !== 'x') {
        if (!snapTween && Math.abs(playhead.f - Math.round(playhead.f)) > 0.001) {
          animateToIndex(Math.round(playhead.f), 0.25);
        }
        return;
      }

      if (wasDragged) {
        suppressNextClick = true;
        if (suppressClickTimer) clearTimeout(suppressClickTimer);
        suppressClickTimer = setTimeout(() => {
          suppressNextClick = false;
        }, 260);
      }

      const dx = lastX - startX;
      const elapsed = Math.max(16, performance.now() - startTime);
      const velocityX = dx / elapsed; // px per ms
      const vpWidth = (imageViewport && imageViewport.offsetWidth) || window.innerWidth * COL_WIDTH_RATIO;
      const dragRatio = -dx / vpWidth;
      const baseIdx = Math.round(startF);

      let targetIdx = Math.round(playhead.f);
      if (dragRatio > 0.14 || velocityX < -0.32) {
        targetIdx = baseIdx + 1;
      } else if (dragRatio < -0.14 || velocityX > 0.32) {
        targetIdx = baseIdx - 1;
      }

      animateToIndex(targetIdx, 0.42);
    }

    // Touch Listeners
    function onTouchStart(e) {
      if (e.touches.length !== 1) return;
      handleGestureStart(e.touches[0].clientX, e.touches[0].clientY);
    }

    function onTouchMove(e) {
      if (!isPointerDown || e.touches.length !== 1) return;
      handleGestureMove(e.touches[0].clientX, e.touches[0].clientY, e);
    }

    function onTouchEnd() {
      handleGestureEnd();
    }

    // Mouse Listeners (for testing in desktop DevTools mobile view)
    function onMouseDown(e) {
      if (e.button !== 0) return;
      e.preventDefault();
      handleGestureStart(e.clientX, e.clientY);
    }

    function onMouseMove(e) {
      if (!isPointerDown) return;
      handleGestureMove(e.clientX, e.clientY, e);
    }

    function onMouseUp() {
      handleGestureEnd();
    }

    // Suppress accidental gallery open click right after a horizontal swipe drag
    function onCaptureClick(e) {
      if (suppressNextClick) {
        e.preventDefault();
        e.stopPropagation();
        suppressNextClick = false;
      }
    }

    function onSectionClick(e) {
      const titleBtn = e.target.closest('.project-title-btn');
      if (titleBtn) {
        const idx = parseInt(titleBtn.getAttribute('data-index'), 10);
        if (!isNaN(idx)) {
          const currentIdx = projectInfoCtrl ? projectInfoCtrl.getCurrentActiveIndex() : Math.round(playhead.f);
          if (idx === currentIdx) {
            openActiveGallery();
          } else {
            animateToIndex(idx, 0.45);
          }
        }
      }
    }

    const swipeTargets = [imageViewport, titleBand].filter(Boolean);
    swipeTargets.forEach((target) => {
      target.addEventListener('touchstart', onTouchStart, { passive: true });
      target.addEventListener('touchmove', onTouchMove, { passive: false });
      target.addEventListener('touchend', onTouchEnd, { passive: true });
      target.addEventListener('touchcancel', onTouchEnd, { passive: true });
      target.addEventListener('mousedown', onMouseDown);
    });
    window.addEventListener('mousemove', onMouseMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp, { passive: true });

    section.addEventListener('click', onCaptureClick, true);
    section.addEventListener('click', onSectionClick);
    if (elGalleryBtn) {
      elGalleryBtn.addEventListener('click', openActiveGallery);
    }

    let mobileResizeTimer = null;

    function onResize() {
      clearTimeout(mobileResizeTimer);
      mobileResizeTimer = setTimeout(() => {
        if (projectInfoCtrl) {
          projectInfoCtrl.onResize();
        }
        renderMobileSlide(playhead.f);
      }, 150);
    }

    window.addEventListener('resize', onResize, { passive: true });

    // ─── Viewport Scroll Entry Choreography ───
    function initMobileEntrance() {
      if (typeof ScrollTrigger === 'undefined' || typeof gsap === 'undefined') {
        renderMobileSlide(0);
        hasCompletedEntrance = true;
        return;
      }

      const stageEl = section.querySelector('.project-sticky-stage') || section;
      const stageRect = stageEl.getBoundingClientRect();
      const isAlreadyInView = stageRect.top < window.innerHeight * 0.75 && stageRect.bottom > 0;

      if (isAlreadyInView) {
        hasCompletedEntrance = true;
        renderMobileSlide(0);
        if (vlineCenter) {
          vlineCenter.style.transform = '';
        }
        if (vlineRight) {
          vlineRight.style.transform = '';
        }
        if (hline) {
          hline.style.transform = '';
        }
        if (imageViewport) {
          imageViewport.style.transform = '';
        }
        return;
      }

      // Scroll-scrubbed parallax entry for architectural grid lines
      // - vlineCenter: glides in from left overflow (-12vw) to resting column (left: 8%)
      // - hline: drops from directly beneath the PROJECT header down to the title-band bottom
      if (vlineCenter || hline) {
        const linesTl = gsap.timeline({
          scrollTrigger: {
            trigger: stageEl,
            start: 'top 95%',
            end: 'top 52%',
            scrub: 0.5,
            invalidateOnRefresh: true
          }
        });

        if (vlineCenter) {
          linesTl.fromTo(
            vlineCenter,
            { x: () => -Math.ceil(window.innerWidth * 0.12) },
            { x: 0, ease: 'none' },
            0
          );
        }

        if (hline) {
          linesTl.fromTo(
            hline,
            { y: () => -(titleBand ? titleBand.offsetHeight : 66) },
            { y: 0, ease: 'none' },
            0
          );
        }

        gridLinesTrigger = linesTl.scrollTrigger;
      }

      // Initial resting DOM state before entrance
      renderMobileSlide(0);

      const vw = window.innerWidth;
      const spotlightLeftPx = vw * LEFT_COL_RATIO;

      // 1. Both vlineRight and imageViewport start from OUTSIDE the right of the screen (luar kanan layar)
      // vlineRight resting position is at 92vw; shifting by +12vw puts it at 104vw (outside screen)
      const vlineStartX = vw * 0.12;
      if (vlineRight) {
        gsap.set(vlineRight, { x: vlineStartX, opacity: 1 });
      }

      // imageViewport resting position is centered (left 8vw, right 92vw); shifting by +vw puts left edge at 108vw (completely outside screen)
      const vpStartX = vw;
      if (imageViewport) {
        gsap.set(imageViewport, { x: vpStartX });
      }

      if (slideImgs[0]) {
        gsap.set(slideImgs[0], { scale: 1.15, xPercent: -15 });
      }

      // Title band tracks start outside the right of the screen in lockstep
      const titleStartX = vw * 1.02;
      gsap.set([trackDim, trackLit], { x: titleStartX, opacity: 1 });

      // Info panel lines start masked below
      const infoInner = section.querySelector('#projectInfoInner');
      if (infoInner) {
        const inners = infoInner.querySelectorAll('.text-line-inner');
        if (inners.length) {
          gsap.set(inners, { yPercent: 110, opacity: 0 });
        }
      }

      entranceTrigger = ScrollTrigger.create({
        trigger: stageEl,
        start: 'top 78%',
        once: true,
        onEnter: () => {
          if (hasCompletedEntrance) return;

          entranceTween = gsap.timeline({
            onComplete: () => {
              hasCompletedEntrance = true;
              entranceTween = null;
              if (vlineRight) {
                gsap.set(vlineRight, { clearProps: 'transform' });
              }
              if (imageViewport) {
                gsap.set(imageViewport, { clearProps: 'transform' });
              }
              if (slideImgs[0]) {
                gsap.set(slideImgs[0], { clearProps: 'transform' });
              }
              gsap.set([trackDim, trackLit], { clearProps: 'x' });
              renderMobileSlide(0);
            }
          });

          // 1. Right vertical hairline glides in from outside right into 92%
          if (vlineRight) {
            entranceTween.to(
              vlineRight,
              {
                x: 0,
                duration: 0.95,
                ease: 'power3.out'
              },
              0
            );
          }

          // 2. Project image viewport glides in from outside right to center (8%)
          if (imageViewport) {
            entranceTween.to(
              imageViewport,
              {
                x: 0,
                duration: 1.0,
                ease: 'power3.out'
              },
              0.03
            );
          }

          if (slideImgs[0]) {
            entranceTween.to(
              slideImgs[0],
              {
                scale: 1.0,
                xPercent: 0,
                duration: 1.0,
                ease: 'power3.out'
              },
              0.03
            );
          }

          // 3. Title band glides in from outside right into the spotlight
          entranceTween.to(
            [trackDim, trackLit],
            {
              x: spotlightLeftPx,
              duration: 1.0,
              ease: 'power3.out'
            },
            0.03
          );

          // 4. Info panel lines cascade reveal as image settles
          if (infoInner) {
            const inners = infoInner.querySelectorAll('.text-line-inner');
            if (inners.length) {
              entranceTween.to(
                inners,
                {
                  yPercent: 0,
                  opacity: 1,
                  duration: 0.48,
                  stagger: 0.05,
                  ease: 'power3.out'
                },
                0.45
              );
            }
          }
        }
      });
    }

    initMobileEntrance();

    cleanupMobileCarouselController = () => {
      clearTimeout(mobileResizeTimer);
      if (snapTween) {
        snapTween.kill();
        snapTween = null;
      }
      if (entranceTween) {
        entranceTween.kill();
        entranceTween = null;
      }
      if (entranceTrigger) {
        entranceTrigger.kill();
        entranceTrigger = null;
      }
      if (gridLinesTrigger) {
        gridLinesTrigger.kill(true);
        gridLinesTrigger = null;
      }
      if (suppressClickTimer) {
        clearTimeout(suppressClickTimer);
        suppressClickTimer = null;
      }
      swipeTargets.forEach((target) => {
        target.removeEventListener('touchstart', onTouchStart);
        target.removeEventListener('touchmove', onTouchMove);
        target.removeEventListener('touchend', onTouchEnd);
        target.removeEventListener('touchcancel', onTouchEnd);
        target.removeEventListener('mousedown', onMouseDown);
      });
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onResize);
      section.removeEventListener('click', onCaptureClick, true);
      section.removeEventListener('click', onSectionClick);
      if (elGalleryBtn) {
        elGalleryBtn.removeEventListener('click', openActiveGallery);
      }
      if (projectInfoCtrl) {
        projectInfoCtrl.cleanup();
      }
      if (vlineCenter) {
        vlineCenter.style.left = '';
        vlineCenter.style.transform = '';
      }
      if (vlineRight) {
        vlineRight.style.left = '';
        vlineRight.style.opacity = '';
        vlineRight.style.transform = '';
      }
      if (hline) {
        hline.style.transform = '';
      }
      const infoInner = section.querySelector('#projectInfoInner');
      if (infoInner) {
        const inners = infoInner.querySelectorAll('.text-line-inner');
        if (inners.length) {
          gsap.set(inners, { yPercent: 0, opacity: 1, clearProps: 'transform,opacity' });
        }
      }
      if (layerLit) {
        layerLit.style.clipPath = '';
        layerLit.style.webkitClipPath = '';
      }
      if (imageViewport) {
        imageViewport.style.clipPath = '';
        imageViewport.style.webkitClipPath = '';
        imageViewport.style.transform = '';
      }
      if (trackDim) {
        trackDim.style.transform = '';
      }
      if (trackLit) {
        trackLit.style.transform = '';
      }
      slideFrames.forEach((frame, i) => {
        frame.style.display = '';
        frame.style.transform = '';
        if (slideImgs[i]) {
          slideImgs[i].style.transform = '';
        }
      });
    };
  }

  window.Portfolio.projectMobile = {
    initProjectMobileCarousel,
    cleanupProjectMobile: () => {
      if (cleanupMobileCarouselController) {
        cleanupMobileCarouselController();
        cleanupMobileCarouselController = null;
      }
    }
  };
})(window, document);
