import * as THREE from "three";

export const DockingState =
  Object.freeze({
    APPROACH: "approach",
    IN_RANGE: "in-range",
    CAPTURING: "capturing",
    DOCKED: "docked",
    CRASHED: "crashed",
  });

export const DOCKING_RULES =
  Object.freeze({
    maximumClosingSpeed: 0.25,
    maximumLateralSpeed: 0.12,
    maximumAngularSpeed: 0.15,

    maximumAlignmentAngle:
      THREE.MathUtils.degToRad(7),

    maximumLateralOffset: 0.35,
    maximumCaptureDistance: 0.8,

    hardLockDistance: 0.05,
    hardLockClosingSpeed: 0.05,
    hardLockLateralSpeed: 0.03,
    hardLockAngularSpeed: 0.03,

    hardLockAlignmentAngle:
      THREE.MathUtils.degToRad(1),

    crashForce: 5000,
  });

export const CAPTURE_SETTINGS =
  Object.freeze({
    positionStrength: 500,
    positionDamping: 900,
    maximumForce: 1200,

    rotationStrength: 1000,
    rotationDamping: 650,
    maximumTorque: 1500,
  });
