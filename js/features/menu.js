import { getAuth } from './auth/auth.js';

export function initSidebar() {
  const burger = document.querySelector('.burger-button');
  const sidebar = document.querySelector('.sidebar');
  const closeBtn = document.querySelector('.close-sidebar');

  if (burger && sidebar) {
    burger.addEventListener('click', () => {
      sidebar.classList.add('open');
      burger.style.display = 'none';
      getAuth().updateUI();
    });
  }

  if (closeBtn && sidebar) {
    closeBtn.addEventListener('click', () => {
      sidebar.classList.remove('open');
      if (burger) burger.style.display = 'flex';
    });
  }

  document.addEventListener('click', e => {
    if (sidebar && sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        burger && !burger.contains(e.target)) {
      sidebar.classList.remove('open');
      burger.style.display = 'flex';
    }
  });

  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => {
      if (sidebar) sidebar.classList.remove('open');
      if (burger) burger.style.display = 'flex';
    });
  });

  const sidebarHeader = sidebar ? sidebar.querySelector('.sidebar-header') : null;
  const sidebarNav = sidebar ? sidebar.querySelector('.sidebar-nav') : null;
  if (sidebarHeader && sidebarNav && !sidebar.querySelector('.sidebar-auth')) {
    const authDiv = document.createElement('div');
    authDiv.className = 'sidebar-auth';
    sidebarHeader.parentNode.insertBefore(authDiv, sidebarNav);
    getAuth().updateUI();
  }
}