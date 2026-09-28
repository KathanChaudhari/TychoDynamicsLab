const MAXIMUM_INTEGRITY = 100;

const MINIMUM_DAMAGE_FORCE = 500;
const HEAVY_DAMAGE_FORCE = 2000;
const CATASTROPHIC_FORCE = 5000;

const IMPACT_COOLDOWN = 0.2;

export function createDamageSystem() {
  let integrity =
    MAXIMUM_INTEGRITY;

  let cooldown = 0;
  let impactCount = 0;

  let lastDamage = 0;
  let lastImpactForce = 0;
  let maximumImpactForce = 0;

  function calculateDamage(force) {
    if (
      force <
      MINIMUM_DAMAGE_FORCE
    ) {
      return 0;
    }

    if (
      force >=
      CATASTROPHIC_FORCE
    ) {
      return MAXIMUM_INTEGRITY;
    }

    if (
      force <
      HEAVY_DAMAGE_FORCE
    ) {
      const progress =
        (force -
          MINIMUM_DAMAGE_FORCE) /
        (HEAVY_DAMAGE_FORCE -
          MINIMUM_DAMAGE_FORCE);

      return 2 + progress * 13;
    }

    const progress =
      (force -
        HEAVY_DAMAGE_FORCE) /
      (CATASTROPHIC_FORCE -
        HEAVY_DAMAGE_FORCE);

    return 15 + progress * 45;
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
      CATASTROPHIC_FORCE;

    /*
     * Catastrophic collisions bypass the
     * cooldown. Smaller repeated contact-force
     * events are ignored briefly.
     */
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

  function reset() {
    integrity =
      MAXIMUM_INTEGRITY;

    cooldown = 0;
    impactCount = 0;

    lastDamage = 0;
    lastImpactForce = 0;
    maximumImpactForce = 0;
  }

  return {
    registerImpact,
    update,
    getTelemetry,
    reset,
  };
}