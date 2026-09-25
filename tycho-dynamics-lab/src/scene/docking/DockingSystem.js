import * as THREE from "three";

export const DockingState = {
  APPROACH: "approach",
  IN_RANGE: "in-range",
  DOCKED: "docked",
  CRASHED: "crashed",
};

const DOCKING_LIMITS = {
  maximumSpeed: 0.25,
  maximumAlignmentAngle: 7,
  maximumLateralOffset: 0.35,
  maximumAngularSpeed: 0.15,
  crashForce: 20000,
};

export function createDockingSystem({
  eventQueue,
  spacecraft,
  station,
}) {
  let state = DockingState.APPROACH;
  let insideSensor = false;
  let lastImpactForce = 0;

  const shipForward =
    new THREE.Vector3();

  const desiredDockingDirection =
    new THREE.Vector3(0, 0, -1);

  const orientation =
    new THREE.Quaternion();

  const metrics = {
    insideSensor: false,
    speed: 0,
    angularSpeed: 0,
    lateralOffset: 0,
    alignmentAngle: 0,
    impactForce: 0,

    speedValid: false,
    angularSpeedValid: false,
    offsetValid: false,
    alignmentValid: false,
    allValid: false,
  };

  const spacecraftColliderHandle =
    spacecraft.collider.handle;

  const sensorColliderHandle =
    station.dockingSensor.handle;

  const frameColliderHandles = new Set(
    station.frameColliders.map(
      (collider) => collider.handle
    )
  );

  function pairContains(
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

  function isSpacecraftAndFrame(
    handle1,
    handle2
  ) {
    if (
      handle1 ===
      spacecraftColliderHandle
    ) {
      return frameColliderHandles.has(
        handle2
      );
    }

    if (
      handle2 ===
      spacecraftColliderHandle
    ) {
      return frameColliderHandles.has(
        handle1
      );
    }

    return false;
  }

  function changeState(nextState) {
    if (state === nextState) {
      return;
    }

    state = nextState;
    station.setStatus(state);

    console.log(
      "Docking state:",
      state
    );
  }

  function processCollisionEvents() {
    eventQueue.drainCollisionEvents(
      (
        handle1,
        handle2,
        started
      ) => {
        const isSensorPair =
          pairContains(
            handle1,
            handle2,
            spacecraftColliderHandle,
            sensorColliderHandle
          );

        if (!isSensorPair) {
          return;
        }

        insideSensor = started;

        if (
          !started &&
          state !== DockingState.DOCKED &&
          state !== DockingState.CRASHED
        ) {
          changeState(
            DockingState.APPROACH
          );
        }
      }
    );
  }

  function processContactForceEvents() {
    eventQueue.drainContactForceEvents(
      (event) => {
        const handle1 =
          event.collider1();

        const handle2 =
          event.collider2();

        if (
          !isSpacecraftAndFrame(
            handle1,
            handle2
          )
        ) {
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
          DOCKING_LIMITS.crashForce
        ) {
          changeState(
            DockingState.CRASHED
          );

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

  function calculateMetrics() {
    const linearVelocity =
      spacecraft.rigidBody.linvel();

    const angularVelocity =
      spacecraft.rigidBody.angvel();

    const shipPosition =
      spacecraft.rigidBody.translation();

    const stationPosition =
      station.rigidBody.translation();

    metrics.speed = Math.sqrt(
      linearVelocity.x ** 2 +
        linearVelocity.y ** 2 +
        linearVelocity.z ** 2
    );

    metrics.angularSpeed = Math.sqrt(
      angularVelocity.x ** 2 +
        angularVelocity.y ** 2 +
        angularVelocity.z ** 2
    );

    const offsetX =
      shipPosition.x -
      stationPosition.x;

    const offsetY =
      shipPosition.y -
      stationPosition.y;

    metrics.lateralOffset =
      Math.sqrt(
        offsetX ** 2 +
          offsetY ** 2
      );

    const rotation =
      spacecraft.rigidBody.rotation();

    orientation.set(
      rotation.x,
      rotation.y,
      rotation.z,
      rotation.w
    );

    shipForward
      .set(0, 0, -1)
      .applyQuaternion(orientation)
      .normalize();

    metrics.alignmentAngle =
      THREE.MathUtils.radToDeg(
        shipForward.angleTo(
          desiredDockingDirection
        )
      );

    metrics.insideSensor =
      insideSensor;

    metrics.impactForce =
      lastImpactForce;

    metrics.speedValid =
      metrics.speed <=
      DOCKING_LIMITS.maximumSpeed;

    metrics.angularSpeedValid =
      metrics.angularSpeed <=
      DOCKING_LIMITS
        .maximumAngularSpeed;

    metrics.offsetValid =
      metrics.lateralOffset <=
      DOCKING_LIMITS
        .maximumLateralOffset;

    metrics.alignmentValid =
      metrics.alignmentAngle <=
      DOCKING_LIMITS
        .maximumAlignmentAngle;

    metrics.allValid =
      metrics.insideSensor &&
      metrics.speedValid &&
      metrics.angularSpeedValid &&
      metrics.offsetValid &&
      metrics.alignmentValid;
  }

  function update() {
    calculateMetrics();

    if (
      state === DockingState.DOCKED ||
      state === DockingState.CRASHED
    ) {
      return;
    }

    if (!insideSensor) {
      changeState(
        DockingState.APPROACH
      );

      return;
    }

    if (metrics.allValid) {
      changeState(
        DockingState.DOCKED
      );

      spacecraft.stopLinearMotion();
      spacecraft.stopAngularMotion();

      return;
    }

    changeState(
      DockingState.IN_RANGE
    );
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

  function getMetrics() {
    return {
      ...metrics,
    };
  }

  function reset() {
    insideSensor = false;
    lastImpactForce = 0;

    Object.assign(metrics, {
      insideSensor: false,
      speed: 0,
      angularSpeed: 0,
      lateralOffset: 0,
      alignmentAngle: 0,
      impactForce: 0,
      speedValid: false,
      angularSpeedValid: false,
      offsetValid: false,
      alignmentValid: false,
      allValid: false,
    });

    changeState(
      DockingState.APPROACH
    );

    station.setStatus(
      DockingState.APPROACH
    );
  }

  station.setStatus(
    DockingState.APPROACH
  );

  return {
    processEvents,
    update,
    canControl,
    getState,
    getMetrics,
    reset,
  };
}