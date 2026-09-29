const DEFAULT_SETTINGS = {
  capacity: 120,
  dryMass: 880,
  translationRate: 0.55,
  rotationRate: 0.2,
};

export function createPropellantSystem(
  initialSettings = {}
) {
  let settings = {
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  };

  let remaining =
    settings.capacity;

  let flowRate = 0;

  function configure(
    nextSettings = {}
  ) {
    settings = {
      ...DEFAULT_SETTINGS,
      ...nextSettings,
    };

    remaining = Math.min(
      remaining,
      settings.capacity
    );
  }

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
        settings.translationRate +
      rotationDemand *
        settings.rotationRate;

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

    remaining -= consumedAmount;

    if (remaining < 0.0001) {
      remaining = 0;
    }

    return requestedAmount > 0
      ? consumedAmount /
          requestedAmount
      : 1;
  }

  function getStatus() {
    const percentage =
      (remaining /
        settings.capacity) *
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
        settings.capacity) *
      100;

    return {
      capacity: settings.capacity,
      remaining,
      percentage,
      flowRate,

      dryMass:
        settings.dryMass,

      estimatedMass:
        settings.dryMass +
        remaining,

      status: getStatus(),
    };
  }

  function reset(
    nextSettings
  ) {
    if (nextSettings) {
      configure(nextSettings);
    }

    remaining =
      settings.capacity;

    flowRate = 0;
  }

  return {
    configure,
    consume,
    getTelemetry,
    reset,
  };
}