import { initScene } from './engine.js';
import { createCalendarMesh } from './calendar.js';

const MODEL_SLUG_MAP = {
  guiter: 'guitar'
};

export function initNijikaScene() {
  return initScene({
    theme: 'nijika',
    lightPosition: [-1, 4, -2],
    center: new THREE.Vector3(0, 2, -3),
    decorations: [
      {
        factory: () => createCalendarMesh({ theme: 'nijika', width: 2, height: 1.5, depth: 0.1 }),
        position: [4, 3.5, -11],
        rotation: [0, 0, 0],
        name: 'calendar',
        interactive: true
      }
    ],
    camera: {
      baseAngleX: 0,
      baseAngleY: 0.3,
      limitX: Math.PI / 6,
      limitY: 0.3,
      yMin: -0.5,
      yMax: 0.8,
      mouseGamma: 0.6,
      distance: 1,
      lerp: 0.25
    },
    hoverEmissive: 0x8a8500,
    modelsPath: '../assets/models/nijika',
    models: [
      'Nroom',
      'drums',
      'bass',
      'flute',
      'guiter',
      'maracas',
      'synthesizer',
      'table',
      'violin',
      'acoustic',
      'nijika_door',
      'pictureM',
      'pictureC'
    ],
    nonInteractiveModels: ['Nroom', 'table'],
    menuClass: 'context-menu-n',
    menuItemClass: 'context-menu-item-n',
    doorName: 'nijika_door',
    exitMessage: 'Вы действительно хотите покинуть комнату Ниджики?',
    focusDialog: [
      {
        text: 'О! Заметил календарь? Мы с Каэде пока не решили, зачем он тут вообще нужен.',
        sprite: 'joy.webp'
      },
      {
        text: 'Но это временно! Как только придумаем что-нибудь крутое — сразу покажем.',
        sprite: 'trueHappiness.webp'
      },
      {
        text: 'Ыгрэк',
        sprite: 'misunderstanding.webp'
      }
    ],
    interactions: {
      calendar: [
        { label: 'Открыть', type: 'focus' }
      ],
      pictureM: [
        { label: 'Описание', type: 'dialog', action: 'info' }
      ],
      pictureC: [
        { label: 'Описание', type: 'dialog', action: 'info' }
      ],
      synthesizer: [
        { label: 'Описания', type: 'dialog', action: 'info' }
      ],
      maracas: [
        { label: 'Описания', type: 'dialog', action: 'info' }
      ],
      nijika_door: [
        { label: 'Выйти', type: 'redirect', url: '../index.html' }
      ]
    },
    fallbackActions: objectName => {
      const slug = MODEL_SLUG_MAP[objectName] || objectName;
      return [
        { label: 'Описание', type: 'dialog', action: 'info' },
        { label: 'Поиграть', type: 'redirect', url: `instrument.html?slug=${slug}` }
      ];
    },
    onNonInteractive: object => {
      object.traverse(child => {
        if (child.isMesh && child.material) {
          child.material.side = THREE.DoubleSide;
          child.material.needsUpdate = true;
        }
      });
      object.position.z = -1;
    },
    onDialogNotFound: (objectName, action) => {
      Swal.fire({
        icon: 'error',
        title: 'Диалог не найден',
        text: `Диалог "${action}" для "${objectName || 'неизвестно'}" не найден.`,
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#c7ba00'
      });
    }
  });
}