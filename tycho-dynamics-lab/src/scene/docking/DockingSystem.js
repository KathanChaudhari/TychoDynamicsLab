import * as THREE from "three";

import {
  DockingState,
  DOCKING_RULES,
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


export {
  DockingState,
} from "./system/DockingConfig";

export function createDockingSystem({
  world,
  RAPIER,
  spacecraft,
  station,
}) {
  let state = DockingState.APPROACH;
  let insideSensor = false;

  const telemetry =
    createDockingTelemetry({
      spacecraft,
      station,
    });

  const captureController =
    createCaptureController({
      spacecraft,
      telemetry,
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
  
      onSensorChange(started) {
        insideSensor = started;
      },
  
      onCrash() {
        jointController.remove();
  
        setState(DockingState.CRASHED);
  
        spacecraft.stopLinearMotion();
        spacecraft.stopAngularMotion();
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
        DOCKING_RULES
          .hardLockDistance &&
  
      Math.abs(
        metrics.closingSpeed
      ) <=
        DOCKING_RULES
          .hardLockClosingSpeed &&
  
      metrics.lateralSpeed <=
        DOCKING_RULES
          .hardLockLateralSpeed &&
  
      metrics.angularSpeed <=
        DOCKING_RULES
          .hardLockAngularSpeed &&
  
      metrics.alignmentAngle <=
        THREE.MathUtils.radToDeg(
          DOCKING_RULES
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

    eventHandler.reset();

    station.setStatus(
      DockingState.APPROACH
    );
  }

  function getState() {
    return state;
  }

  function getTelemetry() {
    telemetry.updateMetrics();
  
    return {
      state,
      insideSensor,
  
      speed:
        telemetry.metrics.speed,
  
      closingSpeed:
        telemetry.metrics
          .closingSpeed,
  
      lateralSpeed:
        telemetry.metrics
          .lateralSpeed,
  
      angularSpeed:
        telemetry.metrics
          .angularSpeed,
  
      alignmentAngle:
        telemetry.metrics
          .alignmentAngle,
  
      horizontalOffset:
        telemetry.metrics
          .horizontalOffset,
  
      verticalOffset:
        telemetry.metrics
          .verticalOffset,
  
      lateralOffset:
        telemetry.metrics
          .lateralOffset,
  
      axialDistance:
        telemetry.metrics
          .axialDistance,
  
      distance:
        telemetry.metrics.distance,
  
      timeToContact:
        telemetry.metrics
          .timeToContact,
  
      impactForce:
        eventHandler
          .getLastImpactForce(),
  
      checks: {
        ...telemetry.metrics.checks,
      },
  
      limits: {
        maximumClosingSpeed:
          DOCKING_RULES
            .maximumClosingSpeed,
  
        maximumLateralSpeed:
          DOCKING_RULES
            .maximumLateralSpeed,
  
        maximumAngularSpeed:
          DOCKING_RULES
            .maximumAngularSpeed,
  
        maximumAlignmentAngle:
          THREE.MathUtils.radToDeg(
            DOCKING_RULES
              .maximumAlignmentAngle
          ),
  
        maximumLateralOffset:
          DOCKING_RULES
            .maximumLateralOffset,
  
        maximumCaptureDistance:
          DOCKING_RULES
            .maximumCaptureDistance,
  
        crashForce:
          DOCKING_RULES.crashForce,
      },
    };
  }

  telemetry.updateMetrics();

  return {
    beforePhysicsStep,
    handleCollisionEvent,
    handleContactForceEvent,
    afterPhysicsStep,
    canControl,
    undock,
    reset,
    getState,
    getTelemetry,
  };
}