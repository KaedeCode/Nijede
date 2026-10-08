import { SECTIONS } from '../core/config.js';

export function initSectionNav() {
  if (!document.querySelector('.section')) return;

  document.addEventListener('keydown', event => {
    const target = event.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('.auth-modal-overlay')) {
      return;
    }

    const currentHash = window.location.hash || '#intro';
    let currentIndex = SECTIONS.findIndex(s => '#' + s === currentHash);
    if (currentIndex === -1) currentIndex = 0;

    if (event.code === 'ArrowDown' || event.code === 'KeyS') {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % SECTIONS.length;
      window.location.hash = '#' + SECTIONS[nextIndex];
    } else if (event.code === 'ArrowUp' || event.code === 'KeyW') {
      event.preventDefault();
      const prevIndex = (currentIndex - 1 + SECTIONS.length) % SECTIONS.length;
      window.location.hash = '#' + SECTIONS[prevIndex];
    }
  });
}