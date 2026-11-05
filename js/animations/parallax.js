/**
 * GLOBAL PARALLAX, SCROLL REVEALS & HORIZONTAL PORTFOLIO CONTROLLER
 * Module: js/animations/parallax.js
 * Powered by GSAP ScrollTrigger Pinning for True Sticky Horizontal Showcase
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  let cleanupProjectShowcaseController = null;

  function formatIndex(num) {
    return num < 10 ? `0${num}` : `${num}`;
  }

  /**
   * Horizontal Scroll + Image Wipe Parallax Controller for Home #portfolio
   * Uses GSAP ScrollTrigger Pinning (pin: true) so vertical scroll is captured until horizontal completes.
   */
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

    // Left Info Panel & Bottom Bar DOM nodes
    const infoPanel = section.querySelector('.project-info-panel');
    const infoInner = section.querySelector('#projectInfoInner');
    const elIndex = section.querySelector('#projectActiveIndex');
    const elCategory = section.querySelector('#projectActiveCategory');
    const elDesc = section.querySelector('#projectActiveDesc');
    const elYear = section.querySelector('#projectActiveYear');
    const elStack = section.querySelector('#projectActiveStack');
    const elLink = section.querySelector('#projectActiveLink');
    const elLinkText = section.querySelector('#projectActiveLinkText');
    const elGalleryBtn = section.querySelector('#projectGalleryTrigger');
    const elBottomTitle = section.querySelector('#projectBottomTitle');
    const elCounterCurrent = section.querySelector('#projectCounterCurrent');

    const data = window.PortfolioData;
    const projects = (data && (data.portfolio || data.works)) || [];
    const total = projects.length;

    if (!trackDim || !trackLit || total === 0) return;

    let itemOffsets = [];
    let spotlightLeftPx = 0;
    let currentActiveIdx = -1;
    let projectPinTrigger = null;
    let projectScrollTrigger = null;
    let projectScrubTween = null;
    const playhead = { progress: 0 };

    const fMin = -1;
    const fMax = total;
    const fRange = fMax - fMin; // total + 1

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

    let infoSwitchTween = null;

    function formatTextLines(containerEl, text) {
      if (!containerEl) return;
      if (!text) {
        containerEl.innerHTML = '';
        return;
      }

      // 1. Temporarily place words in DOM to measure exact client-rendered line wrapping
      const words = text.trim().split(/\s+/);
      containerEl.innerHTML = words
        .map((w) => `<span class="temp-word">${w}</span>`)
        .join(' ');

      const wordEls = containerEl.querySelectorAll('.temp-word');
      const lines = [];
      let currentWords = [];
      let currentTop = -1;

      wordEls.forEach((el) => {
        const top = el.offsetTop;
        if (currentTop !== -1 && Math.abs(top - currentTop) > 4) {
          if (currentWords.length) lines.push(currentWords.join(' '));
          currentWords = [];
        }
        currentWords.push(el.textContent);
        currentTop = top;
      });
      if (currentWords.length) {
        lines.push(currentWords.join(' '));
      }

      // Fallback if offsetTop is not measurable (e.g. 0 height before layout)
      if (lines.length <= 1 && text.length > 70) {
        const fallbackLines = text.match(/[^,;:.!?]+[,;:.!?]+(\s|$)|[^,;:.!?]+$/g) || [text];
        containerEl.innerHTML = fallbackLines
          .map((l) => l.trim())
          .filter(Boolean)
          .map((line) => `<span class="text-line-mask"><span class="text-line-inner">${line}</span></span>`)
          .join('');
        return;
      }

      // Wrap each visual line into an overflow-hidden mask and inner reveal span
      containerEl.innerHTML = lines
        .map((line) => `<span class="text-line-mask"><span class="text-line-inner">${line}</span></span>`)
        .join('');
    }

    function applyProjectInfoContent(item, newIdx) {
      if (!item) return;
      if (elIndex) elIndex.textContent = `${formatIndex(newIdx + 1)} // ${formatIndex(total)}`;
      if (elCategory) elCategory.textContent = item.category || '';
      if (elDesc) formatTextLines(elDesc, item.description);
      if (elYear) elYear.textContent = item.year || '';
      if (elStack) elStack.textContent = item.stack || '';

      if (elLink) {
        if (item.linkUrl) {
          elLink.style.display = 'inline-flex';
          elLink.setAttribute('href', item.linkUrl);
          if (item.linkUrl.startsWith('http')) {
            elLink.setAttribute('target', '_blank');
            elLink.setAttribute('rel', 'noopener noreferrer');
          } else {
            elLink.removeAttribute('target');
            elLink.removeAttribute('rel');
          }
          if (elLinkText) elLinkText.textContent = item.linkText || 'Live Demo';
        } else {
          elLink.style.display = 'none';
        }
      }
    }

    function updateActiveProjectInfo(newIdx) {
      if (newIdx === currentActiveIdx || !projects[newIdx]) return;
      const prevIdx = currentActiveIdx;
      currentActiveIdx = newIdx;
      const item = projects[newIdx];

      dimItems.forEach((el, idx) => el.classList.toggle('is-active', idx === newIdx));
      litItems.forEach((el, idx) => el.classList.toggle('is-active', idx === newIdx));
      slideFrames.forEach((el, idx) => el.classList.toggle('is-current-frame', idx === newIdx));

      if (elCounterCurrent) elCounterCurrent.textContent = formatIndex(newIdx + 1);
      if (elBottomTitle) elBottomTitle.textContent = item.title;

      // On initial load, apply content immediately without animation
      if (prevIdx === -1 || !infoInner) {
        applyProjectInfoContent(item, newIdx);
        return;
      }

      // Staggered Line Reveal Animation (GSAP)
      // Cascades sequentially from top to bottom: Meta -> Desc Lines -> Specs -> Actions
      if (typeof gsap !== 'undefined') {
        if (infoSwitchTween) infoSwitchTween.kill();
        gsap.killTweensOf(infoInner.querySelectorAll('.text-line-inner'));

        const oldInners = infoInner.querySelectorAll('.text-line-inner');

        infoSwitchTween = gsap.timeline();

        // 1. Exit: Outgoing lines slide up and fade out through masks
        if (oldInners.length) {
          infoSwitchTween.to(oldInners, {
            yPercent: -105,
            opacity: 0,
            duration: 0.16,
            stagger: 0.02,
            ease: 'power2.in'
          }, 0);
        }

        // 2. On exit complete: swap content into DOM and reveal one by one from top to bottom
        infoSwitchTween.call(() => {
          applyProjectInfoContent(item, newIdx);

          const newInners = infoInner.querySelectorAll('.text-line-inner');

          if (newInners.length) {
            gsap.fromTo(
              newInners,
              { yPercent: 110, opacity: 0 },
              {
                yPercent: 0,
                opacity: 1,
                duration: 0.38,
                stagger: 0.065, // Reveal satu persatu dari atas ke bawah
                ease: 'power3.out'
              }
            );
          }
        });
      } else {
        infoInner.style.transition = 'opacity 0.14s ease, transform 0.14s ease';
        infoInner.style.opacity = '0';
        infoInner.style.transform = 'translate3d(0, -3px, 0)';
        setTimeout(() => {
          applyProjectInfoContent(item, newIdx);
          infoInner.style.transform = 'translate3d(0, 4px, 0)';
          requestAnimationFrame(() => {
            infoInner.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
            infoInner.style.opacity = '1';
            infoInner.style.transform = 'translate3d(0, 0, 0)';
          });
        }, 140);
      }
    }

    function renderFrame(rawProgress) {
      if (itemOffsets.length === 0) {
        measureMetrics();
      }

      const vw = window.innerWidth;
      const isMobile = vw <= 768;
      const leftColPct = isMobile ? 28 : 33;
      const baseRightColPct = isMobile ? 96 : 88;
      const colWidthPct = baseRightColPct - leftColPct; // 55% on desktop (88 - 33 = 55), 68% on mobile

      const progress = Math.max(0, Math.min(1, typeof rawProgress === 'number' ? rawProgress : 0));

      // Continuous project index f in [fMin, fMax] where:
      // f = -1.0..0.0 is Entry (starts at 50% vertical scroll before sticky, finishes after sticky at 33% spotlight),
      // f = 0..total-1 is Showcase transitions (each 1.0 unit),
      // f = total-1..total is Exit (right line closes from 88% to 33%)
      const rawF = fMin + progress * fRange;

      // C1-Continuous Hermite Easing at Entry & Exit so horizontal velocity
      // accelerates gently from vertical scroll and matches slope 1.000 at f = 0 and f = total - 1
      let f = rawF;
      let cushionY = 0;

      if (rawF < 0) {
        const u = Math.max(0, Math.min(1, rawF + 1.0));
        const easedU = -0.6 * u * u * u + 1.2 * u * u + 0.4 * u;
        f = -1.0 + easedU;
        // Soft vertical landing cushion across the top 0% pin boundary
        cushionY = Math.pow(1 - u, 2) * 26;
      } else if (rawF > total - 1) {
        const v = Math.max(0, Math.min(1, rawF - (total - 1)));
        const inv = 1 - v;
        const easedV = 1 - (-0.6 * inv * inv * inv + 1.2 * inv * inv + 0.4 * inv);
        f = (total - 1) + easedV;
        // Soft vertical release cushion before unpinning to next section
        cushionY = -Math.pow(v, 2) * 22;
      }

      // ─── 1. Dynamic Right Vertical Hairline & Spotlight / Viewport Clipping ───
      const entryT = f < 0 ? Math.max(0, Math.min(1, f + 1.0)) : 1;
      const title0ScreenPct = f < 0 ? 100 - entryT * (100 - leftColPct) : leftColPct;

      let rightLinePct = baseRightColPct;
      let viewportRightClipPct = 0;

      if (f < 0) {
        // Phase A1 (100% -> 88%): rightLinePct moves in lockstep with Title 0 left edge (ref1 -> ref2)
        // Phase A2 (88% -> 33%): rightLinePct locks at baseRightColPct (88%) while Title 0 & Slide 0 cross inside (ref3)
        rightLinePct = Math.max(baseRightColPct, title0ScreenPct);
        viewportRightClipPct = 0;
      } else if (f > total - 1) {
        // Phase C: closes from 88% -> 33%
        const exitT = Math.max(0, Math.min(1, f - (total - 1)));
        rightLinePct = baseRightColPct - exitT * colWidthPct;
        viewportRightClipPct = exitT * 100;
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
        imageViewport.style.transform = `translate3d(0, ${cushionY.toFixed(2)}px, 0)`;
      }

      if (titleBand) {
        titleBand.style.transform = `translate3d(0, ${(cushionY * 0.65).toFixed(2)}px, 0)`;
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
        const exitT = Math.max(0, Math.min(1, f - (total - 1)));
        const lastTitleEl = dimItems[total - 1];
        const lastTextSpan = lastTitleEl ? lastTitleEl.querySelector('.project-title-text') : null;
        const textWidth = (lastTextSpan && lastTextSpan.offsetWidth) || vw * 0.18;
        const exitShiftPx = exitT * (textWidth * 1.28);
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

        // Determine if slide is visible:
        // - During Entry (f < 0): ONLY Slide 0 is allowed on stage. Future slides (1..total-1) remain completely hidden!
        // - During Showcase (f >= 0): Only active transitioning slides (|delta| < 1.15) are visible.
        // Prevents future slides (e.g. Kasumi with higher z-index) from leaking or overlapping Slide 0.
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
          // Slide 0 left edge stays 100% locked to Title 0 left edge (title0ScreenPct),
          // while its right edge is clipped at baseRightColPct (88%) by .project-image-viewport (ref3)
          frameXPercent = ((title0ScreenPct - leftColPct) / colWidthPct) * 100;
          const visibleEntryDelta = Math.max(0, Math.min(1, frameXPercent / 100));
          imgXPercent = -22 * visibleEntryDelta;
          imgScale = 1.0 + visibleEntryDelta * 0.25;
        } else if (i === total - 1 && delta < 0) {
          // Last Slide (07) Exit: stays anchored inside [33%, rightLinePct] with subtle counter-drift
          // while the right hairline (rightLinePct) & viewport clip-path close from 88% to 33%
          const exitT = Math.max(0, Math.min(1, -delta));
          frameXPercent = -exitT * 14;
          imgXPercent = exitT * 8;
          imgScale = 1.0;
        } else {
          // Standard slide transition (applies uniformly to Slide 0 and all subsequent slides)
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
      const isExiting = f > (total - 1) + 0.72;
      const nearestIdx = Math.max(0, Math.min(total - 1, Math.round(f)));

      slideFrames.forEach((el, idx) => {
        const isCurrent = (idx === nearestIdx) && !isEntering && !isExiting;
        el.classList.toggle('is-current-frame', isCurrent);
      });

      let stageAlpha = 1.0;
      let stageY = 0;

      if (f < 0) {
        // Left info panel & status bar stay hidden while Title 0 is in [88%, 100%] (ref1, ref2),
        // then fade in smoothly as Title 0 & Slide 0 cross 88% into the spotlight column (ref3)
        const revealProgress = Math.max(0, Math.min(1, (baseRightColPct - title0ScreenPct) / colWidthPct));
        stageAlpha = Math.min(1, revealProgress * 1.6);
        stageY = (1 - stageAlpha) * 16;
      } else if (f > total - 1) {
        const exitT = Math.max(0, Math.min(1, f - (total - 1)));
        if (exitT <= 0.65) {
          stageAlpha = 1.0;
          stageY = 0;
        } else {
          const fadeOutT = Math.min(1, (exitT - 0.65) / 0.22);
          stageAlpha = 1 - fadeOutT;
          stageY = -fadeOutT * 12;
        }
      }

      if (infoPanel) {
        infoPanel.style.opacity = stageAlpha.toFixed(2);
        infoPanel.style.transform = `translate3d(0, ${stageY.toFixed(1)}px, 0)`;
      }

      const elBottomRight = section.querySelector('.project-bottom-right');
      if (elBottomRight) {
        elBottomRight.style.opacity = stageAlpha.toFixed(2);
      }

      // Update active metadata when nearest integer project changes
      updateActiveProjectInfo(nearestIdx);
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
      const idx = currentActiveIdx >= 0 ? currentActiveIdx : 0;
      const activeFrame = slideFrames[idx];
      if (window.Portfolio.carousel && typeof window.Portfolio.carousel.openGallery === 'function') {
        window.Portfolio.carousel.openGallery(idx, 0, activeFrame);
      } else if (activeFrame) {
        activeFrame.click();
      }
    }

    // Click handler on Title Track Buttons
    function onSectionClick(e) {
      const titleBtn = e.target.closest('.project-title-btn');
      if (titleBtn) {
        const idx = parseInt(titleBtn.getAttribute('data-index'), 10);
        if (!isNaN(idx)) {
          if (idx === currentActiveIdx) {
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

    // Target the 100vh horizontal stage so pinning activates after the header scrolls out of view
    const stage = section.querySelector('#projectStickyStage') || section.querySelector('#portfolioList') || section;

    // Initialize GSAP ScrollTrigger:
    // 1. Separate Pin Trigger (locks stage into sticky strictly when reaching top 0%, anticipatePin: 0 to avoid Lenis snap)
    // 2. Scrubbed Playhead Tween (starts at 50% vertical scroll before sticky, continues seamlessly through sticky)
    if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
      const getPinStart = () => (projectPinTrigger ? projectPinTrigger.start : stage.offsetTop);
      const getPrePinPx = () => window.innerHeight * 0.55;
      const getStepPx = () => window.innerHeight * 0.78;
      const getTotalScrollPx = () => (total + 1) * getStepPx();
      const getPinDurationPx = () => Math.max(window.innerHeight, getTotalScrollPx() - getPrePinPx());

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
          end: () => (projectPinTrigger ? projectPinTrigger.end : getPinStart() + getPinDurationPx()),
          scrub: 0.65,
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
      if (currentActiveIdx >= 0 && projects[currentActiveIdx] && elDesc) {
        formatTextLines(elDesc, projects[currentActiveIdx].description);
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
      if (infoSwitchTween) {
        infoSwitchTween.kill();
        infoSwitchTween = null;
      }
      if (infoPanel) {
        infoPanel.style.opacity = '';
        infoPanel.style.transform = '';
      }
      if (infoInner) {
        if (typeof gsap !== 'undefined') {
          gsap.killTweensOf(infoInner.querySelectorAll('.text-line-inner'));
        }
        infoInner.style.opacity = '';
        infoInner.style.transform = '';
        const inners = infoInner.querySelectorAll('.text-line-inner');
        inners.forEach((el) => {
          el.style.transform = '';
          el.style.opacity = '';
        });
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

  function initParallaxAnimations(container) {
    const scope = container || document;

    // Initialize Horizontal Showcase if #project or #portfolio is inside scope
    if (scope === document || scope.id === 'viewHome' || scope.querySelector('#project.project-showcase-section, #portfolio.project-showcase-section')) {
      initProjectShowcaseScroll(scope);
    }

    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

    if (hasGSAP) {
      // 1. BACKGROUND OUTLINED TEXTS PARALLAX (TIMELINE, SKILLS, EDUCATION, PROJECTS)
      const outlineTexts = scope.querySelectorAll('.bg-outline-text');
      outlineTexts.forEach((text) => {
        const parent = text.closest('section') || text.parentElement;
        if (!parent) return;

        const isProjectSection = parent.id === 'project' || parent.classList.contains('project-showcase-section');

        if (isProjectSection) {
          // Dedicated parallax for Project header area: settles directly behind 'PROJECT' title like other sections
          const headerArea = parent.querySelector('.project-header-area') || parent;
          const speed = parseFloat(text.getAttribute('data-parallax')) || 0.18;
          gsap.fromTo(
            text,
            { y: 0 },
            {
              y: () => headerArea.offsetHeight * speed,
              ease: 'none',
              scrollTrigger: {
                trigger: headerArea,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.8,
                invalidateOnRefresh: true
              }
            }
          );
        } else {
          const speed = parseFloat(text.getAttribute('data-parallax')) || 0.2;

          gsap.fromTo(
            text,
            { y: 0 },
            {
              y: () => parent.offsetHeight * speed,
              ease: 'none',
              scrollTrigger: {
                trigger: parent,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.8,
                invalidateOnRefresh: true
              }
            }
          );
        }
      });

      // 2. THE ARCHIVE PROJECT IMAGES ZOOM + VERTICAL PARALLAX (/all-project page)
      const projectItems = scope.querySelectorAll('.project-item');
      projectItems.forEach((item) => {
        const img = item.querySelector('.project-img');
        if (img) {
          gsap.fromTo(
            img,
            {
              yPercent: -10,
              scale: 1.25,
              transformOrigin: 'center center'
            },
            {
              yPercent: 6,
              scale: 1.0,
              transformOrigin: 'center center',
              ease: 'none',
              scrollTrigger: {
                trigger: item,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true
              }
            }
          );
        }
      });

      // 3. SCROLL REVEAL VIA GSAP BATCH
      const revealTargets = Array.from(scope.querySelectorAll('.reveal:not(.revealed)'));
      if (revealTargets.length) {
        ScrollTrigger.batch(revealTargets, {
          start: 'top 88%',
          once: true,
          onEnter: (batch) => {
            batch.forEach((el) => {
              el.classList.add('revealed');
            });
            if (typeof window.renderTimelinePath === 'function') {
              window.renderTimelinePath();
            }
          }
        });
      }
    } else {
      const revealElements = scope.querySelectorAll('.reveal');
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -40px 0px'
        }
      );

      revealElements.forEach((el) => {
        revealObserver.observe(el);
      });
    }
  }

  window.Portfolio.parallax = {
    initParallaxAnimations,
    cleanupProjectShowcase: () => {
      if (cleanupProjectShowcaseController) {
        cleanupProjectShowcaseController();
        cleanupProjectShowcaseController = null;
      }
    }
  };
})(window, document);
