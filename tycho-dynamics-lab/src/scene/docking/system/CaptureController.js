import * as THREE from "three";

export function createCaptureController({
  spacecraft,
  telemetry,
  getSettings,
}) {
  const positionError =
    new THREE.Vector3();

  const captureForce =
    new THREE.Vector3();

  const dockingPortOffset =
    new THREE.Vector3();

  const rotationalPointVelocity =
    new THREE.Vector3();

  const dockingPointVelocity =
    new THREE.Vector3();

  const inverseOrientation =
    new THREE.Quaternion();

  const rotationError =
    new THREE.Quaternion();

  const rotationAxis =
    new THREE.Vector3();

  const captureTorque =
    new THREE.Vector3();

  function applyPositionCorrection() {
    const settings =
      getSettings();

    const {
      spacecraftPosition,
      spacecraftDockingPosition,
      stationPosition,
      linearVelocity,
      angularVelocity,
    } = telemetry.data;

    positionError
      .copy(stationPosition)
      .sub(
        spacecraftDockingPosition
      );

    dockingPortOffset
      .copy(
        spacecraftDockingPosition
      )
      .sub(spacecraftPosition);

    rotationalPointVelocity
      .crossVectors(
        angularVelocity,
        dockingPortOffset
      );

    dockingPointVelocity
      .copy(linearVelocity)
      .add(
        rotationalPointVelocity
      );

    captureForce
      .copy(positionError)
      .multiplyScalar(
        settings.positionStrength
      )
      .addScaledVector(
        dockingPointVelocity,
        -settings.positionDamping
      );

    captureForce.clampLength(
      0,
      settings.maximumForce
    );

    spacecraft.rigidBody
      .addForceAtPoint(
        captureForce,
        spacecraftDockingPosition,
        true
      );
  }

  function applyRotationCorrection() {
    const settings =
      getSettings();

    const {
      spacecraftDockingOrientation,
      stationDockingOrientation,
      angularVelocity,
    } = telemetry.data;

    inverseOrientation
      .copy(
        spacecraftDockingOrientation
      )
      .invert();

    rotationError
      .copy(
        stationDockingOrientation
      )
      .multiply(
        inverseOrientation
      )
      .normalize();

    if (rotationError.w < 0) {
      rotationError.x *= -1;
      rotationError.y *= -1;
      rotationError.z *= -1;
      rotationError.w *= -1;
    }

    const clampedW =
      THREE.MathUtils.clamp(
        rotationError.w,
        -1,
        1
      );

    const angle =
      2 * Math.acos(clampedW);

    const divisor = Math.sqrt(
      Math.max(
        0,
        1 - clampedW * clampedW
      )
    );

    if (divisor < 0.0001) {
      rotationAxis.set(0, 0, 0);
    } else {
      rotationAxis.set(
        rotationError.x / divisor,
        rotationError.y / divisor,
        rotationError.z / divisor
      );
    }

    captureTorque
      .copy(rotationAxis)
      .multiplyScalar(
        angle *
          settings.rotationStrength
      )
      .addScaledVector(
        angularVelocity,
        -settings.rotationDamping
      );

    captureTorque.clampLength(
      0,
      settings.maximumTorque
    );

    spacecraft.rigidBody.addTorque(
      captureTorque,
      true
    );
  }

  function apply() {
    telemetry.updatePhysicsData();

    applyPositionCorrection();
    applyRotationCorrection();
  }

  return {
    apply,
  };
}