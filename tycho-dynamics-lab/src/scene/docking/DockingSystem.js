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
  maximumCaptureDistance: 0.8,
  crashForce: 5000,
});


const SPACECRAFT_DOCKING_POINT = {
  x: 0,
  y: 0,
  z: -2.7,
};

const IDENTITY_ROTATION = {
  x: 0,
  y: 0,
  z: 0,
  w: 1,
};

export function createDockingSystem({
  world,
  RAPIER,
  eventQueue,
  spacecraft,
  station,
}) {
  let state = DockingState.APPROACH;
  let insideSensor = false;
  let lastImpactForce = 0;
  let dockingJoint = null;

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

  const spacecraftDockingPosition =
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
      distance: true,
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

  function createDockingJoint() {
    if (dockingJoint) {
      return;
    }

    spacecraft.stopLinearMotion();
    spacecraft.stopAngularMotion();

  
    const jointData =
      RAPIER.JointData.fixed(
        {
          x: 0,
          y: 0,
          z: 0,
        },
        IDENTITY_ROTATION,
        SPACECRAFT_DOCKING_POINT,
        IDENTITY_ROTATION
      );

    dockingJoint =
      world.createImpulseJoint(
        jointData,
        station.rigidBody,
        spacecraft.rigidBody,
        true
      );
  }

  function removeDockingJoint() {
    if (!dockingJoint) {
      return;
    }

    world.removeImpulseJoint(
      dockingJoint,
      true
    );

    dockingJoint = null;
  }

  function processCollisionEvents() {
    eventQueue.drainCollisionEvents(
      (handle1, handle2, started) => {
        const isSensorEvent =
          containsPair(
            handle1,
            handle2,
            spacecraftHandle,
            sensorHandle
          );

        if (isSensorEvent) {
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

        const hitStation =
          frameHandles.has(handle1) ||
          frameHandles.has(handle2);

        if (!hitSpacecraft || !hitStation) {
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
          removeDockingJoint();

          setState(
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

    orientation.set(
      rotation.x,
      rotation.y,
      rotation.z,
      rotation.w
    );

    station.group.getWorldPosition(
      stationPosition
    );

   
    spacecraftDockingPosition
      .set(
        SPACECRAFT_DOCKING_POINT.x,
        SPACECRAFT_DOCKING_POINT.y,
        SPACECRAFT_DOCKING_POINT.z
      )
      .applyQuaternion(orientation)
      .add(spacecraftPosition);

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
  }

  function update() {
    updateMetrics();

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
      metrics.checks.lateralOffset &&
      metrics.checks.distance;

    if (!validDocking) {
      setState(DockingState.IN_RANGE);
      return;
    }

    createDockingJoint();
    setState(DockingState.DOCKED);
  }

  function canControl() {
    return (
      state !== DockingState.DOCKED &&
      state !== DockingState.CRASHED
    );
  }

  function undock() {
    if (
      state !== DockingState.DOCKED ||
      !dockingJoint
    ) {
      return;
    }

    removeDockingJoint();

    insideSensor = false;
    lastImpactForce = 0;

    spacecraft.stopLinearMotion();
    spacecraft.stopAngularMotion();

   
    spacecraft.rigidBody.applyImpulse(
      {
        x: 0,
        y: 0,
        z: 180,
      },
      true
    );

    setState(DockingState.APPROACH);
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

        maximumCaptureDistance:
          DOCKING_RULES.maximumCaptureDistance,

        crashForce:
          DOCKING_RULES.crashForce,
      },
    };
  }

  function reset() {
    removeDockingJoint();

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
    undock,
    getState,
    getTelemetry,
    reset,
  };
}