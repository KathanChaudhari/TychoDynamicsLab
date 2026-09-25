import * as THREE from "three";

export function createSpacecraftModel(scene) {
  const group = new THREE.Group();

  group.userData.selectable = true;
  group.userData.label =
    "Prototype spacecraft";

  scene.add(group);


  const hullMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.7,
      roughness: 0.35,
    });

  const darkMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x172033,
      metalness: 0.5,
      roughness: 0.5,
    });

  const engineMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x075985,
      emissiveIntensity: 3,
      metalness: 0.4,
      roughness: 0.3,
    });


  const bodyMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.8, 3),
    hullMaterial
  );

  group.add(bodyMesh);


  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.8, 1.2, 4),
    hullMaterial
  );

  nose.rotation.x = -Math.PI / 2;
  nose.position.z = -2.1;

  group.add(nose);


  const leftWing = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.12, 1.4),
    darkMaterial
  );

  leftWing.position.set(-1.5, 0, 0.3);

  group.add(leftWing);


  const rightWing = leftWing.clone();
  rightWing.position.x = 1.5;

  group.add(rightWing);


  const engine = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.45,
      0.45,
      0.25,
      24
    ),
    engineMaterial
  );

  engine.rotation.x = Math.PI / 2;
  engine.position.z = 1.6;

  group.add(engine);


  const velocityArrow = new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(0, 0, 0),
    1,
    0x22c55e,
    0.3,
    0.15
  );

  velocityArrow.visible = false;

  scene.add(velocityArrow);

  const velocityDirection =
    new THREE.Vector3();

  function syncTransform(
    position,
    rotation
  ) {
    group.position.set(
      position.x,
      position.y,
      position.z
    );

    group.quaternion.set(
      rotation.x,
      rotation.y,
      rotation.z,
      rotation.w
    );
  }

  function updateVelocityArrow(
    linearVelocity
  ) {
    velocityDirection.set(
      linearVelocity.x,
      linearVelocity.y,
      linearVelocity.z
    );

    const speed =
      velocityDirection.length();

    velocityArrow.position.copy(
      group.position
    );

    if (speed < 0.001) {
      velocityArrow.visible = false;
      return;
    }

    velocityDirection.normalize();

    velocityArrow.setDirection(
      velocityDirection
    );

    velocityArrow.setLength(
      Math.min(speed * 4, 6),
      0.3,
      0.15
    );

    velocityArrow.visible = true;
  }

  function hideVelocityArrow() {
    velocityArrow.visible = false;
  }

  return {
    group,
    velocityArrow,
    syncTransform,
    updateVelocityArrow,
    hideVelocityArrow,
  };
}