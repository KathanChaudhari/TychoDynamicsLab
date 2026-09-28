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

export function createSpacecraft(
  scene,
  world,
  RAPIER,
  options = {}
) {
  // Three.js visual model
  const model =
    createSpacecraftModel(
      scene,
      {
        onLoadingChange:
          options.onLoadingChange,
      }
    );

  // Rapier rigid body and colliders
  const physics =
    createSpacecraftPhysics({
      world,
      RAPIER,
      model,
    });

  // Keyboard thrust and torque controls
  const flightController =
    createFlightController(
      physics.rigidBody
    );

  // Visible wireframes representing Rapier colliders
  const colliderDebug =
    createSpacecraftColliderDebug(
      model.group
    );

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
    physics.reset();
    model.hideVelocityArrow();
  }

  function dispose() {
    /*
     * Remove the debug meshes before the main
     * spacecraft group is disposed.
     */
    colliderDebug.dispose();
    model.dispose();
  }

  return {
    // ==========================================
    // Three.js objects
    // ==========================================

    group:
      model.group,

    modelRoot:
      model.modelRoot,

    velocityArrow:
      model.velocityArrow,

    // ==========================================
    // Docking port
    // ==========================================

    dockingPort:
      model.dockingPort,

    setDockingPortDebugVisible:
      model.setDockingPortDebugVisible,

    // ==========================================
    // Collider visualization
    // ==========================================

    colliderDebug:
      colliderDebug.group,

    setColliderDebugVisible,
    toggleColliderDebug,

    // ==========================================
    // Model loading
    // ==========================================

    modelReady:
      model.ready,

    get loadedModel() {
      return model.orionModel;
    },

    // ==========================================
    // Rapier physics
    // ==========================================

    rigidBody:
      physics.rigidBody,

    /*
     * Primary collider maintained for
     * compatibility with older code.
     */
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

    // ==========================================
    // Flight controls
    // ==========================================

    applyControls:
      flightController.applyControls,

    stopLinearMotion:
      physics.stopLinearMotion,

    stopAngularMotion:
      physics.stopAngularMotion,

    // ==========================================
    // Simulation updates
    // ==========================================

    syncFromPhysics:
      physics.syncModel,

    updateVelocityArrow,

    // ==========================================
    // Lifecycle
    // ==========================================

    reset,
    dispose,
  };
}