import * as THREE from "three";

export const PROBE_MASS = 2;
export const PROBE_RADIUS = 0.14;
export const PROBE_LIFETIME = 8;

export function createProbe({
  scene,
  world,
  RAPIER,
  position,
  inheritedVelocity,
  launchImpulse,
}) {
  let age = 0;
  let disposed = false;

  const material =
    new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      emissive: 0x0891b2,
      emissiveIntensity: 3,
      metalness: 0.5,
      roughness: 0.25,
    });

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(
      PROBE_RADIUS,
      16,
      12
    ),
    material
  );

  mesh.position.copy(position);

  mesh.userData.selectable = true;
  mesh.userData.label = "Sensor probe";

  scene.add(mesh);

  const bodyDescription =
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(
        position.x,
        position.y,
        position.z
      )
      .setLinvel(
        inheritedVelocity.x,
        inheritedVelocity.y,
        inheritedVelocity.z
      )
      .setLinearDamping(0)
      .setAngularDamping(0.1)
      .setCcdEnabled(true);

  const rigidBody =
    world.createRigidBody(
      bodyDescription
    );

  const colliderDescription =
    RAPIER.ColliderDesc.ball(
      PROBE_RADIUS
    )
      .setMass(PROBE_MASS)
      .setRestitution(0.25)
      .setFriction(0.2)
      .setActiveEvents(
        RAPIER.ActiveEvents
          .COLLISION_EVENTS
      );

  const collider =
    world.createCollider(
      colliderDescription,
      rigidBody
    );

  /*
   * Impulse changes velocity immediately:
   *
   * change in velocity = impulse / mass
   */
  rigidBody.applyImpulse(
    {
      x: launchImpulse.x,
      y: launchImpulse.y,
      z: launchImpulse.z,
    },
    true
  );

  function step(deltaTime) {
    age += deltaTime;

    return age >= PROBE_LIFETIME;
  }

  function syncFromPhysics() {
    const position =
      rigidBody.translation();

    const rotation =
      rigidBody.rotation();

    mesh.position.set(
      position.x,
      position.y,
      position.z
    );

    mesh.quaternion.set(
      rotation.x,
      rotation.y,
      rotation.z,
      rotation.w
    );
  }

  function dispose() {
    if (disposed) {
      return;
    }

    disposed = true;

    scene.remove(mesh);

    mesh.geometry.dispose();
    mesh.material.dispose();

    world.removeRigidBody(
      rigidBody
    );
  }

  return {
    mesh,
    rigidBody,
    collider,
    step,
    syncFromPhysics,
    dispose,
  };
}