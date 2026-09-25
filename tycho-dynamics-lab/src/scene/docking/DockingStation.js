import * as THREE from "three";

const STATION_Z = -7;

const STATUS_STYLES = {
  approach: {
    color: 0xf8fafc,
    emissive: 0x000000,
    intensity: 0,
  },

  "in-range": {
    color: 0x38bdf8,
    emissive: 0x075985,
    intensity: 2,
  },

  docked: {
    color: 0x4ade80,
    emissive: 0x166534,
    intensity: 3,
  },

  crashed: {
    color: 0xf87171,
    emissive: 0x991b1b,
    intensity: 4,
  },
};

export function createDockingStation(
  scene,
  world,
  RAPIER
) {
 
  const group = new THREE.Group();

  group.position.z = STATION_Z;

  group.userData.selectable = true;
  group.userData.label = "Docking station";

  scene.add(group);

  
  const frameMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.75,
      roughness: 0.35,
    });

  const ringMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: 0x000000,
      emissiveIntensity: 0,
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

  group.add(ring);

  const ringMarker = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.25,
      0.7,
      0.25
    ),
    new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0x7c2d12,
      emissiveIntensity: 2,
    })
  );

  ringMarker.position.y = 2.4;

  ring.add(ringMarker);

  
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

    return mesh;
  }

  const horizontalSize =
    new THREE.Vector3(
      5.8,
      0.5,
      0.6
    );

  const verticalSize =
    new THREE.Vector3(
      0.5,
      4.8,
      0.6
    );

  createFramePart(
    horizontalSize,
    new THREE.Vector3(0, 2.65, 0)
  );

  createFramePart(
    horizontalSize,
    new THREE.Vector3(0, -2.65, 0)
  );

  createFramePart(
    verticalSize,
    new THREE.Vector3(-2.65, 0, 0)
  );

  createFramePart(
    verticalSize,
    new THREE.Vector3(2.65, 0, 0)
  );

  
  const sensorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(
      2.4,
      1.4,
      1.5
    ),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    })
  );

  sensorMesh.position.z = -0.4;

  group.add(sensorMesh);

  
  const dockingLight =
    new THREE.PointLight(
      0x38bdf8,
      15,
      10
    );

  dockingLight.position.set(
    0,
    0,
    0.5
  );

  group.add(dockingLight);

  const rigidBodyDescription =
    RAPIER.RigidBodyDesc.fixed()
      .setTranslation(
        0,
        0,
        STATION_Z
      );

  const rigidBody =
    world.createRigidBody(
      rigidBodyDescription
    );

 
  function addFrameCollider(
    halfExtents,
    position
  ) {
    const description =
      RAPIER.ColliderDesc.cuboid(
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

  const frameColliders = [
    addFrameCollider(
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

    addFrameCollider(
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

    addFrameCollider(
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

    addFrameCollider(
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

  
  const sensorDescription =
    RAPIER.ColliderDesc.cuboid(
      1.2,
      0.7,
      0.75
    )
      .setTranslation(
        0,
        0,
        -0.4
      )
      .setSensor(true)
      .setActiveEvents(
        RAPIER.ActiveEvents
          .COLLISION_EVENTS
      );

  const dockingSensor =
    world.createCollider(
      sensorDescription,
      rigidBody
    );

  function setStatus(status) {
    const style =
      STATUS_STYLES[status] ??
      STATUS_STYLES.approach;

    ringMaterial.color.setHex(
      style.color
    );

    ringMaterial.emissive.setHex(
      style.emissive
    );

    ringMaterial.emissiveIntensity =
      style.intensity;
  }

  return {
    group,
    ring,
    sensorMesh,
    rigidBody,
    frameColliders,
    dockingSensor,
    setStatus,
  };
}