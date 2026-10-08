import { getAuth } from '../features/auth/auth.js';
import { initSidebar } from '../features/menu.js';
import { initMusicControls } from '../features/music.js';
import { initGlobalActions } from '../features/actions.js';
import { initSearch } from '../features/search.js';
import { initRotateOverlay } from '../features/rotate.js';
import { getNovel } from '../features/novel/novel.js';
import { initNijikaScene } from '../features/scene/nijika.js';
import { loadResources } from '../core/resource-loader.js';

const SPRITE_BASE = '../assets/images/sprites/nijika/';

const sprites = [
  'extremeJoy.webp', 'fury.webp', 'hf.webp', 'indifference.webp',
  'joy.webp', 'legendary.jpg.webp', 'misunderstanding.webp', 'relaxation.webp',
  'request.webp', 'resentment.webp', 'sadness.webp', 'trueHappiness.webp'
];

const urls = [
  ...sprites.map(s => SPRITE_BASE + s),
  '../assets/images/lightning_bg.png',
  '../assets/audio/music/to_live_is_to_die.opus'
];

getAuth();
initSidebar();
initMusicControls();
initSearch('searchInput', 'searchDropdown');
initRotateOverlay();
initGlobalActions();
getNovel();

const sceneReady = initNijikaScene();

const loadingScreen = document.getElementById('loadingScreen');
const startTime = Date.now();
const minDisplayTime = 500;

function hideLoadingScreen() {
  const remaining = Math.max(0, minDisplayTime - (Date.now() - startTime));
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
    setTimeout(() => loadingScreen.parentNode && loadingScreen.remove(), 500);
  }, remaining);
}

Promise.all([sceneReady, loadResources(urls)]).then(hideLoadingScreen);