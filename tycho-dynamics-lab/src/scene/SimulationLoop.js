import * as THREE from "three";

const FIXED_TIME_STEP = 1 / 60;
const MAX_FRAME_TIME = 0.1;

export function startSimulationLoop({
  scene,
  camera,
  renderer,
  controls,
  world,
  spacecraft,
  station,
  interactions,
}) {
  world.timestep = FIXED_TIME_STEP;

  const clock = new THREE.Clock();

  let accumulator = 0;

  function animate() {
    const frameTime = Math.min(
      clock.getDelta(),
      MAX_FRAME_TIME
    );

    accumulator += frameTime;

    while (
      accumulator >= FIXED_TIME_STEP
    ) {
      spacecraft.applyControls(
        interactions.pressedKeys
      );

      world.step();

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