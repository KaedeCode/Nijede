import { initScene } from './engine.js';

const MODEL_SLUG_MAP = {
  guiter: 'guitar'
};

export function initNijikaScene() {
  initScene({
    baseAngleX: 0,
    limitX: Math.PI / 6,
    lightPosition: [-1, 4, -2],
    center: new THREE.Vector3(0, 2, -3),
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
    confirmColor: '#c7ba00',
    confirmTextColor: 'black',
    confirmShadow: 'rgba(221,212,78,0.5)',
    errorColor: '#c7ba00',
    doorName: 'nijika_door',
    exitMessage: 'Вы действительно хотите покинуть комнату Ниджики?',
    interactions: {
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
    }
  });
}