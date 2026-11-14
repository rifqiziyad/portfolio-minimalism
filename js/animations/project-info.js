/**
 * PROJECT INFO PANEL CONTROLLER & TEXT REVEAL ANIMATIONS
 * Module: js/animations/project-info.js
 * Handles dynamic line-wrapping splitting and staggered top-to-bottom reveals
 */

(function (window, document) {
  'use strict';

  window.Portfolio = window.Portfolio || {};

  function formatIndex(num) {
    return window.Portfolio.utils ? window.Portfolio.utils.formatIndex(num) : num < 10 ? `0${num}` : `${num}`;
  }

  function createProjectInfoController(section, projects) {
    if (!section) return null;

    const total = projects ? projects.length : 0;
    const infoPanel = section.querySelector('.project-info-panel');
    const infoInner = section.querySelector('#projectInfoInner');
    const elDesc = section.querySelector('#projectActiveDesc');
    const elYear = section.querySelector('#projectActiveYear');
    const elStack = section.querySelector('#projectActiveStack');
    const elLink = section.querySelector('#projectActiveLink');
    const elLinkText = section.querySelector('#projectActiveLinkText');
    const elBottomTitle = section.querySelector('#projectBottomTitle');
    const elCounterCurrent = section.querySelector('#projectCounterCurrent');
    const dimItems = Array.from(section.querySelectorAll('#projectTrackDim .project-title-item'));
    const litItems = Array.from(section.querySelectorAll('#projectTrackLit .project-title-item'));
    const slideFrames = Array.from(section.querySelectorAll('.project-slide-frame'));

    let currentActiveIdx = -1;
    let infoSwitchTween = null;

    function formatTextLines(containerEl, text) {
      if (window.Portfolio.utils && typeof window.Portfolio.utils.formatTextLines === 'function') {
        window.Portfolio.utils.formatTextLines(containerEl, text || '', {
          threshold: 4,
          fallbackLength: 70
        });
      }
    }

    function applyProjectInfoContent(item, newIdx) {
      if (!item) return;
      if (elDesc) formatTextLines(elDesc, item.description);
      if (elYear) elYear.textContent = item.year || '';
      if (elStack) elStack.textContent = item.stack || '';

      if (elLink) {
        if (item.linkUrl) {
          elLink.style.display = 'inline-flex';
          elLink.setAttribute('href', item.linkUrl);
          if (item.linkUrl.startsWith('http')) {
            elLink.setAttribute('target', '_blank');
            elLink.setAttribute('rel', 'noopener noreferrer');
          } else {
            elLink.removeAttribute('target');
            elLink.removeAttribute('rel');
          }
          if (elLinkText) elLinkText.textContent = item.linkText || 'Live Demo';
        } else {
          elLink.style.display = 'none';
        }
      }
    }

    function updateActiveProjectInfo(newIdx) {
      if (newIdx === currentActiveIdx || !projects[newIdx]) return;
      const prevIdx = currentActiveIdx;
      currentActiveIdx = newIdx;
      const item = projects[newIdx];

      dimItems.forEach((el, idx) => el.classList.toggle('is-active', idx === newIdx));
      litItems.forEach((el, idx) => el.classList.toggle('is-active', idx === newIdx));
      slideFrames.forEach((el, idx) => el.classList.toggle('is-current-frame', idx === newIdx));

      if (elCounterCurrent) elCounterCurrent.textContent = formatIndex(newIdx + 1);
      if (elBottomTitle) elBottomTitle.textContent = item.title;

      // On initial load, apply content immediately without animation
      if (prevIdx === -1 || !infoInner) {
        applyProjectInfoContent(item, newIdx);
        return;
      }

      // Staggered Line Reveal Animation (GSAP)
      // Cascades sequentially: Desc Lines -> Specs -> Actions
      if (typeof gsap !== 'undefined') {
        if (infoSwitchTween) infoSwitchTween.kill();
        gsap.killTweensOf(infoInner.querySelectorAll('.text-line-inner'));

        const oldInners = infoInner.querySelectorAll('.text-line-inner');
        infoSwitchTween = gsap.timeline();

        // 1. Exit: Outgoing lines slide up and fade out through masks
        if (oldInners.length) {
          infoSwitchTween.to(oldInners, {
            yPercent: -105,
            opacity: 0,
            duration: 0.16,
            stagger: 0.02,
            ease: 'power2.in'
          }, 0);
        }

        // 2. On exit complete: swap content into DOM and reveal one by one from top to bottom
        infoSwitchTween.call(() => {
          applyProjectInfoContent(item, newIdx);
          const newInners = infoInner.querySelectorAll('.text-line-inner');

          if (newInners.length) {
            gsap.fromTo(
              newInners,
              { yPercent: 110, opacity: 0 },
              {
                yPercent: 0,
                opacity: 1,
                duration: 0.38,
                stagger: 0.065, // Reveal satu persatu dari atas ke bawah
                ease: 'power3.out'
              }
            );
          }
        });
      } else {
        infoInner.style.transition = 'opacity 0.14s ease, transform 0.14s ease';
        infoInner.style.opacity = '0';
        infoInner.style.transform = 'translate3d(0, -3px, 0)';
        setTimeout(() => {
          applyProjectInfoContent(item, newIdx);
          infoInner.style.transform = 'translate3d(0, 4px, 0)';
          requestAnimationFrame(() => {
            infoInner.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
            infoInner.style.opacity = '1';
            infoInner.style.transform = 'translate3d(0, 0, 0)';
          });
        }, 140);
      }
    }

    function setInfoOpacity(alpha, cushionY) {
      if (infoPanel) {
        infoPanel.style.opacity = alpha.toFixed(2);
        infoPanel.style.transform = cushionY && cushionY > 0.2 ? `translate3d(0, ${cushionY.toFixed(1)}px, 0)` : '';
      }
      const elBottomRight = section.querySelector('.project-bottom-right');
      if (elBottomRight) {
        elBottomRight.style.opacity = alpha.toFixed(2);
      }
    }

    function onResize() {
      if (currentActiveIdx >= 0 && projects[currentActiveIdx] && elDesc) {
        formatTextLines(elDesc, projects[currentActiveIdx].description);
      }
    }

    function cleanup() {
      if (infoSwitchTween) {
        infoSwitchTween.kill();
        infoSwitchTween = null;
      }
      if (infoPanel) {
        infoPanel.style.opacity = '';
        infoPanel.style.transform = '';
      }
      if (infoInner) {
        if (typeof gsap !== 'undefined') {
          gsap.killTweensOf(infoInner.querySelectorAll('.text-line-inner'));
        }
        infoInner.style.opacity = '';
        infoInner.style.transform = '';
        const inners = infoInner.querySelectorAll('.text-line-inner');
        inners.forEach((el) => {
          el.style.transform = '';
          el.style.opacity = '';
        });
      }
    }

    return {
      updateActiveProjectInfo,
      applyProjectInfoContent,
      setInfoOpacity,
      formatTextLines,
      getCurrentActiveIndex: () => currentActiveIdx,
      onResize,
      cleanup
    };
  }

  window.Portfolio.projectInfo = {
    createController: createProjectInfoController,
    formatIndex
  };
})(window, document);

