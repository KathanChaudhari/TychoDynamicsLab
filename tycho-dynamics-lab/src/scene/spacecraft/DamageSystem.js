const MAXIMUM_INTEGRITY = 100;
const IMPACT_COOLDOWN = 0.2;

const DEFAULT_SETTINGS = {
  minimumDamageForce: 500,
  heavyDamageForce: 2000,
  catastrophicForce: 5000,
  multiplier: 1,
};

export function createDamageSystem(
  initialSettings = {}
) {
  let settings = {
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  };

  let integrity =
    MAXIMUM_INTEGRITY;

  let cooldown = 0;
  let impactCount = 0;

  let lastDamage = 0;
  let lastImpactForce = 0;
  let maximumImpactForce = 0;

  function configure(
    nextSettings = {}
  ) {
    settings = {
      ...DEFAULT_SETTINGS,
      ...nextSettings,
    };
  }

  function calculateDamage(force) {
    const {
      minimumDamageForce,
      heavyDamageForce,
      catastrophicForce,
      multiplier,
    } = settings;
  
    if (
      force <
      minimumDamageForce
    ) {
      return 0;
    }
  
    if (
      force >=
      catastrophicForce
    ) {
      return MAXIMUM_INTEGRITY;
    }
  
    let baseDamage;
  
    if (
      force <
      heavyDamageForce
    ) {
      const progress =
        (force -
          minimumDamageForce) /
        (heavyDamageForce -
          minimumDamageForce);
  
      baseDamage =
        2 + progress * 13;
    } else {
      const progress =
        (force -
          heavyDamageForce) /
        (catastrophicForce -
          heavyDamageForce);
  
      baseDamage =
        15 + progress * 45;
    }
  
    return Math.min(
      MAXIMUM_INTEGRITY,
      baseDamage * multiplier
    );
  }

  function registerImpact(force) {
    lastImpactForce = force;

    maximumImpactForce =
      Math.max(
        maximumImpactForce,
        force
      );

    const catastrophic =
      force >=
      settings.catastrophicForce;

    if (
      cooldown > 0 &&
      !catastrophic
    ) {
      return {
        applied: false,
        destroyed:
          integrity <= 0,
      };
    }

    const damage =
      calculateDamage(force);

    if (damage <= 0) {
      lastDamage = 0;

      return {
        applied: false,
        destroyed: false,
      };
    }

    integrity = Math.max(
      0,
      integrity - damage
    );

    lastDamage = damage;
    impactCount += 1;
    cooldown = IMPACT_COOLDOWN;

    return {
      applied: true,
      force,
      damage,
      catastrophic,
      integrity,

      destroyed:
        integrity <= 0,
    };
  }

  function update(deltaTime) {
    cooldown = Math.max(
      0,
      cooldown - deltaTime
    );
  }

  function getStatus() {
    if (integrity <= 0) {
      return "destroyed";
    }

    if (integrity <= 25) {
      return "critical";
    }

    if (integrity <= 60) {
      return "damaged";
    }

    if (integrity < 100) {
      return "degraded";
    }

    return "nominal";
  }

  function getTelemetry() {
    return {
      integrity,

      maximumIntegrity:
        MAXIMUM_INTEGRITY,

      percentage:
        (integrity /
          MAXIMUM_INTEGRITY) *
        100,

      status: getStatus(),

      impactCount,
      lastDamage,
      lastImpactForce,
      maximumImpactForce,

      destroyed:
        integrity <= 0,
    };
  }

  function reset(
    nextSettings
  ) {
    if (nextSettings) {
      configure(nextSettings);
    }

    integrity =
      MAXIMUM_INTEGRITY;

    cooldown = 0;
    impactCount = 0;

    lastDamage = 0;
    lastImpactForce = 0;
    maximumImpactForce = 0;
  }

  return {
    configure,
    registerImpact,
    update,
    getTelemetry,
    reset,
  };
}