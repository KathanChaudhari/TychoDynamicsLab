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

  const lateralVelocity =
    new THREE.Vector3();

  const closingVelocityVector =
    new THREE.Vector3();

  const stationLocalError =
    new THREE.Vector3();

  const inverseStationOrientation =
    new THREE.Quaternion();

  const metrics = {
    speed: 0,

    closingSpeed: 0,
    lateralSpeed: 0,

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

    stationBodyPosition.set(
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
     * Convert Orion's local docking-port
     * position into world coordinates.
     */
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

    /*
     * Convert Gateway's local docking-port
     * position into world coordinates.
     */
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
    /*
     * Orion flies toward its local -Z axis.
     */
    spacecraftForward
      .set(0, 0, -1)
      .applyQuaternion(
        spacecraftDockingOrientation
      )
      .normalize();

    /*
     * This points from the approach area into
     * the Gateway docking port.
     */
    stationApproachDirection
      .set(0, 0, -1)
      .applyQuaternion(
        stationDockingOrientation
      )
      .normalize();
  }

  function updatePositionMetrics() {
    /*
     * Vector from Orion's docking port to
     * Gateway's docking port.
     */
    relativePosition
      .copy(stationPosition)
      .sub(
        spacecraftDockingPosition
      );

    metrics.distance =
      relativePosition.length();

    /*
     * Distance along the docking approach axis.
     */
    metrics.axialDistance =
      Math.max(
        0,
        relativePosition.dot(
          stationApproachDirection
        )
      );

    lateralPosition
      .copy(relativePosition)
      .addScaledVector(
        stationApproachDirection,
        -relativePosition.dot(
          stationApproachDirection
        )
      );

    metrics.lateralOffset =
      lateralPosition.length();

    /*
     * Convert the position error into Gateway's
     * local coordinate system.
     */
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

    /*
     * Dot product gives the portion of velocity
     * travelling along the docking axis.
     *
     * Positive means moving toward Gateway.
     * Negative means moving away.
     */
    metrics.closingSpeed =
      linearVelocity.dot(
        stationApproachDirection
      );

    closingVelocityVector
      .copy(
        stationApproachDirection
      )
      .multiplyScalar(
        metrics.closingSpeed
      );

    lateralVelocity
      .copy(linearVelocity)
      .sub(
        closingVelocityVector
      );

    metrics.lateralSpeed =
      lateralVelocity.length();

    metrics.angularSpeed =
      angularVelocity.length();

    if (
      metrics.closingSpeed >
        0.001 &&
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

    /*
     * Legacy combined speed check.
     */
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