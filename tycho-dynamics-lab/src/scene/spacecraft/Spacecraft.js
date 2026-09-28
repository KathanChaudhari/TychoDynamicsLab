import {
  createSpacecraftModel,
} from "./SpacecraftModel.js";

import {
  createSpacecraftPhysics,
} from "./SpacecraftPhysics.js";

import {
  createFlightController,
} from "./FlightController.js";

import {
  createSpacecraftColliderDebug,
} from "./SpacecraftColliderDebug.js";

import {
  createSpacecraftThrusterVisuals,
} from "./SpacecraftThrusterVisuals.js";

import {
  createPropellantSystem,
} from "./PropellantSystem.js";

import {
  createDamageSystem,
} from "./DamageSystem.js";

export function createSpacecraft(
  scene,
  world,
  RAPIER,
  options = {}
) {
  const model =
    createSpacecraftModel(
      scene,
      {
        onLoadingChange:
          options.onLoadingChange,
      }
    );

  const physics =
    createSpacecraftPhysics({
      world,
      RAPIER,
      model,
    });

  const flightController =
    createFlightController(
      physics.rigidBody
    );

  const propellantSystem =
    createPropellantSystem();

    const damageSystem =
  createDamageSystem();

  const colliderDebug =
    createSpacecraftColliderDebug(
      model.group
    );

  const thrusterVisuals =
    createSpacecraftThrusterVisuals(
      model.group
    );

  function applyControls(
    pressedKeys,
    deltaTime
  ) {
    flightController.setInput(
      pressedKeys
    );

    const thrustScale =
      propellantSystem.consume(
        flightController.controlState,
        deltaTime
      );

    flightController
      .applyCurrentControls(
        thrustScale
      );
  }

  function updateThrusterVisuals(
    deltaTime
  ) {
    thrusterVisuals.update(
      flightController.controlState,
      deltaTime
    );
  }

  function getPropellantTelemetry() {
    return propellantSystem
      .getTelemetry();
  }

  function updateVelocityArrow() {
    const linearVelocity =
      physics.rigidBody.linvel();

    model.updateVelocityArrow(
      linearVelocity
    );
  }
  function registerImpact(force) {
    return damageSystem
      .registerImpact(force);
  }
  
  function updateDamage(deltaTime) {
    damageSystem.update(deltaTime);
  }
  
  function getDamageTelemetry() {
    return damageSystem
      .getTelemetry();
  }

  function setColliderDebugVisible(
    visible
  ) {
    colliderDebug.setVisible(
      visible
    );
  }

  function toggleColliderDebug() {
    return colliderDebug.toggle();
  }

  function reset() {
    flightController.clearControls();
    propellantSystem.reset();
    thrusterVisuals.reset();

    physics.reset();
    damageSystem.reset();
    model.hideVelocityArrow();
  }

  function dispose() {
    thrusterVisuals.dispose();
    colliderDebug.dispose();
    model.dispose();
  }

  return {
    group:
      model.group,

    modelRoot:
      model.modelRoot,

    velocityArrow:
      model.velocityArrow,

    thrusterVisuals:
      thrusterVisuals.group,

    dockingPort:
      model.dockingPort,

    setDockingPortDebugVisible:
      model.setDockingPortDebugVisible,

    colliderDebug:
      colliderDebug.group,

    setColliderDebugVisible,
    toggleColliderDebug,

    modelReady:
      model.ready,

    get loadedModel() {
      return model.orionModel;
    },

    rigidBody:
      physics.rigidBody,

    collider:
      physics.collider,

    colliders:
      physics.colliders,

    ownsCollider:
      physics.ownsCollider,

    serviceModuleCollider:
      physics.serviceModuleCollider,

    crewCapsuleCollider:
      physics.crewCapsuleCollider,

    dockingMechanismCollider:
      physics.dockingMechanismCollider,

    mass:
      physics.mass,

    applyControls,

    controlState:
      flightController.controlState,

    getPropellantTelemetry,

    stopLinearMotion:
      physics.stopLinearMotion,

    stopAngularMotion:
      physics.stopAngularMotion,

    syncFromPhysics:
      physics.syncModel,

    updateVelocityArrow,
    updateThrusterVisuals,

    registerImpact,
updateDamage,
getDamageTelemetry,
    reset,
    
    dispose,
  };
}