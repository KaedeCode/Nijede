import { initScene } from './engine.js';
import { createCalendarMesh } from './calendar.js';

export function initKaedeScene() {
  return initScene({
    theme: 'kaede',
    lightPosition: [5, 10, 7],
    center: new THREE.Vector3(10, 20, 0),
    decorations: [
      {
        factory: () => createCalendarMesh({ theme: 'kaede', width: 16, height: 12, depth: 0.3 }),
        position: [-50, 25, -42],
        rotation: [0, 0, 0],
        name: 'calendar',
        interactive: true
      }
    ],
    camera: {
      baseAngleX: Math.PI / 2,
      baseAngleY: 0.3,
      limitX: Math.PI / 12,
      limitY: 0.3,
      yMin: -0.5,
      yMax: 0.8,
      mouseGamma: 0.6,
      distance: 1,
      lerp: 0.25
    },
    hoverEmissive: 0x7a3a9a,
    modelsPath: '../assets/models/kaede',
    models: [
      'kaede_room',
      'kaede_desk',
      'kaede_door',
      'kaede_laptop',
      'kaede_piano',
      'kaede_picture',
      'kaede_syntesier'
    ],
    nonInteractiveModels: ['kaede_room'],
    menuClass: 'context-menu-k',
    menuItemClass: 'context-menu-item-k',
    doorName: 'kaede_door',
    exitMessage: 'Вы действительно хотите покинуть комнату Каэде?',
    focusDialog: [
      {
        text: 'Ах... календарь. Знаешь, я пока не придумала, как его использовать в комнате. Но я обязательно что-нибудь придумаю!',
        sprite: 'thoughtfully_explains.webp'
      },
      {
        text: 'Обещаю — как только у меня появится идея, ты узнаешь об этом первым.',
        sprite: 'smiling.webp'
      }
    ],
    interactions: {
      calendar: [
        { label: 'Открыть', type: 'focus' }
      ],
      kaede_piano: [
        { label: 'Описания', type: 'dialog', action: 'info' },
        { label: 'История', type: 'dialog', action: 'detail' },
        { label: 'Поиграть', type: 'redirect', url: 'instrument.html?slug=piano' }
      ],
      kaede_syntesier: [
        { label: 'Описания', type: 'dialog', action: 'info' },
        { label: 'История', type: 'dialog', action: 'detail' },
        { label: 'Поиграть', type: 'redirect', url: 'instrument.html?slug=synthesizer' }
      ],
      kaede_laptop: [
        { label: 'Описания', type: 'dialog', action: 'info' },
        { label: 'История', type: 'dialog', action: 'detail' }
      ],
      kaede_desk: [
        { label: 'Описания', type: 'dialog', action: 'info' },
        { label: 'История', type: 'dialog', action: 'detail' }
      ],
      kaede_picture: [
        { label: 'Описания', type: 'dialog', action: 'info' },
        { label: 'История', type: 'dialog', action: 'detail' }
      ],
      kaede_door: [
        { label: 'Выйти', type: 'redirect', url: '../index.html' }
      ]
    },
    fallbackActions: () => [
      { label: 'Описания', type: 'dialog', action: 'info' },
      { label: 'История', type: 'dialog', action: 'detail' }
    ],
    onDialogNotFound: (objectName, action) => {
      Swal.fire({
        icon: 'error',
        title: 'Диалог не найден',
        text: `Диалог "${action}" для "${objectName || 'неизвестно'}" не найден.`,
        background: '#1a1a2e',
        color: '#fff',
        confirmButtonColor: '#9d4edd'
      });
    }
  });
}