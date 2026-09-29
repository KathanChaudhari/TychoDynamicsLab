import {
  MissionStatus,
  MISSION_SCORING,
} from "./MissionConfig.js";

import {
  getDifficultyPreset,
} from "./DifficultyConfig.js";

export function createMissionSystem({
  difficulty,
} = {}) {
  let activeDifficulty =
    difficulty ??
    getDifficultyPreset(
      "standard"
    );

  let status =
    MissionStatus.BRIEFING;

  let elapsedTime = 0;
  let initialPropellant = 120;
  let maximumImpact = 0;

  let latestTelemetry = null;
  let result = null;

  function clamp(
    value,
    minimum,
    maximum
  ) {
    return Math.min(
      Math.max(value, minimum),
      maximum
    );
  }

  function setDifficulty(
    nextDifficulty
  ) {
    if (
      status !==
      MissionStatus.BRIEFING
    ) {
      return false;
    }

    activeDifficulty =
      nextDifficulty;

    return true;
  }

  function getPropellantUsed(
    telemetry
  ) {
    const remaining =
      telemetry?.propellant
        ?.remaining ??
      initialPropellant;

    return Math.max(
      0,
      initialPropellant -
        remaining
    );
  }

  function getHullDamage(
    telemetry
  ) {
    return Math.max(
      0,
      100 -
        (telemetry?.damage
          ?.integrity ?? 100)
    );
  }

  function calculateScore(
    telemetry
  ) {
    if (!telemetry) {
      return MISSION_SCORING
        .baseScore;
    }

    const timePenalty =
      elapsedTime *
      MISSION_SCORING
        .timePenaltyPerSecond;

    const fuelPenalty =
      getPropellantUsed(
        telemetry
      ) *
      MISSION_SCORING
        .propellantPenaltyPerKg;

    const impactPenalty =
      maximumImpact /
      MISSION_SCORING
        .impactPenaltyDivisor;

    const damagePenalty =
      getHullDamage(telemetry) *
      MISSION_SCORING
        .damagePenaltyPerPercent;

    const maximumAlignment =
      telemetry.limits
        ?.maximumAlignmentAngle ??
      7;

    const alignmentRatio =
      1 -
      clamp(
        telemetry.alignmentAngle /
          maximumAlignment,
        0,
        1
      );

    const alignmentBonus =
      alignmentRatio *
      MISSION_SCORING
        .maximumAlignmentBonus;

    const maximumClosingSpeed =
      telemetry.limits
        ?.maximumClosingSpeed ??
      0.25;

    const velocityRatio =
      1 -
      clamp(
        Math.abs(
          telemetry.closingSpeed
        ) /
          maximumClosingSpeed,
        0,
        1
      );

    const velocityBonus =
      velocityRatio *
      MISSION_SCORING
        .maximumVelocityBonus;

    const rawScore =
      MISSION_SCORING.baseScore -
      timePenalty -
      fuelPenalty -
      impactPenalty -
      damagePenalty +
      alignmentBonus +
      velocityBonus;

    const multiplier =
      activeDifficulty
        .mission
        .scoreMultiplier;

    return Math.round(
      Math.max(
        0,
        rawScore * multiplier
      )
    );
  }

  function getGrade(score) {
    if (score >= 1100) {
      return "S";
    }

    if (score >= 900) {
      return "A";
    }

    if (score >= 700) {
      return "B";
    }

    if (score >= 500) {
      return "C";
    }

    return "D";
  }

  function getFailureReason(
    telemetry
  ) {
    if (
      telemetry.crashReason ===
      "hull-destroyed"
    ) {
      return "Hull integrity lost";
    }

    if (
      telemetry.crashReason ===
      "catastrophic-impact"
    ) {
      return "Catastrophic station impact";
    }

    return "Unsafe station impact";
  }

  function finish(
    outcome,
    telemetry
  ) {
    const succeeded =
      outcome ===
      MissionStatus.SUCCESS;

    const score = succeeded
      ? calculateScore(telemetry)
      : 0;

    status = outcome;

    result = {
      outcome,

      reason: succeeded
        ? "Docking confirmed"
        : getFailureReason(
            telemetry
          ),

      score,

      grade: succeeded
        ? getGrade(score)
        : "F",

      difficulty:
        activeDifficulty.label,

      duration: elapsedTime,

      propellantUsed:
        getPropellantUsed(
          telemetry
        ),

      hullIntegrity:
        telemetry.damage
          ?.integrity ?? 100,

      totalDamage:
        getHullDamage(
          telemetry
        ),

      impactCount:
        telemetry.damage
          ?.impactCount ?? 0,

      maximumImpact,

      finalClosingSpeed:
        telemetry.closingSpeed,

      finalLateralSpeed:
        telemetry.lateralSpeed,

      finalAlignment:
        telemetry.alignmentAngle,
    };
  }

  function start(
    propellantRemaining = 120
  ) {
    if (
      status !==
      MissionStatus.BRIEFING
    ) {
      return false;
    }

    initialPropellant =
      propellantRemaining;

    elapsedTime = 0;
    maximumImpact = 0;
    latestTelemetry = null;
    result = null;

    status =
      MissionStatus.ACTIVE;

    return true;
  }

  function update(
    deltaTime,
    telemetry
  ) {
    latestTelemetry = telemetry;

    if (
      status !==
      MissionStatus.ACTIVE
    ) {
      return;
    }

    elapsedTime += deltaTime;

    maximumImpact = Math.max(
      maximumImpact,
      telemetry.impactForce ?? 0
    );

    if (
      telemetry.state ===
      "docked"
    ) {
      finish(
        MissionStatus.SUCCESS,
        telemetry
      );

      return;
    }

    if (
      telemetry.state ===
        "crashed" ||
      telemetry.damage?.destroyed
    ) {
      finish(
        MissionStatus.FAILED,
        telemetry
      );
    }
  }

  function reset(
    propellantRemaining = 120
  ) {
    status =
      MissionStatus.BRIEFING;

    elapsedTime = 0;

    initialPropellant =
      propellantRemaining;

    maximumImpact = 0;
    latestTelemetry = null;
    result = null;
  }

  function getTelemetry() {
    return {
      status,
      elapsedTime,

      difficultyId:
        activeDifficulty.id,

      difficultyLabel:
        activeDifficulty.label,

      scoreMultiplier:
        activeDifficulty
          .mission
          .scoreMultiplier,

      score:
        status ===
        MissionStatus.ACTIVE
          ? calculateScore(
              latestTelemetry
            )
          : result?.score ?? 0,

      propellantUsed:
        latestTelemetry
          ? getPropellantUsed(
              latestTelemetry
            )
          : 0,

      hullIntegrity:
        latestTelemetry
          ?.damage?.integrity ??
        100,

      maximumImpact,
      result,
    };
  }

  return {
    setDifficulty,
    start,
    update,
    reset,

    canControl() {
      return (
        status ===
        MissionStatus.ACTIVE
      );
    },

    getTelemetry,
  };
}