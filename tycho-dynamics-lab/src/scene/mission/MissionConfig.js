export const MissionStatus =
  Object.freeze({
    BRIEFING: "briefing",
    ACTIVE: "active",
    SUCCESS: "success",
    FAILED: "failed",
  });

export const MISSION_SCORING =
  Object.freeze({
    baseScore: 1000,

    timePenaltyPerSecond: 2,
    propellantPenaltyPerKg: 3,
    impactPenaltyDivisor: 50,

    maximumAlignmentBonus: 150,
    maximumVelocityBonus: 100,
  });