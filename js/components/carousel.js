/**
/**
 * THE MONOLITH SHARD LIGHTBOX CAROUSEL
 * Module: js/components/carousel.js
 * High-Performance GSAP Carousel for Selected Works Galleries
 * Features: Touch swipe, keyboard controls (Arrow/ESC), Lenis scroll lock, 60fps compositor transforms.
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  function initCarousel() {
    const modal = document.getElementById('portfolioCarouselModal');
    if (!modal) return;

    const backdrop = document.getElementById('carouselBackdrop') || modal.querySelector('.carousel-backdrop');
    const scanline = modal.querySelector('.carousel-scanline');
    const header = modal.querySelector('.carousel-header');
    const footer = modal.querySelector('.carousel-footer');
    const viewport = document.getElementById('carouselViewport');
    const projectTitle = document.getElementById('carouselProjectTitle');
    const mainImg = document.getElementById('carouselMainImg');
    const slideCard = document.getElementById('carouselSlideCard');
    const thumbsTrack = document.getElementById('carouselThumbsTrack');
    const prevBtn = document.getElementById('carouselPrevBtn');
    const nextBtn = document.getElementById('carouselNextBtn');
    const closeBtn = document.getElementById('carouselCloseBtn');
    const stage = document.getElementById('carouselStage');

    let currentProject = null;
    let currentGallery = [];
    let currentSlideIdx = 0;
    let slideFrames = [];
    let slideImgs = [];
    let activeSlideTween = null;
    let activeSourceFrame = null;
    let activeParallaxState = null;
    let lastFocusedElement = null;
    let isOpen = false;
    let isAnimating = false;

    const backgroundContainers = [
      document.getElementById('mainContent'),
      document.getElementById('header'),
      document.querySelector('.site-footer')
    ].filter(Boolean);

    function setBackgroundInert(isInert) {
      backgroundContainers.forEach((el) => {
        el.inert = Boolean(isInert);
      });
    }

    function getFocusableModalElements() {
      return Array.from(
        modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter((el) => !el.disabled && el.offsetParent !== null);
    }

    function getActiveSlideImg() {
      return slideImgs[currentSlideIdx] || (slideCard && slideCard.querySelector('.carousel-slide-img')) || mainImg;
    }

    function computeViewportBox(sourceFrame) {
      const vpRect = (viewport || stage).getBoundingClientRect();
      const srcImg = sourceFrame ? sourceFrame.querySelector('img') : null;
      const aspect =
        currentProject && currentProject.imageWidth && currentProject.imageHeight
          ? currentProject.imageWidth / currentProject.imageHeight
          : srcImg && srcImg.naturalWidth && srcImg.naturalHeight
            ? srcImg.naturalWidth / srcImg.naturalHeight
            : 16 / 10;

      const maxW = Math.min(vpRect.width || window.innerWidth * 0.85, 1000);
      const maxH = window.innerHeight * 0.62;
      let width = maxW;
      let height = width / aspect;

      if (height > maxH) {
        height = maxH;
        width = height * aspect;
      }

      const left = vpRect.left + (vpRect.width - width) / 2;
      const top = vpRect.top + (vpRect.height - height) / 2;

      return { left, top, width, height };
    }

    function syncCardViewportSize(sourceFrame) {
      if (!slideCard) return null;
      const box = computeViewportBox(sourceFrame);
      slideCard.style.width = `${Math.round(box.width)}px`;
      slideCard.style.height = `${Math.round(box.height)}px`;
      return box;
    }

    // Helper: measure target bounding rect of #carouselSlideCard in its neutral centered state
    function getTargetRect(sourceFrame) {
      const rect = slideCard.getBoundingClientRect();
      if (rect.width > 40 && rect.height > 40) {
        return rect;
      }
      return computeViewportBox(sourceFrame);
    }

    // Helper: calculate Preserving Crop Morph (uniform scale + dynamic top-left clip-path)
    function computeCropMorphDelta(sourceRect, targetRect, srcImg) {
      if (!sourceRect || !targetRect || !targetRect.width || !targetRect.height) {
        return null;
      }

      const imgRef = srcImg || mainImg;
      const aspectImg =
        imgRef && imgRef.naturalWidth && imgRef.naturalHeight
          ? imgRef.naturalWidth / imgRef.naturalHeight
          : targetRect.width / targetRect.height;

      const aspectFrame = sourceRect.width / sourceRect.height;
      let scale = 1;
      let clipRight = 0;
      let clipBottom = 0;
      let offsetX = 0;
      let offsetY = 0;

      if (aspectImg >= aspectFrame) {
        // Image is wider than the 4:3 frame (e.g. widescreen 16:9 / 16:10)
        // Height fits the frame height, right side is cropped off (anchored to top-left)
        scale = sourceRect.height / targetRect.height;
        const unclippedWidth = targetRect.width * scale;
        clipRight = Math.max(0, (1 - sourceRect.width / unclippedWidth) * 100);
        offsetX = (unclippedWidth - sourceRect.width) / 2;
      } else {
        // Image is taller than the frame
        // Width fits the frame width, bottom side is cropped off (anchored to top-left)
        scale = sourceRect.width / targetRect.width;
        const unclippedHeight = targetRect.height * scale;
        clipBottom = Math.max(0, (1 - sourceRect.height / unclippedHeight) * 100);
        offsetY = (unclippedHeight - sourceRect.height) / 2;
      }

      const sourceCenterX = sourceRect.left + sourceRect.width / 2;
      const sourceCenterY = sourceRect.top + sourceRect.height / 2;
      const targetCenterX = targetRect.left + targetRect.width / 2;
      const targetCenterY = targetRect.top + targetRect.height / 2;

      return {
        x: (sourceCenterX + offsetX) - targetCenterX,
        y: (sourceCenterY + offsetY) - targetCenterY,
        scale: scale,
        clipStart: `inset(0% ${clipRight.toFixed(2)}% ${clipBottom.toFixed(2)}% 0%)`,
        clipEnd: 'inset(0% 0% 0% 0%)'
      };
    }

    // Helper: read live parallax transform (scale, yPercent, y, x) from .project-img
    function getParallaxState(imgEl) {
      if (!imgEl || typeof gsap === 'undefined') {
        return { scale: 1, yPercent: 0, y: 0, x: 0 };
      }
      return {
        scale: gsap.getProperty(imgEl, 'scale') || 1,
        yPercent: gsap.getProperty(imgEl, 'yPercent') || 0,
        y: gsap.getProperty(imgEl, 'y') || 0,
        x: gsap.getProperty(imgEl, 'x') || 0
      };
    }

    // Lock/Unlock background scroll without layout shift
    function lockScroll() {
      const lenis = getLenis();
      if (lenis) lenis.stop();

      const prevClientWidth = document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      const newClientWidth = document.documentElement.clientWidth;

      const diff = newClientWidth - prevClientWidth;
      if (diff > 0) {
        document.body.style.paddingRight = `${diff}px`;
        const headerEl = document.querySelector('.site-header');
        if (headerEl) headerEl.style.paddingRight = `${diff}px`;
      }
    }

    function unlockScroll() {
      const lenis = getLenis();
      if (lenis) lenis.start();

      document.body.style.paddingRight = '';
      const headerEl = document.querySelector('.site-header');
      if (headerEl) headerEl.style.paddingRight = '';
      document.body.style.overflow = '';
    }

    function getLenis() {
      const scrollService = window.Portfolio.scroll;
      return scrollService ? scrollService.getLenis() : null;
    }

    function updateActiveThumb(index) {
      if (!thumbsTrack) return;
      const thumbs = thumbsTrack.querySelectorAll('.carousel-thumb-item');
      thumbs.forEach((thumb, idx) => {
        if (idx === index) {
          thumb.classList.add('is-active');
          thumb.setAttribute('aria-selected', 'true');
          // Scroll thumb into view if overflowing
          thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          thumb.classList.remove('is-active');
          thumb.setAttribute('aria-selected', 'false');
        }
      });
    }

    function updateMeta(index) {
      updateActiveThumb(index);
    }

    function applyViewportParallax(frameEl, imgEl, delta) {
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

      if (frameEl) {
        frameEl.style.transform = `translate3d(${frameXPercent.toFixed(2)}%, 0, 0)`;
        frameEl.style.opacity = '1';
      }
      if (imgEl) {
        imgEl.style.transform = `translate3d(${imgXPercent.toFixed(2)}%, 0, 0) scale(${imgScale.toFixed(3)})`;
      }
    }

    function renderSlides() {
      if (!slideCard) return;
      slideCard.innerHTML = '';
      slideFrames = [];
      slideImgs = [];

      const utils = window.Portfolio && window.Portfolio.utils;
      const titleText = (currentProject && currentProject.title) || 'Portfolio Showcase';

      currentGallery.forEach((src, idx) => {
        const safeSrc = utils && typeof utils.sanitizeUrl === 'function' ? utils.sanitizeUrl(src, false) : src;
        const frame = document.createElement('div');
        frame.className = `carousel-slide-frame img-skeleton${idx === currentSlideIdx ? ' is-current-frame' : ''}`;

        const img = document.createElement('img');
        img.src = safeSrc;
        img.alt = `${titleText} — Slide ${idx + 1}`;
        img.className = 'carousel-slide-img carousel-main-img';
        img.width = 1200;
        img.height = 800;
        img.decoding = 'async';
        img.draggable = false;

        if (idx === currentSlideIdx) {
          frame.style.visibility = 'visible';
          frame.style.zIndex = '1';
          applyViewportParallax(frame, img, 0);
        } else {
          frame.style.visibility = 'hidden';
          frame.style.zIndex = '0';
        }

        frame.appendChild(img);
        slideCard.appendChild(frame);
        slideFrames.push(frame);
        slideImgs.push(img);
      });

      if (utils && typeof utils.bindImageSkeleton === 'function') {
        utils.bindImageSkeleton(slideCard);
      }
    }

    function renderThumbs() {
      if (!thumbsTrack) return;
      thumbsTrack.innerHTML = '';
      const utils = window.Portfolio && window.Portfolio.utils;
      currentGallery.forEach((src, idx) => {
        const safeSrc = utils && typeof utils.sanitizeUrl === 'function' ? utils.sanitizeUrl(src, false) : src;
        const attrSrc = utils && typeof utils.escapeAttr === 'function' ? utils.escapeAttr(safeSrc) : safeSrc;
        const thumb = document.createElement('button');
        thumb.className = `carousel-thumb-item img-skeleton ${idx === currentSlideIdx ? 'is-active' : ''}`;
        thumb.setAttribute('role', 'tab');
        thumb.setAttribute('aria-label', `Thumbnail ${idx + 1}`);
        thumb.setAttribute('aria-selected', idx === currentSlideIdx ? 'true' : 'false');
        thumb.innerHTML = `<img src="${attrSrc}" alt="Thumbnail ${idx + 1}" width="72" height="46" decoding="async" draggable="false">`;

        thumb.addEventListener('click', () => {
          goToSlide(idx, idx > currentSlideIdx ? 1 : -1);
        });

        thumbsTrack.appendChild(thumb);
      });

      if (utils && typeof utils.bindImageSkeleton === 'function') {
        utils.bindImageSkeleton(thumbsTrack);
      }
    }

    function goToSlide(targetIdx, direction = 1) {
      if (!currentGallery.length || isAnimating) return;
      const total = currentGallery.length;
      const newIdx = (targetIdx + total) % total;
      if (newIdx === currentSlideIdx) return;

      const fromIdx = currentSlideIdx;
      const fromFrame = slideFrames[fromIdx];
      const fromImg = slideImgs[fromIdx];
      const toFrame = slideFrames[newIdx];
      const toImg = slideImgs[newIdx];

      if (!fromFrame || !toFrame) {
        currentSlideIdx = newIdx;
        updateMeta(newIdx);
        return;
      }

      isAnimating = true;
      updateMeta(newIdx);

      // Hide unrelated frames while animating only the active transition pair
      slideFrames.forEach((frame, idx) => {
        if (idx !== fromIdx && idx !== newIdx) {
          frame.style.visibility = 'hidden';
          frame.style.zIndex = '0';
          frame.classList.remove('is-current-frame');
        }
      });

      fromFrame.style.visibility = 'visible';
      toFrame.style.visibility = 'visible';
      fromFrame.classList.remove('is-current-frame');

      // Mirror project-image-viewport layering:
      // Forward (direction >= 0): incoming wipes over outgoing from +100% -> 0%
      // Backward (direction < 0): outgoing wipes off to +100%, revealing incoming from -28% -> 0%
      if (direction >= 0) {
        fromFrame.style.zIndex = '1';
        toFrame.style.zIndex = '2';
      } else {
        toFrame.style.zIndex = '1';
        fromFrame.style.zIndex = '2';
      }

      if (fromImg) fromImg.style.transformOrigin = 'center center';
      if (toImg) toImg.style.transformOrigin = 'center center';

      if (typeof gsap !== 'undefined') {
        if (activeSlideTween) {
          activeSlideTween.kill();
          activeSlideTween = null;
        }

        const progressProxy = { t: 0 };
        activeSlideTween = gsap.to(progressProxy, {
          t: 1,
          duration: 0.52,
          ease: 'power3.out',
          onUpdate: () => {
            const t = progressProxy.t;
            if (direction >= 0) {
              applyViewportParallax(fromFrame, fromImg, -t);
              applyViewportParallax(toFrame, toImg, 1 - t);
            } else {
              applyViewportParallax(toFrame, toImg, -(1 - t));
              applyViewportParallax(fromFrame, fromImg, t);
            }
          },
          onComplete: () => {
            activeSlideTween = null;
            currentSlideIdx = newIdx;
            fromFrame.style.visibility = 'hidden';
            fromFrame.style.zIndex = '0';
            fromFrame.style.transform = '';
            if (fromImg) fromImg.style.transform = '';

            toFrame.style.zIndex = '1';
            toFrame.classList.add('is-current-frame');
            applyViewportParallax(toFrame, toImg, 0);
            isAnimating = false;
          }
        });
      } else {
        currentSlideIdx = newIdx;
        fromFrame.style.visibility = 'hidden';
        fromFrame.style.zIndex = '0';
        toFrame.style.zIndex = '1';
        toFrame.classList.add('is-current-frame');
        applyViewportParallax(toFrame, toImg, 0);
        isAnimating = false;
      }
    }

    function nextSlide() {
      goToSlide(currentSlideIdx + 1, 1);
    }

    function prevSlide() {
      goToSlide(currentSlideIdx - 1, -1);
    }

    function openGallery(projectIndex, startSlide = 0, triggerFrame = null) {
      const data = window.PortfolioData;
      const projects = (data && (data.portfolio || data.works)) || [];
      const project = projects[projectIndex];

      if (!project) return;

      // Restore any previously hidden source frame
      if (activeSourceFrame && typeof gsap !== 'undefined') {
        gsap.set(activeSourceFrame, { clearProps: 'opacity,visibility' });
      }

      activeSourceFrame =
        triggerFrame ||
        document.querySelector(`.project-img-frame[data-gallery-project="${projectIndex}"]`);

      const sourceRect = activeSourceFrame ? activeSourceFrame.getBoundingClientRect() : null;

      currentProject = project;
      currentGallery = (Array.isArray(project.gallery) && project.gallery.length)
        ? project.gallery
        : [project.image];

      currentSlideIdx = Math.min(startSlide, currentGallery.length - 1);

      // Populate header details
      if (projectTitle) projectTitle.textContent = project.title || 'PROJECT';

      // Render initial stacked slides & thumbnails
      renderSlides();
      syncCardViewportSize(activeSourceFrame);
      updateMeta(currentSlideIdx);
      renderThumbs();

      // Lock background scroll without layout shift & isolate modal focus
      lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      lockScroll();
      setBackgroundInert(true);

      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('is-active');
      isOpen = true;
      isAnimating = true;

      requestAnimationFrame(() => {
        if (closeBtn && typeof closeBtn.focus === 'function') {
          closeBtn.focus({ preventScroll: true });
        }
      });

      // Animate modal open with FLIP from clicked portfolio thumbnail
      if (typeof gsap !== 'undefined') {
        if (activeSlideTween) {
          activeSlideTween.kill();
          activeSlideTween = null;
        }
        const activeImg = getActiveSlideImg();
        const uiTargets = [
          modal,
          backdrop,
          scanline,
          header,
          footer,
          slideCard,
          activeImg,
          prevBtn,
          nextBtn,
          activeSourceFrame
        ].filter(Boolean);
        gsap.killTweensOf(uiTargets);

        // Make modal container immediately visible so slideCard is 100% opaque from frame 0
        gsap.set(modal, { autoAlpha: 1 });
        gsap.set(slideCard, { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1, autoAlpha: 1, borderRadius: '0px' });
        if (activeImg) {
          gsap.set(activeImg, { transformOrigin: 'left top' });
        }

        const targetRect = getTargetRect(activeSourceFrame);
        const srcImg = (activeSourceFrame ? activeSourceFrame.querySelector('img') : null) || activeImg;
        const flip = computeCropMorphDelta(sourceRect, targetRect, srcImg);
        activeParallaxState = getParallaxState(srcImg);

        // Seamlessly hand off from the page thumbnail to the expanding slideCard
        if (activeSourceFrame) {
          gsap.set(activeSourceFrame, { autoAlpha: 0 });
        }

        // 1. Backdrop & scanline fade in smoothly
        gsap.fromTo(
          [backdrop, scanline].filter(Boolean),
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.45, ease: 'power2.out' }
        );

        // 2. Header slides & fades down from top
        if (header) {
          gsap.fromTo(
            header,
            { y: -24, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.48, ease: 'power3.out', delay: 0.05 }
          );
        }

        // 3. Footer slides & fades up from bottom
        if (footer) {
          gsap.fromTo(
            footer,
            { y: 24, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.48, ease: 'power3.out', delay: 0.05 }
          );
        }

        // 4. Navigation buttons enter cleanly without bounce
        const navBtns = [prevBtn, nextBtn].filter(Boolean);
        if (navBtns.length) {
          gsap.fromTo(
            navBtns,
            { scale: 0.92, autoAlpha: 0 },
            {
              scale: 1,
              autoAlpha: 1,
              duration: 0.42,
              ease: 'power3.out',
              delay: 0.08,
              clearProps: 'transform'
            }
          );
        }

        // 5. Main image card & inner parallax image expand simultaneously
        if (flip) {
          // Inner Image: Animate from thumbnail's live parallax transform to neutral
          if (activeImg) {
            gsap.fromTo(
              activeImg,
              {
                scale: activeParallaxState.scale,
                yPercent: activeParallaxState.yPercent,
                y: activeParallaxState.y,
                x: activeParallaxState.x,
                transformOrigin: 'left top'
              },
              {
                scale: 1,
                yPercent: 0,
                y: 0,
                x: 0,
                duration: 0.58,
                ease: 'expo.out',
                clearProps: 'transform,transformOrigin'
              }
            );
          }

          // Outer Card Frame: Morph position, scale, and clipPath with sharp monolith corners
          gsap.fromTo(
            slideCard,
            {
              x: flip.x,
              y: flip.y,
              scale: flip.scale,
              scaleX: 1,
              scaleY: 1,
              clipPath: flip.clipStart,
              borderRadius: '0px',
              autoAlpha: 1
            },
            {
              x: 0,
              y: 0,
              scale: 1,
              scaleX: 1,
              scaleY: 1,
              clipPath: flip.clipEnd,
              borderRadius: '0px',
              autoAlpha: 1,
              duration: 0.58,
              ease: 'expo.out',
              onComplete: () => {
                gsap.set(slideCard, { clearProps: 'clipPath' });
                isAnimating = false;
              }
            }
          );
        } else {
          if (activeImg) {
            gsap.set(activeImg, { clearProps: 'transform,transformOrigin' });
          }
          gsap.fromTo(
            slideCard,
            { scale: 0.94, y: 16, autoAlpha: 0, x: 0, borderRadius: '0px' },
            {
              scale: 1,
              y: 0,
              autoAlpha: 1,
              x: 0,
              borderRadius: '0px',
              duration: 0.48,
              ease: 'expo.out',
              onComplete: () => {
                isAnimating = false;
              }
            }
          );
        }
      } else {
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
        isAnimating = false;
      }
    }

    function closeGallery() {
      if (!isOpen) return;
      isOpen = false;
      isAnimating = true;

      const sourceFrame = activeSourceFrame;
      const activeImg = getActiveSlideImg();

      if (typeof gsap !== 'undefined') {
        if (activeSlideTween) {
          activeSlideTween.kill();
          activeSlideTween = null;
        }
        const uiTargets = [
          modal,
          backdrop,
          scanline,
          header,
          footer,
          slideCard,
          activeImg,
          prevBtn,
          nextBtn,
          sourceFrame
        ].filter(Boolean);
        gsap.killTweensOf(uiTargets);

        // Measure current transform in case close was triggered mid-animation
        const curX = gsap.getProperty(slideCard, 'x') || 0;
        const curY = gsap.getProperty(slideCard, 'y') || 0;
        const curScale = gsap.getProperty(slideCard, 'scale') || 1;

        gsap.set(slideCard, { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1, clipPath: 'inset(0% 0% 0% 0%)' });
        const targetRect = getTargetRect(sourceFrame);
        gsap.set(slideCard, { x: curX, y: curY, scale: curScale });

        const sourceRect = sourceFrame ? sourceFrame.getBoundingClientRect() : null;
        const srcImg = (sourceFrame ? sourceFrame.querySelector('img') : null) || mainImg;
        const flip = computeCropMorphDelta(sourceRect, targetRect, srcImg);
        const parallaxState = activeParallaxState || getParallaxState(srcImg);

        // 1. Header slides up & fades out
        if (header) {
          gsap.to(header, {
            y: -20,
            autoAlpha: 0,
            duration: 0.28,
            ease: 'power2.in'
          });
        }

        // 2. Footer slides down & fades out
        if (footer) {
          gsap.to(footer, {
            y: 20,
            autoAlpha: 0,
            duration: 0.28,
            ease: 'power2.in'
          });
        }

        // 3. Nav buttons scale down & fade out
        const navBtns = [prevBtn, nextBtn].filter(Boolean);
        if (navBtns.length) {
          gsap.to(navBtns, {
            scale: 0.82,
            autoAlpha: 0,
            duration: 0.22,
            ease: 'power2.in'
          });
        }

        // 4. Backdrop & scanline fade out
        gsap.to([backdrop, scanline].filter(Boolean), {
          autoAlpha: 0,
          duration: 0.42,
          ease: 'power2.inOut'
        });

        // 5. Reverse Preserving Crop Morph: shrink slideCard & morph inner image back to thumbnail
        const finalizeClose = () => {
          if (sourceFrame) {
            gsap.set(sourceFrame, { clearProps: 'opacity,visibility' });
          }
          gsap.set(slideCard, { clearProps: 'transform,opacity,visibility,clipPath,borderRadius' });
          slideCard.style.width = '';
          slideCard.style.height = '';
          slideFrames.forEach((f) => gsap.set(f, { clearProps: 'transform,opacity,visibility,zIndex' }));
          slideImgs.forEach((img) => gsap.set(img, { clearProps: 'transform,transformOrigin' }));
          gsap.set(modal, { autoAlpha: 0 });
          modal.setAttribute('aria-hidden', 'true');
          modal.classList.remove('is-active');
          activeSourceFrame = null;
          activeParallaxState = null;
          isAnimating = false;
          unlockScroll();
          setBackgroundInert(false);

          const focusTarget = lastFocusedElement || sourceFrame;
          lastFocusedElement = null;
          if (focusTarget && focusTarget.isConnected && typeof focusTarget.focus === 'function') {
            focusTarget.focus({ preventScroll: true });
          }
        };

        if (flip) {
          if (sourceFrame) {
            gsap.to(sourceFrame, {
              autoAlpha: 1,
              duration: 0.18,
              delay: 0.28,
              ease: 'power2.out'
            });
          }

          // Inner Image: Animate from neutral back to thumbnail's live parallax transform
          if (activeImg) {
            gsap.to(activeImg, {
              scale: parallaxState.scale,
              yPercent: parallaxState.yPercent,
              y: parallaxState.y,
              x: parallaxState.x,
              transformOrigin: 'left top',
              duration: 0.46,
              ease: 'expo.inOut'
            });
          }

          // Outer Card Frame: Shrink back to thumbnail rect with sharp monolith corners
          gsap.to(slideCard, {
            x: flip.x,
            y: flip.y,
            scale: flip.scale,
            scaleX: 1,
            scaleY: 1,
            clipPath: flip.clipStart,
            borderRadius: '0px',
            duration: 0.46,
            ease: 'expo.inOut',
            onComplete: finalizeClose
          });

          gsap.to(slideCard, {
            autoAlpha: 0,
            duration: 0.15,
            delay: 0.31,
            ease: 'power2.in'
          });
        } else {
          if (sourceFrame) {
            gsap.set(sourceFrame, { clearProps: 'opacity,visibility' });
          }
          gsap.to(slideCard, {
            scale: 0.94,
            y: 12,
            autoAlpha: 0,
            duration: 0.26,
            ease: 'power2.in',
            onComplete: finalizeClose
          });
        }
      } else {
        if (sourceFrame) {
          sourceFrame.style.opacity = '';
          sourceFrame.style.visibility = '';
        }
        slideCard.style.width = '';
        slideCard.style.height = '';
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('is-active');
        activeSourceFrame = null;
        activeParallaxState = null;
        isAnimating = false;
        unlockScroll();
        setBackgroundInert(false);

        const focusTarget = lastFocusedElement || sourceFrame;
        lastFocusedElement = null;
        if (focusTarget && focusTarget.isConnected && typeof focusTarget.focus === 'function') {
          focusTarget.focus({ preventScroll: true });
        }
      }
    }

    // 1. Button click listeners
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextSlide(); });
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevSlide(); });
    if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeGallery(); });

    // 2. Click outside main slide card to close
    if (stage) {
      stage.addEventListener('click', (e) => {
        if (!slideCard.contains(e.target) && !prevBtn.contains(e.target) && !nextBtn.contains(e.target)) {
          closeGallery();
        }
      });
    }

    // 3. Global Keyboard Navigation (Tab focus trap, ArrowLeft, ArrowRight, Escape)
    window.addEventListener('keydown', (e) => {
      if (!isOpen) return;

      if (e.key === 'Tab') {
        const focusables = getFocusableModalElements();
        if (!focusables.length) return;
        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];

        if (e.shiftKey && (document.activeElement === firstEl || !modal.contains(document.activeElement))) {
          e.preventDefault();
          lastEl.focus({ preventScroll: true });
        } else if (!e.shiftKey && (document.activeElement === lastEl || !modal.contains(document.activeElement))) {
          e.preventDefault();
          firstEl.focus({ preventScroll: true });
        }
      } else if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        closeGallery();
      } else if (e.key === 'ArrowRight' || e.key === 'Right') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        e.preventDefault();
        prevSlide();
      }
    });

    // 4. Touch Swipe Gestures for Mobile & Tablets
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    if (stage) {
      stage.addEventListener(
        'touchstart',
        (e) => {
          if (!isOpen || e.touches.length > 1) return;
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchEndX = touchStartX;
          touchEndY = touchStartY;
        },
        { passive: true }
      );

      stage.addEventListener(
        'touchmove',
        (e) => {
          if (!isOpen || e.touches.length > 1) return;
          touchEndX = e.touches[0].clientX;
          touchEndY = e.touches[0].clientY;
        },
        { passive: true }
      );

      stage.addEventListener(
        'touchend',
        () => {
          if (!isOpen) return;
          const diffX = touchEndX - touchStartX;
          const diffY = touchEndY - touchStartY;

          // Horizontal swipe detection with 45px threshold and dominance over vertical drag
          if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX < 0) {
              nextSlide(); // Swiped left -> next
            } else {
              prevSlide(); // Swiped right -> prev
            }
          }
        },
        { passive: true }
      );
    }

    // 5. Global Event Delegation on Portfolio Showcase (#portfolioList)
    const portfolioContainers = [
      document.getElementById('portfolioList')
    ].filter(Boolean);

    portfolioContainers.forEach((portfolioContainer) => {
      portfolioContainer.addEventListener('click', (e) => {
        const frame = e.target.closest('.project-img-frame');
        if (!frame) return;

        const projectIdxAttr = frame.getAttribute('data-gallery-project');
        if (projectIdxAttr !== null) {
          const projectIdx = parseInt(projectIdxAttr, 10);
          if (!isNaN(projectIdx)) {
            if (typeof window.Portfolio.openProjectGallery === 'function') {
              window.Portfolio.openProjectGallery(projectIdx, frame);
            } else {
              openGallery(projectIdx, 0, frame);
            }
          }
        }
      });

      // Accessible keyboard Enter/Space activation on thumbnail
      portfolioContainer.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const frame = e.target.closest('.project-img-frame');
          if (frame) {
            e.preventDefault();
            const projectIdxAttr = frame.getAttribute('data-gallery-project');
            if (projectIdxAttr !== null) {
              const projectIdx = parseInt(projectIdxAttr, 10);
              if (!isNaN(projectIdx)) {
                if (typeof window.Portfolio.openProjectGallery === 'function') {
                  window.Portfolio.openProjectGallery(projectIdx, frame);
                } else {
                  openGallery(projectIdx, 0, frame);
                }
              }
            }
          }
        }
      });
    });

    // 6. Keep locked viewport dimensions responsive when window resizes while modal is open
    let resizeRafId = 0;
    window.addEventListener(
      'resize',
      () => {
        if (!isOpen || isAnimating) return;
        if (resizeRafId) cancelAnimationFrame(resizeRafId);
        resizeRafId = requestAnimationFrame(() => {
          resizeRafId = 0;
          if (isOpen && !isAnimating) {
            syncCardViewportSize(activeSourceFrame);
          }
        });
      },
      { passive: true }
    );

    // Public API
    Object.assign(window.Portfolio.carousel, {
      openGallery,
      closeGallery,
      nextSlide,
      prevSlide,
      goToSlide,
      isBusy: () => isOpen || isAnimating
    });
  }

  window.Portfolio.carousel = {
    initCarousel
  };
})(window, document);

