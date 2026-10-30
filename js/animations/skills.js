/**
 * CAPABILITIES (SKILLS) INTERACTIVE SHARP TRIANGULAR CRYSTAL MONOLITH
 * Module: js/animations/skills.js
 * - Uses exact #bgContactCrystal triangular shard geometry (viewBox 0 0 1000 960).
 * - GSAP ScrollTrigger assembly animation (from scattered outward state to locked monolith at center of viewport).
 * - Interactive hover glow + dynamic radial repulsion on neighboring triangular crystal shards.
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  function fitSkillTextsToTriangles(stage) {
    if (!stage) return;
    const shards = stage.querySelectorAll('.skill-tri-shard');
    shards.forEach((el) => {
      const textEl = el.querySelector('.skill-tri-text');
      const textWrap = el.querySelector('.skill-tri-text-wrap');
      const ptsData = el.dataset.pts;
      if (!textEl || !textWrap || !ptsData) return;

      const pts = ptsData.split(';').map((pair) => pair.split(',').map(Number));
      if (pts.length !== 3) return;
      const [p1, p2, p3] = pts;

      const angle = Number(el.dataset.angle) || 0;
      const safeSpan = Number(el.dataset.safeSpan) || 120;
      let fontSize = parseFloat(textEl.getAttribute('font-size')) || Number(el.dataset.fontSize) || 11;

      // Real rendered SVG width in the browser (accounting for loaded 'Syne' font & letter-spacing)
      let measuredW = 0;
      try {
        measuredW = textEl.getComputedTextLength();
      } catch (e) {
        measuredW = 0;
      }

      if (measuredW > safeSpan && safeSpan > 20) {
        fontSize = Math.max(7.2, Math.round((fontSize * (safeSpan / measuredW)) * 10) / 10);
        textEl.setAttribute('font-size', fontSize + 'px');
        try {
          measuredW = textEl.getComputedTextLength();
        } catch (e) {}
      }

      const W = measuredW || (fontSize * (textEl.textContent.length * 0.94));
      const H = fontSize * 1.35;

      const L1 = Math.hypot(p2[0] - p3[0], p2[1] - p3[1]);
      const L2 = Math.hypot(p1[0] - p3[0], p1[1] - p3[1]);
      const L3 = Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
      const perim = L1 + L2 + L3;
      const area = Math.abs((p2[0] - p1[0]) * (p3[1] - p1[1]) - (p2[1] - p1[1]) * (p3[0] - p1[0])) / 2;

      const n1 = [(p3[1] - p2[1]) / L1, -(p3[0] - p2[0]) / L1];
      const n2 = [(p1[1] - p3[1]) / L2, -(p1[0] - p3[0]) / L2];
      const n3 = [(p2[1] - p1[1]) / L3, -(p2[0] - p1[0]) / L3];

      const rad = (angle * Math.PI) / 180;
      const u = [Math.cos(rad), Math.sin(rad)];
      const v = [-Math.sin(rad), Math.cos(rad)];

      const R1 = 0.5 * W * Math.abs(u[0] * n1[0] + u[1] * n1[1]) + 0.5 * H * Math.abs(v[0] * n1[0] + v[1] * n1[1]);
      const R2 = 0.5 * W * Math.abs(u[0] * n2[0] + u[1] * n2[1]) + 0.5 * H * Math.abs(v[0] * n2[0] + v[1] * n2[1]);
      const R3 = 0.5 * W * Math.abs(u[0] * n3[0] + u[1] * n3[1]) + 0.5 * H * Math.abs(v[0] * n3[0] + v[1] * n3[1]);

      const M = (2 * area - (L1 * R1 + L2 * R2 + L3 * R3)) / perim;
      const lam1 = (L1 * (R1 + M)) / (2 * area);
      const lam2 = (L2 * (R2 + M)) / (2 * area);
      const lam3 = (L3 * (R3 + M)) / (2 * area);

      const tx = Math.round((lam1 * p1[0] + lam2 * p2[0] + lam3 * p3[0]) * 10) / 10;
      const ty = Math.round((lam1 * p1[1] + lam2 * p2[1] + lam3 * p3[1]) * 10) / 10;

      textWrap.setAttribute('transform', `translate(${tx}, ${ty}) rotate(${angle})`);
    });
  }

  function initSkillsCrystalAnimation() {
    const stage = document.getElementById('skillsCrystalStage');
    const skillsSection = document.getElementById('skills');
    const svg = document.getElementById('skillsCrystalSvg');
    if (!stage || !skillsSection || !svg) return;

    // Auto-fit label typography inside triangles (immediate + after Syne font loads)
    fitSkillTextsToTriangles(stage);
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => fitSkillTextsToTriangles(stage));
    }

    const shardEls = Array.from(stage.querySelectorAll('.skill-tri-shard'));
    if (!shardEls.length) return;

    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

    // Exact #bgContactCrystal tier scatter vectors (scaled 2x to 1000x960 coordinate space)
    const TIER_SCATTER = {
      'needle-upper': { x: -210, y: -175, rot: -24, scale: 1.0 },
      'sub-a':        { x: -295, y: -235, rot: -38, scale: 1.04 },
      'spike-right':  { x: 235,  y: -140, rot: 24,  scale: 1.0 },
      'sub-b':        { x: 315,  y: -50,  rot: 40,  scale: 1.05 },
      'core-monolith':{ x: -85,  y: -30,  rot: -14, scale: 0.88 },
      'sub-c':        { x: -190, y: 42,   rot: -30, scale: 0.95 },
      'dagger-lower': { x: -165, y: 225,  rot: 22,  scale: 1.0 },
      'sub-d1':       { x: -255, y: 285,  rot: 36,  scale: 0.96 },
      'sub-d2':       { x: 185,  y: 275,  rot: -28, scale: 0.96 },
      'splinter-1':   { x: 275,  y: -265, rot: -42, scale: 1.15 },
      'splinter-2':   { x: -355, y: -85,  rot: -48, scale: 1.15 },
      'splinter-3':   { x: 265,  y: 285,  rot: 38,  scale: 0.92 },
      'splinter-4':   { x: 325,  y: -155, rot: 44,  scale: 1.1 },
      'splinter-5':   { x: -295, y: 250,  rot: -36, scale: 0.92 }
    };

    const MONOLITH_CENTER = { x: 485, y: 470 };

    const shardState = shardEls.map((el, idx) => {
      const cx = Number(el.dataset.cx) || MONOLITH_CENTER.x;
      const cy = Number(el.dataset.cy) || MONOLITH_CENTER.y;
      const size = Number(el.dataset.size) || 140;
      const inradius = Number(el.dataset.inradius) || 45;
      const tier = el.dataset.tier || 'core-monolith';
      const tierBase = TIER_SCATTER[tier] || TIER_SCATTER['core-monolith'];

      // Radial vector from monolith center so every triangle in the same tier also separates cleanly
      const dx = cx - MONOLITH_CENTER.x;
      const dy = cy - MONOLITH_CENTER.y;
      const dist = Math.hypot(dx, dy) || 1;
      const ux = dx / dist;
      const uy = dy / dist;

      const radialSpread = 85 + (idx % 4) * 32;
      const scatterX = Math.round(tierBase.x + ux * radialSpread);
      const scatterY = Math.round(tierBase.y + uy * radialSpread);
      const scatterRot = tierBase.rot + ((idx % 3) - 1) * 9;
      const scatterScale = tierBase.scale;

      return {
        el,
        scrollEl: el.querySelector('.skill-shard-scroll'),
        bodyEl: el.querySelector('.skill-shard-body'),
        idx,
        cx,
        cy,
        size,
        inradius,
        scatterX,
        scatterY,
        scatterRot,
        scatterScale
      };
    });

    // 1. GSAP ScrollTrigger Assembly Animation (Identical choreography to #bgContactCrystal)
    if (hasGSAP) {
      const assembleTl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: skillsSection,
          start: 'top 85%',
          end: 'center center',
          scrub: 0.9,
          invalidateOnRefresh: true
        }
      });

      // Overall crystal vertical parallax & glow intensification
      assembleTl
        .fromTo(
          svg,
          { y: -70, rotation: -5, transformOrigin: '50% 50%' },
          { y: 0, rotation: 0, transformOrigin: '50% 50%' },
          0
        )
        .fromTo(
          stage,
          {
            opacity: 0.55,
            filter: 'drop-shadow(0 0 35px rgba(255, 85, 0, 0.14))'
          },
          {
            opacity: 1,
            filter: 'drop-shadow(0 0 85px rgba(255, 115, 0, 0.42))'
          },
          0
        );

      // Each sharp triangular shard animates from scattered outward state to locked (0, 0, 0)
      shardState.forEach((it) => {
        if (!it.scrollEl) return;
        assembleTl.fromTo(
          it.scrollEl,
          {
            x: it.scatterX,
            y: it.scatterY,
            rotation: it.scatterRot,
            scale: it.scatterScale,
            transformOrigin: '50% 50%'
          },
          {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            transformOrigin: '50% 50%'
          },
          0
        );
      });
    }

    // 2. Interactive Hover Glow & Dynamic Radial Repulsion on Neighboring Triangular Shards
    function handleShardHover(hoveredIndex) {
      const hovered = shardState[hoveredIndex];
      if (!hovered) return;

      stage.classList.add('has-hovered-shard');

      shardState.forEach((it, idx) => {
        if (!it.bodyEl) return;

        if (idx === hoveredIndex) {
          it.el.classList.add('is-hovered');
          if (hasGSAP) {
            gsap.to(it.bodyEl, {
              x: 0,
              y: 0,
              scale: 1.09,
              rotation: 0,
              transformOrigin: '50% 50%',
              duration: 0.38,
              ease: 'power3.out',
              overwrite: 'auto'
            });
          } else {
            it.bodyEl.style.transform = 'translate3d(0px, 0px, 0) scale(1.09)';
          }
        } else {
          it.el.classList.remove('is-hovered');

          const dx = it.cx - hovered.cx;
          const dy = it.cy - hovered.cy;
          const dist = Math.hypot(dx, dy) || 1;
          const ux = dx / dist;
          const uy = dy / dist;

          // Repulsion radius scales with hovered skill's size field in JSON
          const sizeMultiplier = hovered.size / 140;
          const repelRadius = 380 * sizeMultiplier;

          if (dist < repelRadius) {
            const ratio = 1 - dist / repelRadius;
            const pushDist = Math.pow(ratio, 1.15) * 72 * sizeMultiplier;
            const pushX = Math.round(ux * pushDist * 10) / 10;
            const pushY = Math.round(uy * pushDist * 10) / 10;
            const tiltRot = Math.round(ux * 7 * ratio * 10) / 10;

            if (hasGSAP) {
              gsap.to(it.bodyEl, {
                x: pushX,
                y: pushY,
                rotation: tiltRot,
                scale: 1,
                transformOrigin: '50% 50%',
                duration: 0.44,
                ease: 'power3.out',
                overwrite: 'auto'
              });
            } else {
              it.bodyEl.style.transform = `translate3d(${pushX}px, ${pushY}px, 0) rotate(${tiltRot}deg)`;
            }
          } else {
            if (hasGSAP) {
              gsap.to(it.bodyEl, {
                x: 0,
                y: 0,
                rotation: 0,
                scale: 1,
                transformOrigin: '50% 50%',
                duration: 0.44,
                ease: 'power3.out',
                overwrite: 'auto'
              });
            } else {
              it.bodyEl.style.transform = 'translate3d(0px, 0px, 0) scale(1)';
            }
          }
        }
      });
    }

    function resetAllShardsHover() {
      stage.classList.remove('has-hovered-shard');

      shardState.forEach((it) => {
        it.el.classList.remove('is-hovered');
        if (!it.bodyEl) return;

        if (hasGSAP) {
          gsap.to(it.bodyEl, {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            transformOrigin: '50% 50%',
            duration: 0.55,
            ease: 'power3.out',
            overwrite: 'auto'
          });
        } else {
          it.bodyEl.style.transform = 'translate3d(0px, 0px, 0) scale(1)';
        }
      });
    }

    if (!stage.dataset.hoverBound) {
      stage.dataset.hoverBound = 'true';
      shardEls.forEach((el, idx) => {
        el.addEventListener('mouseenter', () => handleShardHover(idx));
        el.addEventListener('mouseleave', () => resetAllShardsHover());
      });

      stage.addEventListener('mouseleave', resetAllShardsHover);
    }
  }

  window.Portfolio.skills = {
    initSkillsCrystalAnimation
  };
})(window, document);
