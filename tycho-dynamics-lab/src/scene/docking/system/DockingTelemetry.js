import * as THREE from "three";

import {
  DOCKING_RULES,
} from "./DockingConfig.js";

export function createDockingTelemetry({
  spacecraft,
  station,
}) {
  const spacecraftPosition =
    new THREE.Vector3();

  const stationBodyPosition =
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

  const spacecraftDockingOrientation =
    new THREE.Quaternion();

  const stationDockingOrientation =
    new THREE.Quaternion();

  const spacecraftForward =
    new THREE.Vector3();

  const stationApproachDirection =
    new THREE.Vector3();

  const relativePosition =
    new THREE.Vector3();

  const lateralPosition =
    new THREE.Vector3();

  const stationLocalError =
    new THREE.Vector3();

  const stationLocalVelocity =
    new THREE.Vector3();

  const inverseStationOrientation =
    new THREE.Quaternion();

  const metrics = {
    speed: 0,

    closingSpeed: 0,
    lateralSpeed: 0,

    horizontalSpeed: 0,
    verticalSpeed: 0,

    angularSpeed: 0,
    alignmentAngle: 0,

    horizontalOffset: 0,
    verticalOffset: 0,
    lateralOffset: 0,

    axialDistance: 0,
    distance: 0,

    timeToContact: null,

    checks: {
      speed: true,
      closingSpeed: true,
      lateralSpeed: true,
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

    spacecraftDockingOrientation,
    stationDockingOrientation,

    spacecraftForward,
    stationApproachDirection,
  };

  function copyVector(
    target,
    source
  ) {
    target.set(
      source.x,
      source.y,
      source.z
    );
  }

  function copyQuaternion(
    target,
    source
  ) {
    target.set(
      source.x,
      source.y,
      source.z,
      source.w
    );
  }

  function updatePhysicsData() {
    copyVector(
      spacecraftPosition,
      spacecraft.rigidBody
        .translation()
    );

    copyQuaternion(
      spacecraftOrientation,
      spacecraft.rigidBody
        .rotation()
    );

    copyVector(
      linearVelocity,
      spacecraft.rigidBody.linvel()
    );

    copyVector(
      angularVelocity,
      spacecraft.rigidBody.angvel()
    );

    copyVector(
      stationBodyPosition,
      station.rigidBody
        .translation()
    );

    copyQuaternion(
      stationOrientation,
      station.rigidBody.rotation()
    );

    spacecraftDockingPosition
      .copy(
        spacecraft
          .dockingPort.position
      )
      .applyQuaternion(
        spacecraftOrientation
      )
      .add(spacecraftPosition);

    spacecraftDockingOrientation
      .copy(
        spacecraftOrientation
      )
      .multiply(
        spacecraft
          .dockingPort.quaternion
      );

    stationPosition
      .copy(
        station.dockingPort.position
      )
      .applyQuaternion(
        stationOrientation
      )
      .add(stationBodyPosition);

    stationDockingOrientation
      .copy(stationOrientation)
      .multiply(
        station
          .dockingPort.quaternion
      );
  }

  function updateDirections() {
    spacecraftForward
      .set(0, 0, -1)
      .applyQuaternion(
        spacecraftDockingOrientation
      )
      .normalize();

    stationApproachDirection
      .set(0, 0, -1)
      .applyQuaternion(
        stationDockingOrientation
      )
      .normalize();
  }

  function updatePositionMetrics() {
    relativePosition
      .copy(stationPosition)
      .sub(
        spacecraftDockingPosition
      );

    metrics.distance =
      relativePosition.length();

    const axialDistance =
      relativePosition.dot(
        stationApproachDirection
      );

    metrics.axialDistance =
      Math.max(
        0,
        axialDistance
      );

    lateralPosition
      .copy(relativePosition)
      .addScaledVector(
        stationApproachDirection,
        -axialDistance
      );

    metrics.lateralOffset =
      lateralPosition.length();

    inverseStationOrientation
      .copy(
        stationDockingOrientation
      )
      .invert();

    stationLocalError
      .copy(
        spacecraftDockingPosition
      )
      .sub(stationPosition)
      .applyQuaternion(
        inverseStationOrientation
      );

    metrics.horizontalOffset =
      stationLocalError.x;

    metrics.verticalOffset =
      stationLocalError.y;
  }

  function updateVelocityMetrics() {
    metrics.speed =
      linearVelocity.length();

    metrics.closingSpeed =
      linearVelocity.dot(
        stationApproachDirection
      );

    /*
     * Convert velocity from world coordinates
     * into Gateway docking-port coordinates.
     */
    stationLocalVelocity
      .copy(linearVelocity)
      .applyQuaternion(
        inverseStationOrientation
      );

    metrics.horizontalSpeed =
      stationLocalVelocity.x;

    metrics.verticalSpeed =
      stationLocalVelocity.y;

    metrics.lateralSpeed =
      Math.hypot(
        metrics.horizontalSpeed,
        metrics.verticalSpeed
      );

    metrics.angularSpeed =
      angularVelocity.length();

    if (
      metrics.closingSpeed > 0.001 &&
      metrics.axialDistance > 0
    ) {
      metrics.timeToContact =
        metrics.axialDistance /
        metrics.closingSpeed;
    } else {
      metrics.timeToContact =
        null;
    }
  }

  function updateAlignmentMetric() {
    metrics.alignmentAngle =
      THREE.MathUtils.radToDeg(
        spacecraftForward.angleTo(
          stationApproachDirection
        )
      );
  }

  function updateChecks() {
    metrics.checks.closingSpeed =
      metrics.closingSpeed >=
        -0.01 &&
      metrics.closingSpeed <=
        DOCKING_RULES
          .maximumClosingSpeed;

    metrics.checks.lateralSpeed =
      metrics.lateralSpeed <=
        DOCKING_RULES
          .maximumLateralSpeed;

    metrics.checks.speed =
      metrics.checks.closingSpeed &&
      metrics.checks.lateralSpeed;

    metrics.checks.angularSpeed =
      metrics.angularSpeed <=
        DOCKING_RULES
          .maximumAngularSpeed;

    metrics.checks.alignment =
      metrics.alignmentAngle <=
        THREE.MathUtils.radToDeg(
          DOCKING_RULES
            .maximumAlignmentAngle
        );

    metrics.checks.lateralOffset =
      metrics.lateralOffset <=
        DOCKING_RULES
          .maximumLateralOffset;

    metrics.checks.distance =
      metrics.distance <=
        DOCKING_RULES
          .maximumCaptureDistance;
  }

  function updateMetrics() {
    updatePhysicsData();
    updateDirections();

    updatePositionMetrics();
    updateVelocityMetrics();
    updateAlignmentMetric();
    updateChecks();

    return metrics;
  }

  return {
    data,
    metrics,
    updatePhysicsData,
    updateMetrics,
  };
}