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

  function initSkillsCrystalAnimation() {
    const stage = document.getElementById('skillsCrystalStage');
    const skillsSection = document.getElementById('skills');
    const svg = document.getElementById('skillsCrystalSvg');
    if (!stage || !skillsSection || !svg) return;

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
      const fractures = stage.querySelectorAll('.outline-fracture');

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

      // Fracture Cleavage Laser Traces bond together
      if (fractures.length) {
        assembleTl.fromTo(
          fractures,
          { strokeDashoffset: -54, opacity: 0.08 },
          { strokeDashoffset: 0, opacity: 0.85 },
          0
        );
      }
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

    shardEls.forEach((el, idx) => {
      el.addEventListener('mouseenter', () => handleShardHover(idx));
      el.addEventListener('mouseleave', () => resetAllShardsHover());
    });

    stage.addEventListener('mouseleave', resetAllShardsHover);
  }

  window.Portfolio.skills = {
    initSkillsCrystalAnimation
  };
})(window, document);
