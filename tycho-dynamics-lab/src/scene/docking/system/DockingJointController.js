import {
    IDENTITY_ROTATION,
    SPACECRAFT_DOCKING_POINT,
  } from "./DockingConfig";
  
  export function createDockingJointController({
    world,
    RAPIER,
    spacecraft,
    station,
  }) {
    let dockingJoint = null;
  
    function create() {
      if (dockingJoint) {
        return;
      }
  
      spacecraft.stopLinearMotion();
      spacecraft.stopAngularMotion();
  
      const jointData =
        RAPIER.JointData.fixed(
          {
            x: 0,
            y: 0,
            z: 0,
          },
          IDENTITY_ROTATION,
          SPACECRAFT_DOCKING_POINT,
          IDENTITY_ROTATION
        );
  
      dockingJoint =
        world.createImpulseJoint(
          jointData,
          station.rigidBody,
          spacecraft.rigidBody,
          true
        );
    }
  
    function remove() {
      if (!dockingJoint) {
        return;
      }
  
      world.removeImpulseJoint(
        dockingJoint,
        true
      );
  
      dockingJoint = null;
    }
  
    function exists() {
      return dockingJoint !== null;
    }
  
    return {
      create,
      remove,
      exists,
    };
  }