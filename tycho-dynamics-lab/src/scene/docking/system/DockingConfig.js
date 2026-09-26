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
    maximumSpeed: 0.25,
    maximumAngularSpeed: 0.15,

    maximumAlignmentAngle:
      THREE.MathUtils.degToRad(7),

    maximumLateralOffset: 0.35,
    maximumCaptureDistance: 0.8,

    hardLockDistance: 0.05,
    hardLockSpeed: 0.05,
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

export const SPACECRAFT_DOCKING_POINT =
  Object.freeze({
    x: 0,
    y: 0,
    z: -2.7,
  });

export const IDENTITY_ROTATION =
  Object.freeze({
    x: 0,
    y: 0,
    z: 0,
    w: 1,
  });