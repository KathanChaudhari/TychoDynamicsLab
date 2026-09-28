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
  "KeyU",
  "KeyP",
  "KeyV",
  "KeyC",
  "Enter",
]);

export function createInteractionController({
  scene,
  camera,
  renderer,
  controls,
  spacecraft,
  station,
  onStartMission,
  onReset,
  onUndock,
  onLaunchProbe,
  onToggleTrajectory,
}) {
  const pressedKeys =
    new Set();

  const raycaster =
    new THREE.Raycaster();

  const pointer =
    new THREE.Vector2();

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
      camera.position.set(
        7,
        5,
        10
      );

      controls.target.set(
        0,
        0,
        -3
      );
    }

    if (view === "spacecraft") {
      camera.position
        .copy(
          spacecraft.group.position
        )
        .add(
          spacecraftCameraOffset
        );

      controls.target.copy(
        spacecraft.group.position
      );
    }

    if (view === "docking") {
      camera.position.set(
        0,
        1,
        3
      );

      controls.target.copy(
        station.group.position
      );
    }

    controls.update();
  }

  function handleOneTimeCommand(
    event
  ) {
    if (event.code === "Space") {
      spacecraft.stopLinearMotion();
      return true;
    }

    if (event.code === "KeyX") {
      spacecraft.stopAngularMotion();
      return true;
    }

    if (event.code === "KeyT") {
      onReset?.();
      return true;
    }

    if (event.code === "KeyU") {
      onUndock?.();
      return true;
    }

    if (event.code === "KeyP") {
      onLaunchProbe?.();
      return true;
    }

    if (event.code === "KeyV") {
      onToggleTrajectory?.();
      return true;
    }

    if (event.code === "KeyC") {
      const visible =
        spacecraft.toggleColliderDebug();
    
      station.setColliderDebugVisible?.(
        visible
      );
    
      spacecraft
        .setDockingPortDebugVisible?.(
          visible
        );
    
      station
        .setDockingPortDebugVisible?.(
          visible
        );

        if (event.code === "Enter") {
  onStartMission?.();
  return true;
}
    
      return true;
    }

    if (event.code === "Enter") {
      onStartMission?.();
      return true;
    }
    return false;
  }

  function handleKeyDown(event) {
    if (event.code === "Digit1") {
      setCameraView("overview");
      return;
    }

    if (event.code === "Digit2") {
      setCameraView("spacecraft");
      return;
    }

    if (event.code === "Digit3") {
      setCameraView("docking");
      return;
    }

    if (
      !CONTROLLED_KEYS.has(
        event.code
      )
    ) {
      return;
    }

    event.preventDefault();

    if (event.repeat) {
      return;
    }

    const handledCommand =
      handleOneTimeCommand(event);

    if (handledCommand) {
      pressedKeys.delete(
        event.code
      );

      return;
    }

    /*
     * Only continuous flight controls remain
     * in pressedKeys.
     */
    pressedKeys.add(
      event.code
    );
  }

  function handleKeyUp(event) {
    pressedKeys.delete(
      event.code
    );
  }

  function findSelectableParent(
    object
  ) {
    let currentObject = object;

    while (
      currentObject &&
      currentObject !== scene
    ) {
      if (
        currentObject.userData
          .selectable
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

    if (
      intersections.length === 0
    ) {
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

    renderer.domElement
      .removeEventListener(
        "pointerdown",
        handlePointerDown
      );

    scene.remove(selectionBox);

    selectionBox.geometry.dispose();
    selectionBox.material.dispose();
  }

  window.addEventListener(
    "keydown",
    handleKeyDown
  );

  window.addEventListener(
    "keyup",
    handleKeyUp
  );

  renderer.domElement
    .addEventListener(
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