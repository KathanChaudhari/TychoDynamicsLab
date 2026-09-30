import {
  SPACECRAFT_COLLIDERS,
  SPACECRAFT_MASS,
} from "./SpacecraftColliderConfig.js";

export function createSpacecraftPhysics({
  world,
  RAPIER,
  model,
  initialPose,
}) {


  const startingPosition =
    initialPose?.position ?? {
      x: 0,
      y: 0,
      z: 0,
    };

  const startingRotation =
    initialPose?.rotation ?? {
      x: 0,
      y: 0,
      z: 0,
      w: 1,
    };

  const rigidBodyDescription =
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(
        startingPosition.x,
        startingPosition.y,
        startingPosition.z
      )
      .setRotation(
        startingRotation
      )
      .setLinearDamping(0)
      .setAngularDamping(0)
      .setCcdEnabled(true);

  const rigidBody =
    world.createRigidBody(
      rigidBodyDescription
    );

  function createRotation(
    rotationX
  ) {
    const halfAngle =
      rotationX / 2;

    return {
      x: Math.sin(halfAngle),
      y: 0,
      z: 0,
      w: Math.cos(halfAngle),
    };
  }

  function configureCollider(
    description,
    configuration
  ) {
    return description
      .setTranslation(
        configuration.position.x,
        configuration.position.y,
        configuration.position.z
      )
      .setRotation(
        createRotation(
          configuration.rotationX
        )
      )
      .setMass(
        configuration.mass
      )
      .setFriction(0.4)
      .setRestitution(0.1)
      .setActiveEvents(
        RAPIER.ActiveEvents
          .COLLISION_EVENTS |
          RAPIER.ActiveEvents
            .CONTACT_FORCE_EVENTS
      )
      .setContactForceEventThreshold(
        100
      );
  }

  function createCylinderCollider(
    configuration
  ) {
    const description =
      RAPIER.ColliderDesc.cylinder(
        configuration.halfHeight,
        configuration.radius
      );

    configureCollider(
      description,
      configuration
    );

    return world.createCollider(
      description,
      rigidBody
    );
  }

  function createConeCollider(
    configuration
  ) {
    const description =
      RAPIER.ColliderDesc.cone(
        configuration.halfHeight,
        configuration.radius
      );

    configureCollider(
      description,
      configuration
    );

    return world.createCollider(
      description,
      rigidBody
    );
  }

  const serviceModuleCollider =
    createCylinderCollider(
      SPACECRAFT_COLLIDERS
        .serviceModule
    );

  const crewCapsuleCollider =
    createConeCollider(
      SPACECRAFT_COLLIDERS
        .crewCapsule
    );

  const dockingMechanismCollider =
    createCylinderCollider(
      SPACECRAFT_COLLIDERS
        .dockingMechanism
    );

  const colliders = [
    serviceModuleCollider,
    crewCapsuleCollider,
    dockingMechanismCollider,
  ];

  const colliderHandles = new Set(
    colliders.map(
      (collider) =>
        collider.handle
    )
  );

  function ownsCollider(handle) {
    return colliderHandles.has(handle);
  }

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

  function reset(pose) {
    const position =
      pose?.position ?? {
        x: 0,
        y: 0,
        z: 0,
      };

    const rotation =
      pose?.rotation ?? {
        x: 0,
        y: 0,
        z: 0,
        w: 1,
      };

    rigidBody.setTranslation(
      position,
      true
    );

    rigidBody.setRotation(
      rotation,
      true
    );

    stopLinearMotion();
    stopAngularMotion();

    rigidBody.resetForces(true);
    rigidBody.resetTorques(true);

    syncModel();
  }

  function dispose() {
    world.removeRigidBody(rigidBody);
  }

  console.log(
    "Configured spacecraft mass:",
    SPACECRAFT_MASS
  );

  console.log(
    "Calculated Rapier mass:",
    rigidBody.mass()
  );

  return {
    mass: SPACECRAFT_MASS,

    rigidBody,

    collider:
      dockingMechanismCollider,

    colliders,
    ownsCollider,

    serviceModuleCollider,
    crewCapsuleCollider,
    dockingMechanismCollider,

    syncModel,
    stopLinearMotion,
    stopAngularMotion,
    reset,
    dispose,
  };
}
