/**
 * CONTACT SECTION CRYSTAL ASSEMBLY (REVERSE SHATTER) CHOREOGRAPHY
 * Module: js/animations/contact.js
 * Explicit .fromTo() reverse of js/animations/timeline.js so shards start scattered
 * and lock together at (0, 0, 0) when scroll hits the very bottom (end: 'max').
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  function initContactCrystalAnimation() {
    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    if (!hasGSAP) return;

    const crystal = document.getElementById('bgContactCrystal');
    const contactSection = document.getElementById('contact');
    if (!crystal || !contactSection) return;

    const svg = crystal.querySelector('.cyber-cluster-svg');
    const fractures = crystal.querySelectorAll('.outline-fracture');

    const assembleTl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: contactSection,
        start: 'top 90%',
        end: 'max',
        scrub: 0.8,
        invalidateOnRefresh: true
      }
    });

    // Overall vertical parallax & glow intensification (from scattered state to unified state)
    if (svg) {
      assembleTl.fromTo(
        svg,
        { y: -90, rotation: -6, transformOrigin: '50% 50%' },
        { y: 0, rotation: 0, transformOrigin: '50% 50%' },
        0
      );
    }

    assembleTl.fromTo(
      crystal,
      {
        opacity: 0.45,
        filter: 'drop-shadow(0 0 40px rgba(255, 85, 0, 0.15))'
      },
      {
        opacity: 0.9,
        filter: 'drop-shadow(0 0 95px rgba(255, 120, 0, 0.5))'
      },
      0
    );

    // Level 1: Primary Shard Groups (Start scattered outward -> lock at 0, 0, rotation 0)
    assembleTl
      .fromTo(
        crystal.querySelector('.crystal-needle-upper'),
        { x: -115, y: -95, rotation: -24, transformOrigin: '50% 50%' },
        { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
        0
      )
      .fromTo(
        crystal.querySelector('.crystal-core-monolith'),
        { x: -55, y: -18, rotation: -12, scale: 0.86, transformOrigin: '50% 50%' },
        { x: 0, y: 0, rotation: 0, scale: 1, transformOrigin: '50% 50%' },
        0
      )
      .fromTo(
        crystal.querySelector('.crystal-spike-right'),
        { x: 125, y: -75, rotation: 24, transformOrigin: '50% 50%' },
        { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
        0
      )
      .fromTo(
        crystal.querySelector('.crystal-dagger-lower'),
        { x: -90, y: 125, rotation: 22, transformOrigin: '50% 50%' },
        { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
        0
      );

    // Level 2: Internal Edge Sub-Facets (Start peeled away -> fold seamlessly into parent shard)
    assembleTl
      .fromTo(
        crystal.querySelector('.sub-facet-a'),
        { x: -48, y: -35, rotation: -16, transformOrigin: '50% 50%' },
        { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
        0
      )
      .fromTo(
        crystal.querySelector('.sub-facet-b'),
        { x: 42, y: 45, rotation: 18, transformOrigin: '50% 50%' },
        { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
        0
      )
      .fromTo(
        crystal.querySelector('.sub-facet-c'),
        { x: -52, y: 22, rotation: -18, transformOrigin: '50% 50%' },
        { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
        0
      )
      .fromTo(
        crystal.querySelector('.sub-facet-d1'),
        { x: -50, y: 38, rotation: 16, transformOrigin: '50% 50%' },
        { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
        0
      )
      .fromTo(
        crystal.querySelector('.sub-facet-d2'),
        { x: 44, y: 48, rotation: -18, transformOrigin: '50% 50%' },
        { x: 0, y: 0, rotation: 0, transformOrigin: '50% 50%' },
        0
      );

    // Level 3: Detached Crystal Splinters (Start burst far outward -> lock onto crystal perimeter at 0, 0)
    assembleTl
      .fromTo(
        crystal.querySelector('.splinter-1'),
        { x: 145, y: -140, rotation: -42, scale: 1.15, transformOrigin: '50% 50%' },
        { x: 0, y: 0, rotation: 0, scale: 1, transformOrigin: '50% 50%' },
        0
      )
      .fromTo(
        crystal.querySelector('.splinter-2'),
        { x: -190, y: -45, rotation: -48, scale: 1.15, transformOrigin: '50% 50%' },
        { x: 0, y: 0, rotation: 0, scale: 1, transformOrigin: '50% 50%' },
        0
      )
      .fromTo(
        crystal.querySelector('.splinter-3'),
        { x: 140, y: 150, rotation: 38, scale: 0.9, transformOrigin: '50% 50%' },
        { x: 0, y: 0, rotation: 0, scale: 1, transformOrigin: '50% 50%' },
        0
      )
      .fromTo(
        crystal.querySelector('.splinter-4'),
        { x: 170, y: -80, rotation: 44, scale: 1.1, transformOrigin: '50% 50%' },
        { x: 0, y: 0, rotation: 0, scale: 1, transformOrigin: '50% 50%' },
        0
      )
      .fromTo(
        crystal.querySelector('.splinter-5'),
        { x: -155, y: 130, rotation: -36, scale: 0.92, transformOrigin: '50% 50%' },
        { x: 0, y: 0, rotation: 0, scale: 1, transformOrigin: '50% 50%' },
        0
      );

    // Level 4: Fracture Cleavage Traces (Reverse dash flow + energetic bonding)
    if (fractures.length) {
      assembleTl.fromTo(
        fractures,
        { strokeDashoffset: -48, opacity: 0.1 },
        { strokeDashoffset: 0, opacity: 0.85 },
        0
      );
    }
  }

  window.Portfolio.contact = {
    initContactCrystalAnimation
  };
})(window, document);
