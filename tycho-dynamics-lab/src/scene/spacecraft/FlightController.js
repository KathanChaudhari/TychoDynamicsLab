import * as THREE from "three";

const THRUST_FORCE = 250;
const TORQUE_FORCE = 600;

export function createFlightController(
  rigidBody
) {
  const localForce =
    new THREE.Vector3();

  const forceDirection =
    new THREE.Vector3();

  const worldForce =
    new THREE.Vector3();

  const localTorque =
    new THREE.Vector3();

  const torqueDirection =
    new THREE.Vector3();

  const worldTorque =
    new THREE.Vector3();

  const orientation =
    new THREE.Quaternion();

  const controlState = {
    translation:
      new THREE.Vector3(),

    rotation:
      new THREE.Vector3(),

    thrustScale: 1,
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

    /*
     * Keep raw axis values so simultaneous
     * thrusters consume additional fuel.
     */
    controlState.translation.copy(
      localForce
    );
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

    controlState.rotation.copy(
      localTorque
    );
  }

  function setInput(pressedKeys) {
    readTranslationInput(
      pressedKeys
    );

    readRotationInput(
      pressedKeys
    );
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

  function applyTranslationForce(
    thrustScale
  ) {
    if (
      localForce.lengthSq() === 0 ||
      thrustScale <= 0
    ) {
      return;
    }

    forceDirection
      .copy(localForce)
      .normalize()
      .multiplyScalar(
        THRUST_FORCE *
          thrustScale
      );

    worldForce
      .copy(forceDirection)
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

  function applyRotationTorque(
    thrustScale
  ) {
    if (
      localTorque.lengthSq() === 0 ||
      thrustScale <= 0
    ) {
      return;
    }

    torqueDirection
      .copy(localTorque)
      .normalize()
      .multiplyScalar(
        TORQUE_FORCE *
          thrustScale
      );

    worldTorque
      .copy(torqueDirection)
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

  function applyCurrentControls(
    thrustScale = 1
  ) {
    rigidBody.resetForces(true);
    rigidBody.resetTorques(true);

    controlState.thrustScale =
      thrustScale;

    updateOrientation();

    applyTranslationForce(
      thrustScale
    );

    applyRotationTorque(
      thrustScale
    );
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

    controlState.thrustScale = 1;
  }

  return {
    controlState,
    setInput,
    applyCurrentControls,
    clearControls,
  };
}