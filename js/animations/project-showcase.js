/**
 * HORIZONTAL PROJECT SHOWCASE CONTROLLER & PINNING ANIMATION
 * Module: js/animations/project-showcase.js
 * Powered by GSAP ScrollTrigger Pinning for True Sticky Horizontal Showcase
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  let cleanupProjectShowcaseController = null;

  function initProjectShowcaseScroll(scope) {
    if (cleanupProjectShowcaseController) {
      cleanupProjectShowcaseController();
      cleanupProjectShowcaseController = null;
    }

    const section = (scope || document).querySelector('#project.project-showcase-section, #portfolio.project-showcase-section');
    if (!section) return;

    const trackDim = section.querySelector('#projectTrackDim');
    const trackLit = section.querySelector('#projectTrackLit');
    const titleBand = section.querySelector('.project-title-band');
    const layerLit = section.querySelector('#projectLayerLit') || section.querySelector('.project-title-layer-lit');
    const vlineRight = section.querySelector('#projectVlineRight') || section.querySelector('.project-vline-right');
    const imageViewport = section.querySelector('#projectImageViewport') || section.querySelector('.project-image-viewport');
    const dimItems = Array.from(section.querySelectorAll('#projectTrackDim .project-title-item'));
    const litItems = Array.from(section.querySelectorAll('#projectTrackLit .project-title-item'));
    const slideFrames = Array.from(section.querySelectorAll('.project-slide-frame'));
    const slideImgs = slideFrames.map((frame) => frame.querySelector('.project-img'));
    const elGalleryBtn = section.querySelector('#projectGalleryTrigger');

    const data = window.PortfolioData;
    const projects = (data && (data.portfolio || data.works)) || [];
    const total = projects.length;

    if (!trackDim || !trackLit || total === 0) return;

    // Initialize Modular Left Info Panel Controller
    const projectInfo = window.Portfolio.projectInfo;
    const projectInfoCtrl = projectInfo && typeof projectInfo.createController === 'function'
      ? projectInfo.createController(section, projects)
      : null;

    let itemOffsets = [];
    let spotlightLeftPx = 0;
    let projectPinTrigger = null;
    let projectScrollTrigger = null;
    let projectScrubTween = null;
    const playhead = { progress: 0 };

    const entrySpan = 0.60; // Clean entry span matching pre-pin scroll
    const fMin = -entrySpan;
    const pinnedExitSpan = 0.35; // Stage unpins and switches to vertical scroll at exactly 50% image closure
    const verticalExitSpan = 0.35; // While scrolling vertically, image completes remaining 50% to 100% closure
    const totalExitSpan = pinnedExitSpan + verticalExitSpan; // 0.70 total exit span
    const fMax = (total - 1) + totalExitSpan;
    const fRange = fMax - fMin;

    function measureMetrics() {
      const vw = window.innerWidth;
      const isMobile = vw <= 768;

      // Spotlight column left boundary: 33% on desktop/tablet, 28% on mobile
      spotlightLeftPx = vw * (isMobile ? 0.28 : 0.33);

      // Column width matches .project-image-viewport (55vw on desktop, 68vw on mobile)
      const colWidthPx = vw * (isMobile ? 0.68 : 0.55);

      // Record exact anchor offset of each title item to stay strictly in line (sebaris) with slide frames
      itemOffsets = dimItems.map((el, idx) => idx * colWidthPx);
    }

    function renderFrame(rawProgress) {
      if (itemOffsets.length === 0) {
        measureMetrics();
      }

      const vw = window.innerWidth;
      const isMobile = vw <= 768;
      const leftColPct = isMobile ? 28 : 33;
      const baseRightColPct = isMobile ? 96 : 88;
      const colWidthPct = baseRightColPct - leftColPct; // 55% on desktop, 68% on mobile

      const progress = Math.max(0, Math.min(1, typeof rawProgress === 'number' ? rawProgress : 0));

      // Continuous project index f in [fMin, fMax] where:
      // f = -entrySpan..0.0 is Entry (starts before sticky, reaches 0.0 exactly when stage pins at top 0%),
      // f = 0..total-1 is Showcase transitions (each 1.0 unit),
      // f = total-1..total is Exit (right line closes from 88% to 33%)
      const rawF = fMin + progress * fRange;

      // C1-Continuous Hermite Easing at Entry & Exit so horizontal velocity
      // accelerates gently from vertical scroll and matches slope 1.000 at f = 0 and f = total - 1
      let f = rawF;
      let cushionY = 0;

      if (rawF < 0) {
        const u = Math.max(0, Math.min(1, (rawF + entrySpan) / entrySpan));
        // C1-Continuous smooth acceleration: starts with 0 velocity, ramps gently to 1.0 at f = 0
        const easedU = 2 * u * u - u * u * u;
        f = -entrySpan + easedU * entrySpan;
        // Soft vertical landing cushion across the top 0% pin boundary (decays to 0 at f = 0)
        cushionY = Math.pow(1 - u, 2.2) * 16;
      } else if (rawF > total - 1) {
        const exitRatio = Math.max(0, Math.min(1, (rawF - (total - 1)) / totalExitSpan));
        const easedV = exitRatio * exitRatio * (3 - 2 * exitRatio);
        f = (total - 1) + easedV * totalExitSpan;
        cushionY = 0; // Strict zero upward shift on exit to eliminate overflow into title band
      }

      // ─── 1. Dynamic Right Vertical Hairline & Spotlight / Viewport Clipping ───
      const entryT = f < 0 ? Math.max(0, Math.min(1, (f + entrySpan) / entrySpan)) : 1;
      const title0ScreenPct = f < 0 ? 100 - entryT * (100 - leftColPct) : leftColPct;

      let rightLinePct = baseRightColPct;
      let viewportRightClipPct = 0;

      if (f < 0) {
        // Phase A1 (100% -> 88%): rightLinePct moves in lockstep with Title 0 left edge
        // Phase A2 (88% -> 33%): rightLinePct locks at baseRightColPct (88%) while Title 0 & Slide 0 cross inside
        rightLinePct = Math.max(baseRightColPct, title0ScreenPct);
        viewportRightClipPct = 0;
      } else if (f > total - 1) {
        // Exit: closes image completely to 100% (88% -> 33%, ketutup semua)
        const exitRatio = Math.max(0, Math.min(1, (f - (total - 1)) / totalExitSpan));
        rightLinePct = baseRightColPct - exitRatio * colWidthPct;
        viewportRightClipPct = exitRatio * 100; // 0% -> 100%
      } else {
        rightLinePct = baseRightColPct;
        viewportRightClipPct = 0;
      }

      if (vlineRight) {
        vlineRight.style.left = `${rightLinePct.toFixed(2)}%`;
        vlineRight.style.opacity = '1';
      }

      if (layerLit) {
        const rightInsetPct = Math.max(0, 100 - rightLinePct);
        const litClip = `inset(0 ${rightInsetPct.toFixed(2)}% 0 ${leftColPct}%)`;
        layerLit.style.clipPath = litClip;
        layerLit.style.webkitClipPath = litClip;
      }

      if (imageViewport) {
        const vpClip = `inset(0 ${viewportRightClipPct.toFixed(2)}% 0 0)`;
        imageViewport.style.clipPath = vpClip;
        imageViewport.style.webkitClipPath = vpClip;
        imageViewport.style.transform = cushionY > 0.2 ? `translate3d(0, ${cushionY.toFixed(1)}px, 0)` : '';
      }

      if (titleBand) {
        titleBand.style.transform = cushionY > 0.2 ? `translate3d(0, ${cushionY.toFixed(1)}px, 0)` : '';
      }

      // ─── 2. Title Track Glide: Full Stage Overflow with Lit Current Title ───
      let trackX = 0;
      const firstOffset = itemOffsets[0] || 0;
      const lastOffset = itemOffsets[total - 1] || firstOffset;

      if (f < 0) {
        // Title 01 starts from 100% (offscreen) and glides to 33% (spotlight)
        const title0ScreenPx = (title0ScreenPct / 100) * vw;
        trackX = title0ScreenPx - firstOffset;
      } else if (f > total - 1) {
        const exitRatio = Math.max(0, Math.min(1, (f - (total - 1)) / totalExitSpan));
        const lastTitleEl = dimItems[total - 1];
        const lastTextSpan = lastTitleEl ? lastTitleEl.querySelector('.project-title-text') : null;
        const textWidth = (lastTextSpan && lastTextSpan.offsetWidth) || vw * 0.18;
        const exitShiftPx = exitRatio * (textWidth * 0.55);
        trackX = spotlightLeftPx - lastOffset - exitShiftPx;
      } else {
        const lowerIdx = Math.floor(f);
        const upperIdx = Math.min(total - 1, lowerIdx + 1);
        const t = f - lowerIdx;
        const offsetA = itemOffsets[lowerIdx] !== undefined ? itemOffsets[lowerIdx] : firstOffset;
        const offsetB = itemOffsets[upperIdx] !== undefined ? itemOffsets[upperIdx] : offsetA;
        const currentAnchorOffset = offsetA + (offsetB - offsetA) * t;
        trackX = spotlightLeftPx - currentAnchorOffset;
      }

      const trackTransform = `translate3d(${trackX.toFixed(2)}px, 0, 0)`;
      if (trackDim) {
        trackDim.style.transform = trackTransform;
        trackDim.style.opacity = '1';
      }
      if (trackLit) {
        trackLit.style.transform = trackTransform;
        trackLit.style.opacity = '1';
      }

      // Keep title items at constant opacity 1 without 0 -> 1 fade
      for (let k = 0; k < litItems.length; k++) {
        litItems[k].style.opacity = '1';
      }

      // ─── 3. Stacked Image Slides (Synchronized Entry Wipe, Zoom Parallax & Aperture Exit) ───
      for (let i = 0; i < slideFrames.length; i++) {
        const frame = slideFrames[i];
        const img = slideImgs[i];
        const delta = i - f; // delta = 0 when project i is centered in active viewport

        let isVisible = false;
        if (f < 0) {
          isVisible = (i === 0);
        } else {
          isVisible = Math.abs(delta) < 1.15;
        }

        if (!isVisible) {
          frame.style.display = 'none';
          continue;
        }
        frame.style.display = '';

        let frameXPercent = 0;
        let imgXPercent = 0;
        let imgScale = 1.0;

        if (i === 0 && f < 0) {
          // Slide 0 left edge stays 100% locked to Title 0 left edge
          frameXPercent = ((title0ScreenPct - leftColPct) / colWidthPct) * 100;
          const visibleEntryDelta = Math.max(0, Math.min(1, frameXPercent / 100));
          imgXPercent = -22 * visibleEntryDelta;
          imgScale = 1.0 + visibleEntryDelta * 0.25;
        } else if (i === total - 1 && delta < 0) {
          // Last Slide (07) Exit
          const exitRatio = Math.max(0, Math.min(1, -delta / totalExitSpan));
          frameXPercent = -exitRatio * 14;
          imgXPercent = exitRatio * 8;
          imgScale = 1.0;
        } else {
          // Standard slide transition
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
        }

        frame.style.transform = `translate3d(${frameXPercent.toFixed(2)}%, 0, 0)`;
        frame.style.opacity = '1';
        if (img) {
          img.style.transform = `translate3d(${imgXPercent.toFixed(2)}%, 0, 0) scale(${imgScale.toFixed(3)})`;
        }
      }

      // ─── 4. Active Current Frame State & Info Panel / Bottom Status Visibility ───
      const isEntering = f < -0.35;
      const isExiting = f > (total - 1) + pinnedExitSpan;
      const nearestIdx = Math.max(0, Math.min(total - 1, Math.round(f)));

      slideFrames.forEach((el, idx) => {
        const isCurrent = (idx === nearestIdx) && !isEntering && !isExiting;
        el.classList.toggle('is-current-frame', isCurrent);
      });

      let stageAlpha = 1.0;

      if (f < 0) {
        const revealProgress = Math.max(0, Math.min(1, (baseRightColPct - title0ScreenPct) / colWidthPct));
        stageAlpha = Math.min(1, revealProgress * 1.6);
      } else if (f > total - 1) {
        const exitRatio = Math.max(0, Math.min(1, (f - (total - 1)) / totalExitSpan));
        const infoExitRatio = Math.min(1, exitRatio / (pinnedExitSpan / totalExitSpan));
        stageAlpha = Math.max(0, 1 - Math.pow(infoExitRatio, 1.1));
      }

      if (projectInfoCtrl) {
        projectInfoCtrl.setInfoOpacity(stageAlpha, cushionY > 0.2 ? cushionY * 0.75 : 0);
        projectInfoCtrl.updateActiveProjectInfo(nearestIdx);
      }
    }

    function scrollToProjectIndex(targetIdx) {
      if (targetIdx < 0 || targetIdx >= total) return;
      const ratio = (targetIdx - fMin) / fRange;
      let targetY = 0;

      if (projectScrollTrigger) {
        targetY = projectScrollTrigger.start + ratio * (projectScrollTrigger.end - projectScrollTrigger.start);
      } else {
        const rect = section.getBoundingClientRect();
        const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        targetY = rect.top + scrollY;
      }

      const scrollService = window.Portfolio.scroll;
      if (scrollService && typeof scrollService.scrollTo === 'function') {
        scrollService.scrollTo(targetY, { duration: 1.1 });
      } else {
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    }

    function openActiveGallery() {
      const activeIdx = projectInfoCtrl ? projectInfoCtrl.getCurrentActiveIndex() : 0;
      const idx = activeIdx >= 0 ? activeIdx : 0;
      const activeFrame = slideFrames[idx];
      if (window.Portfolio.carousel && typeof window.Portfolio.carousel.openGallery === 'function') {
        window.Portfolio.carousel.openGallery(idx, 0, activeFrame);
      } else if (activeFrame) {
        activeFrame.click();
      }
    }

    function onSectionClick(e) {
      const titleBtn = e.target.closest('.project-title-btn');
      if (titleBtn) {
        const idx = parseInt(titleBtn.getAttribute('data-index'), 10);
        if (!isNaN(idx)) {
          const currentIdx = projectInfoCtrl ? projectInfoCtrl.getCurrentActiveIndex() : -1;
          if (idx === currentIdx) {
            openActiveGallery();
          } else {
            scrollToProjectIndex(idx);
          }
        }
        return;
      }
    }

    section.addEventListener('click', onSectionClick);
    if (elGalleryBtn) {
      elGalleryBtn.addEventListener('click', openActiveGallery);
    }

    measureMetrics();
    renderFrame(0);

    const stage = section.querySelector('#projectStickyStage') || section.querySelector('#portfolioList') || section;

    if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
      const getPinStart = () => (projectPinTrigger ? projectPinTrigger.start : stage.offsetTop);
      const getStepPx = () => window.innerHeight * 0.78;
      const getPrePinPx = () => entrySpan * getStepPx();
      const getTotalPinnedScrollPx = () => (entrySpan + (total - 1) + pinnedExitSpan) * getStepPx();
      const getPinDurationPx = () => Math.max(window.innerHeight, getTotalPinnedScrollPx() - getPrePinPx());
      const getPostPinPx = () => verticalExitSpan * getStepPx();

      projectPinTrigger = ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        end: () => `+=${getPinDurationPx()}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 0,
        refreshPriority: 1,
        invalidateOnRefresh: true
      });

      projectScrubTween = gsap.to(playhead, {
        progress: 1,
        ease: 'none',
        onUpdate: () => {
          renderFrame(playhead.progress);
        },
        scrollTrigger: {
          trigger: stage,
          start: () => Math.max(0, getPinStart() - getPrePinPx()),
          end: () => (projectPinTrigger ? projectPinTrigger.end + getPostPinPx() : getPinStart() + getPinDurationPx() + getPostPinPx()),
          scrub: 0.25,
          refreshPriority: 0,
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            measureMetrics();
            playhead.progress = self.progress;
            renderFrame(playhead.progress);
          }
        }
      });

      projectScrollTrigger = projectScrubTween.scrollTrigger;
    }

    const onResize = () => {
      measureMetrics();
      if (projectInfoCtrl) {
        projectInfoCtrl.onResize();
      }
      if (projectScrollTrigger) {
        renderFrame(playhead.progress);
      } else {
        renderFrame(0);
      }
    };

    window.addEventListener('resize', onResize, { passive: true });

    cleanupProjectShowcaseController = () => {
      section.removeEventListener('click', onSectionClick);
      if (elGalleryBtn) {
        elGalleryBtn.removeEventListener('click', openActiveGallery);
      }
      window.removeEventListener('resize', onResize);
      if (projectScrubTween) {
        projectScrubTween.kill();
        projectScrubTween = null;
      }
      if (projectScrollTrigger) {
        projectScrollTrigger.kill(true);
        projectScrollTrigger = null;
      }
      if (projectPinTrigger) {
        projectPinTrigger.kill(true);
        projectPinTrigger = null;
      }
      if (projectInfoCtrl) {
        projectInfoCtrl.cleanup();
      }
      if (imageViewport) {
        imageViewport.style.transform = '';
      }
      if (titleBand) {
        titleBand.style.transform = '';
      }
      slideFrames.forEach((frame) => {
        frame.style.display = '';
      });
      if (vlineRight) {
        vlineRight.style.opacity = '';
      }
    };
  }

  window.Portfolio.projectShowcase = {
    initProjectShowcaseScroll,
    cleanupProjectShowcase: () => {
      if (cleanupProjectShowcaseController) {
        cleanupProjectShowcaseController();
        cleanupProjectShowcaseController = null;
      }
    }
  };
})(window, document);

