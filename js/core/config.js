export const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : '/api';

export const SECTIONS = ['intro', 'kaede', 'nijika'];

export const PROJECT_ROOT = new URL('../../', import.meta.url).href;

export const INSTRUMENTS = {
  piano:       { title: 'Пианино',            sample: 'piano',       startOctave: 2, endOctave: 7, theme: 'kaede'  },
  synthesizer: { title: 'Синтезатор',         sample: 'synthesizer', startOctave: 2, endOctave: 7, theme: 'kaede'  },
  guitar:      { title: 'Электрогитара',      sample: 'guiter',      startOctave: 2, endOctave: 6, theme: 'nijika' },
  acoustic:    { title: 'Акустическая гитара', sample: 'acoustic',   startOctave: 2, endOctave: 6, theme: 'nijika' },
  bass:        { title: 'Бас-гитара',         sample: 'bass',        startOctave: 1, endOctave: 5, theme: 'nijika' },
  violin:      { title: 'Скрипка',            sample: 'violin',      startOctave: 3, endOctave: 7, theme: 'nijika' },
  flute:       { title: 'Флейта',             sample: 'flute',       startOctave: 3, endOctave: 6, theme: 'nijika' },
  drums:       { title: 'Ударные',            theme: 'nijika', drums: true }
};

export const SEARCH_DATA = [
  { name: 'Пианино',            category: 'Каэдэ',   url: 'pages/instrument.html?slug=piano' },
  { name: 'Синтезатор',         category: 'Каэдэ',   url: 'pages/instrument.html?slug=synthesizer' },
  { name: 'Ударная установка',  category: 'Ниджика', url: 'pages/instrument.html?slug=drums' },
  { name: 'Электрогитара',      category: 'Ниджика', url: 'pages/instrument.html?slug=guitar' },
  { name: 'Акустическая гитара', category: 'Ниджика', url: 'pages/instrument.html?slug=acoustic' },
  { name: 'Бас-гитара',         category: 'Ниджика', url: 'pages/instrument.html?slug=bass' },
  { name: 'Скрипка',            category: 'Ниджика', url: 'pages/instrument.html?slug=violin' },
  { name: 'Флейта',             category: 'Ниджика', url: 'pages/instrument.html?slug=flute' }
];