import * as THREE from "three";

import {
  CAPTURE_SETTINGS,
} from "./DockingConfig.js";

export function createCaptureController({
  spacecraft,
  telemetry,
}) {
  /*
   * Translation controller vectors.
   */
  const positionError =
    new THREE.Vector3();

  const captureForce =
    new THREE.Vector3();

  /*
   * Vector from the spacecraft's center of mass
   * to its docking port.
   */
  const dockingPortOffset =
    new THREE.Vector3();

  /*
   * Linear velocity caused at the docking port
   * by the spacecraft's angular velocity.
   *
   * Formula:
   *
   * point velocity = linear velocity + ω × r
   */
  const rotationalPointVelocity =
    new THREE.Vector3();

  const dockingPointVelocity =
    new THREE.Vector3();

  /*
   * Rotation-controller objects.
   */
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
      spacecraftPosition,
      spacecraftDockingPosition,
      stationPosition,
      linearVelocity,
      angularVelocity,
    } = telemetry.data;

    /*
     * Calculate the positional difference between
     * the two docking-port anchors.
     */
    positionError
      .copy(stationPosition)
      .sub(
        spacecraftDockingPosition
      );

    /*
     * Calculate the world-space offset between the
     * spacecraft center and its docking port.
     */
    dockingPortOffset
      .copy(
        spacecraftDockingPosition
      )
      .sub(spacecraftPosition);

    /*
     * Rotating around the center gives the docking
     * port an additional linear velocity.
     *
     * THREE.Vector3.crossVectors(a, b):
     *
     * ω × r
     */
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

    /*
     * Proportional-derivative controller:
     *
     * force =
     *   position error × strength
     *   - port velocity × damping
     */
    captureForce
      .copy(positionError)
      .multiplyScalar(
        CAPTURE_SETTINGS
          .positionStrength
      )
      .addScaledVector(
        dockingPointVelocity,
        -CAPTURE_SETTINGS
          .positionDamping
      );

    captureForce.clampLength(
      0,
      CAPTURE_SETTINGS.maximumForce
    );

    /*
     * Apply the force at the docking port rather
     * than at the center of mass.
     *
     * This produces physically appropriate torque
     * when the port is laterally offset.
     */
    spacecraft.rigidBody
      .addForceAtPoint(
        {
          x: captureForce.x,
          y: captureForce.y,
          z: captureForce.z,
        },
        {
          x:
            spacecraftDockingPosition.x,

          y:
            spacecraftDockingPosition.y,

          z:
            spacecraftDockingPosition.z,
        },
        true
      );
  }

  function applyRotationCorrection() {
    const {
      spacecraftDockingOrientation,
      stationDockingOrientation,
      angularVelocity,
    } = telemetry.data;

    /*
     * Find the rotation required to move the
     * spacecraft-port orientation onto the
     * station-port orientation:
     *
     * error =
     * target × inverse(current)
     */
    inverseSpacecraftOrientation
      .copy(
        spacecraftDockingOrientation
      )
      .invert();

    rotationErrorQuaternion
      .copy(
        stationDockingOrientation
      )
      .multiply(
        inverseSpacecraftOrientation
      )
      .normalize();

    /*
     * q and -q represent the same rotation.
     * Select the shorter rotational path.
     */
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
        1 -
          clampedW *
            clampedW
      )
    );

    if (divisor < 0.0001) {
      rotationErrorAxis.set(
        0,
        0,
        0
      );
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
     * torque =
     *   rotation error × strength
     *   - angular velocity × damping
     */
    captureTorque
      .copy(rotationErrorAxis)
      .multiplyScalar(
        angle *
          CAPTURE_SETTINGS
            .rotationStrength
      )
      .addScaledVector(
        angularVelocity,
        -CAPTURE_SETTINGS
          .rotationDamping
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
    /*
     * Refresh positions, orientations and
     * velocities before calculating forces.
     */
    telemetry.updatePhysicsData();

    applyPositionCorrection();
    applyRotationCorrection();
  }

  return {
    apply,
  };
}