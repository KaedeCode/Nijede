import { initScene } from './engine.js';

export function initKaedeScene() {
  initScene({
    baseAngleX: Math.PI / 2,
    limitX: Math.PI / 12,
    lightPosition: [5, 10, 7],
    center: new THREE.Vector3(10, 20, 0),
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
    confirmColor: '#9d4edd',
    confirmTextColor: 'white',
    confirmShadow: 'rgba(157,78,221,0.5)',
    errorColor: '#9d4edd',
    doorName: 'kaede_door',
    exitMessage: 'Вы действительно хотите покинуть комнату Каэде?',
    interactions: {
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
    ]
  });
}