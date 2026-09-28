import {
    GATEWAY_COLLIDERS,
    GATEWAY_SENSOR,
    GATEWAY_STATION_Z,
  } from "./GatewayColliderConfig.js";
  
  export function createGatewayPhysics({
    world,
    RAPIER,
  }) {
    const rigidBodyDescription =
      RAPIER.RigidBodyDesc
        .fixed()
        .setTranslation(
          0,
          0,
          GATEWAY_STATION_Z
        );
  
    const rigidBody =
      world.createRigidBody(
        rigidBodyDescription
      );
  
    function createRotation(
      rotationX = 0
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
  
    function createDescription(
      configuration
    ) {
      if (
        configuration.shape ===
        "cylinder"
      ) {
        return RAPIER.ColliderDesc
          .cylinder(
            configuration.halfHeight,
            configuration.radius
          );
      }
  
      if (
        configuration.shape ===
        "cuboid"
      ) {
        return RAPIER.ColliderDesc
          .cuboid(
            configuration
              .halfExtents.x,
  
            configuration
              .halfExtents.y,
  
            configuration
              .halfExtents.z
          );
      }
  
      throw new Error(
        `Unsupported Gateway collider: ${configuration.shape}`
      );
    }
  
    function createSolidCollider(
      configuration
    ) {
      const description =
        createDescription(
          configuration
        )
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
          .setFriction(0.6)
          .setRestitution(0.05)
          .setActiveEvents(
            RAPIER.ActiveEvents
              .COLLISION_EVENTS |
              RAPIER.ActiveEvents
                .CONTACT_FORCE_EVENTS
          )
          .setContactForceEventThreshold(
            100
          );
  
      return world.createCollider(
        description,
        rigidBody
      );
    }
  
    const dockingAdapterCollider =
      createSolidCollider(
        GATEWAY_COLLIDERS
          .dockingAdapter
      );
  
    const forwardModuleCollider =
      createSolidCollider(
        GATEWAY_COLLIDERS
          .forwardModule
      );
  
    const coreModuleCollider =
      createSolidCollider(
        GATEWAY_COLLIDERS
          .coreModule
      );
  
    const sideModuleCollider =
      createSolidCollider(
        GATEWAY_COLLIDERS
          .sideModule
      );
  
    const solidColliders = [
      dockingAdapterCollider,
      forwardModuleCollider,
      coreModuleCollider,
      sideModuleCollider,
    ];
  
    const solidColliderHandles =
      new Set(
        solidColliders.map(
          (collider) =>
            collider.handle
        )
      );
  
    const sensorDescription =
      RAPIER.ColliderDesc
        .cuboid(
          GATEWAY_SENSOR
            .halfExtents.x,
  
          GATEWAY_SENSOR
            .halfExtents.y,
  
          GATEWAY_SENSOR
            .halfExtents.z
        )
        .setTranslation(
          GATEWAY_SENSOR.position.x,
          GATEWAY_SENSOR.position.y,
          GATEWAY_SENSOR.position.z
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
  
    function ownsSolidCollider(
      handle
    ) {
      return solidColliderHandles.has(
        handle
      );
    }
  
    return {
      rigidBody,
      solidColliders,
      dockingSensor,
  
      dockingAdapterCollider,
      forwardModuleCollider,
      coreModuleCollider,
      sideModuleCollider,
  
      ownsSolidCollider,
    };
  }