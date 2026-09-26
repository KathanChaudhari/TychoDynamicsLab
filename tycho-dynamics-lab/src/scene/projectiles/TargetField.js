import * as THREE from "three";

const TARGET_SIZE = {
  x: 1.3,
  y: 1.3,
  z: 0.25,
};

const TARGET_POSITIONS = [
  new THREE.Vector3(0, 0, -13),
  new THREE.Vector3(-3.5, 1.5, -12),
  new THREE.Vector3(3.5, -1.5, -15),
];

export function createTargetField({
  scene,
  world,
  RAPIER,
}) {
  const group = new THREE.Group();

  group.userData.selectable = true;
  group.userData.label =
    "Probe target field";

  scene.add(group);

  const rigidBody =
    world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed()
    );

  const targetsByCollider =
    new Map();

  const colliders = [];

  for (
    let index = 0;
    index < TARGET_POSITIONS.length;
    index += 1
  ) {
    const position =
      TARGET_POSITIONS[index];

    const material =
      new THREE.MeshStandardMaterial({
        color: 0xf97316,
        emissive: 0x7c2d12,
        emissiveIntensity: 1.5,
        metalness: 0.6,
        roughness: 0.35,
      });

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        TARGET_SIZE.x,
        TARGET_SIZE.y,
        TARGET_SIZE.z
      ),
      material
    );

    mesh.position.copy(position);

    mesh.userData.selectable = true;
    mesh.userData.label =
      `Probe target ${index + 1}`;

    group.add(mesh);

    const colliderDescription =
      RAPIER.ColliderDesc.cuboid(
        TARGET_SIZE.x / 2,
        TARGET_SIZE.y / 2,
        TARGET_SIZE.z / 2
      )
        .setTranslation(
          position.x,
          position.y,
          position.z
        )
        .setRestitution(0.2)
        .setFriction(0.5);

    const collider =
      world.createCollider(
        colliderDescription,
        rigidBody
      );

    const target = {
      mesh,
      material,
      collider,
      hitTimer: 0,
      hitCount: 0,
    };

    colliders.push(collider);

    targetsByCollider.set(
      collider.handle,
      target
    );
  }

  function hasCollider(handle) {
    return targetsByCollider.has(handle);
  }

  function registerHit(handle) {
    const target =
      targetsByCollider.get(handle);

    if (!target) {
      return false;
    }

    target.hitCount += 1;
    target.hitTimer = 0.35;

    target.material.color.setHex(
      0x4ade80
    );

    target.material.emissive.setHex(
      0x166534
    );

    target.material.emissiveIntensity =
      4;

    console.log(
      `Target hit: ${target.hitCount}`
    );

    return true;
  }

  function update(deltaTime) {
    for (
      const target of
      targetsByCollider.values()
    ) {
      if (target.hitTimer <= 0) {
        continue;
      }

      target.hitTimer -= deltaTime;

      if (target.hitTimer <= 0) {
        target.material.color.setHex(
          0xf97316
        );

        target.material.emissive.setHex(
          0x7c2d12
        );

        target.material.emissiveIntensity =
          1.5;
      }
    }
  }

  function dispose() {
    scene.remove(group);

    for (
      const target of
      targetsByCollider.values()
    ) {
      target.mesh.geometry.dispose();
      target.material.dispose();
    }

    targetsByCollider.clear();

    world.removeRigidBody(
      rigidBody
    );
  }

  return {
    group,
    colliders,
    hasCollider,
    registerHit,
    update,
    dispose,
  };
}