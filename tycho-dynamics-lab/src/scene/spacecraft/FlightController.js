import * as THREE from "three";

const THRUST_FORCE = 250;
const TORQUE_FORCE = 600;

export function createFlightController(
  rigidBody
) {
  const localForce =
    new THREE.Vector3();

  const worldForce =
    new THREE.Vector3();

  const localTorque =
    new THREE.Vector3();

  const worldTorque =
    new THREE.Vector3();

  const orientation =
    new THREE.Quaternion();

  /*
   * These vectors contain normalized input
   * values used by the visual thrusters.
   */
  const controlState = {
    translation:
      new THREE.Vector3(),

    rotation:
      new THREE.Vector3(),
  };

  function readTranslationInput(
    pressedKeys
  ) {
    localForce.set(0, 0, 0);

    if (pressedKeys.has("KeyW")) {
      localForce.z -= 1;
    }

    if (pressedKeys.has("KeyS")) {
      localForce.z += 1;
    }

    if (pressedKeys.has("KeyA")) {
      localForce.x -= 1;
    }

    if (pressedKeys.has("KeyD")) {
      localForce.x += 1;
    }

    if (pressedKeys.has("KeyR")) {
      localForce.y += 1;
    }

    if (pressedKeys.has("KeyF")) {
      localForce.y -= 1;
    }

    controlState.translation
      .copy(localForce);

    if (
      controlState.translation
        .lengthSq() > 1
    ) {
      controlState.translation
        .normalize();
    }
  }

  function readRotationInput(
    pressedKeys
  ) {
    localTorque.set(0, 0, 0);

    if (
      pressedKeys.has(
        "ArrowUp"
      )
    ) {
      localTorque.x += 1;
    }

    if (
      pressedKeys.has(
        "ArrowDown"
      )
    ) {
      localTorque.x -= 1;
    }

    if (
      pressedKeys.has(
        "ArrowLeft"
      )
    ) {
      localTorque.y += 1;
    }

    if (
      pressedKeys.has(
        "ArrowRight"
      )
    ) {
      localTorque.y -= 1;
    }

    if (pressedKeys.has("KeyQ")) {
      localTorque.z += 1;
    }

    if (pressedKeys.has("KeyE")) {
      localTorque.z -= 1;
    }

    controlState.rotation
      .copy(localTorque);

    if (
      controlState.rotation
        .lengthSq() > 1
    ) {
      controlState.rotation
        .normalize();
    }
  }

  function updateOrientation() {
    const rotation =
      rigidBody.rotation();

    orientation.set(
      rotation.x,
      rotation.y,
      rotation.z,
      rotation.w
    );
  }

  function applyTranslationForce() {
    if (
      localForce.lengthSq() === 0
    ) {
      return;
    }

    localForce
      .normalize()
      .multiplyScalar(
        THRUST_FORCE
      );

    worldForce
      .copy(localForce)
      .applyQuaternion(
        orientation
      );

    rigidBody.addForce(
      {
        x: worldForce.x,
        y: worldForce.y,
        z: worldForce.z,
      },
      true
    );
  }

  function applyRotationTorque() {
    if (
      localTorque.lengthSq() === 0
    ) {
      return;
    }

    localTorque
      .normalize()
      .multiplyScalar(
        TORQUE_FORCE
      );

    worldTorque
      .copy(localTorque)
      .applyQuaternion(
        orientation
      );

    rigidBody.addTorque(
      {
        x: worldTorque.x,
        y: worldTorque.y,
        z: worldTorque.z,
      },
      true
    );
  }

  function applyControls(
    pressedKeys
  ) {
    rigidBody.resetForces(true);
    rigidBody.resetTorques(true);

    readTranslationInput(
      pressedKeys
    );

    readRotationInput(
      pressedKeys
    );

    updateOrientation();

    applyTranslationForce();
    applyRotationTorque();
  }

  function clearControls() {
    localForce.set(0, 0, 0);
    localTorque.set(0, 0, 0);

    controlState.translation.set(
      0,
      0,
      0
    );

    controlState.rotation.set(
      0,
      0,
      0
    );
  }

  return {
    controlState,
    applyControls,
    clearControls,
  };
}