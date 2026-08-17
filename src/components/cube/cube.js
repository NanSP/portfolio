import * as THREE from "three";
import cubeMarkup from "./cube.html?raw";
import "./cube.css";

export function mountCubeComponent(container) {
  if (!container) {
    return false;
  }

  container.innerHTML = cubeMarkup;
  return true;
}

export function initCube({
  getTranslation,
} = {}) {
  const canvas = document.querySelector("#cube-canvas");
  const stage = document.querySelector("#cube-stage");
  const scrambleButton = document.querySelector("#cube-scramble");
  const solveButton = document.querySelector("#cube-solve");
  const resetButton = document.querySelector("#cube-reset");
  const guideToggle = document.querySelector("#cube-guide-toggle");
  const guidePanel = document.querySelector("#cube-guide");
  const statusLabel = document.querySelector("#cube-status");

  if (!canvas || !stage) {
    return { statusLabel: null };
  }

  const translate = (key) => (typeof getTranslation === "function" ? getTranslation(key) : key);
  const FACE_COLORS = {
    px: "#ff7a00",
    nx: "#d62828",
    py: "#ffffff",
    ny: "#f4d000",
    pz: "#0d6efd",
    nz: "#1a8f3c",
  };

  const GRID_SPACING = 1.05;
  const TURN_ANGLE = Math.PI / 2;
  const SCRAMBLE_LENGTH = 18;
  const ORBIT_SENSITIVITY = 0.008;
  const faceOffsets = {
    px: new THREE.Vector3(0.485, 0, 0),
    nx: new THREE.Vector3(-0.485, 0, 0),
    py: new THREE.Vector3(0, 0.485, 0),
    ny: new THREE.Vector3(0, -0.485, 0),
    pz: new THREE.Vector3(0, 0, 0.485),
    nz: new THREE.Vector3(0, 0, -0.485),
  };

  const faceRotations = {
    px: [0, Math.PI / 2, 0],
    nx: [0, -Math.PI / 2, 0],
    py: [-Math.PI / 2, 0, 0],
    ny: [Math.PI / 2, 0, 0],
    pz: [0, 0, 0],
    nz: [0, Math.PI, 0],
  };

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.6, 9.2);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const clock = new THREE.Clock();
  const cubeRoot = new THREE.Group();
  const tempGroup = new THREE.Group();
  const cubies = [];
  const initialCubieStates = new Map();
  const cubeLocalAxes = {
    x: new THREE.Vector3(1, 0, 0),
    y: new THREE.Vector3(0, 1, 0),
    z: new THREE.Vector3(0, 0, 1),
  };

  let orbitYaw = -0.55;
  let orbitPitch = 0.55;
  let targetYaw = orbitYaw;
  let targetPitch = orbitPitch;
  let activeTurn = null;
  let interaction = null;
  let autoRotateTimer = 0;
  let pendingMoves = [];
  let moveHistory = [];
  let isSolving = false;
  let previewLayer = null;
  let solvedToastTimer = 0;

  scene.add(cubeRoot);
  scene.add(tempGroup);

  scene.add(new THREE.AmbientLight("#ffffff", 1.3));

  const keyLight = new THREE.DirectionalLight("#dce7ff", 1.5);
  keyLight.position.set(4, 6, 7);
  const fillLight = new THREE.DirectionalLight("#5f66ff", 0.45);
  fillLight.position.set(-6, -2, 5);
  scene.add(keyLight, fillLight);

  const cubeBodyGeometry = new THREE.BoxGeometry(0.96, 0.96, 0.96, 4, 4, 4);
  const cubeBodyMaterial = new THREE.MeshPhysicalMaterial({
    color: "#090909",
    roughness: 0.28,
    metalness: 0.08,
    clearcoat: 0.6,
    clearcoatRoughness: 0.26,
  });

  const stickerMaterials = Object.fromEntries(
    Object.entries(FACE_COLORS).map(([key, color]) => [
      key,
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.45,
        metalness: 0.03,
        clearcoat: 0.35,
        clearcoatRoughness: 0.4,
      }),
    ]),
  );

  function createCubie(gridX, gridY, gridZ) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(cubeBodyGeometry, cubeBodyMaterial.clone());
    body.material.emissive = new THREE.Color("#000000");
    body.material.emissiveIntensity = 0;
    group.userData.body = body;
    group.userData.stickers = [];
    group.add(body);

    const stickerGeometry = new THREE.PlaneGeometry(0.72, 0.72);
    [
      ["px", gridX === 1],
      ["nx", gridX === -1],
      ["py", gridY === 1],
      ["ny", gridY === -1],
      ["pz", gridZ === 1],
      ["nz", gridZ === -1],
    ].forEach(([faceKey, visible]) => {
      if (!visible) {
        return;
      }

      const sticker = new THREE.Mesh(
        stickerGeometry,
        stickerMaterials[faceKey].clone(),
      );
      sticker.position.copy(faceOffsets[faceKey]);
      sticker.rotation.set(...faceRotations[faceKey]);
      sticker.userData.faceKey = faceKey;
      sticker.userData.cubie = group;
      sticker.material.emissive = new THREE.Color("#000000");
      sticker.material.emissiveIntensity = 0;
      group.userData.stickers.push(sticker);
      group.add(sticker);
    });

    group.position.set(gridX * GRID_SPACING, gridY * GRID_SPACING, gridZ * GRID_SPACING);
    group.userData.grid = { x: gridX, y: gridY, z: gridZ };
    cubeRoot.add(group);
    cubies.push(group);
    initialCubieStates.set(group.uuid, {
      position: group.position.clone(),
      quaternion: group.quaternion.clone(),
      grid: { ...group.userData.grid },
    });
  }

  for (let x = -1; x <= 1; x += 1) {
    for (let y = -1; y <= 1; y += 1) {
      for (let z = -1; z <= 1; z += 1) {
        createCubie(x, y, z);
      }
    }
  }

  function setRendererSize() {
    const { width } = stage.getBoundingClientRect();
    const height = canvas.clientHeight || 320;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const scale = width < 340 ? 0.85 : 1;
    cubeRoot.scale.setScalar(scale);
  }

  function updatePointer(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  }

  function pickSticker(clientX, clientY) {
    updatePointer(clientX, clientY);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(cubeRoot.children, true);
    return hits.find((hit) => hit.object.userData.faceKey) || null;
  }

  function getFaceInteractionData(hit) {
    const faceQuaternion = new THREE.Quaternion();
    hit.object.getWorldQuaternion(faceQuaternion);

    const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(faceQuaternion).normalize();
    const tangentU = new THREE.Vector3(1, 0, 0).applyQuaternion(faceQuaternion).normalize();
    const tangentV = new THREE.Vector3(0, 1, 0).applyQuaternion(faceQuaternion).normalize();

    return {
      plane: new THREE.Plane().setFromNormalAndCoplanarPoint(normal, hit.point),
      startPoint: hit.point.clone(),
      normal,
      tangentU,
      tangentV,
    };
  }

  function intersectPointerWithPlane(clientX, clientY, plane) {
    updatePointer(clientX, clientY);
    raycaster.setFromCamera(pointer, camera);
    const point = new THREE.Vector3();
    const intersects = raycaster.ray.intersectPlane(plane, point);
    return intersects ? point : null;
  }

  function resolveTurnFromGesture(interactionState, clientX, clientY) {
    const faceMesh = interactionState.hit.object;
    const cubie = faceMesh.userData.cubie;
    const currentPoint = intersectPointerWithPlane(
      clientX,
      clientY,
      interactionState.facePlane,
    );

    if (!currentPoint) {
      return null;
    }

    const worldDrag = currentPoint.clone().sub(interactionState.faceStartPoint);
    const dragU = worldDrag.dot(interactionState.faceTangentU);
    const dragV = worldDrag.dot(interactionState.faceTangentV);

    if (Math.abs(dragU) < 0.02 && Math.abs(dragV) < 0.02) {
      return null;
    }

    const useU = Math.abs(dragU) >= Math.abs(dragV);
    const chosenTangent = useU
      ? interactionState.faceTangentU
      : interactionState.faceTangentV;
    const tangentSign = useU ? Math.sign(dragU) || 1 : Math.sign(dragV) || 1;
    const rotationWorld = interactionState.faceNormal
      .clone()
      .cross(chosenTangent)
      .normalize()
      .multiplyScalar(tangentSign);
    const rootQuaternion = new THREE.Quaternion();
    cubeRoot.getWorldQuaternion(rootQuaternion);

    let chosenAxis = "x";
    let chosenSign = 1;
    let bestDot = -Infinity;

    Object.entries(cubeLocalAxes).forEach(([axisName, axisVector]) => {
      const worldAxis = axisVector.clone().applyQuaternion(rootQuaternion).normalize();
      const alignment = rotationWorld.dot(worldAxis);
      if (Math.abs(alignment) > bestDot) {
        bestDot = Math.abs(alignment);
        chosenAxis = axisName;
        chosenSign = alignment >= 0 ? 1 : -1;
      }
    });

    return {
      axis: chosenAxis,
      layer: cubie.userData.grid[chosenAxis],
      direction: chosenSign,
    };
  }

  function collectLayer(axis, layer) {
    return cubies.filter((cubie) => cubie.userData.grid[axis] === layer);
  }

  function showSolvedState() {
    stage.classList.add("is-solved");
    if (statusLabel) {
      statusLabel.dataset.statusKey = "cube.solved";
      statusLabel.textContent = translate("cube.solved");
      statusLabel.classList.add("is-visible");
    }
    solvedToastTimer = 2.8;
  }

  function clearSolvedState({ preserveText = false } = {}) {
    stage.classList.remove("is-solved");
    solvedToastTimer = 0;
    if (statusLabel && !preserveText) {
      delete statusLabel.dataset.statusKey;
      statusLabel.textContent = "";
      statusLabel.classList.remove("is-visible");
    }
  }

  function isCubeSolved() {
    return cubies.every((cubie) => {
      const initial = initialCubieStates.get(cubie.uuid);
      const sameGrid =
        cubie.userData.grid.x === initial.grid.x &&
        cubie.userData.grid.y === initial.grid.y &&
        cubie.userData.grid.z === initial.grid.z;
      const sameRotation = cubie.quaternion.angleTo(initial.quaternion) < 0.001;
      return sameGrid && sameRotation;
    });
  }

  function clearPreviewLayer() {
    if (!previewLayer) {
      return;
    }

    previewLayer.members.forEach((cubie) => {
      cubie.scale.setScalar(1);
      cubie.userData.body.material.emissiveIntensity = 0;
      cubie.userData.stickers.forEach((sticker) => {
        sticker.material.emissiveIntensity = 0;
      });
    });

    previewLayer = null;
  }

  function setPreviewLayer(axis, layer) {
    if (
      previewLayer &&
      previewLayer.axis === axis &&
      previewLayer.layer === layer
    ) {
      return;
    }

    clearPreviewLayer();

    const members = collectLayer(axis, layer);
    members.forEach((cubie) => {
      cubie.scale.setScalar(1.03);
      cubie.userData.body.material.emissive.set("#1a00ff");
      cubie.userData.body.material.emissiveIntensity = 0.08;
      cubie.userData.stickers.forEach((sticker) => {
        sticker.material.emissive.set("#2f2fff");
        sticker.material.emissiveIntensity = 0.14;
      });
    });

    previewLayer = { axis, layer, members };
  }

  function resetTempGroup() {
    tempGroup.rotation.set(0, 0, 0);
    tempGroup.position.set(0, 0, 0);
    tempGroup.quaternion.identity();
  }

  function startTurn(axis, layer, direction, source = "user") {
    if (activeTurn) {
      return false;
    }

    const members = collectLayer(axis, layer);
    if (members.length === 0) {
      return false;
    }

    clearPreviewLayer();
    resetTempGroup();
    cubeRoot.add(tempGroup);
    members.forEach((cubie) => tempGroup.attach(cubie));

    activeTurn = {
      axis,
      layer,
      direction,
      source,
      angle: 0,
      targetAngle: direction * TURN_ANGLE,
      members,
    };

    canvas.classList.add("is-turning");
    return true;
  }

  function snapCubie(cubie) {
    cubie.position.set(
      Math.round(cubie.position.x / GRID_SPACING) * GRID_SPACING,
      Math.round(cubie.position.y / GRID_SPACING) * GRID_SPACING,
      Math.round(cubie.position.z / GRID_SPACING) * GRID_SPACING,
    );
    cubie.userData.grid = {
      x: Math.round(cubie.position.x / GRID_SPACING),
      y: Math.round(cubie.position.y / GRID_SPACING),
      z: Math.round(cubie.position.z / GRID_SPACING),
    };
  }

  function finishTurn() {
    const { axis, direction, layer, members, source, targetAngle } = activeTurn;
    tempGroup.rotation[axis] = targetAngle;
    tempGroup.updateMatrixWorld(true);

    members.forEach((cubie) => {
      cubeRoot.attach(cubie);
      snapCubie(cubie);
    });

    resetTempGroup();
    if (source !== "solve") {
      moveHistory.push({ axis, layer, direction });
    } else if (pendingMoves.length === 0) {
      isSolving = false;
    }
    activeTurn = null;
    canvas.classList.remove("is-turning");
    if (isCubeSolved()) {
      showSolvedState();
    }
  }

  function queueScramble(length = SCRAMBLE_LENGTH) {
    const axes = ["x", "y", "z"];
    const moves = [];
    let lastAxis = null;

    for (let i = 0; i < length; i += 1) {
      const availableAxes = axes.filter((axis) => axis !== lastAxis);
      const axis = availableAxes[Math.floor(Math.random() * availableAxes.length)];
      const layer = [-1, 0, 1][Math.floor(Math.random() * 3)];
      const direction = Math.random() > 0.5 ? 1 : -1;
      moves.push({ axis, layer, direction });
      lastAxis = axis;
    }

    return moves;
  }

  function invertMoves(moves) {
    return [...moves].reverse().map((move) => ({
      axis: move.axis,
      layer: move.layer,
      direction: move.direction * -1,
      source: "solve",
    }));
  }

  function applyNextPendingMove() {
    if (activeTurn || pendingMoves.length === 0) {
      return;
    }

    const nextMove = pendingMoves.shift();
    startTurn(
      nextMove.axis,
      nextMove.layer,
      nextMove.direction,
      nextMove.source ?? "queue",
    );
  }

  function resetCubeState() {
    pendingMoves = [];
    activeTurn = null;
    interaction = null;
    moveHistory = [];
    isSolving = false;
    clearPreviewLayer();
    clearSolvedState();
    canvas.classList.remove("is-turning");
    resetTempGroup();

    cubies.forEach((cubie) => {
      cubeRoot.attach(cubie);
      const state = initialCubieStates.get(cubie.uuid);
      cubie.position.copy(state.position);
      cubie.quaternion.copy(state.quaternion);
      cubie.userData.grid = { ...state.grid };
    });

    orbitYaw = -0.55;
    orbitPitch = 0.55;
    targetYaw = orbitYaw;
    targetPitch = orbitPitch;
    autoRotateTimer = 0;
  }

  function scrambleCube() {
    if (activeTurn) {
      return;
    }

    clearSolvedState();
    pendingMoves = queueScramble().map((move) => ({
      ...move,
      source: "scramble",
    }));
    moveHistory = [];
    isSolving = false;
    autoRotateTimer = 0;
  }

  function solveCube() {
    if (activeTurn || pendingMoves.length > 0 || moveHistory.length === 0) {
      return;
    }

    clearSolvedState();
    pendingMoves = invertMoves(moveHistory);
    moveHistory = [];
    isSolving = true;
    autoRotateTimer = 0;
  }

  function onPointerDown(event) {
    if (activeTurn) {
      return;
    }

    const hit = pickSticker(event.clientX, event.clientY);
    interaction = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      mode: hit ? "pending-face" : "orbit",
      hit,
    };

    if (hit) {
      const faceData = getFaceInteractionData(hit);
      interaction.facePlane = faceData.plane;
      interaction.faceStartPoint = faceData.startPoint;
      interaction.faceNormal = faceData.normal;
      interaction.faceTangentU = faceData.tangentU;
      interaction.faceTangentV = faceData.tangentV;
    }

    canvas.setPointerCapture(event.pointerId);
    autoRotateTimer = 0;
  }

  function onPointerMove(event) {
    if (!interaction || interaction.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - interaction.startX;
    const dy = event.clientY - interaction.startY;
    const totalDistance = Math.hypot(dx, dy);

    if (interaction.mode === "pending-face") {
      if (totalDistance < 10) {
        return;
      }

      const move = resolveTurnFromGesture(
        interaction,
        event.clientX,
        event.clientY,
      );
      if (move) {
        setPreviewLayer(move.axis, move.layer);
      } else {
        clearPreviewLayer();
      }
      if (move && startTurn(move.axis, move.layer, move.direction, "user")) {
        pendingMoves = [];
        isSolving = false;
        clearSolvedState();
        clearInteraction(event.pointerId);
      }
      return;
    }

    targetYaw += (event.clientX - interaction.lastX) * ORBIT_SENSITIVITY;
    targetPitch += (event.clientY - interaction.lastY) * ORBIT_SENSITIVITY;
    targetPitch = THREE.MathUtils.clamp(targetPitch, -1.1, 1.1);
    interaction.lastX = event.clientX;
    interaction.lastY = event.clientY;
    clearPreviewLayer();
  }

  function clearInteraction(pointerId) {
    if (!interaction || interaction.pointerId !== pointerId) {
      return;
    }

    if (canvas.hasPointerCapture(pointerId)) {
      canvas.releasePointerCapture(pointerId);
    }
    clearPreviewLayer();
    interaction = null;
  }

  function onPointerUp(event) {
    clearInteraction(event.pointerId);
  }

  function animate() {
    const delta = Math.min(clock.getDelta(), 0.033);

    orbitYaw += (targetYaw - orbitYaw) * Math.min(1, delta * 8);
    orbitPitch += (targetPitch - orbitPitch) * Math.min(1, delta * 8);
    cubeRoot.rotation.y = orbitYaw;
    cubeRoot.rotation.x = orbitPitch;

    if (activeTurn) {
      activeTurn.angle = THREE.MathUtils.damp(
        activeTurn.angle,
        activeTurn.targetAngle,
        5.8,
        delta,
      );
      tempGroup.rotation[activeTurn.axis] = activeTurn.angle;

      if (Math.abs(activeTurn.targetAngle - activeTurn.angle) < 0.008) {
        finishTurn();
      }
    } else if (pendingMoves.length > 0) {
      applyNextPendingMove();
    } else if (!interaction) {
      autoRotateTimer += delta;
      if (autoRotateTimer > 3.8) {
        targetYaw += delta * 0.28;
      }
    }

    if (solvedToastTimer > 0) {
      solvedToastTimer = Math.max(0, solvedToastTimer - delta);
      if (solvedToastTimer === 0 && statusLabel) {
        statusLabel.classList.remove("is-visible");
      }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function setGuideOpen(isOpen) {
    if (!guideToggle || !guidePanel) {
      return;
    }

    guidePanel.hidden = !isOpen;
    guideToggle.setAttribute("aria-expanded", String(isOpen));
  }

  function toggleGuide() {
    if (!guidePanel) {
      return;
    }

    setGuideOpen(guidePanel.hidden);
  }

  function onDocumentPointerDown(event) {
    if (!guidePanel || !guideToggle || guidePanel.hidden) {
      return;
    }

    const target = event.target;
    if (guidePanel.contains(target) || guideToggle.contains(target)) {
      return;
    }

    setGuideOpen(false);
  }

  scrambleButton?.addEventListener("click", scrambleCube);
  solveButton?.addEventListener("click", solveCube);
  resetButton?.addEventListener("click", resetCubeState);
  guideToggle?.addEventListener("click", toggleGuide);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("lostpointercapture", onPointerUp);
  document.addEventListener("pointerdown", onDocumentPointerDown);
  window.addEventListener("resize", setRendererSize);

  setRendererSize();
  setGuideOpen(false);
  scrambleCube();
  animate();

  return { statusLabel };
}
