import * as THREE from "three";

const STATION_Z = -7;

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
    new THREE.BoxGeometry(0.25, 0.7, 0.25),
    new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0x7c2d12,
      emissiveIntensity: 2,
    })
  );

  ringMarker.position.y = 2.4;

  ring.add(ringMarker);

  function createFramePart(size, position) {
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

  const topSize = new THREE.Vector3(
    5.8,
    0.5,
    0.6
  );

  const sideSize = new THREE.Vector3(
    0.5,
    4.8,
    0.6
  );

  createFramePart(
    topSize,
    new THREE.Vector3(0, 2.65, 0)
  );

  createFramePart(
    topSize,
    new THREE.Vector3(0, -2.65, 0)
  );

  createFramePart(
    sideSize,
    new THREE.Vector3(-2.65, 0, 0)
  );

  createFramePart(
    sideSize,
    new THREE.Vector3(2.65, 0, 0)
  );

  
  const dockingLight = new THREE.PointLight(
    0x38bdf8,
    15,
    10
  );

  dockingLight.position.set(0, 0, 0.5);

  group.add(dockingLight);


  const rigidBodyDescription =
    RAPIER.RigidBodyDesc.fixed()
      .setTranslation(0, 0, STATION_Z);

  const rigidBody = world.createRigidBody(
    rigidBodyDescription
  );

  function addCuboidCollider(
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

  const colliders = [
    addCuboidCollider(
      new THREE.Vector3(2.9, 0.25, 0.3),
      new THREE.Vector3(0, 2.65, 0)
    ),

    addCuboidCollider(
      new THREE.Vector3(2.9, 0.25, 0.3),
      new THREE.Vector3(0, -2.65, 0)
    ),

    addCuboidCollider(
      new THREE.Vector3(0.25, 2.4, 0.3),
      new THREE.Vector3(-2.65, 0, 0)
    ),

    addCuboidCollider(
      new THREE.Vector3(0.25, 2.4, 0.3),
      new THREE.Vector3(2.65, 0, 0)
    ),
  ];

  return {
    group,
    ring,
    rigidBody,
    colliders,
  };
}