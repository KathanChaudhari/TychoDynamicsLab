import * as THREE from "three";

import {
  DOCKING_RULES,
  CAPTURE_SETTINGS,
} from "../docking/system/DockingConfig.js";

export const DifficultyId =
  Object.freeze({
    TRAINING: "training",
    STANDARD: "standard",
    EXPERT: "expert",
  });

function createRotation(
  xDegrees,
  yDegrees,
  zDegrees
) {
  const quaternion =
    new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        THREE.MathUtils.degToRad(
          xDegrees
        ),
        THREE.MathUtils.degToRad(
          yDegrees
        ),
        THREE.MathUtils.degToRad(
          zDegrees
        )
      )
    );

  return {
    x: quaternion.x,
    y: quaternion.y,
    z: quaternion.z,
    w: quaternion.w,
  };
}

export const DIFFICULTY_PRESETS =
  Object.freeze({
    training: {
      id: DifficultyId.TRAINING,
      label: "Training",
      description:
        "Strong capture assistance and forgiving safety limits.",

      docking: {
        ...DOCKING_RULES,

        maximumClosingSpeed: 0.35,
        maximumLateralSpeed: 0.2,
        maximumAngularSpeed: 0.22,

        maximumAlignmentAngle:
          THREE.MathUtils.degToRad(
            12
          ),

        maximumLateralOffset: 0.55,
        maximumCaptureDistance: 1.2,

        hardLockDistance: 0.08,
        hardLockClosingSpeed: 0.08,
        hardLockLateralSpeed: 0.05,
        hardLockAngularSpeed: 0.05,

        hardLockAlignmentAngle:
          THREE.MathUtils.degToRad(
            2
          ),

        crashForce: 6500,
      },

      capture: {
        ...CAPTURE_SETTINGS,

        positionStrength: 650,
        positionDamping: 1000,
        maximumForce: 1600,

        rotationStrength: 1250,
        rotationDamping: 800,
        maximumTorque: 1900,
      },

      propellant: {
        capacity: 180,
        dryMass: 880,
        translationRate: 0.45,
        rotationRate: 0.15,
      },

      damage: {
        minimumDamageForce: 650,
        heavyDamageForce: 2600,
        catastrophicForce: 6500,
        multiplier: 0.55,
      },

      mission: {
        scoreMultiplier: 0.8,
      },

      startPose: {
        position: {
          x: 0,
          y: 0,
          z: -0.8,
        },

        rotation:
          createRotation(0, 0, 0),
      },
    },

    standard: {
      id: DifficultyId.STANDARD,
      label: "Standard",
      description:
        "Balanced docking limits, fuel and capture assistance.",

      docking: {
        ...DOCKING_RULES,
      },

      capture: {
        ...CAPTURE_SETTINGS,
      },

      propellant: {
        capacity: 120,
        dryMass: 880,
        translationRate: 0.55,
        rotationRate: 0.2,
      },

      damage: {
        minimumDamageForce: 500,
        heavyDamageForce: 2000,
        catastrophicForce: 5000,
        multiplier: 1,
      },

      mission: {
        scoreMultiplier: 1,
      },

      startPose: {
        position: {
          x: 0,
          y: 0,
          z: 0,
        },

        rotation:
          createRotation(0, 0, 0),
      },
    },

    expert: {
      id: DifficultyId.EXPERT,
      label: "Expert",
      description:
        "Strict limits, reduced fuel and weaker capture assistance.",

      docking: {
        ...DOCKING_RULES,

        maximumClosingSpeed: 0.16,
        maximumLateralSpeed: 0.07,
        maximumAngularSpeed: 0.08,

        maximumAlignmentAngle:
          THREE.MathUtils.degToRad(
            3
          ),

        maximumLateralOffset: 0.18,
        maximumCaptureDistance: 0.55,

        hardLockDistance: 0.03,
        hardLockClosingSpeed: 0.03,
        hardLockLateralSpeed: 0.018,
        hardLockAngularSpeed: 0.018,

        hardLockAlignmentAngle:
          THREE.MathUtils.degToRad(
            0.5
          ),

        crashForce: 3500,
      },

      capture: {
        ...CAPTURE_SETTINGS,

        positionStrength: 300,
        positionDamping: 650,
        maximumForce: 700,

        rotationStrength: 500,
        rotationDamping: 450,
        maximumTorque: 750,
      },

      propellant: {
        capacity: 75,
        dryMass: 880,
        translationRate: 0.7,
        rotationRate: 0.28,
      },

      damage: {
        minimumDamageForce: 350,
        heavyDamageForce: 1400,
        catastrophicForce: 3500,
        multiplier: 1.4,
      },

      mission: {
        scoreMultiplier: 1.25,
      },

      startPose: {
        position: {
          x: 0.55,
          y: -0.35,
          z: 0.6,
        },

        rotation:
          createRotation(
            4,
            -5,
            3
          ),
      },
    },
  });

export const DIFFICULTY_OPTIONS =
  Object.freeze([
    DIFFICULTY_PRESETS.training,
    DIFFICULTY_PRESETS.standard,
    DIFFICULTY_PRESETS.expert,
  ]);

export function getDifficultyPreset(
  difficultyId
) {
  return (
    DIFFICULTY_PRESETS[
      difficultyId
    ] ??
    DIFFICULTY_PRESETS.standard
  );
}