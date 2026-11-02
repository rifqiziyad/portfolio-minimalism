/**
 * GLOBAL PARALLAX, SCROLL REVEALS & SANTAL HORIZONTAL PORTFOLIO CONTROLLER
 * Module: js/animations/parallax.js
 * Powered by GSAP ScrollTrigger Pinning for True Sticky Horizontal Showcase
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  let cleanupSantalController = null;

  function formatIndex(num) {
    return num < 10 ? `0${num}` : `${num}`;
  }

  /**
   * Santal-inspired Horizontal Scroll + Image Wipe Parallax Controller for Home #portfolio
   * Uses GSAP ScrollTrigger Pinning (pin: true) so vertical scroll is captured until horizontal completes.
   */
  function initSantalPortfolioScroll(scope) {
    if (cleanupSantalController) {
      cleanupSantalController();
      cleanupSantalController = null;
    }

    const section = (scope || document).querySelector('#project.santal-portfolio-section, #portfolio.santal-portfolio-section');
    if (!section) return;

    const trackDim = section.querySelector('#santalTrackDim');
    const trackLit = section.querySelector('#santalTrackLit');
    const layerLit = section.querySelector('#santalLayerLit') || section.querySelector('.santal-title-layer-lit');
    const vlineRight = section.querySelector('#santalVlineRight') || section.querySelector('.santal-vline-right');
    const imageViewport = section.querySelector('#santalImageViewport') || section.querySelector('.santal-image-viewport');
    const dimItems = Array.from(section.querySelectorAll('#santalTrackDim .santal-title-item'));
    const litItems = Array.from(section.querySelectorAll('#santalTrackLit .santal-title-item'));
    const slideFrames = Array.from(section.querySelectorAll('.santal-slide-frame'));
    const slideImgs = slideFrames.map((frame) => frame.querySelector('.project-img'));

    // Left Info Panel & Bottom Bar DOM nodes
    const infoInner = section.querySelector('#santalInfoInner');
    const elIndex = section.querySelector('#santalActiveIndex');
    const elCategory = section.querySelector('#santalActiveCategory');
    const elDesc = section.querySelector('#santalActiveDesc');
    const elYear = section.querySelector('#santalActiveYear');
    const elStack = section.querySelector('#santalActiveStack');
    const elLink = section.querySelector('#santalActiveLink');
    const elLinkText = section.querySelector('#santalActiveLinkText');
    const elGalleryBtn = section.querySelector('#santalGalleryTrigger');
    const elBottomTitle = section.querySelector('#santalBottomTitle');
    const elCounterCurrent = section.querySelector('#santalCounterCurrent');

    const data = window.PortfolioData;
    const projects = (data && (data.portfolio || data.works)) || [];
    const total = projects.length;

    if (!trackDim || !trackLit || total === 0) return;

    let itemOffsets = [];
    let spotlightLeftPx = 0;
    let currentActiveIdx = -1;
    let santalScrollTrigger = null;

    const fMin = -1;
    const fMax = total;
    const fRange = fMax - fMin; // total + 1

    function measureMetrics() {
      const vw = window.innerWidth;
      const isMobile = vw <= 768;

      // Spotlight column left boundary: 50% on desktop/tablet, 28% on mobile
      spotlightLeftPx = vw * (isMobile ? 0.28 : 0.5);

      // Record offsetLeft of each title item inside the track
      itemOffsets = dimItems.map((el) => el.offsetLeft);
    }

    function updateActiveProjectInfo(newIdx) {
      if (newIdx === currentActiveIdx || !projects[newIdx]) return;
      currentActiveIdx = newIdx;
      const item = projects[newIdx];

      dimItems.forEach((el, idx) => el.classList.toggle('is-active', idx === newIdx));
      litItems.forEach((el, idx) => el.classList.toggle('is-active', idx === newIdx));
      slideFrames.forEach((el, idx) => el.classList.toggle('is-current-frame', idx === newIdx));

      if (elCounterCurrent) elCounterCurrent.textContent = formatIndex(newIdx + 1);
      if (elBottomTitle) elBottomTitle.textContent = item.title;

      if (infoInner) {
        infoInner.classList.add('is-switching');
      }

      const applyText = () => {
        if (elIndex) elIndex.textContent = `${formatIndex(newIdx + 1)} // ${formatIndex(total)}`;
        if (elCategory) elCategory.textContent = item.category || '';
        if (elDesc) elDesc.textContent = item.description || '';
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

        if (infoInner) {
          infoInner.classList.remove('is-switching');
        }
      };

      applyText();
    }

    function renderFrame(rawProgress) {
      if (itemOffsets.length === 0) {
        measureMetrics();
      }

      const vw = window.innerWidth;
      const isMobile = vw <= 768;
      const leftColPct = isMobile ? 28 : 50;
      const baseRightColPct = isMobile ? 92 : 75;
      const startRightColPct = 100;
      const colWidthPct = baseRightColPct - leftColPct; // 25% on desktop, 64% on mobile

      const progress = Math.max(0, Math.min(1, typeof rawProgress === 'number' ? rawProgress : 0));

      // Continuous project index f in [fMin, fMax] where:
      // f = -1.0 is Start (Image 2: right line at 96%, Title 01 peeking at right edge),
      // f = -0.45..0.0 is Entry into [50%, 75%] (Image 4: right line at 75%, Title 01 & Slide 01 wipe to 50%),
      // f = 0..total-1 is Showcase,
      // f = total-1..total is End (Image 3 -> Image 1: right line closes from 75% to 50%)
      const f = fMin + progress * fRange;
      const startSplit = -0.45;

      // ─── 1. Dynamic Right Vertical Hairline & Spotlight / Viewport Clipping ───
      let rightLinePct = baseRightColPct;
      let viewportRightClipPct = 0;

      if (f < startSplit) {
        // Sub-phase A1 (f in [-1.0, -0.45]): right line moves from 96% -> 75%
        const subT1 = Math.max(0, Math.min(1, (f - (-1.0)) / (startSplit - (-1.0))));
        rightLinePct = startRightColPct - subT1 * (startRightColPct - baseRightColPct);
        viewportRightClipPct = 0;
      } else if (f > total - 1) {
        // Phase C (f in [total - 1, total]): right line closes from 75% -> 50%
        const exitT = Math.max(0, Math.min(1, f - (total - 1)));
        rightLinePct = baseRightColPct - exitT * colWidthPct;
        viewportRightClipPct = exitT * 100;
      } else {
        rightLinePct = baseRightColPct;
        viewportRightClipPct = 0;
      }

      if (vlineRight) {
        vlineRight.style.left = `${rightLinePct.toFixed(2)}%`;
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
      }

      // ─── 2. Title Track Glide (Synchronized with Right Line & Slide 01 Entry) ───
      let trackX = 0;
      const firstOffset = itemOffsets[0] || 0;
      const lastOffset = itemOffsets[total - 1] || firstOffset;

      if (f < 0) {
        let title0ScreenPct = leftColPct;
        if (f < startSplit) {
          // Image 2 -> Image 4: Title 01 sits right at rightLinePct (96% -> 75%)
          title0ScreenPct = rightLinePct;
        } else {
          // Image 4 -> Centered: Title 01 moves from 75% -> 50% in lockstep with Slide 01
          const subT2 = Math.max(0, Math.min(1, (f - startSplit) / (0 - startSplit)));
          title0ScreenPct = baseRightColPct - subT2 * colWidthPct;
        }
        const title0ScreenPx = (title0ScreenPct / 100) * vw;
        trackX = title0ScreenPx - firstOffset;
      } else if (f > total - 1) {
        // Exit phase (Image 3 -> Image 1): Title 07 glides left past 50% so only tail letter is lit at ~0.55,
        // and completely dimmed to the left of 50% by ~0.85
        const exitT = Math.max(0, Math.min(1, f - (total - 1)));
        const lastTitleEl = dimItems[total - 1];
        const lastTextSpan = lastTitleEl ? lastTitleEl.querySelector('.santal-title-text') : null;
        const textWidth = (lastTextSpan && lastTextSpan.offsetWidth) || vw * 0.18;
        const exitShiftPx = exitT * (textWidth * 1.28);
        trackX = spotlightLeftPx - lastOffset - exitShiftPx;
      } else {
        // Normal showcase: piecewise linear interpolation aligning each title with spotlightLeftPx (50%)
        const lowerIdx = Math.floor(f);
        const upperIdx = Math.min(total - 1, lowerIdx + 1);
        const t = f - lowerIdx;
        const offsetA = itemOffsets[lowerIdx] !== undefined ? itemOffsets[lowerIdx] : firstOffset;
        const offsetB = itemOffsets[upperIdx] !== undefined ? itemOffsets[upperIdx] : offsetA;
        const currentAnchorOffset = offsetA + (offsetB - offsetA) * t;
        trackX = spotlightLeftPx - currentAnchorOffset;
      }

      const trackTransform = `translate3d(${trackX.toFixed(2)}px, 0, 0)`;
      trackDim.style.transform = trackTransform;
      trackLit.style.transform = trackTransform;

      // ─── 3. Stacked Image Slides (Synchronized Entry Wipe, Zoom Parallax & Aperture Exit) ───
      for (let i = 0; i < slideFrames.length; i++) {
        const frame = slideFrames[i];
        const img = slideImgs[i];
        const delta = i - f; // delta = 0 when project i is centered at 50%

        let frameXPercent = 0;
        let imgXPercent = 0;
        let imgScale = 1.0;

        if (i === 0 && f < 0) {
          // Slide 01 Entry: stays hidden >100% until f >= startSplit, then wipes 100% -> 0% in lockstep with Title 01
          if (f < startSplit) {
            frameXPercent = 100.5;
            imgXPercent = -22;
            imgScale = 1.25;
          } else {
            const subT2 = Math.max(0, Math.min(1, (f - startSplit) / (0 - startSplit)));
            const entryDelta = 1 - subT2; // 1 -> 0
            frameXPercent = entryDelta * 100;
            imgXPercent = -22 * entryDelta;
            imgScale = 1.0 + entryDelta * 0.25;
          }
        } else if (i === total - 1 && delta < 0) {
          // Last Slide (07) Exit: stays anchored inside [50%, rightLinePct] with subtle counter-drift
          // while the right hairline (rightLinePct) & viewport clip-path close from 75% to 50% (Image 3 -> Image 1)
          const exitT = Math.max(0, Math.min(1, -delta));
          frameXPercent = -exitT * 14;
          imgXPercent = exitT * 8;
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
        if (img) {
          img.style.transform = `translate3d(${imgXPercent.toFixed(2)}%, 0, 0) scale(${imgScale.toFixed(3)})`;
        }
      }

      // ─── 4. Active Current Frame State & Info Panel / Bottom Status Visibility ───
      const isEntering = f < startSplit;
      const isExiting = f > (total - 1) + 0.72;
      const nearestIdx = Math.max(0, Math.min(total - 1, Math.round(f)));

      slideFrames.forEach((el, idx) => {
        const isCurrent = (idx === nearestIdx) && !isEntering && !isExiting;
        el.classList.toggle('is-current-frame', isCurrent);
      });

      // Match Image 2 (hidden before 75%), Image 4 (visible once entering 75%),
      // Image 3 (visible during initial exit), Image 1 (hidden once title passed left of 50%)
      let stageAlpha = 1.0;
      let stageY = 0;

      if (f < startSplit) {
        stageAlpha = 0;
        stageY = 14;
      } else if (f < 0) {
        const subT2 = Math.max(0, Math.min(1, (f - startSplit) / (0 - startSplit)));
        stageAlpha = Math.min(1, subT2 * 3.2); // Quickly reaches 1.0 by Image 4 (subT2 ≈ 0.25)
        stageY = (1 - stageAlpha) * 14;
      } else if (f > total - 1) {
        const exitT = Math.max(0, Math.min(1, f - (total - 1)));
        if (exitT <= 0.65) {
          // Image 3: still visible while tail of last title is in spotlight
          stageAlpha = 1.0;
          stageY = 0;
        } else {
          // Image 1: fades out cleanly before right line closes at 50%
          const fadeOutT = Math.min(1, (exitT - 0.65) / 0.22);
          stageAlpha = 1 - fadeOutT;
          stageY = -fadeOutT * 12;
        }
      }

      if (infoInner) {
        infoInner.style.opacity = stageAlpha.toFixed(2);
        infoInner.style.transform = `translate3d(0, ${stageY.toFixed(1)}px, 0)`;
      }

      const elBottomRight = section.querySelector('.santal-bottom-right');
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

      if (santalScrollTrigger) {
        targetY = santalScrollTrigger.start + ratio * (santalScrollTrigger.end - santalScrollTrigger.start);
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
      const titleBtn = e.target.closest('.santal-title-btn');
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

    // Snap points for each centered project, plus 0 (entry start) and 1 (exit end)
    const snapPoints = [0];
    for (let k = 0; k < total; k++) {
      snapPoints.push(Number(((k - fMin) / fRange).toFixed(4)));
    }
    snapPoints.push(1);

    // Initialize GSAP ScrollTrigger Pinning for Smooth Horizontal Showcase with Entry & Exit
    if (typeof ScrollTrigger !== 'undefined') {
      santalScrollTrigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * (total + 1) * 0.75}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 0.8,
        snap: {
          snapTo: snapPoints,
          duration: { min: 0.25, max: 0.5 },
          delay: 0.12,
          ease: 'power1.inOut'
        },
        onUpdate: (self) => {
          renderFrame(self.progress);
        },
        onRefresh: () => {
          measureMetrics();
          if (santalScrollTrigger) {
            renderFrame(santalScrollTrigger.progress);
          }
        }
      });
    }

    const onResize = () => {
      measureMetrics();
      if (santalScrollTrigger) {
        renderFrame(santalScrollTrigger.progress);
      } else {
        renderFrame(0);
      }
    };

    window.addEventListener('resize', onResize, { passive: true });

    cleanupSantalController = () => {
      section.removeEventListener('click', onSectionClick);
      if (elGalleryBtn) {
        elGalleryBtn.removeEventListener('click', openActiveGallery);
      }
      window.removeEventListener('resize', onResize);
      if (santalScrollTrigger) {
        santalScrollTrigger.kill(true);
        santalScrollTrigger = null;
      }
    };
  }

  function initParallaxAnimations(container) {
    const scope = container || document;

    // Initialize Santal Horizontal Showcase if #project or #portfolio is inside scope
    if (scope === document || scope.id === 'viewHome' || scope.querySelector('#project.santal-portfolio-section, #portfolio.santal-portfolio-section')) {
      initSantalPortfolioScroll(scope);
    }

    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

    if (hasGSAP) {
      // 1. BACKGROUND OUTLINED TEXTS PARALLAX (TIMELINE, SKILLS, EDUCATION, PROJECTS)
      const outlineTexts = scope.querySelectorAll('.bg-outline-text');
      outlineTexts.forEach((text) => {
        const parent = text.closest('section') || text.parentElement;
        if (!parent) return;

        const isProjectSection = parent.id === 'project' || parent.classList.contains('santal-portfolio-section');

        if (isProjectSection) {
          // Dedicated parallax for Project: starts higher up so as user scrolls down,
          // it settles perfectly behind the 'PROJECT' title header (y: 0) without clashing with the portfolio list
          const startY = window.innerWidth <= 768 ? -70 : -130;
          gsap.fromTo(
            text,
            { y: startY },
            {
              y: 0, // Lands right behind the 'PROJECT' title header when reaching top top
              ease: 'none',
              scrollTrigger: {
                trigger: parent,
                start: 'top bottom',
                end: 'top top',
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
    cleanupSantalPortfolio: () => {
      if (cleanupSantalController) {
        cleanupSantalController();
        cleanupSantalController = null;
      }
    }
  };
})(window, document);
