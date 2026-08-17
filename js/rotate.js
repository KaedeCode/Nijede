(function() {
  const isMobile = () => window.innerWidth < window.innerHeight;
  const isPortrait = () => window.matchMedia('(orientation: portrait)').matches;

  let overlay = null;

  function createOverlay() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'rotate-overlay';
    overlay.innerHTML = `
      <div class="rotate-message">
        <span class="rotate-icon">📱</span>
        <h2>Пожалуйста, переверните телефон</h2>
        <p>Для лучшего просмотра используйте горизонтальную ориентацию.</p>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  function updateOverlay() {
    if (!overlay) createOverlay();
    if (isMobile() && isPortrait()) {
      overlay.style.display = 'flex';
    } else {
      overlay.style.display = 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    createOverlay();
    updateOverlay();
    window.addEventListener('resize', updateOverlay);
    window.addEventListener('orientationchange', () => {
      setTimeout(updateOverlay, 300);
    });
  });
})();