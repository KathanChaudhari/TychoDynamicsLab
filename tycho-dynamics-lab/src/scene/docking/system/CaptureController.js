import * as THREE from "three";

import {
  CAPTURE_SETTINGS,
} from "./DockingConfig";

export function createCaptureController({
  spacecraft,
  telemetry,
}) {
  const positionError =
    new THREE.Vector3();

  const captureForce =
    new THREE.Vector3();

  const inverseSpacecraftOrientation =
    new THREE.Quaternion();

  const rotationErrorQuaternion =
    new THREE.Quaternion();

  const rotationErrorAxis =
    new THREE.Vector3();

  const captureTorque =
    new THREE.Vector3();

  function applyPositionCorrection() {
    const {
      stationPosition,
      spacecraftDockingPosition,
      linearVelocity,
    } = telemetry.data;

  
    positionError
      .copy(stationPosition)
      .sub(spacecraftDockingPosition);

  
    captureForce
      .copy(positionError)
      .multiplyScalar(
        CAPTURE_SETTINGS.positionStrength
      )
      .addScaledVector(
        linearVelocity,
        -CAPTURE_SETTINGS.positionDamping
      );

    captureForce.clampLength(
      0,
      CAPTURE_SETTINGS.maximumForce
    );

    spacecraft.rigidBody.addForce(
      {
        x: captureForce.x,
        y: captureForce.y,
        z: captureForce.z,
      },
      true
    );
  }

  function applyRotationCorrection() {
    const {
      spacecraftOrientation,
      stationOrientation,
      angularVelocity,
    } = telemetry.data;

    inverseSpacecraftOrientation
      .copy(spacecraftOrientation)
      .invert();

  
    rotationErrorQuaternion
      .copy(stationOrientation)
      .multiply(
        inverseSpacecraftOrientation
      )
      .normalize();

    
    if (
      rotationErrorQuaternion.w < 0
    ) {
      rotationErrorQuaternion.x *= -1;
      rotationErrorQuaternion.y *= -1;
      rotationErrorQuaternion.z *= -1;
      rotationErrorQuaternion.w *= -1;
    }

    const clampedW =
      THREE.MathUtils.clamp(
        rotationErrorQuaternion.w,
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
      rotationErrorAxis.set(0, 0, 0);
    } else {
      rotationErrorAxis.set(
        rotationErrorQuaternion.x /
          divisor,
        rotationErrorQuaternion.y /
          divisor,
        rotationErrorQuaternion.z /
          divisor
      );
    }

    /*
     * Rotational PD controller:
     *
     * Torque =
     * angularError * strength
     * - angularVelocity * damping
     */
    captureTorque
      .copy(rotationErrorAxis)
      .multiplyScalar(
        angle *
          CAPTURE_SETTINGS.rotationStrength
      )
      .addScaledVector(
        angularVelocity,
        -CAPTURE_SETTINGS.rotationDamping
      );

    captureTorque.clampLength(
      0,
      CAPTURE_SETTINGS.maximumTorque
    );

    spacecraft.rigidBody.addTorque(
      {
        x: captureTorque.x,
        y: captureTorque.y,
        z: captureTorque.z,
      },
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