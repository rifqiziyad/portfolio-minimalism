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
    const shards = Array.from(stage.querySelectorAll('.skill-tri-shard'));
    if (!shards.length) return;

    // Pass 1 (Read-only): measure natural SVG text length for all shards in one pass
    const measuredEntries = [];
    shards.forEach((el) => {
      const textEl = el.querySelector('.skill-tri-text');
      const textWrap = el.querySelector('.skill-tri-text-wrap');
      const ptsData = el.dataset.pts;
      if (!textEl || !textWrap || !ptsData) return;

      const pts = ptsData.split(';').map((pair) => pair.split(',').map(Number));
      if (pts.length !== 3) return;

      const angle = Number(el.dataset.angle) || 0;
      const safeSpan = Number(el.dataset.safeSpan) || 120;
      const baseFontSize = parseFloat(textEl.getAttribute('font-size')) || Number(el.dataset.fontSize) || 11;

      let measuredW = 0;
      try {
        measuredW = textEl.getComputedTextLength();
      } catch (e) {
        measuredW = 0;
      }

      let nextFontSize = baseFontSize;
      const needsResize = measuredW > safeSpan && safeSpan > 20;
      if (needsResize) {
        nextFontSize = Math.max(8.5, Math.round((baseFontSize * (safeSpan / measuredW)) * 10) / 10);
      }

      measuredEntries.push({
        el,
        textEl,
        textWrap,
        pts,
        angle,
        fontSize: nextFontSize,
        measuredW,
        needsResize: needsResize && nextFontSize !== baseFontSize
      });
    });

    // Pass 2 (Write font-size): batch attribute updates before re-reading
    const resizedEntries = [];
    measuredEntries.forEach((entry) => {
      if (entry.needsResize) {
        entry.textEl.setAttribute('font-size', entry.fontSize + 'px');
        resizedEntries.push(entry);
      }
    });

    // Pass 3 (Conditional Read): re-measure only resized entries
    resizedEntries.forEach((entry) => {
      try {
        entry.measuredW = entry.textEl.getComputedTextLength();
      } catch (e) {}
    });

    // Pass 4 (Compute & Write transforms): batch final SVG transforms and data attributes
    measuredEntries.forEach((entry) => {
      const { el, textEl, textWrap, pts, angle, fontSize, measuredW } = entry;
      const [p1, p2, p3] = pts;

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

      el.dataset.tx = tx;
      el.dataset.ty = ty;
      textWrap.setAttribute('transform', `translate(${tx}, ${ty}) rotate(${angle})`);
    });
  }

  function transformTriangle(pts, ox, oy, scale, rotDeg, dx, dy) {
    const rad = (rotDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return pts.map((p) => {
      const sx = (p[0] - ox) * scale;
      const sy = (p[1] - oy) * scale;
      return [
        ox + sx * cos - sy * sin + dx,
        oy + sx * sin + sy * cos + dy
      ];
    });
  }

  function shiftTriangle(pts, dx, dy) {
    return [
      [pts[0][0] + dx, pts[0][1] + dy],
      [pts[1][0] + dx, pts[1][1] + dy],
      [pts[2][0] + dx, pts[2][1] + dy]
    ];
  }

  // Separating Axis Theorem (SAT) for 2D triangles with an explicit clearance margin
  function trianglesOverlapWithMargin(triA, triB, margin) {
    const polys = [triA, triB];
    for (let p = 0; p < 2; p++) {
      const poly = polys[p];
      for (let i = 0; i < 3; i++) {
        const p1 = poly[i];
        const p2 = poly[(i + 1) % 3];
        const ex = p2[0] - p1[0];
        const ey = p2[1] - p1[1];
        const len = Math.hypot(ex, ey);
        if (len < 1e-5) continue;
        const nx = -ey / len;
        const ny = ex / len;

        let minA = Infinity;
        let maxA = -Infinity;
        for (let k = 0; k < 3; k++) {
          const proj = triA[k][0] * nx + triA[k][1] * ny;
          if (proj < minA) minA = proj;
          if (proj > maxA) maxA = proj;
        }

        let minB = Infinity;
        let maxB = -Infinity;
        for (let k = 0; k < 3; k++) {
          const proj = triB[k][0] * nx + triB[k][1] * ny;
          if (proj < minB) minB = proj;
          if (proj > maxB) maxB = proj;
        }

        if (maxA + margin <= minB || maxB + margin <= minA) {
          return false;
        }
      }
    }
    return true;
  }

  function initSkillsCrystalAnimation() {
    const stage = document.getElementById('skillsCrystalStage');
    const skillsSection = document.getElementById('skills');
    const svg = document.getElementById('skillsCrystalSvg');
    if (!stage || !skillsSection || !svg) return;

    const reducedMotion =
      window.Portfolio.utils &&
      typeof window.Portfolio.utils.prefersReducedMotion === 'function' &&
      window.Portfolio.utils.prefersReducedMotion();

    // Auto-fit label typography inside triangles (immediate + after Syne font loads)
    fitSkillTextsToTriangles(stage);
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready && document.fonts.status !== 'loaded') {
      document.fonts.ready.then(() => fitSkillTextsToTriangles(stage));
    }

    const shardEls = Array.from(stage.querySelectorAll('.skill-tri-shard'));
    if (!shardEls.length) return;

    const hasGSAP = !reducedMotion && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

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
      const angle = Number(el.dataset.angle) || 0;
      const tx = Number(el.dataset.tx) || cx;
      const ty = Number(el.dataset.ty) || cy;
      const ptsData = el.dataset.pts || '';
      const pts = ptsData
        ? ptsData.split(';').map((pair) => pair.split(',').map(Number))
        : [[cx - 30, cy - 30], [cx + 30, cy - 30], [cx, cy + 30]];

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
        hitEl: el.querySelector('.skill-shard-body') || el,
        scrollEl: el.querySelector('.skill-shard-scroll'),
        bodyEl: el.querySelector('.skill-shard-body'),
        idx,
        cx,
        cy,
        tx,
        ty,
        angle,
        pts,
        size,
        inradius,
        scatterX,
        scatterY,
        scatterRot,
        scatterScale,
        anim: { x: 0, y: 0, scale: 1, rot: 0 }
      };
    });

    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        shardState.forEach((it) => {
          it.tx = Number(it.el.dataset.tx) || it.cx;
          it.ty = Number(it.el.dataset.ty) || it.cy;
        });
      });
    }

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
          { y: -70 },
          { y: 0 },
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

    // 2. Interactive Hover (Glow Only) & Click (Scale + Horizontal Rotation + 2s Auto-Reset)
    let activeClickIdx = -1;
    let clickResetTimer = null;
    let clickScrollY = 0;

    // Pure SVG transform attribute writer around exact pivot (ox, oy) — immune to GSAP smoothOrigin drift
    function applyShardTransform(it) {
      if (!it.bodyEl) return;
      const { x, y, scale, rot } = it.anim;
      if (
        Math.abs(x) < 0.01 &&
        Math.abs(y) < 0.01 &&
        Math.abs(scale - 1) < 0.001 &&
        Math.abs(rot) < 0.01
      ) {
        it.bodyEl.removeAttribute('transform');
        return;
      }
      const ox = Number(it.el.dataset.tx) || it.tx;
      const oy = Number(it.el.dataset.ty) || it.ty;
      const tx1 = Math.round((ox + x) * 100) / 100;
      const ty1 = Math.round((oy + y) * 100) / 100;
      const r = Math.round(rot * 100) / 100;
      const s = Math.round(scale * 1000) / 1000;
      it.bodyEl.setAttribute(
        'transform',
        `translate(${tx1}, ${ty1}) rotate(${r}) scale(${s}) translate(${-ox}, ${-oy})`
      );
    }

    function tweenShardTo(it, targetX, targetY, targetScale, targetRot, duration) {
      if (hasGSAP) {
        gsap.to(it.anim, {
          x: targetX,
          y: targetY,
          scale: targetScale,
          rot: targetRot,
          duration,
          ease: 'power3.out',
          overwrite: true,
          onUpdate: () => applyShardTransform(it),
          onComplete: () => applyShardTransform(it)
        });
      } else {
        it.anim.x = targetX;
        it.anim.y = targetY;
        it.anim.scale = targetScale;
        it.anim.rot = targetRot;
        applyShardTransform(it);
      }
    }

    function handleShardHoverEnter(hoveredIndex) {
      stage.classList.add('has-hovered-shard');
      shardState.forEach((it, idx) => {
        if (idx === hoveredIndex) {
          it.el.classList.add('is-hovered');
        } else {
          it.el.classList.remove('is-hovered');
        }
      });
    }

    function handleShardHoverLeave() {
      stage.classList.remove('has-hovered-shard');
      shardState.forEach((it) => {
        it.el.classList.remove('is-hovered');
      });
    }

    function resetAllShardsTransform() {
      if (clickResetTimer) {
        clearTimeout(clickResetTimer);
        clickResetTimer = null;
      }
      activeClickIdx = -1;
      stage.classList.remove('has-active-shard');

      shardState.forEach((it) => {
        it.el.classList.remove('is-active');
        it.el.setAttribute('aria-pressed', 'false');
        tweenShardTo(it, 0, 0, 1, 0, 0.52);
      });
    }

    function handleShardClick(clickedIndex) {
      // Clicking the same active shard again immediately returns all shards to rest
      if (activeClickIdx === clickedIndex) {
        resetAllShardsTransform();
        return;
      }

      if (clickResetTimer) {
        clearTimeout(clickResetTimer);
        clickResetTimer = null;
      }

      const clicked = shardState[clickedIndex];
      if (!clicked) return;

      activeClickIdx = clickedIndex;
      clickScrollY = window.scrollY || window.pageYOffset || 0;
      stage.classList.add('has-active-shard');

      // Highlight active shard & sync ARIA pressed state
      shardState.forEach((it, idx) => {
        const isCurrent = idx === clickedIndex;
        it.el.classList.toggle('is-active', isCurrent);
        it.el.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
      });

      if (reducedMotion) {
        clickResetTimer = setTimeout(() => {
          resetAllShardsTransform();
        }, 2500);
        return;
      }

      // Adaptive scale: smaller shards scale up more (up to 1.55x) so small labels become easy to read
      const hoverScale = Math.max(1.35, Math.min(1.55, 1.62 - clicked.inradius / 180));
      // Counter-rotate by -angle so embedded skill text becomes strictly horizontal (0 deg)
      const targetRot = -clicked.angle;
      const ox = Number(clicked.el.dataset.tx) || clicked.tx;
      const oy = Number(clicked.el.dataset.ty) || clicked.ty;

      // Exact 2D vertices of the clicked triangle after scaling & rotating to horizontal (from its rest state)
      const clickedPoly = transformTriangle(clicked.pts, ox, oy, hoverScale, targetRot, 0, 0);

      // Animate clicked shard to x=0, y=0, scale=hoverScale, rot=targetRot around (ox, oy)
      tweenShardTo(clicked, 0, 0, hoverScale, targetRot, 0.44);

      // Compute outward radial vectors & required clearance push against clickedPoly
      const neighbors = [];
      const sizeMultiplier = clicked.size / 140;
      const repelRadius = 380 * sizeMultiplier;

      shardState.forEach((it, idx) => {
        if (idx === clickedIndex) return;

        const dx = it.cx - ox;
        const dy = it.cy - oy;
        const dist = Math.hypot(dx, dy) || 1;
        const ux = dx / dist;
        const uy = dy / dist;

        let pushDist = 0;
        if (dist < repelRadius) {
          const ratio = 1 - dist / repelRadius;
          pushDist = Math.pow(ratio, 1.15) * 44 * sizeMultiplier;
        }

        // Step outward along (ux, uy) until zero overlap with clickedPoly (+16px breathing margin)
        let currentPoly = shiftTriangle(it.pts, ux * pushDist, uy * pushDist);
        let guard = 0;
        while (trianglesOverlapWithMargin(clickedPoly, currentPoly, 16) && guard < 50) {
          pushDist += 6;
          currentPoly = shiftTriangle(it.pts, ux * pushDist, uy * pushDist);
          guard++;
        }

        neighbors.push({
          it,
          dist,
          ux,
          uy,
          pushDist
        });
      });

      // Radial Diffeomorphism Envelope: propagate push smoothly from inner to outer shards
      // so inner shards never overtake or compress into outer shards
      neighbors.sort((a, b) => a.dist - b.dist);

      for (let i = 0; i < neighbors.length; i++) {
        const inner = neighbors[i];
        if (inner.pushDist <= 0) continue;
        for (let j = i + 1; j < neighbors.length; j++) {
          const outer = neighbors[j];
          const cosSim = inner.ux * outer.ux + inner.uy * outer.uy;
          if (cosSim > 0.15) {
            const radialGap = Math.max(0, outer.dist - inner.dist);
            const carriedPush = inner.pushDist * Math.pow(cosSim, 0.55) - radialGap * 0.08;
            if (carriedPush > outer.pushDist) {
              outer.pushDist = carriedPush;
            }
          }
        }
      }

      // Apply final collision-free positions to all neighbor shards (without rotating/scaling them)
      neighbors.forEach(({ it, ux, uy, pushDist }) => {
        const pushX = Math.round(ux * pushDist * 10) / 10;
        const pushY = Math.round(uy * pushDist * 10) / 10;
        tweenShardTo(it, pushX, pushY, 1, 0, 0.44);
      });

      // Automatically return to original position after 2 seconds (2000ms)
      clickResetTimer = setTimeout(() => {
        resetAllShardsTransform();
      }, 2000);
    }

    if (!stage.dataset.hoverBound) {
      stage.dataset.hoverBound = 'true';
      shardState.forEach((it, idx) => {
        it.hitEl.addEventListener('mouseenter', () => handleShardHoverEnter(idx));
        it.hitEl.addEventListener('mouseleave', () => handleShardHoverLeave());
        it.hitEl.addEventListener('click', (e) => {
          e.stopPropagation();
          handleShardClick(idx);
        });
        it.el.addEventListener('focus', () => handleShardHoverEnter(idx));
        it.el.addEventListener('blur', () => handleShardHoverLeave());
        it.el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            handleShardClick(idx);
          } else if (e.key === 'Escape' && activeClickIdx !== -1) {
            e.preventDefault();
            resetAllShardsTransform();
          }
        });
      });

      stage.addEventListener('mouseleave', handleShardHoverLeave);

      // Reset active shard when clicking anywhere outside a shard
      document.addEventListener('click', (e) => {
        if (activeClickIdx === -1) return;
        if (e.target && e.target.closest && e.target.closest('.skill-shard-body')) return;
        resetAllShardsTransform();
      });

      // Reset active shard immediately on user scroll action (wheel, touchmove, or scroll delta)
      window.addEventListener(
        'wheel',
        () => {
          if (activeClickIdx !== -1) resetAllShardsTransform();
        },
        { passive: true }
      );

      window.addEventListener(
        'touchmove',
        () => {
          if (activeClickIdx !== -1) resetAllShardsTransform();
        },
        { passive: true }
      );

      window.addEventListener(
        'scroll',
        () => {
          if (activeClickIdx === -1) return;
          const currentY = window.scrollY || window.pageYOffset || 0;
          if (Math.abs(currentY - clickScrollY) > 6) {
            resetAllShardsTransform();
          }
        },
        { passive: true }
      );
    }
  }

  window.Portfolio.skills = {
    initSkillsCrystalAnimation
  };
})(window, document);
