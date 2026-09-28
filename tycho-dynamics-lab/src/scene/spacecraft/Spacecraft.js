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

  const colliderDebug =
    createSpacecraftColliderDebug(
      model.group
    );

  const thrusterVisuals =
    createSpacecraftThrusterVisuals(
      model.group
    );

  function applyControls(
    pressedKeys
  ) {
    flightController.applyControls(
      pressedKeys
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
    const linearVelocity =
      physics.rigidBody.linvel();

    model.updateVelocityArrow(
      linearVelocity
    );
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
    thrusterVisuals.reset();

    physics.reset();
    model.hideVelocityArrow();
  }

  function dispose() {
    thrusterVisuals.dispose();
    colliderDebug.dispose();
    model.dispose();
  }

  return {
    // Three.js objects

    group:
      model.group,

    modelRoot:
      model.modelRoot,

    velocityArrow:
      model.velocityArrow,

    thrusterVisuals:
      thrusterVisuals.group,

    // Docking port

    dockingPort:
      model.dockingPort,

    setDockingPortDebugVisible:
      model.setDockingPortDebugVisible,

    // Collider visualization

    colliderDebug:
      colliderDebug.group,

    setColliderDebugVisible,
    toggleColliderDebug,

    // Model loading

    modelReady:
      model.ready,

    get loadedModel() {
      return model.orionModel;
    },

    // Rapier physics

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

    // Flight controls

    applyControls,

    controlState:
      flightController.controlState,

    stopLinearMotion:
      physics.stopLinearMotion,

    stopAngularMotion:
      physics.stopAngularMotion,

    // Simulation updates

    syncFromPhysics:
      physics.syncModel,

    updateVelocityArrow,
    updateThrusterVisuals,

    // Lifecycle

    reset,
    dispose,
  };
}