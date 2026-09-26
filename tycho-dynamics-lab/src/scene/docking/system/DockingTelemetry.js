import * as THREE from "three";

import {
  DOCKING_RULES,
  SPACECRAFT_DOCKING_POINT,
} from "./DockingConfig";

export function createDockingTelemetry({
  spacecraft,
  station,
}) {
  const spacecraftPosition =
    new THREE.Vector3();

  const spacecraftDockingPosition =
    new THREE.Vector3();

  const stationPosition =
    new THREE.Vector3();

  const linearVelocity =
    new THREE.Vector3();

  const angularVelocity =
    new THREE.Vector3();

  const spacecraftOrientation =
    new THREE.Quaternion();

  const stationOrientation =
    new THREE.Quaternion();

  const spacecraftForward =
    new THREE.Vector3();

  const stationForward =
    new THREE.Vector3();

  const metrics = {
    speed: 0,
    angularSpeed: 0,
    alignmentAngle: 0,
    lateralOffset: 0,
    distance: 0,

    checks: {
      speed: true,
      angularSpeed: true,
      alignment: true,
      lateralOffset: true,
      distance: true,
    },
  };

  const data = {
    spacecraftPosition,
    spacecraftDockingPosition,
    stationPosition,
    linearVelocity,
    angularVelocity,
    spacecraftOrientation,
    stationOrientation,
  };

  function updatePhysicsData() {
    const position =
      spacecraft.rigidBody.translation();

    const rotation =
      spacecraft.rigidBody.rotation();

    const linvel =
      spacecraft.rigidBody.linvel();

    const angvel =
      spacecraft.rigidBody.angvel();

    const stationTranslation =
      station.rigidBody.translation();

    const stationRotation =
      station.rigidBody.rotation();

    spacecraftPosition.set(
      position.x,
      position.y,
      position.z
    );

    spacecraftOrientation.set(
      rotation.x,
      rotation.y,
      rotation.z,
      rotation.w
    );

    stationPosition.set(
      stationTranslation.x,
      stationTranslation.y,
      stationTranslation.z
    );

    stationOrientation.set(
      stationRotation.x,
      stationRotation.y,
      stationRotation.z,
      stationRotation.w
    );

    linearVelocity.set(
      linvel.x,
      linvel.y,
      linvel.z
    );

    angularVelocity.set(
      angvel.x,
      angvel.y,
      angvel.z
    );

    /*
     * Convert the local nose position into
     * a world-space docking position.
     */
    spacecraftDockingPosition
      .set(
        SPACECRAFT_DOCKING_POINT.x,
        SPACECRAFT_DOCKING_POINT.y,
        SPACECRAFT_DOCKING_POINT.z
      )
      .applyQuaternion(
        spacecraftOrientation
      )
      .add(spacecraftPosition);
  }

  function updateMetrics() {
    updatePhysicsData();

    spacecraftForward
      .set(0, 0, -1)
      .applyQuaternion(
        spacecraftOrientation
      )
      .normalize();

    stationForward
      .set(0, 0, -1)
      .applyQuaternion(
        stationOrientation
      )
      .normalize();

    metrics.speed =
      linearVelocity.length();

    metrics.angularSpeed =
      angularVelocity.length();

    metrics.alignmentAngle =
      THREE.MathUtils.radToDeg(
        spacecraftForward.angleTo(
          stationForward
        )
      );

    const offsetX =
      spacecraftDockingPosition.x -
      stationPosition.x;

    const offsetY =
      spacecraftDockingPosition.y -
      stationPosition.y;

    metrics.lateralOffset = Math.sqrt(
      offsetX * offsetX +
        offsetY * offsetY
    );

    metrics.distance =
      spacecraftDockingPosition.distanceTo(
        stationPosition
      );

    metrics.checks.speed =
      metrics.speed <=
      DOCKING_RULES.maximumSpeed;

    metrics.checks.angularSpeed =
      metrics.angularSpeed <=
      DOCKING_RULES.maximumAngularSpeed;

    metrics.checks.alignment =
      metrics.alignmentAngle <=
      THREE.MathUtils.radToDeg(
        DOCKING_RULES.maximumAlignmentAngle
      );

    metrics.checks.lateralOffset =
      metrics.lateralOffset <=
      DOCKING_RULES.maximumLateralOffset;

    metrics.checks.distance =
      metrics.distance <=
      DOCKING_RULES.maximumCaptureDistance;

    return metrics;
  }

  return {
    data,
    metrics,
    updatePhysicsData,
    updateMetrics,
  };
}