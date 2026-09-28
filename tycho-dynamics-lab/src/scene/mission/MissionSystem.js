import {
    MissionStatus,
    MISSION_SCORING,
  } from "./MissionConfig.js";
  
  export function createMissionSystem() {
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
  
      return Math.round(
        clamp(
          MISSION_SCORING
            .baseScore -
            timePenalty -
            fuelPenalty -
            impactPenalty +
            alignmentBonus +
            velocityBonus,
          0,
          1250
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
          : "Unsafe station impact",
  
        score,
        grade: succeeded
          ? getGrade(score)
          : "F",
  
        duration: elapsedTime,
  
        propellantUsed:
          getPropellantUsed(
            telemetry
          ),
  
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
        return;
      }
  
      initialPropellant =
        propellantRemaining;
  
      elapsedTime = 0;
      maximumImpact = 0;
      latestTelemetry = null;
      result = null;
  
      status =
        MissionStatus.ACTIVE;
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
        "crashed"
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
  
    function canControl() {
      return (
        status ===
        MissionStatus.ACTIVE
      );
    }
  
    function getTelemetry() {
      return {
        status,
        elapsedTime,
  
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
  
        maximumImpact,
        result,
      };
    }
  
    return {
      start,
      update,
      reset,
      canControl,
      getTelemetry,
    };
  }