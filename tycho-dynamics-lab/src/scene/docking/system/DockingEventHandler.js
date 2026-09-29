export function createDockingEventHandler({
  spacecraft,
  station,
  getRules,
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
    return spacecraft.ownsCollider
      ? spacecraft.ownsCollider(
          handle
        )
      : handle ===
          spacecraft.collider.handle;
  }

  function handleCollisionEvent(
    handle1,
    handle2,
    started
  ) {
    const firstIsSensor =
      handle1 === sensorHandle;

    const secondIsSensor =
      handle2 === sensorHandle;

    if (
      !firstIsSensor &&
      !secondIsSensor
    ) {
      return;
    }

    const otherHandle =
      firstIsSensor
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
      getRules().crashForce;

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

  function reset() {
    lastImpactForce = 0;

    sensorContactHandles.clear();

    onSensorChange(false);
  }

  return {
    handleCollisionEvent,
    handleContactForceEvent,

    getLastImpactForce() {
      return lastImpactForce;
    },

    reset,
  };
}