import * as THREE from "three";

export const CameraMode =
  Object.freeze({
    OVERVIEW: "overview",
    CHASE: "chase",
    DOCKING: "docking",
    CINEMATIC: "cinematic",
  });

const OVERVIEW_POSITION =
  new THREE.Vector3(
    7,
    5,
    10
  );

const OVERVIEW_TARGET =
  new THREE.Vector3(
    0,
    0,
    -3
  );

const CHASE_OFFSET =
  new THREE.Vector3(
    4,
    2.2,
    6
  );

const CHASE_TARGET_OFFSET =
  new THREE.Vector3(
    0,
    0.25,
    -2.5
  );

const DOCKING_CAMERA_OFFSET =
  new THREE.Vector3(
    0,
    0.08,
    -2.25
  );

const DOCKING_TARGET_OFFSET =
  new THREE.Vector3(
    0,
    0,
    -12
  );

export function createCameraController({
  camera,
  controls,
  spacecraft,
  station,
}) {
  let mode =
    CameraMode.OVERVIEW;

  let overviewTransition =
    false;

  let cinematicTime = 0;

  const desiredPosition =
    new THREE.Vector3();

  const desiredTarget =
    new THREE.Vector3();

  const currentTarget =
    controls.target.clone();

  const spacecraftPosition =
    new THREE.Vector3();

  const spacecraftRotation =
    new THREE.Quaternion();

  const stationPosition =
    new THREE.Vector3();

  const cinematicCenter =
    new THREE.Vector3();

  function getSpacecraftTransform() {
    spacecraft.group
      .updateWorldMatrix(
        true,
        false
      );

    spacecraft.group
      .getWorldPosition(
        spacecraftPosition
      );

    spacecraft.group
      .getWorldQuaternion(
        spacecraftRotation
      );
  }

  function getStationPosition() {
    station.group
      .updateWorldMatrix(
        true,
        false
      );

    station.group
      .getWorldPosition(
        stationPosition
      );
  }

  function calculateOverviewView() {
    desiredPosition.copy(
      OVERVIEW_POSITION
    );

    desiredTarget.copy(
      OVERVIEW_TARGET
    );
  }

  function calculateChaseView() {
    getSpacecraftTransform();

    desiredPosition
      .copy(CHASE_OFFSET)
      .applyQuaternion(
        spacecraftRotation
      )
      .add(spacecraftPosition);

    desiredTarget
      .copy(
        CHASE_TARGET_OFFSET
      )
      .applyQuaternion(
        spacecraftRotation
      )
      .add(spacecraftPosition);
  }

  function calculateDockingView() {
    getSpacecraftTransform();

    /*
     * Place the camera just ahead of Orion's
     * docking port so the GLB does not block it.
     */
    desiredPosition
      .copy(
        DOCKING_CAMERA_OFFSET
      )
      .applyQuaternion(
        spacecraftRotation
      )
      .add(spacecraftPosition);

    desiredTarget
      .copy(
        DOCKING_TARGET_OFFSET
      )
      .applyQuaternion(
        spacecraftRotation
      )
      .add(spacecraftPosition);
  }

  function calculateCinematicView(
    deltaTime
  ) {
    cinematicTime += deltaTime;

    getSpacecraftTransform();
    getStationPosition();

    cinematicCenter
      .copy(spacecraftPosition)
      .lerp(
        stationPosition,
        0.5
      );

    const radius = 9;
    const angle =
      cinematicTime * 0.22;

    desiredPosition.set(
      cinematicCenter.x +
        Math.cos(angle) *
          radius,

      cinematicCenter.y +
        3.5 +
        Math.sin(
          cinematicTime * 0.4
        ),

      cinematicCenter.z +
        Math.sin(angle) *
          radius
    );

    desiredTarget.copy(
      cinematicCenter
    );
  }

  function setMode(nextMode) {
    const validMode =
      Object.values(
        CameraMode
      ).includes(nextMode);

    if (!validMode) {
      console.warn(
        `Unknown camera mode: ${nextMode}`
      );

      return;
    }

    if (mode === nextMode) {
      return;
    }

    mode = nextMode;

    currentTarget.copy(
      controls.target
    );

    cinematicTime = 0;

    if (
      mode ===
      CameraMode.OVERVIEW
    ) {
      /*
       * OrbitControls remains disabled until
       * the camera reaches the overview view.
       */
      controls.enabled = false;
      overviewTransition = true;
    } else {
      controls.enabled = false;
      overviewTransition = false;
    }
  }

  function updateOverview(
    deltaTime
  ) {
    if (!overviewTransition) {
      controls.enabled = true;
      controls.update();

      currentTarget.copy(
        controls.target
      );

      return;
    }

    calculateOverviewView();

    const positionAlpha =
      1 -
      Math.exp(
        -4.5 * deltaTime
      );

    const targetAlpha =
      1 -
      Math.exp(
        -5.5 * deltaTime
      );

    camera.position.lerp(
      desiredPosition,
      positionAlpha
    );

    currentTarget.lerp(
      desiredTarget,
      targetAlpha
    );

    camera.lookAt(
      currentTarget
    );

    const positionReady =
      camera.position
        .distanceTo(
          desiredPosition
        ) < 0.03;

    const targetReady =
      currentTarget
        .distanceTo(
          desiredTarget
        ) < 0.03;

    if (
      positionReady &&
      targetReady
    ) {
      camera.position.copy(
        desiredPosition
      );

      currentTarget.copy(
        desiredTarget
      );

      controls.target.copy(
        desiredTarget
      );

      controls.enabled = true;
      overviewTransition = false;

      controls.update();
    }
  }

  function updateFollowCamera(
    deltaTime
  ) {
    if (
      mode ===
      CameraMode.CHASE
    ) {
      calculateChaseView();
    }

    if (
      mode ===
      CameraMode.DOCKING
    ) {
      calculateDockingView();
    }

    if (
      mode ===
      CameraMode.CINEMATIC
    ) {
      calculateCinematicView(
        deltaTime
      );
    }

    const positionAlpha =
      1 -
      Math.exp(
        -5 * deltaTime
      );

    const targetAlpha =
      1 -
      Math.exp(
        -7 * deltaTime
      );

    camera.position.lerp(
      desiredPosition,
      positionAlpha
    );

    currentTarget.lerp(
      desiredTarget,
      targetAlpha
    );

    camera.lookAt(
      currentTarget
    );
  }

  function update(deltaTime) {
    if (
      mode ===
      CameraMode.OVERVIEW
    ) {
      updateOverview(deltaTime);
      return;
    }

    updateFollowCamera(
      deltaTime
    );
  }

  function getMode() {
    return mode;
  }

  function dispose() {
    controls.enabled = true;
  }

  return {
    setMode,
    getMode,
    update,
    dispose,
  };
}