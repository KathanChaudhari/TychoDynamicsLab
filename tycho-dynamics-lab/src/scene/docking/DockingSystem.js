import * as THREE from "three";

import {
  DockingState,
  DOCKING_RULES,
  CAPTURE_SETTINGS,
} from "./system/DockingConfig";

import {
  createDockingTelemetry,
} from "./system/DockingTelemetry";

import {
  createCaptureController,
} from "./system/CaptureController";

import {
  createDockingJointController,
} from "./system/DockingJointController";

import {
  createDockingEventHandler,
} from "./system/DockingEventHandler";

import { createDockingTelemetrySnapshot } from "./system/createDockingTelemetrySnapshot.js";


export {
  DockingState,
} from "./system/DockingConfig";

export function createDockingSystem({
  world,
  RAPIER,
  spacecraft,
  station,
  difficulty,
}) {
  let state = DockingState.APPROACH;

  let activeDifficulty =
  difficulty;

let rules =
  difficulty?.docking ??
  DOCKING_RULES;

let captureSettings =
  difficulty?.capture ??
  CAPTURE_SETTINGS;

function getRules() {
  return rules;
}

function getCaptureSettings() {
  return captureSettings;
}

function setDifficulty(
  nextDifficulty
) {
  activeDifficulty =
    nextDifficulty;

  rules =
    nextDifficulty.docking;

  captureSettings =
    nextDifficulty.capture;
}

  let insideSensor = false;
  let crashReason = null;

  const telemetry =
  createDockingTelemetry({
    spacecraft,
    station,
    getRules,
  });

  const captureController =
    createCaptureController({
      spacecraft,
      telemetry,
      getSettings:
        getCaptureSettings,
    });

  const jointController =
    createDockingJointController({
      world,
      RAPIER,
      spacecraft,
      station,
    });

    const eventHandler =
    createDockingEventHandler({
      spacecraft,
      station,
      getRules,

    onSensorChange(started) {
      insideSensor = started;
    },

    onImpact(impactForce) {
      return spacecraft
        .registerImpact(
          impactForce
        );
    },

    onCrash(
      impactForce,
      reason
    ) {
      if (
        state ===
        DockingState.CRASHED
      ) {
        return;
      }

      crashReason = reason;

      jointController.remove();

      setState(
        DockingState.CRASHED
      );

      spacecraft
        .stopLinearMotion();

      spacecraft
        .stopAngularMotion();

      console.warn(
        "Spacecraft crash:",
        {
          impactForce,
          reason,
        }
      );
    },
  });

  function setState(nextState) {
    if (state === nextState) {
      return;
    }

    state = nextState;
    station.setStatus(nextState);
  }

  function isSafeToCapture() {
    const { checks } =
      telemetry.metrics;
  
    return (
      checks.closingSpeed &&
      checks.lateralSpeed &&
      checks.angularSpeed &&
      checks.alignment &&
      checks.lateralOffset &&
      checks.distance
    );
  }

  function isReadyForHardLock() {
    const metrics =
      telemetry.metrics;
  
    return (
      metrics.distance <=
        rules
          .hardLockDistance &&
  
      Math.abs(
        metrics.closingSpeed
      ) <=
        rules
          .hardLockClosingSpeed &&
  
      metrics.lateralSpeed <=
        rules
          .hardLockLateralSpeed &&
  
      metrics.angularSpeed <=
        rules
          .hardLockAngularSpeed &&
  
      metrics.alignmentAngle <=
        THREE.MathUtils.radToDeg(
          rules
            .hardLockAlignmentAngle
        )
    );
  }


  function beforePhysicsStep() {
    if (
      state !== DockingState.CAPTURING
    ) {
      return;
    }

    captureController.apply();
  }

  
  function handleCollisionEvent(
    handle1,
    handle2,
    started
  ) {
    eventHandler.handleCollisionEvent(
      handle1,
      handle2,
      started
    );
  }
  
  function handleContactForceEvent(event) {
    eventHandler.handleContactForceEvent(
      event
    );
  }
  
  function afterPhysicsStep() {
    telemetry.updateMetrics();

    if (
      state === DockingState.CRASHED ||
      state === DockingState.DOCKED
    ) {
      return;
    }

    if (
      state === DockingState.CAPTURING
    ) {
      if (isReadyForHardLock()) {
        jointController.create();
        setState(DockingState.DOCKED);
      }

      return;
    }

    if (!insideSensor) {
      setState(DockingState.APPROACH);
      return;
    }

    if (isSafeToCapture()) {
      setState(DockingState.CAPTURING);
    } else {
      setState(DockingState.IN_RANGE);
    }
  }

  function canControl() {
    return (
      state === DockingState.APPROACH ||
      state === DockingState.IN_RANGE
    );
  }

  function clearForces() {
    spacecraft.rigidBody.resetForces(
      true
    );

    spacecraft.rigidBody.resetTorques(
      true
    );

    spacecraft.stopLinearMotion();
    spacecraft.stopAngularMotion();
  }

  function applySeparationImpulse() {
    spacecraft.rigidBody.applyImpulse(
      {
        x: 0,
        y: 0,
        z: 180,
      },
      true
    );
  }

  function undock() {
    const canUndock =
      state === DockingState.DOCKED ||
      state === DockingState.CAPTURING;

    if (!canUndock) {
      return;
    }

    jointController.remove();
    clearForces();

    insideSensor = false;
    eventHandler.reset();

    applySeparationImpulse();
    setState(DockingState.APPROACH);
  }

  function reset() {
    jointController.remove();
    clearForces();

    state = DockingState.APPROACH;
    insideSensor = false;
    crashReason = null;

    eventHandler.reset();

    station.setStatus(
      DockingState.APPROACH
    );
  }

  function getState() {
    return state;
  }

  function getTelemetry({ refresh = true } = {}) {
    if (refresh) {
      telemetry.updateMetrics();
    }
  
    return createDockingTelemetrySnapshot({
      state,
      insideSensor,
      crashReason,
      difficulty: activeDifficulty,
      metrics: telemetry.metrics,
      impactForce: eventHandler.getLastImpactForce(),
      damage: spacecraft.getDamageTelemetry(),
      propellant: spacecraft.getPropellantTelemetry(),
      rules,
    });
  }

  function dispose() {
    jointController.remove();
    eventHandler.reset();
  }

  telemetry.updateMetrics();

  return {
    setDifficulty,
    beforePhysicsStep,
    handleCollisionEvent,
    handleContactForceEvent,
    afterPhysicsStep,
    canControl,
    undock,
    reset,
    getState,
    getTelemetry,
    dispose,
  };
}
