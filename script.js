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
  // 8. TIMELINE DYNAMIC PERIMETER DOCKING & SCROLL CHOREOGRAPHY
  // ═════════════════════════════════════════════════════════════
  function initTimelineChoreography() {
    const container = document.querySelector('.timeline-stream-container');
    const svg = document.getElementById('prodTimelineTrackSvg');
    const path = document.getElementById('prodTrackPath');
    const pathGlow = document.getElementById('prodTrackPathGlow');
    if (!container || !svg || !path) return;

    function renderTimelinePath() {
      const cRect = container.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${cRect.width} ${cRect.height}`);

      function getDockPos(id) {
        const el = document.getElementById(id);
        if (!el) return { x: cRect.width / 2, y: 0 };
        const r = el.getBoundingClientRect();
        return {
          x: Math.round(r.left + r.width / 2 - cRect.left),
          y: Math.round(r.top + r.height / 2 - cRect.top)
        };
      }

      const p_top = { x: Math.round(cRect.width / 2), y: 15 };
      const p_c1_top = getDockPos('prod-dock-c1-top');
      const p_c1_bottom = getDockPos('prod-dock-c1-bottom');
      const p_int1 = getDockPos('prod-dock-int-1');
      const p_c2_left = getDockPos('prod-dock-c2-left');
      const p_c2_bottom = getDockPos('prod-dock-c2-bottom');
      const p_int2 = getDockPos('prod-dock-int-2');
      const p_c3_right = getDockPos('prod-dock-c3-right');
      const p_c3_bottom = getDockPos('prod-dock-c3-bottom');
      const p_bottom = { x: Math.round(cRect.width / 2), y: Math.round(cRect.height - 15) };

      // Continuous zigzag trajectory: sweeps between center cards and intermediate floating clusters!
      const d = `M ${p_top.x},${p_top.y}
                 L ${p_c1_top.x},${p_c1_top.y}
                 M ${p_c1_bottom.x},${p_c1_bottom.y}
                 L ${p_int1.x},${p_int1.y}
                 L ${p_c2_left.x},${p_c2_left.y}
                 M ${p_c2_bottom.x},${p_c2_bottom.y}
                 L ${p_int2.x},${p_int2.y}
                 L ${p_c3_right.x},${p_c3_right.y}
                 M ${p_c3_bottom.x},${p_c3_bottom.y}
                 L ${p_bottom.x},${p_bottom.y}`;

      path.setAttribute('d', d);
      if (pathGlow) {
        pathGlow.setAttribute('d', d);
      }
    }

    renderTimelinePath();
    window.addEventListener('resize', renderTimelinePath);
    window.addEventListener('load', renderTimelinePath);

    if (window.ResizeObserver) {
      new ResizeObserver(renderTimelinePath).observe(container);
    }

    // GSAP ScrollTrigger Animations for Timeline
    if (hasGSAP) {
      // Parallax floating on intermediate colored crystal shards
      const art1 = document.getElementById('prod-art-1');
      const art2 = document.getElementById('prod-art-2');

      if (art1) {
        gsap.to(art1, {
          y: -40,
          rotation: -3,
          ease: 'none',
          scrollTrigger: {
            trigger: '#prod-interval-1',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          }
        });
      }

      if (art2) {
        gsap.to(art2, {
          y: -40,
          rotation: 3,
          ease: 'none',
          scrollTrigger: {
            trigger: '#prod-interval-2',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          }
        });
      }

      // Parallax for Giant Background Wireframe Crystal Shards (Overflowing screen edges)
      const bgShardRight = document.getElementById('bgShardRight');
      const bgShardLeft = document.getElementById('bgShardLeft');
      const timelineSection = document.getElementById('timeline');

      if (timelineSection) {
        if (bgShardRight) {
          gsap.to(bgShardRight, {
            y: 180,
            rotation: 6,
            ease: 'none',
            scrollTrigger: {
              trigger: timelineSection,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5
            }
          });
        }

        if (bgShardLeft) {
          gsap.to(bgShardLeft, {
            y: 210,
            rotation: -8,
            ease: 'none',
            scrollTrigger: {
              trigger: timelineSection,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.8
            }
          });
        }
      }

      // Laser path stroke dashoffset scrubbing
      ScrollTrigger.create({
        trigger: container,
        start: 'top 75%',
        end: 'bottom 85%',
        scrub: 0.8,
        onUpdate: (self) => {
          const progress = self.progress;
          path.style.strokeDashoffset = `${(1 - progress) * 220}px`;
          if (pathGlow) {
            pathGlow.style.opacity = `${0.18 + progress * 0.4}`;
          }
        }
      });
    }
  }

  initTimelineChoreography();
});
