export function createDockingJointController({
  world,
  RAPIER,
  spacecraft,
  station,
}) {
  let dockingJoint = null;

  function getAnchorPosition(
    dockingPort
  ) {
    return {
      x: dockingPort.position.x,
      y: dockingPort.position.y,
      z: dockingPort.position.z,
    };
  }

  function getAnchorRotation(
    dockingPort
  ) {
    return {
      x: dockingPort.quaternion.x,
      y: dockingPort.quaternion.y,
      z: dockingPort.quaternion.z,
      w: dockingPort.quaternion.w,
    };
  }

  function create() {
    if (dockingJoint) {
      return;
    }

    if (
      !spacecraft.dockingPort ||
      !station.dockingPort
    ) {
      console.error(
        "Cannot create docking joint: docking-port anchors are missing."
      );

      return;
    }

    const stationAnchor =
      getAnchorPosition(
        station.dockingPort
      );

    const spacecraftAnchor =
      getAnchorPosition(
        spacecraft.dockingPort
      );

    const stationFrameRotation =
      getAnchorRotation(
        station.dockingPort
      );

    const spacecraftFrameRotation =
      getAnchorRotation(
        spacecraft.dockingPort
      );

    spacecraft.stopLinearMotion();
    spacecraft.stopAngularMotion();

    const jointData =
      RAPIER.JointData.fixed(
        stationAnchor,
        stationFrameRotation,
        spacecraftAnchor,
        spacecraftFrameRotation
      );

    dockingJoint =
      world.createImpulseJoint(
        jointData,
        station.rigidBody,
        spacecraft.rigidBody,
        true
      );

    console.log(
      "Docking joint created",
      {
        stationAnchor,
        spacecraftAnchor,
      }
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

    console.log(
      "Docking joint removed"
    );
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
