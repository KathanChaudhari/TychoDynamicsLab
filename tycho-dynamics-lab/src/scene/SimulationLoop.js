import * as THREE from "three";

const FIXED_TIME_STEP = 1 / 60;
const MAX_FRAME_TIME = 0.1;
const TELEMETRY_INTERVAL = 0.1;

const EMPTY_KEYS = new Set();

export function startSimulationLoop({
  renderer,
  scene,
  camera,
  world,
  eventQueue,
  physicsEvents,
  spacecraft,
  dockingSystem,
  missionSystem,
  probeSystem,
  cameraController,
  interactions,
  pressedKeys,
  onTelemetry,
}) {
  const clock =
    new THREE.Clock();

  let physicsAccumulator = 0;

  let telemetryAccumulator =
    TELEMETRY_INTERVAL;

  function getCombinedTelemetry() {
    return {
      ...dockingSystem
        .getTelemetry(),

      mission:
        missionSystem
          .getTelemetry(),
    };
  }

  function animate() {
    const frameTime =
      Math.min(
        clock.getDelta(),
        MAX_FRAME_TIME
      );

    physicsAccumulator +=
      frameTime;

    telemetryAccumulator +=
      frameTime;

    while (
      physicsAccumulator >=
      FIXED_TIME_STEP
    ) {
      const canControl =
        missionSystem.canControl() &&
        dockingSystem.canControl();

      const activeKeys =
        canControl
          ? pressedKeys
          : EMPTY_KEYS;

      spacecraft.applyControls(
        activeKeys,
        FIXED_TIME_STEP
      );

      dockingSystem
        .beforePhysicsStep();

      world.step(eventQueue);

      physicsEvents.drain();

      dockingSystem
        .afterPhysicsStep();

      probeSystem
        .afterPhysicsStep(
          FIXED_TIME_STEP
        );

      const dockingTelemetry =
        dockingSystem
          .getTelemetry();

      missionSystem.update(
        FIXED_TIME_STEP,
        dockingTelemetry
      );

      physicsAccumulator -=
        FIXED_TIME_STEP;
    }

    spacecraft.syncFromPhysics();

    spacecraft
      .updateVelocityArrow();

    spacecraft
      .updateThrusterVisuals(
        frameTime
      );

    probeSystem.syncVisuals();

    /*
     * Update selection helpers after the
     * spacecraft visual transform is synced.
     */
    interactions.update();

    /*
     * Camera must update after syncing the
     * spacecraft so chase/docking views use
     * the newest transform.
     */
    cameraController.update(
      frameTime
    );

    if (
      telemetryAccumulator >=
      TELEMETRY_INTERVAL
    ) {
      onTelemetry?.(
        getCombinedTelemetry()
      );

      telemetryAccumulator = 0;
    }

    renderer.render(
      scene,
      camera
    );
  }

  renderer.setAnimationLoop(
    animate
  );

  return {
    getTelemetry:
      getCombinedTelemetry,

    stop() {
      renderer.setAnimationLoop(
        null
      );

      clock.stop();
    },
  };
}