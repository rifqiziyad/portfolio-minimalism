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
    const projectTag = document.getElementById('carouselProjectTag');
    const currentIndexEl = document.getElementById('carouselCurrentIndex');
    const totalCountEl = document.getElementById('carouselTotalCount');
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
    let activeSourceFrame = null;
    let isOpen = false;
    let isAnimating = false;

    // Helper: measure target bounding rect of #carouselSlideCard in its neutral centered state
    function getTargetRect(sourceFrame) {
      const rect = slideCard.getBoundingClientRect();
      if (rect.width > 40 && rect.height > 40) {
        return rect;
      }

      const vpRect = (viewport || stage).getBoundingClientRect();
      const srcImg = sourceFrame ? sourceFrame.querySelector('img') : null;
      const aspect =
        srcImg && srcImg.naturalWidth && srcImg.naturalHeight
          ? srcImg.naturalWidth / srcImg.naturalHeight
          : 4 / 3;

      const maxW = Math.min(vpRect.width || window.innerWidth * 0.85, 1000);
      const maxH = window.innerHeight * 0.62;
      let width = maxW;
      let height = width / aspect;

      if (height > maxH) {
        height = maxH;
        width = height * aspect;
      }

      const centerX = vpRect.left + vpRect.width / 2;
      const centerY = vpRect.top + vpRect.height / 2;

      return {
        left: centerX - width / 2,
        top: centerY - height / 2,
        width,
        height
      };
    }

    // Helper: calculate FLIP translation (dx, dy) and scale ratios (scaleX, scaleY)
    function computeFlipDelta(sourceRect, targetRect) {
      if (!sourceRect || !targetRect || !targetRect.width || !targetRect.height) {
        return null;
      }

      const sourceCenterX = sourceRect.left + sourceRect.width / 2;
      const sourceCenterY = sourceRect.top + sourceRect.height / 2;
      const targetCenterX = targetRect.left + targetRect.width / 2;
      const targetCenterY = targetRect.top + targetRect.height / 2;

      return {
        x: sourceCenterX - targetCenterX,
        y: sourceCenterY - targetCenterY,
        scaleX: sourceRect.width / targetRect.width,
        scaleY: sourceRect.height / targetRect.height
      };
    }

    // Helper: format two-digit index (01, 02, etc.)
    function formatNum(n) {
      return n < 10 ? '0' + n : String(n);
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
      if (currentIndexEl) {
        currentIndexEl.textContent = formatNum(index + 1);
      }
      updateActiveThumb(index);
    }

    function renderThumbs() {
      if (!thumbsTrack) return;
      thumbsTrack.innerHTML = '';
      currentGallery.forEach((src, idx) => {
        const thumb = document.createElement('button');
        thumb.className = `carousel-thumb-item ${idx === currentSlideIdx ? 'is-active' : ''}`;
        thumb.setAttribute('role', 'tab');
        thumb.setAttribute('aria-label', `Thumbnail ${idx + 1}`);
        thumb.setAttribute('aria-selected', idx === currentSlideIdx ? 'true' : 'false');
        thumb.innerHTML = `<img src="${src}" alt="Thumbnail ${idx + 1}" loading="lazy">`;

        thumb.addEventListener('click', () => {
          goToSlide(idx, idx > currentSlideIdx ? 1 : -1);
        });

        thumbsTrack.appendChild(thumb);
      });
    }

    function goToSlide(targetIdx, direction = 1) {
      if (!currentGallery.length || isAnimating) return;
      if (targetIdx === currentSlideIdx) return;

      const total = currentGallery.length;
      const newIdx = (targetIdx + total) % total;
      isAnimating = true;

      // GSAP Hardware-Accelerated Kinetic Slide
      if (typeof gsap !== 'undefined') {
        const outX = -direction * 45;
        const inX = direction * 45;

        gsap.to(slideCard, {
          x: outX,
          scale: 0.97,
          autoAlpha: 0,
          duration: 0.18,
          ease: 'power2.in',
          onComplete: () => {
            currentSlideIdx = newIdx;
            mainImg.src = currentGallery[newIdx];
            updateMeta(newIdx);

            gsap.fromTo(
              slideCard,
              { x: inX, scale: 0.97, autoAlpha: 0 },
              {
                x: 0,
                scale: 1,
                autoAlpha: 1,
                duration: 0.35,
                ease: 'power3.out',
                onComplete: () => {
                  isAnimating = false;
                }
              }
            );
          }
        });
      } else {
        // Fallback without GSAP
        currentSlideIdx = newIdx;
        mainImg.src = currentGallery[newIdx];
        updateMeta(newIdx);
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
      if (projectTag) projectTag.textContent = project.category || project.tag || 'GALLERY';
      if (totalCountEl) totalCountEl.textContent = formatNum(currentGallery.length);

      // Render initial image & thumbnails
      if (mainImg) mainImg.src = currentGallery[currentSlideIdx];
      updateMeta(currentSlideIdx);
      renderThumbs();

      // Lock background scroll with Lenis
      const lenis = getLenis();
      if (lenis) lenis.stop();
      document.body.style.overflow = 'hidden';

      modal.classList.add('is-active');
      isOpen = true;
      isAnimating = true;

      // Animate modal open with FLIP from clicked portfolio thumbnail
      if (typeof gsap !== 'undefined') {
        const uiTargets = [
          modal,
          backdrop,
          scanline,
          header,
          footer,
          slideCard,
          prevBtn,
          nextBtn,
          activeSourceFrame
        ].filter(Boolean);
        gsap.killTweensOf(uiTargets);

        // Make modal container immediately visible so slideCard is 100% opaque from frame 0
        gsap.set(modal, { autoAlpha: 1 });
        gsap.set(slideCard, { x: 0, y: 0, scaleX: 1, scaleY: 1, scale: 1, autoAlpha: 1 });

        const targetRect = getTargetRect(activeSourceFrame);
        const flip = computeFlipDelta(sourceRect, targetRect);

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

        // 4. Navigation arrows scale & fade in with slight stagger
        const navBtns = [prevBtn, nextBtn].filter(Boolean);
        if (navBtns.length) {
          gsap.fromTo(
            navBtns,
            { scale: 0.8, autoAlpha: 0 },
            {
              scale: 1,
              autoAlpha: 1,
              duration: 0.42,
              ease: 'back.out(1.6)',
              delay: 0.1,
              clearProps: 'transform'
            }
          );
        }

        // 5. Main image card expands smoothly from clicked portfolio thumbnail rect
        if (flip) {
          gsap.fromTo(
            slideCard,
            {
              x: flip.x,
              y: flip.y,
              scaleX: flip.scaleX,
              scaleY: flip.scaleY,
              autoAlpha: 1
            },
            {
              x: 0,
              y: 0,
              scaleX: 1,
              scaleY: 1,
              autoAlpha: 1,
              duration: 0.58,
              ease: 'expo.out',
              onComplete: () => {
                isAnimating = false;
              }
            }
          );
        } else {
          gsap.fromTo(
            slideCard,
            { scale: 0.93, y: 18, autoAlpha: 0, x: 0 },
            {
              scale: 1,
              y: 0,
              autoAlpha: 1,
              x: 0,
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

      const lenis = getLenis();
      const sourceFrame = activeSourceFrame;

      if (typeof gsap !== 'undefined') {
        const uiTargets = [
          modal,
          backdrop,
          scanline,
          header,
          footer,
          slideCard,
          prevBtn,
          nextBtn,
          sourceFrame
        ].filter(Boolean);
        gsap.killTweensOf(uiTargets);

        // Measure current transform in case close was triggered mid-animation
        const curX = gsap.getProperty(slideCard, 'x') || 0;
        const curY = gsap.getProperty(slideCard, 'y') || 0;
        const curSX = gsap.getProperty(slideCard, 'scaleX') || 1;
        const curSY = gsap.getProperty(slideCard, 'scaleY') || 1;

        gsap.set(slideCard, { x: 0, y: 0, scaleX: 1, scaleY: 1, scale: 1 });
        const targetRect = getTargetRect(sourceFrame);
        gsap.set(slideCard, { x: curX, y: curY, scaleX: curSX, scaleY: curSY });

        const sourceRect = sourceFrame ? sourceFrame.getBoundingClientRect() : null;
        const flip = computeFlipDelta(sourceRect, targetRect);

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

        // 5. Reverse FLIP: shrink slideCard back to its portfolio thumbnail position
        const finalizeClose = () => {
          if (sourceFrame) {
            gsap.set(sourceFrame, { clearProps: 'opacity,visibility' });
          }
          gsap.set(slideCard, { clearProps: 'transform,opacity,visibility' });
          gsap.set(modal, { autoAlpha: 0 });
          modal.classList.remove('is-active');
          activeSourceFrame = null;
          isAnimating = false;
          if (lenis) lenis.start();
          document.body.style.overflow = '';
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

          gsap.to(slideCard, {
            x: flip.x,
            y: flip.y,
            scaleX: flip.scaleX,
            scaleY: flip.scaleY,
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
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        modal.classList.remove('is-active');
        activeSourceFrame = null;
        isAnimating = false;
        if (lenis) lenis.start();
        document.body.style.overflow = '';
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

    // 3. Global Keyboard Navigation (ArrowLeft, ArrowRight, Escape)
    window.addEventListener('keydown', (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape' || e.key === 'Esc') {
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

    // 5. Global Event Delegation on Portfolio List
    const portfolioContainer = document.getElementById('portfolioList') || document.getElementById('worksList');
    if (portfolioContainer) {
      portfolioContainer.addEventListener('click', (e) => {
        const frame = e.target.closest('.project-img-frame');
        if (!frame) return;

        const projectIdxAttr = frame.getAttribute('data-gallery-project');
        if (projectIdxAttr !== null) {
          const projectIdx = parseInt(projectIdxAttr, 10);
          if (!isNaN(projectIdx)) {
            openGallery(projectIdx, 0, frame);
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
                openGallery(projectIdx, 0, frame);
              }
            }
          }
        }
      });
    }

    // Public API
    window.Portfolio.carousel = {
      openGallery,
      closeGallery,
      nextSlide,
      prevSlide,
      goToSlide
    };
  }

  window.Portfolio.carousel = {
    initCarousel
  };
})(window, document);

