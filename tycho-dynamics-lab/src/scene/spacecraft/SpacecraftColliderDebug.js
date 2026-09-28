import * as THREE from "three";

import {
  SPACECRAFT_COLLIDERS,
} from "./SpacecraftColliderConfig.js";

export function createSpacecraftColliderDebug(
  spacecraftGroup
) {
  const debugGroup =
    new THREE.Group();

  debugGroup.name =
    "SpacecraftColliderDebug";

  debugGroup.visible = false;

  spacecraftGroup.add(
    debugGroup
  );

  function createMaterial(color) {
    return new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity: 0.8,

      /*
       * Draw colliders through the GLB model.
       */
      depthTest: false,
      depthWrite: false,
    });
  }

  function createGeometry(
    configuration
  ) {
    const height =
      configuration.halfHeight * 2;

    if (
      configuration.shape ===
      "cylinder"
    ) {
      return new THREE.CylinderGeometry(
        configuration.radius,
        configuration.radius,
        height,
        24,
        1,
        true
      );
    }

    if (
      configuration.shape ===
      "cone"
    ) {
      return new THREE.ConeGeometry(
        configuration.radius,
        height,
        24,
        1,
        true
      );
    }

    throw new Error(
      `Unsupported collider shape: ${configuration.shape}`
    );
  }

  function createDebugMesh(
    name,
    configuration
  ) {
    const geometry =
      createGeometry(
        configuration
      );

    const material =
      createMaterial(
        configuration.color
      );

    const mesh = new THREE.Mesh(
      geometry,
      material
    );

    mesh.name = name;

    mesh.position.set(
      configuration.position.x,
      configuration.position.y,
      configuration.position.z
    );

    mesh.rotation.x =
      configuration.rotationX;

    mesh.renderOrder = 1000;

    debugGroup.add(mesh);

    return mesh;
  }

  const serviceModule =
    createDebugMesh(
      "ServiceModuleColliderDebug",
      SPACECRAFT_COLLIDERS
        .serviceModule
    );

  const crewCapsule =
    createDebugMesh(
      "CrewCapsuleColliderDebug",
      SPACECRAFT_COLLIDERS
        .crewCapsule
    );

  const dockingMechanism =
    createDebugMesh(
      "DockingMechanismColliderDebug",
      SPACECRAFT_COLLIDERS
        .dockingMechanism
    );

  function setVisible(visible) {
    debugGroup.visible = visible;
  }

  function toggle() {
    debugGroup.visible =
      !debugGroup.visible;

    console.log(
      "Spacecraft colliders:",
      debugGroup.visible
        ? "visible"
        : "hidden"
    );

    return debugGroup.visible;
  }

  function isVisible() {
    return debugGroup.visible;
  }

  function dispose() {
    spacecraftGroup.remove(
      debugGroup
    );

    debugGroup.traverse(
      (object) => {
        if (!object.isMesh) {
          return;
        }

        object.geometry?.dispose();
        object.material?.dispose();
      }
    );
  }

  return {
    group: debugGroup,

    serviceModule,
    crewCapsule,
    dockingMechanism,

    setVisible,
    toggle,
    isVisible,
    dispose,
  };
}