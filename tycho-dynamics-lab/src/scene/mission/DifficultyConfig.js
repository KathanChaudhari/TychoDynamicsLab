import * as THREE from "three";

import {
  CAPTURE_SETTINGS,
  DOCKING_RULES,
} from "../docking/system/DockingConfig.js";

export const DifficultyId = Object.freeze({
  EASY: "easy",
  NORMAL: "normal",
  HARD: "hard",
});

const IDENTITY_ROTATION = Object.freeze({ x: 0, y: 0, z: 0, w: 1 });

export const DIFFICULTY_PRESETS = Object.freeze({
  easy: {
    id: DifficultyId.EASY,
    label: "Easy",
    docking: {
      ...DOCKING_RULES,
      maximumClosingSpeed: 0.35,
      maximumLateralSpeed: 0.2,
      maximumAngularSpeed: 0.22,
      maximumAlignmentAngle: THREE.MathUtils.degToRad(12),
      maximumLateralOffset: 0.55,
      maximumCaptureDistance: 1.2,
      hardLockDistance: 0.08,
      hardLockClosingSpeed: 0.08,
      hardLockLateralSpeed: 0.05,
      hardLockAngularSpeed: 0.05,
      hardLockAlignmentAngle: THREE.MathUtils.degToRad(2),
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
    mission: { scoreMultiplier: 0.8 },
    startPose: {
      position: { x: 0, y: 0, z: -0.8 },
      rotation: IDENTITY_ROTATION,
    },
  },
  normal: {
    id: DifficultyId.NORMAL,
    label: "Normal",
    docking: { ...DOCKING_RULES },
    capture: { ...CAPTURE_SETTINGS },
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
    mission: { scoreMultiplier: 1 },
    startPose: {
      position: { x: 0, y: 0.85, z: -0.8 },
      rotation: IDENTITY_ROTATION,
    },
  },
  hard: {
    id: DifficultyId.HARD,
    label: "Hard",
    docking: {
      ...DOCKING_RULES,
      maximumClosingSpeed: 0.16,
      maximumLateralSpeed: 0.07,
      maximumAngularSpeed: 0.08,
      maximumAlignmentAngle: THREE.MathUtils.degToRad(3),
      maximumLateralOffset: 0.18,
      maximumCaptureDistance: 0.55,
      hardLockDistance: 0.03,
      hardLockClosingSpeed: 0.03,
      hardLockLateralSpeed: 0.018,
      hardLockAngularSpeed: 0.018,
      hardLockAlignmentAngle: THREE.MathUtils.degToRad(0.5),
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
    mission: { scoreMultiplier: 1.25 },
    startPose: {
      position: { x: 0.55, y: -0.35, z: 0.6 },
      rotation: IDENTITY_ROTATION,
    },
  },
});

const DIFFICULTY_ALIASES = Object.freeze({
  training: DifficultyId.EASY,
  standard: DifficultyId.NORMAL,
  expert: DifficultyId.HARD,
});

export const DIFFICULTY_OPTIONS = Object.freeze([
  DIFFICULTY_PRESETS.easy,
  DIFFICULTY_PRESETS.normal,
  DIFFICULTY_PRESETS.hard,
]);

export function getDifficultyPreset(difficultyId) {
  const normalizedId = DIFFICULTY_ALIASES[difficultyId] ?? difficultyId;
  return DIFFICULTY_PRESETS[normalizedId] ?? DIFFICULTY_PRESETS.normal;
}
