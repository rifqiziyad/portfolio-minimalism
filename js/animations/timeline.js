/**
 * TIMELINE DYNAMIC DOCKING & SHATTER CHOREOGRAPHY
 * Module: js/animations/timeline.js
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

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

    window.renderTimelinePath = renderTimelinePath;
    renderTimelinePath();

    if (!window._timelinePathListenersAttached) {
      window._timelinePathListenersAttached = true;
      window.addEventListener('resize', renderTimelinePath);
      window.addEventListener('load', renderTimelinePath);

      if (window.ResizeObserver) {
        new ResizeObserver(renderTimelinePath).observe(container);
      }

      if (document.fonts) {
        document.fonts.ready.then(renderTimelinePath);
      }
    }

    setTimeout(renderTimelinePath, 100);
    setTimeout(renderTimelinePath, 350);
    setTimeout(renderTimelinePath, 900);

    // GSAP ScrollTrigger Animations for Timeline
    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    if (hasGSAP) {
      ScrollTrigger.removeEventListener('refresh', renderTimelinePath);
      ScrollTrigger.addEventListener('refresh', renderTimelinePath);

      // Hierarchical Shatter & Parallax Choreography for Giant Background Wireframe Crystal Shards
      const bgShardRight = document.getElementById('bgShardRight');
      const bgShardLeft = document.getElementById('bgShardLeft');

      // 1. RIGHT CRYSTAL SHARD (cluster-gem-outline.svg) — Shatters inward toward left/viewport
      if (bgShardRight) {
        const rightSvg = bgShardRight.querySelector('.cyber-cluster-svg');
        const rightFacets = bgShardRight.querySelectorAll('.outline-facet');
        const rightFractures = bgShardRight.querySelectorAll('.outline-fracture');

        const rightShatterTl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: bgShardRight,
            start: 'top 80%',
            end: 'bottom 10%',
            scrub: 1.2,
            invalidateOnRefresh: true
          }
        });

        // Subtle overall vertical parallax & monochrome wireframe intensification
        if (rightSvg) {
          rightShatterTl.fromTo(
            rightSvg,
            { y: 0, rotation: 0, transformOrigin: '50% 50%' },
            { y: 110, rotation: 4, transformOrigin: '50% 50%' },
            0
          );
        }
        rightShatterTl.fromTo(bgShardRight, { opacity: 0.24 }, { opacity: 0.36 }, 0);
        if (rightFacets.length) {
          rightShatterTl.fromTo(
            rightFacets,
            {
              stroke: 'rgba(255, 255, 255, 0.22)',
              fill: 'rgba(255, 255, 255, 0.015)'
            },
            {
              stroke: 'rgba(255, 255, 255, 0.38)',
              fill: 'rgba(255, 255, 255, 0.03)'
            },
            0
          );
        }

        // Level 1: Primary Shard Groups (45–95px radial expansion biased inward, 8°–18° rotation)
        rightShatterTl
          .fromTo(
            bgShardRight.querySelector('.crystal-needle-upper'),
            { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
            { x: -72, y: -58, rotation: -15, transformOrigin: '50% 50%' },
            0
          )
          .fromTo(
            bgShardRight.querySelector('.crystal-core-monolith'),
            { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
            { x: -52, y: -10, rotation: -9, transformOrigin: '50% 50%' },
            0
          )
          .fromTo(
            bgShardRight.querySelector('.crystal-spike-right'),
            { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
            { x: 46, y: -48, rotation: 14, transformOrigin: '50% 50%' },
            0
          )
          .fromTo(
            bgShardRight.querySelector('.crystal-dagger-lower'),
            { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
            { x: -64, y: 82, rotation: 13, transformOrigin: '50% 50%' },
            0
          );

        // Level 2: Internal Edge Sub-Facets (Peel away further from parent shard)
        rightShatterTl
          .fromTo(
            bgShardRight.querySelector('.sub-facet-a'),
            { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
            { x: -32, y: -22, rotation: -11, transformOrigin: '50% 50%' },
            0
          )
          .fromTo(
            bgShardRight.querySelector('.sub-facet-b'),
            { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
            { x: 24, y: 30, rotation: 12, transformOrigin: '50% 50%' },
            0
          )
          .fromTo(
            bgShardRight.querySelector('.sub-facet-c'),
            { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
            { x: -38, y: 14, rotation: -13, transformOrigin: '50% 50%' },
            0
          )
          .fromTo(
            bgShardRight.querySelector('.sub-facet-d1'),
            { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
            { x: -36, y: 26, rotation: 11, transformOrigin: '50% 50%' },
            0
          )
          .fromTo(
            bgShardRight.querySelector('.sub-facet-d2'),
            { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
            { x: 28, y: 34, rotation: -14, transformOrigin: '50% 50%' },
            0
          );

        // Level 3: Detached Crystal Splinters (110–180px burst into timeline space, 25°–45° rotation)
        rightShatterTl
          .fromTo(
            bgShardRight.querySelector('.splinter-1'),
            { x: 0, y: 0, rotation: 0, scale: 1, transformOrigin: '50% 50%' },
            { x: -118, y: -125, rotation: -38, scale: 1.08, transformOrigin: '50% 50%' },
            0
          )
          .fromTo(
            bgShardRight.querySelector('.splinter-2'),
            { x: 0, y: 0, rotation: 0, scale: 1, transformOrigin: '50% 50%' },
            { x: -175, y: -38, rotation: -44, scale: 1.12, transformOrigin: '50% 50%' },
            0
          )
          .fromTo(
            bgShardRight.querySelector('.splinter-3'),
            { x: 0, y: 0, rotation: 0, scale: 1, transformOrigin: '50% 50%' },
            { x: -110, y: 135, rotation: 34, scale: 0.92, transformOrigin: '50% 50%' },
            0
          )
          .fromTo(
            bgShardRight.querySelector('.splinter-4'),
            { x: 0, y: 0, rotation: 0, scale: 1, transformOrigin: '50% 50%' },
            { x: -155, y: -68, rotation: 39, scale: 1.05, transformOrigin: '50% 50%' },
            0
          )
          .fromTo(
            bgShardRight.querySelector('.splinter-5'),
            { x: 0, y: 0, rotation: 0, scale: 1, transformOrigin: '50% 50%' },
            { x: -142, y: 115, rotation: -33, scale: 0.95, transformOrigin: '50% 50%' },
            0
          );

        // Level 4: Fracture Cleavage Traces (Dash flow + tension fade-out)
        if (rightFractures.length) {
          rightShatterTl.fromTo(
            rightFractures,
            { strokeDashoffset: 0, opacity: 0.16 },
            { strokeDashoffset: -48, opacity: 0.12 },
            0
          );
        }
      }

      // 2. LEFT CRYSTAL SHARD (cluster-apex-outline.svg) — Shatters inward toward right/viewport
      if (bgShardLeft) {
        const leftSvg = bgShardLeft.querySelector('.cyber-cluster-svg');
        const leftFacets = bgShardLeft.querySelectorAll('.outline-facet');
        const leftFractures = bgShardLeft.querySelectorAll('.outline-fracture');

        const leftShatterTl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: bgShardLeft,
            start: 'top 80%',
            end: 'bottom 10%',
            scrub: 1.2,
            invalidateOnRefresh: true
          }
        });

        // Subtle overall vertical parallax & monochrome wireframe intensification
        if (leftSvg) {
          leftShatterTl.fromTo(
            leftSvg,
            { y: 0, rotation: 0, transformOrigin: '50% 50%' },
            { y: 125, rotation: -5, transformOrigin: '50% 50%' },
            0
          );
        }
        leftShatterTl.fromTo(bgShardLeft, { opacity: 0.24 }, { opacity: 0.36 }, 0);
        if (leftFacets.length) {
          leftShatterTl.fromTo(
            leftFacets,
            {
              stroke: 'rgba(255, 255, 255, 0.22)',
              fill: 'rgba(255, 255, 255, 0.015)'
            },
            {
              stroke: 'rgba(255, 255, 255, 0.38)',
              fill: 'rgba(255, 255, 255, 0.03)'
            },
            0
          );
        }

        // Level 1: Primary Shard Groups (45–95px radial expansion biased inward, 8°–18° rotation)
        leftShatterTl
          .fromTo(
            bgShardLeft.querySelector('.shard-primary'),
            { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
            { x: 78, y: -62, rotation: 15, transformOrigin: '50% 50%' },
            0
          )
          .fromTo(
            bgShardLeft.querySelector('.shard-secondary'),
            { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
            { x: -45, y: -46, rotation: -14, transformOrigin: '50% 50%' },
            0
          )
          .fromTo(
            bgShardLeft.querySelector('.shard-dagger'),
            { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
            { x: 86, y: 76, rotation: 17, transformOrigin: '50% 50%' },
            0
          );

        // Level 2: Internal Edge Sub-Facets (Peel away further from parent shard)
        leftShatterTl
          .fromTo(
            bgShardLeft.querySelector('.sub-facet-p1'),
            { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
            { x: 38, y: -26, rotation: 13, transformOrigin: '50% 50%' },
            0
          )
          .fromTo(
            bgShardLeft.querySelector('.sub-facet-p2'),
            { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
            { x: 34, y: 16, rotation: -10, transformOrigin: '50% 50%' },
            0
          )
          .fromTo(
            bgShardLeft.querySelector('.sub-facet-s1'),
            { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
            { x: 44, y: -18, rotation: 12, transformOrigin: '50% 50%' },
            0
          )
          .fromTo(
            bgShardLeft.querySelector('.sub-facet-dg1'),
            { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
            { x: 42, y: 28, rotation: 14, transformOrigin: '50% 50%' },
            0
          );

        // Level 3: Detached Crystal Splinters (110–180px burst into timeline space, 25°–45° rotation)
        leftShatterTl
          .fromTo(
            bgShardLeft.querySelector('.splinter-1'),
            { x: 0, y: 0, rotation: 0, scale: 1, transformOrigin: '50% 50%' },
            { x: 115, y: -112, rotation: 33, scale: 1.06, transformOrigin: '50% 50%' },
            0
          )
          .fromTo(
            bgShardLeft.querySelector('.splinter-2'),
            { x: 0, y: 0, rotation: 0, scale: 1, transformOrigin: '50% 50%' },
            { x: 178, y: -30, rotation: 45, scale: 1.12, transformOrigin: '50% 50%' },
            0
          )
          .fromTo(
            bgShardLeft.querySelector('.splinter-3'),
            { x: 0, y: 0, rotation: 0, scale: 1, transformOrigin: '50% 50%' },
            { x: 128, y: 132, rotation: -36, scale: 0.94, transformOrigin: '50% 50%' },
            0
          )
          .fromTo(
            bgShardLeft.querySelector('.splinter-4'),
            { x: 0, y: 0, rotation: 0, scale: 1, transformOrigin: '50% 50%' },
            { x: 156, y: 48, rotation: -40, scale: 1.08, transformOrigin: '50% 50%' },
            0
          )
          .fromTo(
            bgShardLeft.querySelector('.splinter-5'),
            { x: 0, y: 0, rotation: 0, scale: 1, transformOrigin: '50% 50%' },
            { x: 140, y: 118, rotation: 31, scale: 0.96, transformOrigin: '50% 50%' },
            0
          );

        // Level 4: Fracture Cleavage Lines (Dash flow + tension fade-out)
        if (leftFractures.length) {
          leftShatterTl.fromTo(
            leftFractures,
            { strokeDashoffset: 0, opacity: 0.16 },
            { strokeDashoffset: -48, opacity: 0.12 },
            0
          );
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

  window.Portfolio.timeline = {
    initTimelineChoreography
  };
})(window, document);
