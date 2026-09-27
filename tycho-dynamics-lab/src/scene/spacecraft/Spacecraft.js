import {
  createSpacecraftModel,
} from "./SpacecraftModel.js";

import {
  createSpacecraftPhysics,
} from "./SpacecraftPhysics.js";

import {
  createFlightController,
} from "./FlightController.js";

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

  function updateVelocityArrow() {
    const linearVelocity =
      physics.rigidBody.linvel();

    model.updateVelocityArrow(
      linearVelocity
    );
  }

  function reset() {
    physics.reset();
    model.hideVelocityArrow();
  }

  function dispose() {
    model.dispose();
  }

  return {
    group: model.group,

    modelRoot:
      model.modelRoot,

    velocityArrow:
      model.velocityArrow,

    modelReady:
      model.ready,

    get loadedModel() {
      return model.orionModel;
    },

    rigidBody:
      physics.rigidBody,

    collider:
      physics.collider,

    mass:
      physics.mass,

    applyControls:
      flightController.applyControls,

    syncFromPhysics:
      physics.syncModel,

    updateVelocityArrow,

    stopLinearMotion:
      physics.stopLinearMotion,

    stopAngularMotion:
      physics.stopAngularMotion,

    reset,
    dispose,
  };
}