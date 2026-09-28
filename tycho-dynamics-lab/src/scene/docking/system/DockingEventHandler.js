import {
  DOCKING_RULES,
} from "./DockingConfig.js";

export function createDockingEventHandler({
  spacecraft,
  station,
  onSensorChange,
  onImpact,
  onCrash,
}) {
  let lastImpactForce = 0;

  const sensorHandle =
    station.dockingSensor.handle;

  const stationColliderHandles =
    new Set(
      station.frameColliders.map(
        (collider) =>
          collider.handle
      )
    );

  const sensorContactHandles =
    new Set();

  function ownsSpacecraftCollider(
    handle
  ) {
    if (
      spacecraft.ownsCollider
    ) {
      return spacecraft
        .ownsCollider(handle);
    }

    return (
      handle ===
      spacecraft.collider.handle
    );
  }

  function handleCollisionEvent(
    handle1,
    handle2,
    started
  ) {
    const handle1IsSensor =
      handle1 === sensorHandle;

    const handle2IsSensor =
      handle2 === sensorHandle;

    if (
      !handle1IsSensor &&
      !handle2IsSensor
    ) {
      return;
    }

    const otherHandle =
      handle1IsSensor
        ? handle2
        : handle1;

    if (
      !ownsSpacecraftCollider(
        otherHandle
      )
    ) {
      return;
    }

    if (started) {
      sensorContactHandles.add(
        otherHandle
      );
    } else {
      sensorContactHandles.delete(
        otherHandle
      );
    }

    /*
     * Compound colliders can enter and leave
     * individually. Orion is inside while at
     * least one collider overlaps the sensor.
     */
    onSensorChange(
      sensorContactHandles.size > 0
    );
  }

  function isSpacecraftStationPair(
    handle1,
    handle2
  ) {
    return (
      (ownsSpacecraftCollider(
        handle1
      ) &&
        stationColliderHandles.has(
          handle2
        )) ||
      (ownsSpacecraftCollider(
        handle2
      ) &&
        stationColliderHandles.has(
          handle1
        ))
    );
  }

  function handleContactForceEvent(
    event
  ) {
    const handle1 =
      event.collider1();

    const handle2 =
      event.collider2();

    if (
      !isSpacecraftStationPair(
        handle1,
        handle2
      )
    ) {
      return;
    }

    const impactForce =
      event.totalForceMagnitude();

    lastImpactForce = Math.max(
      lastImpactForce,
      impactForce
    );

    const damageResult =
      onImpact?.(impactForce);

    const catastrophic =
      impactForce >=
      DOCKING_RULES.crashForce;

    const destroyed =
      damageResult?.destroyed ??
      false;

    if (
      catastrophic ||
      destroyed
    ) {
      onCrash?.(
        impactForce,
        catastrophic
          ? "catastrophic-impact"
          : "hull-destroyed"
      );
    }
  }

  function getLastImpactForce() {
    return lastImpactForce;
  }

  function reset() {
    lastImpactForce = 0;

    sensorContactHandles.clear();

    onSensorChange(false);
  }

  return {
    handleCollisionEvent,
    handleContactForceEvent,
    getLastImpactForce,
    reset,
  };
}