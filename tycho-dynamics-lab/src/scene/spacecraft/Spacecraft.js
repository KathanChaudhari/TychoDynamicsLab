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
  let difficulty =
    options.difficulty ?? null;

  const model =
    createSpacecraftModel(scene, {
      onLoadingChange:
        options.onLoadingChange,
    });

  const physics =
    createSpacecraftPhysics({
      world,
      RAPIER,
      model,

      initialPose:
        difficulty?.startPose,
    });

  const flightController =
    createFlightController(
      physics.rigidBody
    );

  const propellantSystem =
    createPropellantSystem(
      difficulty?.propellant
    );

  const damageSystem =
    createDamageSystem(
      difficulty?.damage
    );

  const colliderDebug =
    createSpacecraftColliderDebug(
      model.group
    );

  const thrusterVisuals =
    createSpacecraftThrusterVisuals(
      model.group
    );

  function configureDifficulty(
    nextDifficulty
  ) {
    difficulty = nextDifficulty;

    propellantSystem.configure(
      difficulty.propellant
    );

    damageSystem.configure(
      difficulty.damage
    );
  }

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

  function updateVelocityArrow() {
    model.updateVelocityArrow(
      physics.rigidBody.linvel()
    );
  }

  function registerImpact(force) {
    return damageSystem
      .registerImpact(force);
  }

  function updateDamage(deltaTime) {
    damageSystem.update(deltaTime);
  }

  function reset() {
    flightController.clearControls();

    propellantSystem.reset(
      difficulty?.propellant
    );

    damageSystem.reset(
      difficulty?.damage
    );

    thrusterVisuals.reset();

    physics.reset(
      difficulty?.startPose
    );

    model.hideVelocityArrow();
  }

  function dispose() {
    thrusterVisuals.dispose();
    colliderDebug.dispose();
    model.dispose();
  }

  return {
    group: model.group,
    modelRoot: model.modelRoot,

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

    setColliderDebugVisible:
      colliderDebug.setVisible,

    toggleColliderDebug:
      colliderDebug.toggle,

    modelReady: model.ready,

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

    mass: physics.mass,

    configureDifficulty,

    applyControls,

    controlState:
      flightController.controlState,

    getPropellantTelemetry:
      propellantSystem.getTelemetry,

    registerImpact,

    updateDamage,

    getDamageTelemetry:
      damageSystem.getTelemetry,

    stopLinearMotion:
      physics.stopLinearMotion,

    stopAngularMotion:
      physics.stopAngularMotion,

    syncFromPhysics:
      physics.syncModel,

    updateVelocityArrow,
    updateThrusterVisuals,

    reset,
    dispose,
  };
}