import { showPopup } from './popup.js';
import { showFeedbackModal } from './feedback.js';

export function initGlobalActions() {
  document.querySelectorAll('[data-action="show-popup"]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      showPopup();
    });
  });

  document.querySelectorAll('[data-action="show-feedback"]').forEach(el => {
    el.addEventListener('click', showFeedbackModal);
  });
}