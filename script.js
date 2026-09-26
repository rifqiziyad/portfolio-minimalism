/**
 * VISCERA-INSPIRED BRUTALIST PORTFOLIO INTERACTIONS
 * Author: Rifqi Ziyadi Mtinan
 * Tech: Pure Vanilla JavaScript (ESNext), IntersectionObserver, requestAnimationFrame
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ═════════════════════════════════════════════════════════════
  // 1. DYNAMIC CURSOR BLOB & GLOW (SMOOTH LERP CHOREOGRAPHY)
  // ═════════════════════════════════════════════════════════════
  const blob = document.getElementById('cursor-blob');
  const glow = document.getElementById('cursor-glow');
  const dot = document.getElementById('cursor-dot');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let blobX = mouseX;
  let blobY = mouseY;
  let glowX = mouseX;
  let glowY = mouseY;
  let isMoving = false;
  let isHoveringInteractive = false;

  // Track real mouse position
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isMoving) {
      document.body.classList.add('has-cursor');
      isMoving = true;
    }
  });

  window.addEventListener('mouseleave', () => {
    document.body.classList.remove('has-cursor');
    isMoving = false;
  });

  // Check interactive elements for cursor expansion
  const interactiveElements = document.querySelectorAll('a, button, .project-img-frame, .skill-row, .btn-brutal');
  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      isHoveringInteractive = true;
      if (blob) {
        blob.style.transform = 'translate(-50%, -50%) scale(1.25)';
        blob.style.filter = 'blur(45px)';
      }
      if (glow) {
        glow.style.transform = 'translate(-50%, -50%) scale(2.2)';
      }
      if (dot) {
        dot.style.transform = 'translate(-50%, -50%) scale(0.5)';
      }
    });

    el.addEventListener('mouseleave', () => {
      isHoveringInteractive = false;
      if (blob) {
        blob.style.transform = 'translate(-50%, -50%) scale(1)';
        blob.style.filter = 'blur(40px)';
      }
      if (glow) {
        glow.style.transform = 'translate(-50%, -50%) scale(1)';
      }
      if (dot) {
        dot.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    });
  });

  // High-performance requestAnimationFrame loop with linear interpolation (Lerp)
  function renderCursor() {
    // Sharp central dot follows 1:1 instantaneously for clicking precision
    if (dot) {
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    }

    // Blob follows with smooth fluid lag
    const blobSpeed = isHoveringInteractive ? 0.09 : 0.065;
    blobX += (mouseX - blobX) * blobSpeed;
    blobY += (mouseY - blobY) * blobSpeed;

    // Inner glow is snappier
    const glowSpeed = 0.18;
    glowX += (mouseX - glowX) * glowSpeed;
    glowY += (mouseY - glowY) * glowSpeed;

    if (blob) {
      blob.style.left = `${blobX}px`;
      blob.style.top = `${blobY}px`;
    }

    if (glow) {
      glow.style.left = `${glowX}px`;
      glow.style.top = `${glowY}px`;
    }

    requestAnimationFrame(renderCursor);
  }

  // Only run cursor animation on non-touch devices
  if (window.matchMedia('(pointer: fine)').matches) {
    requestAnimationFrame(renderCursor);
  }

  // ═════════════════════════════════════════════════════════════
  // 2. LENIS SMOOTH SCROLL & GSAP TICKER INTEGRATION
  // ═════════════════════════════════════════════════════════════
  let lenis = null;
  const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const hasLenis = typeof Lenis !== 'undefined';

  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
  }

  if (hasLenis) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.8
    });

    if (hasGSAP) {
      // Synchronize Lenis scroll with GSAP ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // ═════════════════════════════════════════════════════════════
  // 3. GSAP SCROLLTRIGGER PARALLAX CHOREOGRAPHY
  // ═════════════════════════════════════════════════════════════
  if (hasGSAP) {
    // 3A. VISION & SYSTEM SECTION: IMMEDIATE SCROLL PARALLAX + ENTRANCE CHOREOGRAPHY
    const visionSection = document.getElementById('vision');
    if (visionSection) {
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

    // 3B. BACKGROUND OUTLINED TEXTS PARALLAX (DEVELOPER, FORM, ARCHIVE, STACK, CONNECT)
    gsap.utils.toArray('.bg-outline-text').forEach((text) => {
      const speed = parseFloat(text.getAttribute('data-parallax')) || 0.2;
      const parent = text.closest('section') || text.parentElement;
      gsap.to(text, {
        y: () => parent.offsetHeight * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: parent,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8
        }
      });
    });

    // 3C. THE ARCHIVE PROJECT IMAGES ZOOM + VERTICAL PARALLAX
    gsap.utils.toArray('.project-item').forEach((item) => {
      const img = item.querySelector('.project-img');
      if (img) {
        gsap.fromTo(
          img,
          {
            yPercent: -8,
            scale: 1.0
          },
          {
            yPercent: 8,
            scale: 1.14,
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true
            }
          }
        );
      }
    });

    // 3D. SCROLL REVEAL VIA GSAP BATCH
    ScrollTrigger.batch('.reveal', {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => {
        batch.forEach((el, index) => {
          el.classList.add('revealed');
        });
      }
    });

    // Refresh ScrollTrigger to calculate exact initial trigger positions
    ScrollTrigger.refresh();
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    });
  } else {
    // Graceful fallback to native IntersectionObserver if GSAP is not available
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach((el) => {
      revealObserver.observe(el);
    });
  }

  // ═════════════════════════════════════════════════════════════
  // 4. NAVBAR SCROLL STATE CONTROLLER
  // ═════════════════════════════════════════════════════════════
  const header = document.getElementById('header');

  function handleHeaderScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollY > 50) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  if (lenis) {
    lenis.on('scroll', handleHeaderScroll);
  } else {
    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  }

  // ═════════════════════════════════════════════════════════════
  // 5. MOBILE MENU DRAWER CONTROLLER
  // ═════════════════════════════════════════════════════════════
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isActive = mobileToggle.classList.toggle('is-active');
      navMenu.classList.toggle('is-active', isActive);
      if (header) {
        header.classList.toggle('is-menu-open', isActive);
      }
      document.body.style.overflow = isActive ? 'hidden' : '';
    });

    // Close menu when clicking any nav link
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('is-active');
        navMenu.classList.remove('is-active');
        if (header) {
          header.classList.remove('is-menu-open');
        }
        document.body.style.overflow = '';
      });
    });
  }

  // ═════════════════════════════════════════════════════════════
  // 6. LIVE JAKARTA / INDONESIA (WIB / UTC+7) TIME CLOCK
  // ═════════════════════════════════════════════════════════════
  const localTimeDisplay = document.getElementById('localTimeDisplay');

  function updateLocalTime() {
    if (!localTimeDisplay) return;

    const options = {
      timeZone: 'Asia/Jakarta',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };

    const now = new Intl.DateTimeFormat('en-GB', options).format(new Date());
    localTimeDisplay.textContent = `LOCAL TIME: ${now} WIB`;
  }

  updateLocalTime();
  setInterval(updateLocalTime, 1000);

  // ═════════════════════════════════════════════════════════════
  // 7. SMOOTH ANCHOR SCROLLING (LENIS INTEGRATED)
  // ═════════════════════════════════════════════════════════════
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(targetElement, {
            offset: -70,
            duration: 1.4
          });
        } else {
          const headerOffset = 70;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // ═════════════════════════════════════════════════════════════
  // 8. TACTILE PROJECT IMAGE TILT / HOVER REACTION
  // ═════════════════════════════════════════════════════════════
  const projectFrames = document.querySelectorAll('.project-img-frame');

  projectFrames.forEach((frame) => {
    frame.addEventListener('mousemove', (e) => {
      const rect = frame.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      const img = frame.querySelector('.project-img');
      if (img) {
        img.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.05)`;
      }
    });

    frame.addEventListener('mouseleave', () => {
      const img = frame.querySelector('.project-img');
      if (img) {
        img.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
      }
    });
  });
});
