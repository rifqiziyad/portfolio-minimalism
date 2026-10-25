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
    let isOpen = false;
    let isAnimating = false;

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

    function openGallery(projectIndex, startSlide = 0) {
      const data = window.PortfolioData;
      const projects = (data && (data.portfolio || data.works)) || [];
      const project = projects[projectIndex];

      if (!project) return;

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

      // Animate modal open with GSAP
      if (typeof gsap !== 'undefined') {
        gsap.killTweensOf([modal, slideCard]);
        gsap.to(modal, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' });
        gsap.fromTo(
          slideCard,
          { scale: 0.93, y: 18, autoAlpha: 0, x: 0 },
          { scale: 1, y: 0, autoAlpha: 1, x: 0, duration: 0.45, ease: 'power3.out', delay: 0.05 }
        );
      } else {
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
      }
    }

    function closeGallery() {
      if (!isOpen || isAnimating) return;
      isAnimating = true;

      const lenis = getLenis();

      if (typeof gsap !== 'undefined') {
        gsap.to(slideCard, {
          scale: 0.94,
          y: 12,
          duration: 0.22,
          ease: 'power2.in'
        });

        gsap.to(modal, {
          autoAlpha: 0,
          duration: 0.3,
          ease: 'power2.inOut',
          onComplete: () => {
            modal.classList.remove('is-active');
            isOpen = false;
            isAnimating = false;
            if (lenis) lenis.start();
            document.body.style.overflow = '';
          }
        });
      } else {
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        modal.classList.remove('is-active');
        isOpen = false;
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
            openGallery(projectIdx, 0);
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
                openGallery(projectIdx, 0);
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

