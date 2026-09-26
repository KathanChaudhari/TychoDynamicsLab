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
  probeSystem,
  pressedKeys,
  onTelemetry,
}) {
  const clock = new THREE.Clock();

  let physicsAccumulator = 0;
  let telemetryAccumulator =
    TELEMETRY_INTERVAL;

  function animate() {
    const frameTime = Math.min(
      clock.getDelta(),
      MAX_FRAME_TIME
    );

    physicsAccumulator += frameTime;
    telemetryAccumulator += frameTime;

    while (
      physicsAccumulator >= FIXED_TIME_STEP
    ) {
      const activeKeys =
        dockingSystem.canControl()
          ? pressedKeys
          : EMPTY_KEYS;

      spacecraft.applyControls(
        activeKeys
      );

      dockingSystem.beforePhysicsStep();

      world.step(eventQueue);

      /*
       * Drain once and distribute the events
       * to docking and projectile systems.
       */
      physicsEvents.drain();

      dockingSystem.afterPhysicsStep();

      probeSystem.afterPhysicsStep(
        FIXED_TIME_STEP
      );

      physicsAccumulator -=
        FIXED_TIME_STEP;
    }

    spacecraft.syncFromPhysics();
    spacecraft.updateVelocityArrow();

    probeSystem.syncVisuals();

    if (
      telemetryAccumulator >=
      TELEMETRY_INTERVAL
    ) {
      onTelemetry?.(
        dockingSystem.getTelemetry()
      );

      telemetryAccumulator = 0;
    }

    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);

  return {
    stop() {
      renderer.setAnimationLoop(null);
      clock.stop();
    },
  };
}