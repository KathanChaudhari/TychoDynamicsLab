const SPACECRAFT_MASS = 1000;

export function createSpacecraftPhysics({
  world,
  RAPIER,
  model,
}) {
  const rigidBodyDescription =
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(0, 0, 0)
      .setLinearDamping(0)
      .setAngularDamping(0)
      .setCcdEnabled(true);

  const rigidBody =
    world.createRigidBody(
      rigidBodyDescription
    );

  /*
   * Rapier cuboids use half-extents.
   *
   * Visible body: 1.6 × 0.8 × 3
   * Collider:     0.8 × 0.4 × 1.5
   */
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

  function syncModel() {
    const position =
      rigidBody.translation();

    const rotation =
      rigidBody.rotation();

    model.syncTransform(
      position,
      rotation
    );
  }

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

    syncModel();
  }

  return {
    mass: SPACECRAFT_MASS,
    rigidBody,
    collider,
    syncModel,
    stopLinearMotion,
    stopAngularMotion,
    reset,
  };
}
