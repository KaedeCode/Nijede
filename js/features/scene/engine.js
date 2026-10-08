import { getNovel } from '../novel/novel.js';
import { DIALOGS_MAP } from '../novel/dialogs.js';

const BACKGROUND_DEFAULT = 0x111122;
const AMBIENT_COLOR = 0xffcc99;
const AMBIENT_INTENSITY = 0.5;
const DIRECTIONAL_COLOR = 0xffeebb;
const DIRECTIONAL_INTENSITY = 0.8;
const SHADOW_DEFAULT = {
  bounds: 15,
  near: 0.5,
  far: 30,
  mapSize: 1024
};
const FOCUS_FILL = 0.7;
const FOCUS_DURATION = 1.8;
const ROTATION_LAG = 1.15;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

export function initScene(config) {
  const shadowCfg = { ...SHADOW_DEFAULT, ...(config.shadow || {}) };

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(config.background ?? BACKGROUND_DEFAULT);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(AMBIENT_COLOR, AMBIENT_INTENSITY));

  const directionalLight = new THREE.DirectionalLight(DIRECTIONAL_COLOR, DIRECTIONAL_INTENSITY);
  directionalLight.position.set(config.lightPosition[0], config.lightPosition[1], config.lightPosition[2]);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = shadowCfg.mapSize;
  directionalLight.shadow.mapSize.height = shadowCfg.mapSize;
  directionalLight.shadow.camera.left = -shadowCfg.bounds;
  directionalLight.shadow.camera.right = shadowCfg.bounds;
  directionalLight.shadow.camera.top = shadowCfg.bounds;
  directionalLight.shadow.camera.bottom = -shadowCfg.bounds;
  directionalLight.shadow.camera.near = shadowCfg.near;
  directionalLight.shadow.camera.far = shadowCfg.far;
  scene.add(directionalLight);

  const cam = config.camera;
  let cameraAngleX = cam.baseAngleX;
  let cameraAngleY = cam.baseAngleY;
  let targetCameraAngleX = cameraAngleX;
  let targetCameraAngleY = cameraAngleY;
  const center = config.center;

  const focusAnim = {
    startTime: 0,
    progress: 0,
    startPos: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
    startQuat: new THREE.Quaternion(),
    endQuat: new THREE.Quaternion()
  };
  let cameraMode = 'orbit';

  function computeOrbitPosition() {
    return new THREE.Vector3(
      center.x + cam.distance * Math.cos(cameraAngleY) * Math.sin(cameraAngleX),
      center.y + cam.distance * Math.sin(cameraAngleY),
      center.z + cam.distance * Math.cos(cameraAngleY) * Math.cos(cameraAngleX)
    );
  }

  function quaternionLookingAt(eyePos, targetPos) {
    const m = new THREE.Matrix4();
    m.lookAt(eyePos, targetPos, camera.up);
    return new THREE.Quaternion().setFromRotationMatrix(m);
  }

  function updateCamera() {
    if (cameraMode === 'focusing-in' || cameraMode === 'focusing-out') {
      const tPos = easeInOutCubic(focusAnim.progress);
      const tRot = Math.pow(easeInOutSine(focusAnim.progress), ROTATION_LAG);
      camera.position.lerpVectors(focusAnim.startPos, focusAnim.endPos, tPos);
      camera.quaternion.slerpQuaternions(focusAnim.startQuat, focusAnim.endQuat, tRot);
      return;
    }
    if (cameraMode === 'focused') {
      camera.position.copy(focusAnim.endPos);
      camera.quaternion.copy(focusAnim.endQuat);
      return;
    }
    camera.position.copy(computeOrbitPosition());
    camera.lookAt(center);
  }

  function beginFocusTravel(endPos, endLookAt, returning) {
    focusAnim.startTime = performance.now();
    focusAnim.progress = 0;
    focusAnim.startPos.copy(camera.position);
    focusAnim.endPos.copy(endPos);
    focusAnim.startQuat.copy(camera.quaternion);
    focusAnim.endQuat.copy(quaternionLookingAt(endPos, endLookAt));
    cameraMode = returning ? 'focusing-out' : 'focusing-in';
  }

  function focusOnObject(object) {
    if (cameraMode !== 'orbit') return;
    object.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const objCenter = box.getCenter(new THREE.Vector3());
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(
      object.getWorldQuaternion(new THREE.Quaternion())
    );

    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    const dH = size.y / (2 * FOCUS_FILL * Math.tan(vFov / 2));
    const dW = size.x / (2 * FOCUS_FILL * Math.tan(hFov / 2));
    const distance = Math.max(dH, dW) * 1.05;

    const targetPos = objCenter.clone().add(forward.multiplyScalar(distance));
    beginFocusTravel(targetPos, objCenter, false);
  }

  function unfocusCamera() {
    if (cameraMode !== 'focused') return;
    beginFocusTravel(computeOrbitPosition(), center, true);
  }

  function exitFocus() {
    if (cameraMode !== 'focused') return;
    if (config.focusDialog && config.focusDialog.length) {
      getNovel().show(config.focusDialog, { onHide: unfocusCamera });
    } else {
      unfocusCamera();
    }
  }

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const interactiveObjects = [];
  let hoveredObject = null;
  let pointerDirty = false;

  function traverseMaterials(obj, callback) {
    obj.traverse(child => {
      if (child.isMesh) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach(callback);
      }
    });
  }

  function findRootGroup(obj) {
    while (obj.parent && !interactiveObjects.includes(obj)) {
      obj = obj.parent;
    }
    return obj;
  }

  function highlightObject(obj) {
    obj.userData.targetScale.copy(obj.userData.originalScale).multiplyScalar(1.05);
    traverseMaterials(obj, material => {
      if (material.emissive) material.emissive.setHex(config.hoverEmissive);
    });
  }

  function resetObject(obj) {
    obj.userData.targetScale.copy(obj.userData.originalScale);
    const originalEmissive = obj.userData.originalEmissive || [];
    originalEmissive.forEach(item => {
      item.material.emissive.copy(item.emissive);
    });
  }

  const dimOverlay = document.createElement('div');
  dimOverlay.id = 'dimOverlay';
  document.body.appendChild(dimOverlay);

  let menuVisible = false;
  const contextMenu = document.createElement('div');
  contextMenu.className = config.menuClass;
  contextMenu.style.display = 'none';
  contextMenu.style.opacity = '0';
  contextMenu.style.transform = 'scale(0.95)';
  document.body.appendChild(contextMenu);

  let currentContextObject = null;
  let menuX = 0;
  let menuY = 0;
  let hideTimeout = null;

  function applyMenuPosition() {
    if (!menuVisible) return;
    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;
    let left = menuX;
    let top = menuY;
    if (left + menuWidth > winWidth) left = winWidth - menuWidth;
    if (top + menuHeight > winHeight) top = winHeight - menuHeight;
    if (left < 0) left = 0;
    if (top < 0) top = 0;
    contextMenu.style.left = left + 'px';
    contextMenu.style.top = top + 'px';
  }

  function hideContextMenu() {
    if (!menuVisible) return;
    if (hideTimeout) clearTimeout(hideTimeout);
    menuVisible = false;
    dimOverlay.style.opacity = '0';
    contextMenu.style.opacity = '0';
    contextMenu.style.transform = 'scale(0.95)';
    hideTimeout = setTimeout(() => {
      if (!menuVisible) {
        dimOverlay.style.display = 'none';
        contextMenu.style.display = 'none';
      }
      hideTimeout = null;
    }, 300);
  }

  function getObjectActions(objectName) {
    return config.interactions[objectName] || config.fallbackActions(objectName);
  }

  function buildContextMenu(object) {
    contextMenu.innerHTML = '';
    const actions = getObjectActions(object.name);
    for (const act of actions) {
      const btn = document.createElement('button');
      btn.className = config.menuItemClass;
      btn.textContent = act.label;
      btn.dataset.type = act.type;
      if (act.type === 'dialog') {
        btn.dataset.action = act.action;
      } else if (act.type === 'redirect') {
        btn.dataset.url = act.url;
        if (object.name === config.doorName) btn.dataset.confirm = 'true';
      }
      contextMenu.appendChild(btn);
    }
  }

  function showConfirmModal(message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-modal-overlay';
    overlay.dataset.theme = config.theme;
    overlay.innerHTML = `
      <div class="confirm-modal">
        <h3>Подтверждение выхода</h3>
        <p>${message}</p>
        <div class="confirm-modal-actions">
          <button class="confirm-btn-yes">Выйти</button>
          <button class="confirm-btn-no">Отмена</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      overlay.querySelector('.confirm-modal').style.transform = 'scale(1)';
    });

    function closeModal(confirmed) {
      overlay.style.opacity = '0';
      overlay.querySelector('.confirm-modal').style.transform = 'scale(0.9)';
      setTimeout(() => {
        if (overlay.parentNode) overlay.remove();
        if (confirmed) onConfirm();
      }, 300);
    }

    overlay.querySelector('.confirm-btn-yes').addEventListener('click', () => closeModal(true));
    overlay.querySelector('.confirm-btn-no').addEventListener('click', () => closeModal(false));
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(false);
    });
  }

  function handleObjectInteraction(object, x, y) {
    const actions = getObjectActions(object.name);

    if (actions.length === 1) {
      const a = actions[0];
      if (a.type === 'redirect') {
        if (object.name === config.doorName) {
          showConfirmModal(config.exitMessage, () => { window.location.href = a.url; });
        } else {
          window.location.href = a.url;
        }
        return;
      }
      if (a.type === 'focus') {
        if (hoveredObject) {
          resetObject(hoveredObject);
          hoveredObject = null;
        }
        focusOnObject(object);
        return;
      }
    }

    showContextMenu(x, y, object);
  }

  function showContextMenu(x, y, object) {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    if (menuVisible) {
      currentContextObject = object;
      menuX = x;
      menuY = y;
      applyMenuPosition();
      return;
    }
    buildContextMenu(object);
    menuVisible = true;
    currentContextObject = object;
    menuX = x;
    menuY = y;
    dimOverlay.style.display = 'block';
    contextMenu.style.display = 'block';
    requestAnimationFrame(() => {
      applyMenuPosition();
      dimOverlay.style.opacity = '1';
      contextMenu.style.opacity = '1';
      contextMenu.style.transform = 'scale(1)';
    });
  }

  function enableShadows(obj, castShadow = true) {
    obj.traverse(child => {
      if (child.isMesh) {
        child.castShadow = castShadow;
        child.receiveShadow = true;
      }
    });
  }

  function performHoverCheck() {
    if (menuVisible || cameraMode !== 'orbit') return;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects, true);
    if (intersects.length > 0) {
      const root = findRootGroup(intersects[0].object);
      if (root !== hoveredObject) {
        if (hoveredObject) resetObject(hoveredObject);
        hoveredObject = root;
        highlightObject(hoveredObject);
      }
    } else if (hoveredObject) {
      resetObject(hoveredObject);
      hoveredObject = null;
    }
  }

  renderer.domElement.addEventListener('mousemove', e => {
    if (menuVisible || cameraMode !== 'orbit') return;
    const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    const mappedX = Math.pow(Math.abs(mouseX), cam.mouseGamma) * Math.sign(mouseX);
    const mappedY = Math.pow(Math.abs(mouseY), cam.mouseGamma) * Math.sign(mouseY);
    targetCameraAngleX = cam.baseAngleX - mappedX * cam.limitX;
    targetCameraAngleX = Math.max(cam.baseAngleX - cam.limitX, Math.min(cam.baseAngleX + cam.limitX, targetCameraAngleX));
    targetCameraAngleY = cam.baseAngleY - mappedY * cam.limitY;
    targetCameraAngleY = Math.max(cam.yMin, Math.min(cam.yMax, targetCameraAngleY));
    mouse.x = mouseX;
    mouse.y = mouseY;
    pointerDirty = true;
  });

  renderer.domElement.addEventListener('click', e => {
    if (cameraMode === 'focused') {
      exitFocus();
      return;
    }
    if (cameraMode !== 'orbit') return;

    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects, true);

    if (menuVisible) {
      if (intersects.length === 0) {
        hideContextMenu();
        return;
      }
      const root = findRootGroup(intersects[0].object);
      if (root) {
        if (root === currentContextObject) return;
        hideContextMenu();
      }
      return;
    }

    if (intersects.length > 0) {
      const root = findRootGroup(intersects[0].object);
      if (root) {
        hideContextMenu();
        handleObjectInteraction(root, e.clientX, e.clientY);
        e.stopPropagation();
      }
    }
  });

  document.addEventListener('keydown', e => {
    if (e.code === 'Escape' && cameraMode === 'focused') {
      unfocusCamera();
    }
  });

  document.addEventListener('click', e => {
    if (contextMenu && !contextMenu.contains(e.target) && e.target !== renderer.domElement) {
      hideContextMenu();
    }
  });

  contextMenu.addEventListener('click', e => {
    const target = e.target.closest('.' + config.menuItemClass);
    if (!target) return;
    const type = target.dataset.type;
    const objectName = currentContextObject ? currentContextObject.name : null;
    hideContextMenu();
    if (type === 'redirect') {
      const url = target.dataset.url;
      if (!url) return;
      if (objectName === config.doorName) {
        showConfirmModal(config.exitMessage, () => { window.location.href = url; });
      } else {
        window.location.href = url;
      }
      return;
    }
    if (type === 'dialog') {
      const action = target.dataset.action;
      const dialogs = objectName ? DIALOGS_MAP[objectName]?.[action] : null;
      if (dialogs && dialogs.length > 0) {
        getNovel().show(dialogs);
        return;
      }
      if (config.onDialogNotFound) config.onDialogNotFound(objectName, action);
    }
  });

  function centerObject(obj) {
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    const group = new THREE.Group();
    group.name = obj.name;
    obj.traverse(child => {
      if (child.isMesh) child.position.sub(center);
    });
    group.add(obj);
    group.position.copy(center);
    return group;
  }

  function registerInteractive(obj) {
    obj.userData.originalScale = obj.scale.clone();
    obj.userData.targetScale = obj.scale.clone();
    const originalEmissive = [];
    traverseMaterials(obj, material => {
      if (material.emissive) {
        originalEmissive.push({ material, emissive: material.emissive.clone() });
      }
    });
    obj.userData.originalEmissive = originalEmissive;
    interactiveObjects.push(obj);
  }

  function loadModel(objName) {
    return new Promise((resolve, reject) => {
      const objUrl = `${config.modelsPath}/${objName}.obj`;
      const mtlUrl = `${config.modelsPath}/${objName}.mtl`;

      const mtlLoader = new THREE.MTLLoader();
      mtlLoader.load(mtlUrl, materials => {
        materials.preload();
        const objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(objUrl, object => {
          object.name = objName;
          if (!config.nonInteractiveModels.includes(objName)) {
            const centeredGroup = centerObject(object);
            centeredGroup.name = objName;
            enableShadows(centeredGroup, true);
            scene.add(centeredGroup);
            registerInteractive(centeredGroup);
          } else {
            enableShadows(object, false);
            if (config.onNonInteractive) config.onNonInteractive(object);
            scene.add(object);
          }
          resolve();
        }, undefined, reject);
      }, undefined, reject);
    });
  }

  const modelsReady = Promise.allSettled(config.models.map(name => loadModel(name))).then(results => {
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.warn(`Failed to load model "${config.models[i]}":`, r.reason);
      }
    });
  });

  if (config.decorations) {
    config.decorations.forEach(dec => {
      const obj = dec.factory();
      if (dec.position) obj.position.set(dec.position[0], dec.position[1], dec.position[2]);
      if (dec.rotation) obj.rotation.set(dec.rotation[0], dec.rotation[1], dec.rotation[2]);
      if (dec.scale) obj.scale.setScalar(dec.scale);
      if (dec.name) obj.name = dec.name;
      enableShadows(obj, true);
      scene.add(obj);
      if (dec.interactive) registerInteractive(obj);
    });
  }

  function animate() {
    requestAnimationFrame(animate);

    if (cameraMode === 'focusing-in' || cameraMode === 'focusing-out') {
      const elapsed = (performance.now() - focusAnim.startTime) / 1000;
      focusAnim.progress = Math.min(elapsed / FOCUS_DURATION, 1);
      if (focusAnim.progress >= 1) {
        cameraMode = cameraMode === 'focusing-in' ? 'focused' : 'orbit';
      }
    }

    if (cameraMode === 'orbit') {
      cameraAngleX += (targetCameraAngleX - cameraAngleX) * cam.lerp;
      cameraAngleY += (targetCameraAngleY - cameraAngleY) * cam.lerp;
      if (pointerDirty) {
        performHoverCheck();
        pointerDirty = false;
      }
    } else {
      pointerDirty = false;
    }

    updateCamera();

    interactiveObjects.forEach(obj => {
      if (obj.userData.targetScale) {
        obj.scale.lerp(obj.userData.targetScale, 0.2);
        if (obj.scale.distanceTo(obj.userData.targetScale) < 0.001) {
          obj.scale.copy(obj.userData.targetScale);
        }
      }
    });

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return modelsReady;
}