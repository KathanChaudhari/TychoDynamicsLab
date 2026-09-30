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
  audioSystem,
  performanceSystem,
  pressedKeys,
  onTelemetry,
}) {
  const timer = new THREE.Timer();
  timer.connect(document);

  let physicsAccumulator = 0;

  let telemetryAccumulator =
    TELEMETRY_INTERVAL;

  let latestCombinedTelemetry = null;

  let pageVisible =
    !document.hidden;

  function getCombinedTelemetry() {
    if (latestCombinedTelemetry) {
      return latestCombinedTelemetry;
    }

    return {
      ...dockingSystem.getTelemetry(),
      mission:
        missionSystem
          .getTelemetry(),
    };
  }

  function handleVisibilityChange() {
    pageVisible =
      !document.hidden;

   
    physicsAccumulator = 0;

    performanceSystem?.reset();

    timer.reset();
  }

  function animate() {
    timer.update();

    const frameTime =
      Math.min(
        timer.getDelta(),
        MAX_FRAME_TIME
      );

    if (!pageVisible) {
      return;
    }

    performanceSystem?.beginFrame(
      frameTime
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

      spacecraft.updateDamage(
        FIXED_TIME_STEP
      );

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
          .getTelemetry({
            refresh: false,
          });

      missionSystem.update(
        FIXED_TIME_STEP,
        dockingTelemetry
      );

      latestCombinedTelemetry = {
        ...dockingTelemetry,
        mission:
          missionSystem
            .getTelemetry(),
      };

      audioSystem.handleTelemetry(
        latestCombinedTelemetry
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

    audioSystem.updateThrusters(
      spacecraft.controlState,

      missionSystem.canControl() &&
        dockingSystem.canControl()
    );

    probeSystem.syncVisuals();

    interactions.update();

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

   
    performanceSystem
      ?.afterRender();
  }

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

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

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      timer.dispose();
    },
  };
}
