import * as THREE from "three";

import {
  createDockingPortAnchor,
} from "./DockingPortAnchor.js";

const STATION_Z = -7;

export function createDockingStation(
  scene,
  world,
  RAPIER
) {
  const group = new THREE.Group();

  group.name =
    "DockingStationRoot";

  group.position.z = STATION_Z;

  group.userData.selectable = true;
  group.userData.label =
    "Docking station";

  scene.add(group);

  /*
   * Gateway docking-port anchor.
   *
   * The station group origin is already the
   * center of the docking ring and sensor.
   *
   * Gateway faces outward toward Orion along +Z.
   */
  const dockingPort =
    createDockingPortAnchor({
      parent: group,

      name:
        "GatewayDockingPort",

      position:
        new THREE.Vector3(
          0,
          0,
          0
        ),

      direction:
        new THREE.Vector3(
          0,
          0,
          1
        ),

      color: 0xff00ff,
    });

  /*
   * Primitive station visuals.
   *
   * We keep these visible while calibrating the
   * Gateway GLB and docking system.
   */
  const frameMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.75,
      roughness: 0.35,
    });

  const ringMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.8,
      roughness: 0.3,
    });

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(
      2.4,
      0.16,
      16,
      64
    ),
    ringMaterial
  );

  ring.name =
    "DockingGuideRing";

  group.add(ring);

  const ringMarkerMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0x7c2d12,
      emissiveIntensity: 2,
    });

  const ringMarker =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.25,
        0.7,
        0.25
      ),
      ringMarkerMaterial
    );

  ringMarker.name =
    "DockingRingTopMarker";

  ringMarker.position.y = 2.4;

  ring.add(ringMarker);

  const frameMeshes = [];

  function createFramePart(
    size,
    position
  ) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        size.x,
        size.y,
        size.z
      ),
      frameMaterial
    );

    mesh.position.copy(position);

    group.add(mesh);
    frameMeshes.push(mesh);

    return mesh;
  }

  const topSize =
    new THREE.Vector3(
      5.8,
      0.5,
      0.6
    );

  const sideSize =
    new THREE.Vector3(
      0.5,
      4.8,
      0.6
    );

  createFramePart(
    topSize,
    new THREE.Vector3(
      0,
      2.65,
      0
    )
  );

  createFramePart(
    topSize,
    new THREE.Vector3(
      0,
      -2.65,
      0
    )
  );

  createFramePart(
    sideSize,
    new THREE.Vector3(
      -2.65,
      0,
      0
    )
  );

  createFramePart(
    sideSize,
    new THREE.Vector3(
      2.65,
      0,
      0
    )
  );

  const dockingLight =
    new THREE.PointLight(
      0x38bdf8,
      15,
      10
    );

  dockingLight.name =
    "DockingLight";

  dockingLight.position.set(
    0,
    0,
    0.5
  );

  group.add(dockingLight);

  /*
   * Fixed Rapier body.
   */
  const rigidBodyDescription =
    RAPIER.RigidBodyDesc
      .fixed()
      .setTranslation(
        0,
        0,
        STATION_Z
      );

  const rigidBody =
    world.createRigidBody(
      rigidBodyDescription
    );

  function addCuboidCollider(
    halfExtents,
    position
  ) {
    const description =
      RAPIER.ColliderDesc
        .cuboid(
          halfExtents.x,
          halfExtents.y,
          halfExtents.z
        )
        .setTranslation(
          position.x,
          position.y,
          position.z
        )
        .setFriction(0.6)
        .setRestitution(0.05);

    return world.createCollider(
      description,
      rigidBody
    );
  }

  /*
   * These colliders still represent the temporary
   * square docking frame.
   */
  const colliders = [
    addCuboidCollider(
      new THREE.Vector3(
        2.9,
        0.25,
        0.3
      ),
      new THREE.Vector3(
        0,
        2.65,
        0
      )
    ),

    addCuboidCollider(
      new THREE.Vector3(
        2.9,
        0.25,
        0.3
      ),
      new THREE.Vector3(
        0,
        -2.65,
        0
      )
    ),

    addCuboidCollider(
      new THREE.Vector3(
        0.25,
        2.4,
        0.3
      ),
      new THREE.Vector3(
        -2.65,
        0,
        0
      )
    ),

    addCuboidCollider(
      new THREE.Vector3(
        0.25,
        2.4,
        0.3
      ),
      new THREE.Vector3(
        2.65,
        0,
        0
      )
    ),
  ];

  function setGuideVisible(visible) {
    ring.visible = visible;

    frameMeshes.forEach((mesh) => {
      mesh.visible = visible;
    });
  }

  function dispose() {
    dockingPort.dispose();

    scene.remove(group);

    ring.geometry.dispose();
    ringMaterial.dispose();

    ringMarker.geometry.dispose();
    ringMarkerMaterial.dispose();

    frameMeshes.forEach((mesh) => {
      mesh.geometry.dispose();
    });

    frameMaterial.dispose();
  }

  return {
    group,
    ring,
    ringMarker,
    dockingLight,

    rigidBody,
    colliders,

    dockingPort:
      dockingPort.anchor,

    setDockingPortDebugVisible:
      dockingPort.setDebugVisible,

    setGuideVisible,

    dispose,
  };
}