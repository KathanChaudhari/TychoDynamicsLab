import * as THREE from "three";

const POINT_COUNT = 40;
const TIME_STEP = 0.1;

export function createProbeTrajectory(
  scene
) {
  const positions = new Float32Array(
    POINT_COUNT * 3
  );

  const geometry =
    new THREE.BufferGeometry();

  const positionAttribute =
    new THREE.BufferAttribute(
      positions,
      3
    );

  geometry.setAttribute(
    "position",
    positionAttribute
  );

  const material =
    new THREE.LineBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.65,
    });

  const line = new THREE.Line(
    geometry,
    material
  );

  line.frustumCulled = false;
  line.visible = true;

  scene.add(line);

  function update({
    startPosition,
    initialVelocity,
    gravity,
  }) {
    for (
      let index = 0;
      index < POINT_COUNT;
      index += 1
    ) {
      const time =
        index * TIME_STEP;

      const arrayIndex =
        index * 3;

      /*
       * p(t) =
       * p0 + velocity * time
       * + 0.5 * gravity * time²
       */
      positions[arrayIndex] =
        startPosition.x +
        initialVelocity.x * time +
        0.5 *
          gravity.x *
          time *
          time;

      positions[arrayIndex + 1] =
        startPosition.y +
        initialVelocity.y * time +
        0.5 *
          gravity.y *
          time *
          time;

      positions[arrayIndex + 2] =
        startPosition.z +
        initialVelocity.z * time +
        0.5 *
          gravity.z *
          time *
          time;
    }

    positionAttribute.needsUpdate = true;

    geometry.computeBoundingSphere();
  }

  function toggle() {
    line.visible = !line.visible;

    return line.visible;
  }

  function setVisible(visible) {
    line.visible = visible;
  }

  function dispose() {
    scene.remove(line);

    geometry.dispose();
    material.dispose();
  }

  return {
    line,
    update,
    toggle,
    setVisible,
    dispose,
  };
}