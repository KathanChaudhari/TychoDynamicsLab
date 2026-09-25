import { createSpacecraftModel } from "./SpacecraftModel.js";
import { createSpacecraftPhysics } from "./SpacecraftPhysics.js";
import { createFlightController } from "./FlightController.js";

export function createSpacecraft(
  scene,
  world,
  RAPIER
) {
  const model =
    createSpacecraftModel(scene);

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

  return {
    group: model.group,
    velocityArrow:
      model.velocityArrow,

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
  };
}