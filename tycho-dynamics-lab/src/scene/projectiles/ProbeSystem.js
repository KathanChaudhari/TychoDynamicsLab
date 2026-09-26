import * as THREE from "three";

import {
  createProbe,
  PROBE_MASS,
} from "./Probe";

import {
  createProbeTrajectory,
} from "./ProbeTrajectory";

const PROBE_SPEED = 8;
const MAXIMUM_PROBES = 20;

/*
 * Slightly beyond the spacecraft nose,
 * which is located around local z = -2.7.
 */
const LOCAL_LAUNCH_POSITION =
  new THREE.Vector3(0, 0, -3.1);

const LOCAL_FORWARD =
  new THREE.Vector3(0, 0, -1);

export function createProbeSystem({
  scene,
  world,
  RAPIER,
  spacecraft,
  station,
  targetField,
}) {
  const probes = new Map();
  const pendingRemoval = new Set();

  const trajectory =
    createProbeTrajectory(scene);

  const launchPosition =
    new THREE.Vector3();

  const launchDirection =
    new THREE.Vector3();

  const inheritedVelocity =
    new THREE.Vector3();

  const predictedVelocity =
    new THREE.Vector3();

  const launchImpulse =
    new THREE.Vector3();

  const spacecraftPosition =
    new THREE.Vector3();

  const spacecraftOrientation =
    new THREE.Quaternion();

  const gravity =
    new THREE.Vector3(
      world.gravity.x,
      world.gravity.y,
      world.gravity.z
    );

  const stationFrameHandles =
    new Set(
      station.frameColliders.map(
        (collider) => collider.handle
      )
    );

  function calculateLaunchData() {
    const position =
      spacecraft.rigidBody.translation();

    const rotation =
      spacecraft.rigidBody.rotation();

    const velocity =
      spacecraft.rigidBody.linvel();

    spacecraftPosition.set(
      position.x,
      position.y,
      position.z
    );

    spacecraftOrientation.set(
      rotation.x,
      rotation.y,
      rotation.z,
      rotation.w
    );

    launchPosition
      .copy(LOCAL_LAUNCH_POSITION)
      .applyQuaternion(
        spacecraftOrientation
      )
      .add(spacecraftPosition);

    launchDirection
      .copy(LOCAL_FORWARD)
      .applyQuaternion(
        spacecraftOrientation
      )
      .normalize();

    inheritedVelocity.set(
      velocity.x,
      velocity.y,
      velocity.z
    );

    /*
     * Impulse = mass * desired velocity change.
     */
    launchImpulse
      .copy(launchDirection)
      .multiplyScalar(
        PROBE_MASS * PROBE_SPEED
      );

    predictedVelocity
      .copy(inheritedVelocity)
      .addScaledVector(
        launchDirection,
        PROBE_SPEED
      );
  }

  function removeProbe(probe) {
    if (!probe) {
      return;
    }

    probes.delete(
      probe.collider.handle
    );

    pendingRemoval.delete(probe);

    probe.dispose();
  }

  function removeOldestProbe() {
    const firstProbe =
      probes.values().next().value;

    if (firstProbe) {
      removeProbe(firstProbe);
    }
  }

  function launch() {
    if (
      probes.size >= MAXIMUM_PROBES
    ) {
      removeOldestProbe();
    }

    calculateLaunchData();

    const probe = createProbe({
      scene,
      world,
      RAPIER,
      position: launchPosition,
      inheritedVelocity,
      launchImpulse,
    });

    probes.set(
      probe.collider.handle,
      probe
    );
  }

  function handleCollisionEvent(
    handle1,
    handle2,
    started
  ) {
    if (!started) {
      return;
    }

    let probe = probes.get(handle1);
    let otherHandle = handle2;

    if (!probe) {
      probe = probes.get(handle2);
      otherHandle = handle1;
    }

    if (!probe) {
      return;
    }

    if (
      targetField.hasCollider(
        otherHandle
      )
    ) {
      targetField.registerHit(
        otherHandle
      );

      pendingRemoval.add(probe);
      return;
    }

    if (
      stationFrameHandles.has(
        otherHandle
      )
    ) {
      pendingRemoval.add(probe);
    }
  }

  function handleContactForceEvent() {
    /*
     * Probe hits currently use collision-start
     * events, so contact-force data isn't needed.
     */
  }

  function afterPhysicsStep(deltaTime) {
    for (const probe of probes.values()) {
      const expired =
        probe.step(deltaTime);

      if (expired) {
        pendingRemoval.add(probe);
      }
    }

    /*
     * Remove bodies after Rapier event callbacks
     * have finished.
     */
    for (const probe of pendingRemoval) {
      removeProbe(probe);
    }

    pendingRemoval.clear();

    targetField.update(deltaTime);
  }

  function syncVisuals() {
    for (const probe of probes.values()) {
      probe.syncFromPhysics();
    }

    calculateLaunchData();

    trajectory.update({
      startPosition: launchPosition,
      initialVelocity:
        predictedVelocity,
      gravity,
    });
  }

  function toggleTrajectory() {
    return trajectory.toggle();
  }

  function dispose() {
    for (const probe of probes.values()) {
      probe.dispose();
    }

    probes.clear();
    pendingRemoval.clear();

    trajectory.dispose();
  }

  return {
    launch,
    toggleTrajectory,
    handleCollisionEvent,
    handleContactForceEvent,
    afterPhysicsStep,
    syncVisuals,
    dispose,
  };
}