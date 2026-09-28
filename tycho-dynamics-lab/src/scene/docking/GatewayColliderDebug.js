import * as THREE from "three";

import {
  GATEWAY_COLLIDERS,
  GATEWAY_SENSOR,
} from "./GatewayColliderConfig.js";

export function createGatewayColliderDebug(
  stationGroup
) {
  const debugGroup =
    new THREE.Group();

  debugGroup.name =
    "GatewayColliderDebug";

  debugGroup.visible = false;

  stationGroup.add(debugGroup);

  function createMaterial(
    color,
    opacity = 0.8
  ) {
    return new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity,
      depthTest: false,
      depthWrite: false,
    });
  }

  function createGeometry(
    configuration
  ) {
    if (
      configuration.shape ===
      "cylinder"
    ) {
      return new THREE.CylinderGeometry(
        configuration.radius,
        configuration.radius,
        configuration.halfHeight * 2,
        24,
        1,
        true
      );
    }

    if (
      configuration.shape ===
      "cuboid"
    ) {
      return new THREE.BoxGeometry(
        configuration
          .halfExtents.x * 2,

        configuration
          .halfExtents.y * 2,

        configuration
          .halfExtents.z * 2
      );
    }

    throw new Error(
      `Unsupported debug shape: ${configuration.shape}`
    );
  }

  function createColliderMesh(
    name,
    configuration
  ) {
    const mesh = new THREE.Mesh(
      createGeometry(configuration),

      createMaterial(
        configuration.color
      )
    );

    mesh.name = name;

    mesh.position.set(
      configuration.position.x,
      configuration.position.y,
      configuration.position.z
    );

    mesh.rotation.x =
      configuration.rotationX ?? 0;

    mesh.renderOrder = 1000;

    debugGroup.add(mesh);

    return mesh;
  }

  const dockingAdapter =
    createColliderMesh(
      "GatewayDockingAdapterDebug",

      GATEWAY_COLLIDERS
        .dockingAdapter
    );

  const forwardModule =
    createColliderMesh(
      "GatewayForwardModuleDebug",

      GATEWAY_COLLIDERS
        .forwardModule
    );

  const coreModule =
    createColliderMesh(
      "GatewayCoreModuleDebug",

      GATEWAY_COLLIDERS
        .coreModule
    );

  const sideModule =
    createColliderMesh(
      "GatewaySideModuleDebug",

      GATEWAY_COLLIDERS
        .sideModule
    );

  const sensorMesh =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        GATEWAY_SENSOR
          .halfExtents.x * 2,

        GATEWAY_SENSOR
          .halfExtents.y * 2,

        GATEWAY_SENSOR
          .halfExtents.z * 2
      ),

      createMaterial(
        GATEWAY_SENSOR.color,
        0.45
      )
    );

  sensorMesh.name =
    "GatewayDockingSensorDebug";

  sensorMesh.position.set(
    GATEWAY_SENSOR.position.x,
    GATEWAY_SENSOR.position.y,
    GATEWAY_SENSOR.position.z
  );

  sensorMesh.renderOrder = 1001;

  debugGroup.add(sensorMesh);

  function setVisible(visible) {
    debugGroup.visible = visible;
  }

  function toggle() {
    debugGroup.visible =
      !debugGroup.visible;

    return debugGroup.visible;
  }

  function isVisible() {
    return debugGroup.visible;
  }

  function setSensorVisible(
    visible
  ) {
    sensorMesh.visible = visible;
  }

  function dispose() {
    stationGroup.remove(
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

    dockingAdapter,
    forwardModule,
    coreModule,
    sideModule,
    sensorMesh,

    setVisible,
    toggle,
    isVisible,
    setSensorVisible,
    dispose,
  };
}