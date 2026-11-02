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
    let projectEnterTrigger = null;
    let santalEnterProgress = typeof ScrollTrigger !== 'undefined' ? 0.0 : 1.0;

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

      const progress = Math.max(0, Math.min(1, typeof rawProgress === 'number' ? rawProgress : 0));

      // Continuous project index f in [0, total - 1]
      const f = progress * Math.max(0, total - 1);
      const lowerIdx = Math.min(total - 1, Math.max(0, Math.floor(f)));
      const upperIdx = Math.min(total - 1, lowerIdx + 1);
      const t = f - lowerIdx;

      // Piecewise linear interpolation so every project title aligns 100% with the 50% vertical line
      const offsetA = itemOffsets[lowerIdx] || 0;
      const offsetB = itemOffsets[upperIdx] !== undefined ? itemOffsets[upperIdx] : offsetA;
      const currentAnchorOffset = offsetA + (offsetB - offsetA) * t;
      const trackX = spotlightLeftPx - currentAnchorOffset;

      const trackTransform = `translate3d(${trackX.toFixed(2)}px, 0, 0)`;
      trackDim.style.transform = trackTransform;
      trackLit.style.transform = trackTransform;

      // Update Stacked Image Slides (Horizontal Wipe + Inner Counter-Parallax Pan + Zoom Parallax)
      for (let i = 0; i < slideFrames.length; i++) {
        const frame = slideFrames[i];
        const img = slideImgs[i];
        const delta = i - f; // delta = 0 when project i is centered

        let frameXPercent = 0;
        let imgXPercent = 0;
        let imgScale = 1.0;

        if (i === 0) {
          // Base slide (Project 01):
          // Before horizontal scroll (delta >= 0): zoom from large (1.25) to normal (1.00) as user scrolls into #project
          if (delta >= 0) {
            frameXPercent = 0;
            imgXPercent = 0;
            const enterClamped = Math.max(0, Math.min(1, santalEnterProgress));
            imgScale = 1.0 + (1 - enterClamped) * 0.25;
          } else if (delta > -1) {
            frameXPercent = delta * 28;
            imgXPercent = -delta * 14;
            imgScale = 1.0;
          } else {
            frameXPercent = -28;
            imgXPercent = 14;
            imgScale = 1.0;
          }
        } else {
          // Subsequent slides (Projects 02..07): wipe in from right (100% -> 0%) as delta goes 1 -> 0
          if (delta >= 1) {
            frameXPercent = 100.5;
            imgXPercent = -22;
            imgScale = 1.25;
          } else if (delta >= 0) {
            // Parallax entrance: wipes in horizontally while zooming down from 1.25 to 1.00
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

      // Update active metadata when nearest integer project changes
      const nearestIdx = Math.max(0, Math.min(total - 1, Math.round(f)));
      updateActiveProjectInfo(nearestIdx);
    }

    function scrollToProjectIndex(targetIdx) {
      if (targetIdx < 0 || targetIdx >= total) return;
      const ratio = total > 1 ? targetIdx / (total - 1) : 0;
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

    // Initialize GSAP ScrollTrigger Entrance (for Slide 0 Zoom Parallax) and Pinning
    if (typeof ScrollTrigger !== 'undefined') {
      projectEnterTrigger = ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'top top',
        scrub: 0.8,
        onUpdate: (self) => {
          santalEnterProgress = self.progress;
          if (!santalScrollTrigger || santalScrollTrigger.progress === 0) {
            renderFrame(0);
          }
        },
        onRefresh: (self) => {
          santalEnterProgress = self.progress;
          if (!santalScrollTrigger || santalScrollTrigger.progress === 0) {
            renderFrame(0);
          }
        }
      });

      santalScrollTrigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * (total - 1) * 0.85}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 0.8,
        snap: {
          snapTo: 1 / (total - 1),
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
      if (projectEnterTrigger) {
        projectEnterTrigger.kill(true);
        projectEnterTrigger = null;
      }
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
