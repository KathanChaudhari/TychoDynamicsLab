import * as THREE from "three";

const CONTROLLED_KEYS = new Set([
  "KeyW",
  "KeyS",
  "KeyA",
  "KeyD",
  "KeyR",
  "KeyF",
  "KeyQ",
  "KeyE",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
  "KeyX",
  "KeyT",
]);

export function createInteractionController({
  scene,
  camera,
  renderer,
  controls,
  spacecraft,
  station,
}) {
  const pressedKeys = new Set();

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const spacecraftCameraOffset =
    new THREE.Vector3(4, 2, 5);

  let selectedObject = null;

  const selectionBox =
    new THREE.BoxHelper(
      spacecraft.group,
      0x38bdf8
    );

  selectionBox.visible = false;
  scene.add(selectionBox);

  function setCameraView(view) {
    if (view === "overview") {
      camera.position.set(7, 5, 10);
      controls.target.set(0, 0, -3);
    }

    if (view === "spacecraft") {
      camera.position
        .copy(spacecraft.group.position)
        .add(spacecraftCameraOffset);

      controls.target.copy(
        spacecraft.group.position
      );
    }

    if (view === "docking") {
      camera.position.set(0, 1, 3);

      controls.target.copy(
        station.group.position
      );
    }

    controls.update();
  }

  function handleKeyDown(event) {
    // Camera presets

    if (event.code === "Digit1") {
      setCameraView("overview");
    }

    if (event.code === "Digit2") {
      setCameraView("spacecraft");
    }

    if (event.code === "Digit3") {
      setCameraView("docking");
    }

    if (!CONTROLLED_KEYS.has(event.code)) {
      return;
    }

    event.preventDefault();
    pressedKeys.add(event.code);

    // One-time commands

    if (
      event.code === "Space" &&
      !event.repeat
    ) {
      spacecraft.stopLinearMotion();
    }

    if (
      event.code === "KeyX" &&
      !event.repeat
    ) {
      spacecraft.stopAngularMotion();
    }

    if (
      event.code === "KeyT" &&
      !event.repeat
    ) {
      spacecraft.reset();
    }
  }

  function handleKeyUp(event) {
    pressedKeys.delete(event.code);
  }

  function findSelectableParent(object) {
    let currentObject = object;

    while (
      currentObject &&
      currentObject !== scene
    ) {
      if (
        currentObject.userData.selectable
      ) {
        return currentObject;
      }

      currentObject =
        currentObject.parent;
    }

    return null;
  }

  function handlePointerDown(event) {
    const canvasRect =
      renderer.domElement
        .getBoundingClientRect();

    pointer.x =
      ((event.clientX -
        canvasRect.left) /
        canvasRect.width) *
        2 -
      1;

    pointer.y =
      -(
        (event.clientY -
          canvasRect.top) /
        canvasRect.height
      ) *
        2 +
      1;

    raycaster.setFromCamera(
      pointer,
      camera
    );

    const intersections =
      raycaster.intersectObjects(
        [
          spacecraft.group,
          station.group,
        ],
        true
      );

    if (intersections.length === 0) {
      selectedObject = null;
      selectionBox.visible = false;
      return;
    }

    selectedObject =
      findSelectableParent(
        intersections[0].object
      );

    if (!selectedObject) {
      selectionBox.visible = false;
      return;
    }

    selectionBox.setFromObject(
      selectedObject
    );

    selectionBox.visible = true;

    console.log(
      "Selected:",
      selectedObject.userData.label
    );
  }

  function update() {
    if (selectedObject) {
      selectionBox.setFromObject(
        selectedObject
      );
    }
  }

  function dispose() {
    pressedKeys.clear();

    window.removeEventListener(
      "keydown",
      handleKeyDown
    );

    window.removeEventListener(
      "keyup",
      handleKeyUp
    );

    renderer.domElement.removeEventListener(
      "pointerdown",
      handlePointerDown
    );
  }

  window.addEventListener(
    "keydown",
    handleKeyDown
  );

  window.addEventListener(
    "keyup",
    handleKeyUp
  );

  renderer.domElement.addEventListener(
    "pointerdown",
    handlePointerDown
  );

  return {
    pressedKeys,
    update,
    setCameraView,
    dispose,
  };
}