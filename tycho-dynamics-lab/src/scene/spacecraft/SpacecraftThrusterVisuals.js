import * as THREE from "three";

import { createThrusterDefinitions } from "./ThrusterDefinitions.js";

const PLUME_LENGTH = 0.4;
const PLUME_RADIUS = 0.09;
const BASE_DIRECTION = new THREE.Vector3(0, -1, 0);

export function createSpacecraftThrusterVisuals(spacecraftGroup) {
  const group = new THREE.Group();
  group.name = "SpacecraftThrusterVisuals";
  spacecraftGroup.add(group);

 
  const plumeGeometry = new THREE.ConeGeometry(
    PLUME_RADIUS,
    PLUME_LENGTH,
    12,
    1,
    true
  );
  plumeGeometry.translate(0, -PLUME_LENGTH / 2, 0);

  function createPlume(definition, index) {
    const material = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });

    const mesh = new THREE.Mesh(plumeGeometry, material);
    mesh.name = `RCSPlume-${index}`;
    mesh.position.copy(definition.position);
    mesh.quaternion.setFromUnitVectors(
      BASE_DIRECTION,
      definition.direction.clone().normalize()
    );
    mesh.visible = false;
    mesh.frustumCulled = false;
    mesh.userData.intensity = 0;
    mesh.userData.phase = index * 0.73;
    group.add(mesh);

    return { ...definition, mesh, material };
  }

  const plumes = createThrusterDefinitions().map(createPlume);
  let elapsedTime = 0;

  function getRequestedIntensity(plume, controlState) {
    const vectorState = controlState?.[plume.source];

    if (!vectorState) {
      return 0;
    }

    const value = vectorState[plume.axis] ?? 0;

    if (Math.sign(value) !== plume.sign) {
      return 0;
    }

    return Math.abs(value) * (controlState.thrustScale ?? 1);
  }

  function update(controlState, deltaTime) {
    elapsedTime += deltaTime;
    const response = 1 - Math.exp(-24 * deltaTime);

    for (const plume of plumes) {
      const targetIntensity = getRequestedIntensity(plume, controlState);
      const intensity = THREE.MathUtils.lerp(
        plume.mesh.userData.intensity,
        targetIntensity,
        response
      );

      plume.mesh.userData.intensity = intensity;

      if (intensity < 0.015) {
        plume.mesh.visible = false;
        continue;
      }

      plume.mesh.visible = true;
      const flicker =
        1 + Math.sin(elapsedTime * 45 + plume.mesh.userData.phase) * 0.16;

      plume.mesh.scale.set(
        0.7 + intensity * 0.5,
        intensity * flicker,
        0.7 + intensity * 0.5
      );
      plume.material.opacity = 0.25 + intensity * 0.7;
    }
  }

  function reset() {
    for (const plume of plumes) {
      plume.mesh.visible = false;
      plume.mesh.userData.intensity = 0;
      plume.material.opacity = 0;
    }
  }

  function dispose() {
    spacecraftGroup.remove(group);

    for (const plume of plumes) {
      plume.material.dispose();
    }

    plumeGeometry.dispose();
  }

  return { group, update, reset, dispose };
}
