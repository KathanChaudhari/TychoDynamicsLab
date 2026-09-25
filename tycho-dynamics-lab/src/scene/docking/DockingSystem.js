import * as THREE from "three";

export const DockingState = Object.freeze({
  APPROACH: "approach",
  IN_RANGE: "in-range",
  DOCKED: "docked",
  CRASHED: "crashed",
});

const DOCKING_RULES = Object.freeze({
  maximumSpeed: 0.25,
  maximumAngularSpeed: 0.15,
  maximumAlignmentAngle:
    THREE.MathUtils.degToRad(7),
  maximumLateralOffset: 0.35,

  // Reduced while learning/testing.
  crashForce: 5000,
});

export function createDockingSystem({
  eventQueue,
  spacecraft,
  station,
}) {
  let state = DockingState.APPROACH;
  let insideSensor = false;
  let lastImpactForce = 0;

  const spacecraftHandle =
    spacecraft.collider.handle;

  const sensorHandle =
    station.dockingSensor.handle;

  const frameHandles = new Set(
    station.frameColliders.map(
      (collider) => collider.handle
    )
  );

  const spacecraftPosition =
    new THREE.Vector3();

  const stationPosition =
    new THREE.Vector3();

  const linearVelocity =
    new THREE.Vector3();

  const angularVelocity =
    new THREE.Vector3();

  const spacecraftForward =
    new THREE.Vector3();

  const expectedForward =
    new THREE.Vector3(0, 0, -1);

  const orientation =
    new THREE.Quaternion();

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
    },
  };

  function setState(nextState) {
    if (state === nextState) {
      return;
    }

    state = nextState;
    station.setStatus(nextState);
  }

  function containsPair(
    handle1,
    handle2,
    firstTarget,
    secondTarget
  ) {
    return (
      (handle1 === firstTarget &&
        handle2 === secondTarget) ||
      (handle1 === secondTarget &&
        handle2 === firstTarget)
    );
  }

  function processCollisionEvents() {
    eventQueue.drainCollisionEvents(
      (handle1, handle2, started) => {
        const isDockingSensorEvent =
          containsPair(
            handle1,
            handle2,
            spacecraftHandle,
            sensorHandle
          );

        if (isDockingSensorEvent) {
          insideSensor = started;
        }
      }
    );
  }

  function processContactForceEvents() {
    eventQueue.drainContactForceEvents(
      (event) => {
        const handle1 = event.collider1();
        const handle2 = event.collider2();

        const hitSpacecraft =
          handle1 === spacecraftHandle ||
          handle2 === spacecraftHandle;

        const hitStationFrame =
          frameHandles.has(handle1) ||
          frameHandles.has(handle2);

        if (!hitSpacecraft || !hitStationFrame) {
          return;
        }

        const impactForce =
          event.totalForceMagnitude();

        lastImpactForce = Math.max(
          lastImpactForce,
          impactForce
        );

        if (
          impactForce >=
          DOCKING_RULES.crashForce
        ) {
          setState(DockingState.CRASHED);

          spacecraft.stopLinearMotion();
          spacecraft.stopAngularMotion();
        }
      }
    );
  }

  function processEvents() {
    processCollisionEvents();
    processContactForceEvents();
  }

  function updateMetrics() {
    const position =
      spacecraft.rigidBody.translation();

    const rotation =
      spacecraft.rigidBody.rotation();

    const linvel =
      spacecraft.rigidBody.linvel();

    const angvel =
      spacecraft.rigidBody.angvel();

    spacecraftPosition.set(
      position.x,
      position.y,
      position.z
    );

    station.group.getWorldPosition(
      stationPosition
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

    orientation.set(
      rotation.x,
      rotation.y,
      rotation.z,
      rotation.w
    );

    spacecraftForward
      .set(0, 0, -1)
      .applyQuaternion(orientation)
      .normalize();

    metrics.speed =
      linearVelocity.length();

    metrics.angularSpeed =
      angularVelocity.length();

    metrics.alignmentAngle =
      THREE.MathUtils.radToDeg(
        spacecraftForward.angleTo(
          expectedForward
        )
      );

    const offsetX =
      spacecraftPosition.x -
      stationPosition.x;

    const offsetY =
      spacecraftPosition.y -
      stationPosition.y;

    metrics.lateralOffset = Math.sqrt(
      offsetX * offsetX +
      offsetY * offsetY
    );

    metrics.distance =
      spacecraftPosition.distanceTo(
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
  }

  function update() {
    updateMetrics();

    /*
     * CRASHED must persist until reset.
     * Otherwise IN_RANGE could overwrite it on
     * the next physics step.
     */
    if (state === DockingState.CRASHED) {
      return;
    }

    if (state === DockingState.DOCKED) {
      return;
    }

    if (!insideSensor) {
      setState(DockingState.APPROACH);
      return;
    }

    const validDocking =
      metrics.checks.speed &&
      metrics.checks.angularSpeed &&
      metrics.checks.alignment &&
      metrics.checks.lateralOffset;

    if (!validDocking) {
      setState(DockingState.IN_RANGE);
      return;
    }

    setState(DockingState.DOCKED);

    spacecraft.stopLinearMotion();
    spacecraft.stopAngularMotion();
  }

  function canControl() {
    return (
      state !== DockingState.DOCKED &&
      state !== DockingState.CRASHED
    );
  }

  function getState() {
    return state;
  }

  function getTelemetry() {
    return {
      state,
      insideSensor,

      speed: metrics.speed,
      angularSpeed: metrics.angularSpeed,
      alignmentAngle:
        metrics.alignmentAngle,
      lateralOffset:
        metrics.lateralOffset,
      distance: metrics.distance,
      impactForce: lastImpactForce,

      checks: {
        ...metrics.checks,
      },

      limits: {
        maximumSpeed:
          DOCKING_RULES.maximumSpeed,

        maximumAngularSpeed:
          DOCKING_RULES.maximumAngularSpeed,

        maximumAlignmentAngle:
          THREE.MathUtils.radToDeg(
            DOCKING_RULES.maximumAlignmentAngle
          ),

        maximumLateralOffset:
          DOCKING_RULES.maximumLateralOffset,

        crashForce:
          DOCKING_RULES.crashForce,
      },
    };
  }

  function reset() {
    state = DockingState.APPROACH;
    insideSensor = false;
    lastImpactForce = 0;

    station.setStatus(
      DockingState.APPROACH
    );

    updateMetrics();
  }

  updateMetrics();

  return {
    processEvents,
    update,
    canControl,
    getState,
    getTelemetry,
    reset,
  };
}