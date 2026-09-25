import * as THREE from "three";

const SPACECRAFT_MASS = 1000;
const THRUST_FORCE = 250;
const TORQUE_FORCE = 600;

export function createSpacecraft(
  scene,
  world,
  RAPIER
) {
  // ================================================
  // Three.js visual group
  // ================================================

  const group = new THREE.Group();

  group.userData.selectable = true;
  group.userData.label = "Prototype spacecraft";

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

  // Body

  const bodyMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.8, 3),
    hullMaterial
  );

  group.add(bodyMesh);

  // Nose

  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.8, 1.2, 4),
    hullMaterial
  );

  nose.rotation.x = -Math.PI / 2;
  nose.position.z = -2.1;

  group.add(nose);

  // Left wing

  const leftWing = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.12, 1.4),
    darkMaterial
  );

  leftWing.position.set(-1.5, 0, 0.3);

  group.add(leftWing);

  // Right wing

  const rightWing = leftWing.clone();
  rightWing.position.x = 1.5;

  group.add(rightWing);

  // Engine

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

  // ================================================
  // Rapier rigid body
  // ================================================

  const rigidBodyDescription =
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(0, 0, 0)
      .setLinearDamping(0)
      .setAngularDamping(0)
      .setCcdEnabled(true);

  const rigidBody = world.createRigidBody(
    rigidBodyDescription
  );

  // Rapier cuboids use half-width, half-height
  // and half-depth.
  const colliderDescription =
    RAPIER.ColliderDesc.cuboid(
      0.8,
      0.4,
      1.5
    )
      .setMass(SPACECRAFT_MASS)
      .setFriction(0.4)
      .setRestitution(0.1);

  const collider = world.createCollider(
    colliderDescription,
    rigidBody
  );

  // ================================================
  // Reusable math objects
  // ================================================

  const localForce = new THREE.Vector3();
  const worldForce = new THREE.Vector3();

  const localTorque = new THREE.Vector3();
  const worldTorque = new THREE.Vector3();

  const orientation = new THREE.Quaternion();
  const velocityDirection = new THREE.Vector3();

  // ================================================
  // Velocity arrow
  // ================================================

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

  // ================================================
  // Apply keyboard input to Rapier
  // ================================================

  function applyControls(pressedKeys) {
    /*
     * Rapier forces remain active until they are reset.
     * Begin every physics step with no thruster force.
     */
    rigidBody.resetForces(true);
    rigidBody.resetTorques(true);

    localForce.set(0, 0, 0);
    localTorque.set(0, 0, 0);

    // Translation

    if (pressedKeys.has("KeyW")) {
      localForce.z -= 1;
    }

    if (pressedKeys.has("KeyS")) {
      localForce.z += 1;
    }

    if (pressedKeys.has("KeyA")) {
      localForce.x -= 1;
    }

    if (pressedKeys.has("KeyD")) {
      localForce.x += 1;
    }

    if (pressedKeys.has("KeyR")) {
      localForce.y += 1;
    }

    if (pressedKeys.has("KeyF")) {
      localForce.y -= 1;
    }

    // Rotation

    if (pressedKeys.has("ArrowUp")) {
      localTorque.x += 1;
    }

    if (pressedKeys.has("ArrowDown")) {
      localTorque.x -= 1;
    }

    if (pressedKeys.has("ArrowLeft")) {
      localTorque.y += 1;
    }

    if (pressedKeys.has("ArrowRight")) {
      localTorque.y -= 1;
    }

    if (pressedKeys.has("KeyQ")) {
      localTorque.z += 1;
    }

    if (pressedKeys.has("KeyE")) {
      localTorque.z -= 1;
    }

    const rapierRotation = rigidBody.rotation();

    orientation.set(
      rapierRotation.x,
      rapierRotation.y,
      rapierRotation.z,
      rapierRotation.w
    );

    if (localForce.lengthSq() > 0) {
      localForce
        .normalize()
        .multiplyScalar(THRUST_FORCE);

      /*
       * Rapier expects world-space force.
       * Convert ship-local thrust using the body's
       * current orientation.
       */
      worldForce
        .copy(localForce)
        .applyQuaternion(orientation);

      rigidBody.addForce(
        {
          x: worldForce.x,
          y: worldForce.y,
          z: worldForce.z,
        },
        true
      );
    }

    if (localTorque.lengthSq() > 0) {
      localTorque
        .normalize()
        .multiplyScalar(TORQUE_FORCE);

      worldTorque
        .copy(localTorque)
        .applyQuaternion(orientation);

      rigidBody.addTorque(
        {
          x: worldTorque.x,
          y: worldTorque.y,
          z: worldTorque.z,
        },
        true
      );
    }
  }

  // ================================================
  // Copy Rapier transform into Three.js
  // ================================================

  function syncFromPhysics() {
    const position = rigidBody.translation();
    const rotation = rigidBody.rotation();

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

  // ================================================
  // Velocity visualization
  // ================================================

  function updateVelocityArrow() {
    const linearVelocity = rigidBody.linvel();

    velocityDirection.set(
      linearVelocity.x,
      linearVelocity.y,
      linearVelocity.z
    );

    const speed = velocityDirection.length();

    velocityArrow.position.copy(group.position);

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

  // ================================================
  // Flight commands
  // ================================================

  function stopLinearMotion() {
    rigidBody.setLinvel(
      {
        x: 0,
        y: 0,
        z: 0,
      },
      true
    );
  }

  function stopAngularMotion() {
    rigidBody.setAngvel(
      {
        x: 0,
        y: 0,
        z: 0,
      },
      true
    );
  }

  function reset() {
    rigidBody.setTranslation(
      {
        x: 0,
        y: 0,
        z: 0,
      },
      true
    );

    rigidBody.setRotation(
      {
        x: 0,
        y: 0,
        z: 0,
        w: 1,
      },
      true
    );

    stopLinearMotion();
    stopAngularMotion();

    rigidBody.resetForces(true);
    rigidBody.resetTorques(true);

    syncFromPhysics();

    velocityArrow.visible = false;
  }

  return {
    group,
    rigidBody,
    collider,
    velocityArrow,
    applyControls,
    syncFromPhysics,
    updateVelocityArrow,
    stopLinearMotion,
    stopAngularMotion,
    reset,
  };
}