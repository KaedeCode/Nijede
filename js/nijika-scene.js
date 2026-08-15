(function() {
    const DIM_OPACITY = 0.4;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111122);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffcc99, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffeebb, 0.8);
    directionalLight.position.set(-1, 4, -2);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.left = -15;
    directionalLight.shadow.camera.right = 15;
    directionalLight.shadow.camera.top = 15;
    directionalLight.shadow.camera.bottom = -15;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 30;
    scene.add(directionalLight);

    let cameraAngleX = 0;
    let cameraAngleY = 0.3;
    let targetCameraAngleX = cameraAngleX;
    let targetCameraAngleY = cameraAngleY;
    const cameraDistance = 1;
    const lerpFactor = 0.25;
    const center = new THREE.Vector3(0, 2, -3);

    function updateCamera() {
        const cameraX = center.x + cameraDistance * Math.cos(cameraAngleY) * Math.sin(cameraAngleX);
        const cameraY = center.y + cameraDistance * Math.sin(cameraAngleY);
        const cameraZ = center.z + cameraDistance * Math.cos(cameraAngleY) * Math.cos(cameraAngleX);
        camera.position.set(cameraX, cameraY, cameraZ);
        camera.lookAt(center);
    }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let interactiveObjects = [];
    let hoveredObject = null;

    function traverseMaterials(obj, callback) {
        obj.traverse((child) => {
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
        traverseMaterials(obj, (material) => {
            if (material.emissive) {
                material.emissive.setHex(0x8a8500);
            }
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
    Object.assign(dimOverlay.style, {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: `rgba(0, 0, 0, ${DIM_OPACITY})`,
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0,
        transition: 'opacity 0.3s ease',
        display: 'none'
    });
    document.body.appendChild(dimOverlay);

    let menuVisible = false;
    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu-n';
    contextMenu.style.display = 'none';
    contextMenu.style.opacity = '0';
    contextMenu.style.transform = 'scale(0.95)';
    contextMenu.style.transition = 'opacity 0.3s ease, transform 0.2s ease';
    document.body.appendChild(contextMenu);

    let currentContextObject = null;
    let menuX = 0, menuY = 0;
    let hideTimeout = null;

    function applyMenuPosition() {
        if (!contextMenu || !menuVisible) return;
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

    const INTERACTIONS_CONFIG = {
        "pictureM": [
            { label: "Описание", type: "dialog", action: "info" }
        ],
        "pictureC": [
            { label: "Описание", type: "dialog", action: "info" }
        ],
        "synthesizer": [
            { label: "Описания", type: "dialog", action: "info" }
        ],
        "maracas": [
            { label: "Описания", type: "dialog", action: "info" }
        ],
        "nijika_door": [
            { label: "Выйти", type: "redirect", url: "../index.html" }
        ]
    };

    function getObjectActions(objectName) {
        const config = INTERACTIONS_CONFIG[objectName];
        if (config) return config;
        return [
            { label: "Описание", type: "dialog", action: "info" },
            { label: "Поиграть", type: "redirect", url: `instruments/${objectName}.html` }
        ];
    }

    function buildContextMenu(object) {
        if (!contextMenu) return;
        contextMenu.innerHTML = "";
        const actions = getObjectActions(object.name);
        for (const act of actions) {
            const btn = document.createElement("button");
            btn.className = "context-menu-item-n";
            btn.textContent = act.label;
            btn.dataset.type = act.type;
            if (act.type === "dialog") {
                btn.dataset.action = act.action;
            } else if (act.type === "redirect") {
                btn.dataset.url = act.url;
                if (object.name === "nijika_door") btn.dataset.confirm = "true";
            } 
            contextMenu.appendChild(btn);
        }
    }

    function showConfirmModal(message, onConfirm) {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'confirm-modal-overlay';
        Object.assign(modalOverlay.style, {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20000,
            opacity: 0,
            transition: 'opacity 0.3s ease'
        });

        const modal = document.createElement('div');
        modal.className = 'confirm-modal';
        Object.assign(modal.style, {
            backgroundColor: '#1a1a2e',
            borderRadius: '24px',
            padding: '32px 40px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 2px rgba(221, 212, 78, 0.5)',
            transform: 'scale(0.9)',
            transition: 'transform 0.2s ease'
        });

        modal.innerHTML = `
            <h3 style="color: #fff; margin-bottom: 16px; font-size: 1.5rem;">Подтверждение выхода</h3>
            <p style="color: #ccc; margin-bottom: 32px; font-size: 1.1rem;">${message}</p>
            <div style="display: flex; gap: 20px; justify-content: center;">
                <button class="confirm-btn-yes" style="background: #c7ba00; border: none; color: black; padding: 12px 24px; border-radius: 40px; font-size: 1rem; cursor: pointer; transition: all 0.2s;";>Выйти</button>
                <button class="confirm-btn-no" style="background: #2a2a3a; border: 1px solid #c7ba00; color: white; padding: 12px 24px; border-radius: 40px; font-size: 1rem; cursor: pointer;">Отмена</button>
            </div>
        `;

        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);

        requestAnimationFrame(() => {
            modalOverlay.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        });

        const yesBtn = modal.querySelector('.confirm-btn-yes');
        const noBtn = modal.querySelector('.confirm-btn-no');

        function closeModal(confirmed) {
            modalOverlay.style.opacity = '0';
            modal.style.transform = 'scale(0.9)';
            setTimeout(() => {
                if (modalOverlay.parentNode) modalOverlay.remove();
                if (confirmed) onConfirm();
            }, 300);
        }

        yesBtn.addEventListener('click', () => closeModal(true));
        noBtn.addEventListener('click', () => closeModal(false));
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal(false);
        });
    }

    function handleObjectInteraction(object, x, y) {
        const actions = getObjectActions(object.name);
        if (actions.length === 1 && actions[0].type === "redirect") {
            if (object.name === "nijika_door") {
                showConfirmModal("Вы действительно хотите покинуть комнату Ниджики?", () => {
                    window.location.href = actions[0].url;
                });
            } else {
                window.location.href = actions[0].url;
            }
            return;
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
        dimOverlay.style.display = "block";
        contextMenu.style.display = "block";
        requestAnimationFrame(() => {
            applyMenuPosition();
            dimOverlay.style.opacity = "1";
            contextMenu.style.opacity = "1";
            contextMenu.style.transform = "scale(1)";
        });
    }

    function enableShadows(obj) {
        obj.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }

    renderer.domElement.addEventListener('mousemove', (e) => {
        if (menuVisible) return;
        const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        const mappedX = Math.pow(Math.abs(mouseX), 0.6) * Math.sign(mouseX);
        const mappedY = Math.pow(Math.abs(mouseY), 0.6) * Math.sign(mouseY);
        const maxAngleX = Math.PI / 12;
        const maxAngleY = 0.3;
        const baseAngleY = 0.3;
        
        const centerAngle = 0;
        targetCameraAngleX = centerAngle - mappedX * maxAngleX;
        const limit = Math.PI / 6;
        targetCameraAngleX = Math.max(centerAngle - limit, Math.min(centerAngle + limit, targetCameraAngleX));
        
        targetCameraAngleY = baseAngleY - mappedY * maxAngleY;
        targetCameraAngleY = Math.max(-0.5, Math.min(0.8, targetCameraAngleY));
        
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveObjects, true);
        if (intersects.length > 0) {
            const root = findRootGroup(intersects[0].object);
            if (root !== hoveredObject) {
                if (hoveredObject) resetObject(hoveredObject);
                hoveredObject = root;
                highlightObject(hoveredObject);
            }
        } else {
            if (hoveredObject) {
                resetObject(hoveredObject);
                hoveredObject = null;
            }
        }
    });

    renderer.domElement.addEventListener('click', (e) => {
        if (menuVisible) {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(interactiveObjects, true);
            if (intersects.length === 0) {
                hideContextMenu();
                return;
            }
            const root = findRootGroup(intersects[0].object);
            if (root) {
                if (root === currentContextObject) return;
                else hideContextMenu();
            }
            return;
        }
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveObjects, true);
        if (intersects.length > 0) {
            const root = findRootGroup(intersects[0].object);
            if (root) {
                hideContextMenu();
                handleObjectInteraction(root, e.clientX, e.clientY);
                e.stopPropagation();
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (contextMenu && !contextMenu.contains(e.target) && e.target !== renderer.domElement) {
            hideContextMenu();
        }
    });

    contextMenu.addEventListener('click', (e) => {
        const target = e.target.closest('.context-menu-item-n');
        if (target) {
            const type = target.dataset.type;
            const objectName = currentContextObject ? currentContextObject.name : null;
            hideContextMenu();
            if (type === "redirect") {
                const url = target.dataset.url;
                if (url) {
                    if (objectName === "nijika_door") {
                        showConfirmModal("Вы действительно хотите покинуть комнату Ниджики?", () => {
                            window.location.href = url;
                        });
                    } else {
                        window.location.href = url;
                    }
                }
                return;
            }
            if (type === "dialog") {
                const action = target.dataset.action;
                if (objectName && typeof DIALOGS_MAP !== 'undefined' && window.novel) {
                    const dialogs = DIALOGS_MAP[objectName] && DIALOGS_MAP[objectName][action];
                    if (dialogs && dialogs.length > 0) {
                        window.novel.show(dialogs);
                        return;
                    }
                }
                alert(`Диалог "${action}" для "${objectName || 'неизвестно'}" не найден.`);
            }
        }
    });

    function centerObject(obj) {
        const box = new THREE.Box3().setFromObject(obj);
        const center = box.getCenter(new THREE.Vector3());
        const group = new THREE.Group();
        group.name = obj.name;
        obj.traverse((child) => {
            if (child.isMesh) {
                child.position.sub(center);
            }
        });
        group.add(obj);
        group.position.copy(center);
        return group;
    }

    function loadModel(objName) {
        return new Promise((resolve, reject) => {
            const objUrl = `../assets/models/nijika/${objName}.obj`;
            const mtlUrl = `../assets/models/nijika/${objName}.mtl`;

            const mtlLoader = new THREE.MTLLoader();
            mtlLoader.load(mtlUrl, (materials) => {
                materials.preload();
                const objLoader = new THREE.OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.load(objUrl, (object) => {
                    object.name = objName;
                    if (objName !== 'Nroom' & objName !== 'table') {
                        const centeredGroup = centerObject(object);
                        centeredGroup.name = objName;
                        enableShadows(centeredGroup);
                        scene.add(centeredGroup);
                        interactiveObjects.push(centeredGroup);
                        centeredGroup.userData.originalScale = centeredGroup.scale.clone();
                        centeredGroup.userData.targetScale = centeredGroup.scale.clone();
                        const originalEmissive = [];
                        traverseMaterials(centeredGroup, (material) => {
                            if (material.emissive) {
                                originalEmissive.push({
                                    material,
                                    emissive: material.emissive.clone()
                                });
                            }
                        });
                        centeredGroup.userData.originalEmissive = originalEmissive;
                    } else {
                        enableShadows(object);
                        object.traverse((child) => {
                            if (child.isMesh && child.material) {
                                child.material.side = THREE.DoubleSide;
                                child.material.needsUpdate = true;
                            }
                        });
                        object.position.z = -1;
                        scene.add(object);
                    }
                    resolve();
                }, undefined, reject);
            }, undefined, reject);
        });
    }

    const models = [
        "Nroom",
        "drums",
        "bass",
        "flute",
        "guiter",
        "maracas",
        "synthesizer",
        "table",
        "violin",
        "acoustic",
        "nijika_door",
        "pictureM",
        "pictureC"
    ];

    Promise.allSettled(models.map(name => loadModel(name))).then(() => {
        if (window.resolveModelsLoaded) {
            window.resolveModelsLoaded();
        }
    });

    function animate() {
        requestAnimationFrame(animate);
        if (!menuVisible) {
            cameraAngleX += (targetCameraAngleX - cameraAngleX) * lerpFactor;
            cameraAngleY += (targetCameraAngleY - cameraAngleY) * lerpFactor;
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
})();