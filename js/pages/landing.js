import { getAuth } from '../features/auth/auth.js';
import { initSidebar } from '../features/menu.js';
import { initMusicControls } from '../features/music.js';
import { initSearch } from '../features/search.js';
import { initSectionNav } from '../features/nav.js';
import { initRotateOverlay } from '../features/rotate.js';
import { initGlobalActions } from '../features/actions.js';

getAuth();
initSidebar();
initMusicControls();
initSearch('introSearch', 'introSearchDropdown');
initSectionNav();
initRotateOverlay();
initGlobalActions();