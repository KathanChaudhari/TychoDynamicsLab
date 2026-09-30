import * as THREE from "three";

export function createDockingTelemetrySnapshot({
  state,
  insideSensor,
  crashReason,
  difficulty,
  metrics,
  impactForce,
  damage,
  propellant,
  rules,
}) {
  return {
    state,
    insideSensor,
    crashReason,
    difficulty: {
      id: difficulty?.id ?? "normal",
      label: difficulty?.label ?? "Normal",
    },
    speed: metrics.speed,
    closingSpeed: metrics.closingSpeed,
    lateralSpeed: metrics.lateralSpeed,
    horizontalSpeed: metrics.horizontalSpeed,
    verticalSpeed: metrics.verticalSpeed,
    angularSpeed: metrics.angularSpeed,
    alignmentAngle: metrics.alignmentAngle,
    horizontalOffset: metrics.horizontalOffset,
    verticalOffset: metrics.verticalOffset,
    lateralOffset: metrics.lateralOffset,
    axialDistance: metrics.axialDistance,
    distance: metrics.distance,
    timeToContact: metrics.timeToContact,
    impactForce,
    damage,
    propellant,
    checks: { ...metrics.checks },
    limits: {
      maximumClosingSpeed: rules.maximumClosingSpeed,
      maximumLateralSpeed: rules.maximumLateralSpeed,
      maximumAngularSpeed: rules.maximumAngularSpeed,
      maximumAlignmentAngle: THREE.MathUtils.radToDeg(
        rules.maximumAlignmentAngle
      ),
      maximumLateralOffset: rules.maximumLateralOffset,
      maximumCaptureDistance: rules.maximumCaptureDistance,
      crashForce: rules.crashForce,
    },
  };
}
