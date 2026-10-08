import { getAuth } from '../features/auth/auth.js';
import { initSidebar } from '../features/menu.js';
import { initMusicControls } from '../features/music.js';
import { initSearch } from '../features/search.js';
import { initRotateOverlay } from '../features/rotate.js';
import { initGlobalActions } from '../features/actions.js';
import { getNovel } from '../features/novel/novel.js';
import { initKaedeScene } from '../features/scene/kaede.js';
import { loadResources } from '../core/resource-loader.js';

const SPRITE_BASE = '../assets/images/sprites/kaede/';
const ROOM_IMG_BASE = '../assets/images/kaede_room/';
const ROOM_AUDIO_BASE = '../assets/audio/kaede_room/';

const sprites = [
  'accuse.webp', 'afraid.webp', 'annoyed1.webp', 'annoyed2.webp',
  'confused.webp', 'crying.webp', 'dreaming.webp', 'explain1.webp',
  'explain2.webp', 'extremely_surprised.webp', 'fear.webp', 'focused.webp',
  'glad.webp', 'happily_explains.webp', 'happy.webp', 'inspiring.webp',
  'recognizing.webp', 'shy.webp', 'smiling.webp', 'thoughtfully_explains.webp',
  'trusts.webp', 'uncomfortable.webp', 'very_angry.webp', 'very_confused.webp'
];

const roomImages = [
  '80s_synth_pop.webp', 'chopin_portrait.webp', 'cristofori_piano.webp',
  'daw_interface.webp', 'equalizer_graph.webp', 'fl_studio_logo.webp',
  'fm_synthesis_diagram.webp', 'gramophone.webp', 'harmor_interface.webp',
  'kandinsky_music.webp', 'moog_modular.webp', 'music_and_painting.webp',
  'music_stand.webp', 'old_pianist.webp', 'piano_mechanism_diagram.webp',
  'sampler_interface.webp', 'saw_wave.webp', 'sheet_music.webp',
  'street_piano.webp', 'sunset_painting.webp', 'synth_basics.webp'
];

const sounds = [
  'automation_example.opus', 'dubstep_wobble.opus', 'dx7_epiano.opus',
  'home_studio_example.opus', 'horror_chord.opus', 'inspiration_example.opus',
  'lfo_example.opus', 'pad_example.opus', 'pianola_example.opus',
  'piano_tuning_example.opus', 'richter_performance.opus', 'serum_wobble.opus',
  'sine_wave.opus', 'tb303_acid.opus', 'vibrato_example.opus'
];

const urls = [
  ...sprites.map(s => SPRITE_BASE + s),
  ...roomImages.map(s => ROOM_IMG_BASE + s),
  ...sounds.map(s => ROOM_AUDIO_BASE + s),
  '../assets/images/note_bg.png',
  '../assets/audio/music/moonlight_sonata.opus'
];

getAuth();
initSidebar();
initMusicControls();
initSearch('searchInput', 'searchDropdown');
initRotateOverlay();
initGlobalActions();
getNovel();

const sceneReady = initKaedeScene();

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