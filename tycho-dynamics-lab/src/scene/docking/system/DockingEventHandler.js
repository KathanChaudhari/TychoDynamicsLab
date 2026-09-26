import {
    DOCKING_RULES,
  } from "./DockingConfig";
  
  export function createDockingEventHandler({
    eventQueue,
    spacecraft,
    station,
    onSensorChange,
    onCrash,
  }) {
    let lastImpactForce = 0;
  
    const spacecraftHandle =
      spacecraft.collider.handle;
  
    const sensorHandle =
      station.dockingSensor.handle;
  
    const frameHandles = new Set(
      station.frameColliders.map(
        (collider) => collider.handle
      )
    );
  
    function containsPair(
      handle1,
      handle2,
      firstTarget,
      secondTarget
    ) {
      return (
        (handle1 === firstTarget &&
          handle2 === secondTarget) ||
        (handle1 === secondTarget &&
          handle2 === firstTarget)
      );
    }
  
    function processCollisionEvents() {
      eventQueue.drainCollisionEvents(
        (handle1, handle2, started) => {
          const isSensorEvent =
            containsPair(
              handle1,
              handle2,
              spacecraftHandle,
              sensorHandle
            );
  
          if (isSensorEvent) {
            onSensorChange(started);
          }
        }
      );
    }
  
    function processContactForceEvents() {
      eventQueue.drainContactForceEvents(
        (event) => {
          const handle1 =
            event.collider1();
  
          const handle2 =
            event.collider2();
  
          const hitSpacecraft =
            handle1 === spacecraftHandle ||
            handle2 === spacecraftHandle;
  
          const hitStationFrame =
            frameHandles.has(handle1) ||
            frameHandles.has(handle2);
  
          if (
            !hitSpacecraft ||
            !hitStationFrame
          ) {
            return;
          }
  
          const impactForce =
            event.totalForceMagnitude();
  
          lastImpactForce = Math.max(
            lastImpactForce,
            impactForce
          );
  
          if (
            impactForce >=
            DOCKING_RULES.crashForce
          ) {
            onCrash(impactForce);
          }
        }
      );
    }
  
    function process() {
      processCollisionEvents();
      processContactForceEvents();
    }
  
    function getLastImpactForce() {
      return lastImpactForce;
    }
  
    function reset() {
      lastImpactForce = 0;
    }
  
    return {
      process,
      getLastImpactForce,
      reset,
    };
  }