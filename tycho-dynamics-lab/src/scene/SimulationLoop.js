import * as THREE from "three";

const FIXED_TIME_STEP = 1 / 60;
const MAX_FRAME_TIME = 0.1;

const EMPTY_KEYS = new Set();

export function startSimulationLoop({
  scene,
  camera,
  renderer,
  controls,
  world,
  eventQueue,
  spacecraft,
  station,
  interactions,
  dockingSystem,
}) {
  world.timestep = FIXED_TIME_STEP;

  const clock = new THREE.Clock();

  let accumulator = 0;

  function runPhysicsStep() {
    const activeKeys =
      dockingSystem.canControl()
        ? interactions.pressedKeys
        : EMPTY_KEYS;

    
    spacecraft.applyControls(activeKeys);

    world.step(eventQueue);

    dockingSystem.processEvents();
    dockingSystem.update();
  }

  function animate() {
    const frameTime = Math.min(
      clock.getDelta(),
      MAX_FRAME_TIME
    );

    accumulator += frameTime;

    while (
      accumulator >= FIXED_TIME_STEP
    ) {
      runPhysicsStep();

      accumulator -= FIXED_TIME_STEP;
    }

    spacecraft.syncFromPhysics();
    spacecraft.updateVelocityArrow();

    station.ring.rotation.z +=
      0.08 * frameTime;

    interactions.update();
    controls.update();

    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);

  function stop() {
    renderer.setAnimationLoop(null);
  }

  return {
    stop,
  };
}