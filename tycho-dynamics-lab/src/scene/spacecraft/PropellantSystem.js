const PROPELLANT_CAPACITY = 120;
const SPACECRAFT_DRY_MASS = 880;

const TRANSLATION_RATE = 0.55;
const ROTATION_RATE = 0.2;

export function createPropellantSystem() {
  let remaining =
    PROPELLANT_CAPACITY;

  let flowRate = 0;

  function getAxisDemand(vector) {
    return (
      Math.abs(vector.x) +
      Math.abs(vector.y) +
      Math.abs(vector.z)
    );
  }

  function consume(
    controlState,
    deltaTime
  ) {
    const translationDemand =
      getAxisDemand(
        controlState.translation
      );

    const rotationDemand =
      getAxisDemand(
        controlState.rotation
      );

    flowRate =
      translationDemand *
        TRANSLATION_RATE +
      rotationDemand *
        ROTATION_RATE;

    if (flowRate === 0) {
      return 1;
    }

    if (remaining <= 0) {
      remaining = 0;
      flowRate = 0;

      return 0;
    }

    const requestedAmount =
      flowRate * deltaTime;

    const consumedAmount =
      Math.min(
        remaining,
        requestedAmount
      );

    remaining -=
      consumedAmount;

    if (remaining < 0.0001) {
      remaining = 0;
    }

    /*
     * Usually this is 1. It becomes less than
     * 1 during the final physics step when
     * only a small amount of fuel remains.
     */
    return requestedAmount > 0
      ? consumedAmount /
          requestedAmount
      : 1;
  }

  function getStatus() {
    const percentage =
      (remaining /
        PROPELLANT_CAPACITY) *
      100;

    if (percentage <= 0) {
      return "empty";
    }

    if (percentage <= 5) {
      return "critical";
    }

    if (percentage <= 20) {
      return "low";
    }

    return "nominal";
  }

  function getTelemetry() {
    const percentage =
      (remaining /
        PROPELLANT_CAPACITY) *
      100;

    return {
      capacity:
        PROPELLANT_CAPACITY,

      remaining,

      percentage,

      flowRate,

      dryMass:
        SPACECRAFT_DRY_MASS,

      estimatedMass:
        SPACECRAFT_DRY_MASS +
        remaining,

      status: getStatus(),
    };
  }

  function reset() {
    remaining =
      PROPELLANT_CAPACITY;

    flowRate = 0;
  }

  return {
    consume,
    getTelemetry,
    reset,
  };
}