import { INSTRUMENTS } from '../core/config.js';
import * as Melodic from '../instruments/melodic.js';
import * as Drums from '../instruments/drums.js';

const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');
const config = slug ? INSTRUMENTS[slug] : null;

function hidePreloader() {
  const preloader = document.getElementById('instrument-preloader');
  if (!preloader) return;
  preloader.classList.add('hidden');
  setTimeout(() => preloader.remove(), 500);
}

function showError(message) {
  document.body.innerHTML = `<p style="padding:40px;color:#fff;font-family:Arial;">${message}</p>`;
}

function loadTheme() {
  return new Promise(resolve => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../css/pages/instrument-' + (config.drums ? 'drums' : config.theme) + '.css';
    link.onload = resolve;
    link.onerror = resolve;
    document.head.appendChild(link);
  });
}

function backUrl() {
  return config.theme === 'kaede' ? 'kaede.html' : 'nijika.html';
}

function initMelodic() {
  const root = document.getElementById('melodic-root');
  root.style.display = 'block';
  document.title = config.title;
  root.querySelector('#instrument-title').textContent = config.title.toUpperCase();
  root.querySelector('#exit').addEventListener('click', () => {
    window.location.href = backUrl();
  });

  root.querySelectorAll('[data-melodic-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const fn = Melodic[btn.dataset.melodicAction];
      if (typeof fn === 'function') fn();
    });
  });

  root.querySelectorAll('[data-time-sig="top"]').forEach(el => {
    el.addEventListener('click', () => Melodic.sigTop(el));
  });
  root.querySelectorAll('[data-time-sig="bottom"]').forEach(el => {
    el.addEventListener('click', () => Melodic.sigBottom(el));
  });
  root.querySelector('#BAddBar').addEventListener('click', () => Melodic.addBar());
  root.querySelector('#BPlay').addEventListener('click', () => Melodic.play());

  Melodic.createPiano(
    config.sample,
    config.startOctave,
    config.endOctave,
    root.querySelector('#piano'),
    root.querySelector('#note-menu'),
    root.querySelector('#bar-menu')
  );
}

function initDrums() {
  const root = document.getElementById('drums-root');
  root.style.display = 'block';
  document.title = config.title;
  root.querySelector('#instrument-title').textContent = config.title.toUpperCase();
  root.querySelector('#exit').addEventListener('click', () => {
    window.location.href = backUrl();
  });

  root.querySelectorAll('[data-drums-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const fn = Drums[btn.dataset.drumsAction];
      if (typeof fn === 'function') fn();
    });
  });

  root.querySelectorAll('[data-time-sig="top"]').forEach(el => {
    el.addEventListener('click', () => Drums.sigTop(el));
  });
  root.querySelectorAll('[data-time-sig="bottom"]').forEach(el => {
    el.addEventListener('click', () => Drums.sigBottom(el));
  });
  root.querySelector('#BAddBar').addEventListener('click', () => Drums.addBar());
  root.querySelector('#BPlay').addEventListener('click', () => Drums.play());

  root.querySelectorAll('[data-drum-sample]').forEach(el => {
    el.addEventListener('click', () => Drums.playAudioDrum(el.dataset.drumSample, null));
  });

  Drums.createDrums();
}

async function bootstrap() {
  if (!config) {
    showError('Инструмент не указан или не найден.');
    hidePreloader();
    return;
  }

  document.body.classList.add('instrument-page');
  document.body.classList.add('instrument-' + config.theme);

  await loadTheme();

  if (config.drums) initDrums();
  else initMelodic();

  requestAnimationFrame(hidePreloader);
}

bootstrap();