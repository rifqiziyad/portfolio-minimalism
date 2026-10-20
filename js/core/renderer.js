/**
 * DYNAMIC DOM RENDERER
 * Module: js/core/renderer.js
 * Injects content from window.PortfolioData into semantic containers before animations run.
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  function renderWorks(works) {
    const container = document.getElementById('worksList');
    if (!container || !Array.isArray(works)) return;

    const html = works
      .map((item, index) => {
        const isReversed = index % 2 === 1;
        const layoutClass = isReversed ? 'project-layout-reversed' : 'project-layout-normal';
        const infoRevealClass = isReversed ? 'reveal-right' : 'reveal-left';

        const infoMarkup = `
          <div class="project-info reveal ${infoRevealClass}">
            <div class="project-meta">
              <span class="project-num">${item.num} / ${item.category}</span>
              <span class="project-tag">${item.tag}</span>
            </div>
            <h3 class="project-title">${item.title}</h3>
            <p class="project-desc">${item.description}</p>
            <div class="project-details">
              <div class="detail-row">
                <span class="detail-label">YEAR</span>
                <span class="detail-val">${item.year}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">STACK</span>
                <span class="detail-val">${item.stack}</span>
              </div>
            </div>
            <div class="project-link-wrap">
              <a href="${item.linkUrl || '#contact'}" class="project-link">
                <span>${item.linkText || 'INQUIRE DETAILS'}</span>
                <span class="arrow">↗</span>
              </a>
            </div>
          </div>
        `;

        const visualMarkup = `
          <div class="project-visual reveal reveal-scale">
            <div class="project-img-frame">
              <img src="${item.image}" alt="${item.imageAlt || item.title}" class="project-img" loading="lazy">
              <div class="project-badge-float">${item.num}</div>
            </div>
          </div>
        `;

        return `
          <article class="project-item ${layoutClass}" id="${item.id}">
            ${isReversed ? visualMarkup + infoMarkup : infoMarkup + visualMarkup}
          </article>
        `;
      })
      .join('');

    container.innerHTML = html;
  }

  function renderTimeline(timeline) {
    const container = document.getElementById('timelineStream');
    if (!container || !Array.isArray(timeline)) return;

    const intervals = [
      {
        id: 'prod-interval-1',
        class: 'interval-left',
        artId: 'prod-art-1',
        svg: 'assets/cluster-apex.svg',
        alt: 'Apex Crystal Shards',
        dockId: 'prod-dock-int-1',
        dotClass: ''
      },
      {
        id: 'prod-interval-2',
        class: 'interval-right',
        artId: 'prod-art-2',
        svg: 'assets/cluster-gem.svg',
        alt: 'Shattered Crystal Prism',
        dockId: 'prod-dock-int-2',
        dotClass: 'purple'
      }
    ];

    let itemsHtml = `
      <svg class="timeline-dynamic-track" id="prodTimelineTrackSvg" fill="none">
        <path id="prodTrackPathGlow" stroke="rgba(255, 69, 0, 0.22)" stroke-width="5" />
        <path id="prodTrackPath" stroke="rgba(255, 69, 0, 0.75)" stroke-width="2" stroke-dasharray="6 6" />
      </svg>
    `;

    timeline.forEach((card, index) => {
      const docksMarkup = (card.docks || [])
        .map(
          (d) =>
            `<div class="card-dock ${d.posClass}" id="${d.id}"><span class="dock-point ${d.dotClass}"></span></div>`
        )
        .join('');

      itemsHtml += `
        <div class="timeline-card-wrapper" id="${card.wrapId}">
          <div class="timeline-card reveal reveal-fade" id="${card.id}">
            ${docksMarkup}
            <div class="timeline-card-year">
              <span>${card.year}</span>
            </div>
            <h3 class="timeline-card-heading">${card.heading}</h3>
            <p class="timeline-card-text">${card.text}</p>
          </div>
        </div>
      `;

      if (intervals[index]) {
        const int = intervals[index];
        itemsHtml += `
          <div class="timeline-interval ${int.class}" id="${int.id}">
            <div class="interval-illustration" id="${int.artId}">
              <img src="${int.svg}" alt="${int.alt}" loading="lazy">
              <div class="flank-dock" id="${int.dockId}"><span class="dock-point ${int.dotClass}"></span></div>
            </div>
          </div>
        `;
      }
    });

    container.innerHTML = itemsHtml;
  }

  function normalizeAngleDeg(deg) {
    let a = deg;
    while (a > 90) a -= 180;
    while (a < -90) a += 180;
    return Math.max(-76, Math.min(76, a));
  }

  function computeTriangleMetrics(p1, p2, p3) {
    const a = Math.hypot(p2[0] - p3[0], p2[1] - p3[1]);
    const b = Math.hypot(p1[0] - p3[0], p1[1] - p3[1]);
    const c = Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
    const perim = a + b + c;

    const ix = (a * p1[0] + b * p2[0] + c * p3[0]) / perim;
    const iy = (a * p1[1] + b * p2[1] + c * p3[1]) / perim;
    const cx = (p1[0] + p2[0] + p3[0]) / 3;
    const cy = (p1[1] + p2[1] + p3[1]) / 3;

    const area =
      Math.abs((p2[0] - p1[0]) * (p3[1] - p1[1]) - (p2[1] - p1[1]) * (p3[0] - p1[0])) / 2;
    const inradius = (2 * area) / perim;

    return {
      area,
      inradius,
      cx,
      cy,
      ix,
      iy
    };
  }

  /**
   * Uniform Pixel Margin Center (Anisotropic Rectangular Incenter) Algorithm:
   * Finds the exact center (tx, ty) and orientation angle theta where the clearance from all
   * 4 corners of the rotated text box to all 3 edges of the triangle is mathematically equal!
   */
  function computeInscribedTextPlacement(p1, p2, p3, text, skillSize) {
    const m = computeTriangleMetrics(p1, p2, p3);
    const L1 = Math.hypot(p2[0] - p3[0], p2[1] - p3[1]);
    const L2 = Math.hypot(p1[0] - p3[0], p1[1] - p3[1]);
    const L3 = Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
    const perim = L1 + L2 + L3;

    const n1 = [(p3[1] - p2[1]) / L1, -(p3[0] - p2[0]) / L1];
    const n2 = [(p1[1] - p3[1]) / L2, -(p1[0] - p3[0]) / L2];
    const n3 = [(p2[1] - p1[1]) / L3, -(p2[0] - p1[0]) / L3];

    // Syne 800 uppercase + 0.07em letter-spacing ratio (~0.94em per character)
    const w0 = Math.max(4.2, text.length * 0.94);
    const h0 = 1.4;

    const pts = [p1, p2, p3];
    const candidates = [];
    for (let i = 0; i < 3; i++) {
      const pa = pts[i], pb = pts[(i + 1) % 3], pc = pts[(i + 2) % 3];
      candidates.push(normalizeAngleDeg(Math.atan2(pb[1] - pa[1], pb[0] - pa[0]) * (180 / Math.PI)));
      const mid = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
      candidates.push(normalizeAngleDeg(Math.atan2(mid[1] - pc[1], mid[0] - pc[0]) * (180 / Math.PI)));
    }

    let best = null;

    for (const angleDeg of candidates) {
      const rad = (angleDeg * Math.PI) / 180;
      const u = [Math.cos(rad), Math.sin(rad)];
      const v = [-Math.sin(rad), Math.cos(rad)];

      const r1_unit = 0.5 * w0 * Math.abs(u[0] * n1[0] + u[1] * n1[1]) + 0.5 * h0 * Math.abs(v[0] * n1[0] + v[1] * n1[1]);
      const r2_unit = 0.5 * w0 * Math.abs(u[0] * n2[0] + u[1] * n2[1]) + 0.5 * h0 * Math.abs(v[0] * n2[0] + v[1] * n2[1]);
      const r3_unit = 0.5 * w0 * Math.abs(u[0] * n3[0] + u[1] * n3[1]) + 0.5 * h0 * Math.abs(v[0] * n3[0] + v[1] * n3[1]);

      const denom = L1 * r1_unit + L2 * r2_unit + L3 * r3_unit;
      const fMax = (2 * m.area) / denom;

      if (!best || fMax > best.fMax) {
        best = { fMax, angleDeg, r1_unit, r2_unit, r3_unit };
      }
    }

    const sizeScale = Math.sqrt(skillSize / 145);
    const fontSize = Math.max(7.5, Math.min(12.8, Math.round(best.fMax * 0.55 * sizeScale * 10) / 10));

    const R1 = fontSize * best.r1_unit;
    const R2 = fontSize * best.r2_unit;
    const R3 = fontSize * best.r3_unit;

    // Exact uniform pixel clearance M so distance to Edge 1 = Edge 2 = Edge 3 = M
    const M = (2 * m.area - (L1 * R1 + L2 * R2 + L3 * R3)) / perim;

    const lam1 = (L1 * (R1 + M)) / (2 * m.area);
    const lam2 = (L2 * (R2 + M)) / (2 * m.area);
    const lam3 = (L3 * (R3 + M)) / (2 * m.area);

    const tx = lam1 * p1[0] + lam2 * p2[0] + lam3 * p3[0];
    const ty = lam1 * p1[1] + lam2 * p2[1] + lam3 * p3[1];
    const safeSpan = Math.round(best.fMax * w0 * 0.65);

    return {
      ...m,
      tx: Math.round(tx * 10) / 10,
      ty: Math.round(ty * 10) / 10,
      angle: Math.round(best.angleDeg * 10) / 10,
      fontSize,
      safeSpan
    };
  }

  function buildContactCrystalTriangulation(targetCount) {
    const S = 2.0;
    const pt = (x, y) => [Math.round(x * S), Math.round(y * S)];

    // 100% Exact Silhouette & Vertex Proportions of #bgContactCrystal (scaled 2x to 1000x960)
    const V = {
      P_160_50:  pt(160, 50),
      P_250_135: pt(250, 135),
      P_190_170: pt(190, 170),
      P_120_130: pt(120, 130),
      P_430_175: pt(430, 175),
      P_320_225: pt(320, 225),
      P_355_275: pt(355, 275),
      P_255_230: pt(255, 230),
      P_205_245: pt(205, 245),
      P_270_320: pt(270, 320),
      P_155_265: pt(155, 265),
      P_175_440: pt(175, 440),
      P_255_385: pt(275, 385),
      P_320_105: pt(320, 105),
      P_120_330: pt(120, 330),
      I_352_162: pt(340, 155),
      I_218_342: pt(195, 312)
    };

    const baseDefs = [
      // Shard A: Upper Needle Crystal (Level 1 + Sub-Facet A)
      { pts: [V.P_160_50, V.P_250_135, V.P_190_170], grad: 'orange-intense', stroke: '#ff7700', ridge: [V.P_160_50, V.P_190_170], node: V.P_160_50, tier: 'needle-upper' },
      { pts: [V.P_160_50, V.P_190_170, V.P_120_130], grad: 'violet-radiant', stroke: '#c084fc', tier: 'sub-a' },

      // Shard B: Lateral Right Spike (Level 1 + Sub-Facet B)
      { pts: [V.P_250_135, V.I_352_162, V.P_320_225], grad: 'amber-gold',     stroke: '#ffaa00', tier: 'spike-right' },
      { pts: [V.I_352_162, V.P_430_175, V.P_320_225], grad: 'amber-gold',     stroke: '#ffaa00', ridge: [V.P_430_175, V.P_320_225], node: V.P_430_175, tier: 'spike-right' },
      { pts: [V.P_430_175, V.P_355_275, V.P_320_225], grad: 'magenta-flare',  stroke: '#ff4500', node: V.P_320_225, tier: 'sub-b' },
      { pts: [V.P_250_135, V.P_320_225, V.P_255_230], grad: 'violet-radiant', stroke: '#9333ea', tier: 'spike-right' },

      // Shard C: Central Fractured Core Monolith (Level 1 + Sub-Facet C)
      { pts: [V.P_190_170, V.P_250_135, V.P_205_245], grad: 'magenta-flare',  stroke: '#d946ef', node: V.P_250_135, tier: 'core-monolith' },
      { pts: [V.P_250_135, V.P_255_230, V.P_205_245], grad: 'magenta-flare',  stroke: '#d946ef', ridge: [V.P_250_135, V.P_270_320], tier: 'core-monolith' },
      { pts: [V.P_205_245, V.P_255_230, V.P_270_320], grad: 'orange-intense', stroke: '#ff5500', node: V.P_205_245, tier: 'core-monolith' },
      { pts: [V.P_255_230, V.P_320_225, V.P_270_320], grad: 'orange-intense', stroke: '#ff5500', tier: 'core-monolith' },
      { pts: [V.P_190_170, V.P_205_245, V.P_155_265], grad: 'violet-radiant', stroke: '#8b5cf6', tier: 'sub-c' },

      // Shard D: Lower Dagger Crystal (Level 1 + Sub-Facets D1 & D2)
      { pts: [V.P_205_245, V.P_155_265, V.I_218_342], grad: 'violet-radiant', stroke: '#a855f7', tier: 'sub-d1' },
      { pts: [V.P_155_265, V.P_175_440, V.I_218_342], grad: 'violet-radiant', stroke: '#a855f7', ridge: [V.P_205_245, V.P_175_440], tier: 'sub-d1' },
      { pts: [V.P_205_245, V.P_270_320, V.I_218_342], grad: 'orange-intense', stroke: '#ff4500', tier: 'dagger-lower' },
      { pts: [V.I_218_342, V.P_270_320, V.P_175_440], grad: 'orange-intense', stroke: '#ff4500', node: V.P_175_440, tier: 'dagger-lower' },
      { pts: [V.P_270_320, V.P_355_275, V.P_255_385], grad: 'magenta-flare',  stroke: '#c084fc', node: V.P_270_320, tier: 'sub-d2' },
      { pts: [V.P_270_320, V.P_255_385, V.P_175_440], grad: 'amber-gold',     stroke: '#ff7700', tier: 'dagger-lower' },

      // Detached Floating Crystal Splinters (Level 3: 5 Splinters)
      { pts: [V.P_160_50,  V.P_320_105, V.P_250_135], grad: 'amber-gold',     stroke: '#ffaa00', tier: 'splinter-1' },
      { pts: [V.P_120_130, V.P_190_170, V.P_155_265], grad: 'violet-radiant', stroke: '#c084fc', tier: 'splinter-2' },
      { pts: [V.P_320_225, V.P_355_275, V.P_270_320], grad: 'orange-intense', stroke: '#ff5500', tier: 'splinter-3' },
      { pts: [V.P_250_135, V.P_320_105, V.P_430_175], grad: 'magenta-flare',  stroke: '#d946ef', tier: 'splinter-4' },
      { pts: [V.P_155_265, V.P_120_330, V.P_175_440], grad: 'amber-gold',     stroke: '#ff7700', tier: 'splinter-5' }
    ];

    // If user adds more skills in JSON beyond 22, dynamically split largest triangle along its longest edge
    while (baseDefs.length < targetCount) {
      let maxIdx = 0;
      let maxArea = -1;
      baseDefs.forEach((def, idx) => {
        const m = computeTriangleMetrics(def.pts[0], def.pts[1], def.pts[2]);
        if (m.area > maxArea) {
          maxArea = m.area;
          maxIdx = idx;
        }
      });

      const target = baseDefs[maxIdx];
      const [p1, p2, p3] = target.pts;
      const d12 = Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
      const d23 = Math.hypot(p2[0] - p3[0], p2[1] - p3[1]);
      const d31 = Math.hypot(p3[0] - p1[0], p3[1] - p1[1]);

      let triA, triB;
      if (d12 >= d23 && d12 >= d31) {
        const mid = [Math.round((p1[0] + p2[0]) / 2), Math.round((p1[1] + p2[1]) / 2)];
        triA = [p1, mid, p3];
        triB = [mid, p2, p3];
      } else if (d23 >= d12 && d23 >= d31) {
        const mid = [Math.round((p2[0] + p3[0]) / 2), Math.round((p2[1] + p3[1]) / 2)];
        triA = [p1, p2, mid];
        triB = [p1, mid, p3];
      } else {
        const mid = [Math.round((p3[0] + p1[0]) / 2), Math.round((p3[1] + p1[1]) / 2)];
        triA = [p1, p2, mid];
        triB = [mid, p2, p3];
      }

      baseDefs.splice(
        maxIdx,
        1,
        { ...target, pts: triA },
        { grad: target.grad, stroke: target.stroke, tier: target.tier, pts: triB }
      );
    }

    return baseDefs.slice(0, targetCount);
  }

  function renderSkills(skills) {
    const container = document.getElementById('skillsCrystalStage');
    if (!container || !Array.isArray(skills) || !skills.length) return;

    const shardDefs = buildContactCrystalTriangulation(skills.length);
    const enrichedShards = shardDefs.map((def, origIndex) => {
      const m = computeTriangleMetrics(def.pts[0], def.pts[1], def.pts[2]);
      return { ...def, origIndex, ...m };
    });

    // Rank triangles by effective capacity so wider facets host larger primary skills
    const shardsByCapacity = [...enrichedShards].sort(
      (a, b) => b.inradius * Math.sqrt(b.area) - a.inradius * Math.sqrt(a.area)
    );
    const skillsBySize = skills
      .map((s, idx) => ({
        name: s.name || s.title || '',
        size: Math.max(70, Math.min(260, Number(s.size) || 135)),
        skillIndex: idx
      }))
      .sort((a, b) => b.size - a.size);

    const pairedShards = shardsByCapacity
      .map((shard, rank) => {
        const skill = skillsBySize[rank];
        const placement = computeInscribedTextPlacement(
          shard.pts[0],
          shard.pts[1],
          shard.pts[2],
          skill.name,
          skill.size
        );
        return {
          ...shard,
          ...placement,
          skill
        };
      })
      .sort((a, b) => a.origIndex - b.origIndex);

    const shardsSvgMarkup = pairedShards
      .map((item, idx) => {
        const [p1, p2, p3] = item.pts;
        const ptsStr = `${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`;
        const ptsData = `${p1[0]},${p1[1]};${p2[0]},${p2[1]};${p3[0]},${p3[1]}`;

        const insetPts = item.pts
          .map(
            ([x, y]) =>
              `${Math.round(item.cx + (x - item.cx) * 0.86)},${Math.round(item.cy + (y - item.cy) * 0.86)}`
          )
          .join(' ');

        let ridgeSvg = '';
        if (item.ridge) {
          const [r1, r2] = item.ridge;
          ridgeSvg = `<line class="skill-tri-ridge" x1="${r1[0]}" y1="${r1[1]}" x2="${r2[0]}" y2="${r2[1]}" stroke="#ffffff" stroke-width="2.2" opacity="0.85" filter="url(#skills-gem-shard-laser)" pointer-events="none" />`;
        }

        let nodeSvg = '';
        if (item.node) {
          const np = item.node;
          nodeSvg = `
            <g class="shard-node" transform="translate(${np[0]}, ${np[1]})" pointer-events="none">
              <circle r="24" fill="url(#skills-g-shard-star)" filter="url(#skills-gem-shard-core)" />
              <circle r="5.5" fill="#ffffff" />
              <circle r="12" fill="none" stroke="${item.stroke}" stroke-width="1.8" />
            </g>
          `;
        }

        return `
          <g class="skill-shard skill-tri-shard"
             data-index="${idx}"
             data-size="${item.skill.size}"
             data-name="${item.skill.name}"
             data-tier="${item.tier}"
             data-cx="${Math.round(item.cx)}"
             data-cy="${Math.round(item.cy)}"
             data-inradius="${Math.round(item.inradius)}"
             data-pts="${ptsData}"
             data-angle="${item.angle}"
             data-safe-span="${item.safeSpan}"
             data-font-size="${item.fontSize}">
            <g class="skill-shard-scroll">
              <g class="skill-shard-body">
                <polygon class="crystal-facet skill-tri-poly"
                         points="${ptsStr}"
                         fill="url(#skills-g-shard-${item.grad})"
                         stroke="${item.stroke}"
                         stroke-width="2.0"
                         stroke-linejoin="round" />
                <polygon class="skill-tri-sheen"
                         points="${insetPts}"
                         fill="url(#skills-g-inner-sheen)"
                         stroke="rgba(255, 255, 255, 0.14)"
                         stroke-width="0.8"
                         pointer-events="none" />
                <g class="skill-tri-text-wrap"
                   transform="translate(${item.tx}, ${item.ty}) rotate(${item.angle})"
                   pointer-events="none">
                  <text class="skill-shard-label skill-tri-text"
                        x="0"
                        y="0"
                        text-anchor="middle"
                        dominant-baseline="central"
                        font-size="${item.fontSize}px">${item.skill.name}</text>
                </g>
                <polygon class="skill-tri-refract"
                         points="${ptsStr}"
                         fill="url(#skills-g-glass-refract)"
                         pointer-events="none" />
                ${ridgeSvg}
                ${nodeSvg}
              </g>
            </g>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg"
           viewBox="0 0 1000 960"
           width="100%"
           height="100%"
           class="skills-crystal-svg cyber-cluster-svg"
           id="skillsCrystalSvg"
           overflow="visible">
        <defs>
          <filter id="skills-gem-shard-laser" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="blur1" />
            <feGaussianBlur stdDeviation="2" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="skills-gem-shard-core" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="skills-g-shard-orange-intense" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ff9900" stop-opacity="0.95" />
            <stop offset="45%" stop-color="#ff4500" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#7c3aed" stop-opacity="0.65" />
          </linearGradient>

          <linearGradient id="skills-g-shard-violet-radiant" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#581c87" stop-opacity="0.85" />
            <stop offset="50%" stop-color="#9333ea" stop-opacity="0.6" />
            <stop offset="100%" stop-color="#c084fc" stop-opacity="0.95" />
          </linearGradient>

          <linearGradient id="skills-g-shard-magenta-flare" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.85" />
            <stop offset="40%" stop-color="#d946ef" stop-opacity="0.75" />
            <stop offset="100%" stop-color="#ff5500" stop-opacity="0.85" />
          </linearGradient>

          <linearGradient id="skills-g-shard-amber-gold" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stop-color="#ffdd00" stop-opacity="0.9" />
            <stop offset="60%" stop-color="#ff6a00" stop-opacity="0.7" />
            <stop offset="100%" stop-color="#a855f7" stop-opacity="0.4" />
          </linearGradient>

          <linearGradient id="skills-g-inner-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.09" />
            <stop offset="50%" stop-color="#ffffff" stop-opacity="0" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0.16" />
          </linearGradient>

          <linearGradient id="skills-g-glass-refract" x1="0%" y1="0%" x2="60%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18" />
            <stop offset="35%" stop-color="#ffffff" stop-opacity="0.04" />
            <stop offset="100%" stop-color="#a855f7" stop-opacity="0.08" />
          </linearGradient>

          <radialGradient id="skills-g-shard-star" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
            <stop offset="30%" stop-color="#ff8c00" stop-opacity="0.95" />
            <stop offset="70%" stop-color="#c084fc" stop-opacity="0.4" />
            <stop offset="100%" stop-color="#ff4500" stop-opacity="0" />
          </radialGradient>
        </defs>

        <g id="skills-crystal-formation">
          <g class="skills-shards-cluster" id="skillsShardsCluster">
            ${shardsSvgMarkup}
          </g>
        </g>
      </svg>
    `;
  }

  function renderEducation(education) {
    const container = document.getElementById('educationTable');
    if (!container || !Array.isArray(education)) return;

    const html = education
      .map((item, index) => {
        const delayClass = index > 0 ? ` delay-${index}` : '';

        return `
          <div class="education-row reveal reveal-up${delayClass}">
            <span class="education-index">${item.index}</span>
            <div class="education-main">
              <div class="education-meta-top">
                <span class="education-program-tag">${item.programTag}</span>
                <span class="education-period">${item.period}</span>
              </div>
              <h3 class="education-degree">${item.degree}</h3>
              <p class="education-school">${item.school}</p>
              <p class="education-desc">${item.description}</p>
            </div>
            <span class="education-arrow">→</span>
          </div>
        `;
      })
      .join('');

    container.innerHTML = html;
  }

  function renderAll() {
    const data = window.PortfolioData;
    if (!data) return;

    renderWorks(data.works);
    renderTimeline(data.timeline);
    renderSkills(data.skills);
    renderEducation(data.education);
  }

  window.Portfolio.renderer = {
    renderAll,
    renderWorks,
    renderTimeline,
    renderSkills,
    renderEducation
  };
})(window, document);

