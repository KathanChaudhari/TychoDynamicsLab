import {
    createThrusterAudio,
  } from "./ThrusterAudio.js";
  
  import {
    createNotificationAudio,
  } from "./NotificationAudio.js";
  
  export function createAudioSystem() {
    let context = null;
    let masterGain = null;
  
    let thrusterAudio = null;
    let notificationAudio = null;
  
    let muted = false;
    let disposed = false;
  
    let initializedTelemetry = false;
  
    const previous = {
      state: null,
      insideSensor: false,
      safe: true,
      impactCount: 0,
      missionStatus: null,
    };
  
    function ensureContext() {
      if (
        context ||
        disposed
      ) {
        return context;
      }
  
      const AudioContextClass =
        window.AudioContext ??
        window.webkitAudioContext;
  
      if (!AudioContextClass) {
        console.warn(
          "Web Audio is not supported."
        );
  
        return null;
      }
  
      context =
        new AudioContextClass();
  
      masterGain =
        context.createGain();
  
      masterGain.gain.value =
        muted ? 0 : 0.75;
  
      masterGain.connect(
        context.destination
      );
  
      thrusterAudio =
        createThrusterAudio({
          context,
          destination:
            masterGain,
        });
  
      notificationAudio =
        createNotificationAudio({
          context,
          destination:
            masterGain,
        });
  
      return context;
    }
  
    async function unlock() {
      const currentContext =
        ensureContext();
  
      if (
        currentContext?.state ===
        "suspended"
      ) {
        await currentContext.resume();
      }
    }
  
    function setMuted(nextMuted) {
      muted = Boolean(nextMuted);
  
      if (!muted) {
        unlock();
      }
  
      if (context && masterGain) {
        const now =
          context.currentTime;
  
        masterGain.gain
          .cancelScheduledValues(now);
  
        masterGain.gain
          .setTargetAtTime(
            muted ? 0 : 0.75,
            now,
            0.03
          );
      }
  
      return muted;
    }
  
    function toggleMuted() {
      return setMuted(!muted);
    }
  
    function isMuted() {
      return muted;
    }
  
    function updateThrusters(
      controlState,
      active
    ) {
      if (
        !context ||
        muted ||
        context.state !== "running"
      ) {
        thrusterAudio?.stop();
        return;
      }
  
      thrusterAudio?.update(
        controlState,
        active
      );
    }
  
    function calculateSafe(
      telemetry
    ) {
      const checks =
        telemetry.checks ?? {};
  
      return Boolean(
        checks.closingSpeed &&
        checks.lateralSpeed &&
        checks.angularSpeed &&
        checks.alignment &&
        checks.lateralOffset
      );
    }
  
    function savePrevious(
      telemetry,
      safe
    ) {
      previous.state =
        telemetry.state;
  
      previous.insideSensor =
        telemetry.insideSensor;
  
      previous.safe = safe;
  
      previous.impactCount =
        telemetry.damage
          ?.impactCount ?? 0;
  
      previous.missionStatus =
        telemetry.mission
          ?.status ?? null;
    }
  
    function handleTelemetry(
      telemetry
    ) {
      const safe =
        calculateSafe(telemetry);
  
      if (
        !initializedTelemetry
      ) {
        initializedTelemetry = true;
  
        savePrevious(
          telemetry,
          safe
        );
  
        return;
      }
  
      const canPlay =
        context &&
        context.state === "running" &&
        !muted;
  
      if (canPlay) {
        const enteredSensor =
          telemetry.insideSensor &&
          !previous.insideSensor;
  
        if (enteredSensor) {
          notificationAudio
            .sensorAcquired();
  
          if (!safe) {
            notificationAudio
              .warning(0.25);
          }
        } else if (
          telemetry.insideSensor &&
          previous.safe &&
          !safe
        ) {
          notificationAudio
            .warning();
        }
  
        if (
          telemetry.state ===
            "capturing" &&
          previous.state !==
            "capturing"
        ) {
          notificationAudio
            .capture();
        }
  
        const impactCount =
          telemetry.damage
            ?.impactCount ?? 0;
  
        if (
          impactCount >
          previous.impactCount
        ) {
          notificationAudio
            .playImpact(
              telemetry.damage
                ?.lastImpactForce ??
                telemetry
                  .impactForce ??
                0,
  
              telemetry.limits
                ?.crashForce ??
                5000
            );
        }
  
        const missionStatus =
          telemetry.mission
            ?.status;
  
        if (
          missionStatus ===
            "success" &&
          previous.missionStatus !==
            "success"
        ) {
          notificationAudio
            .missionSuccess();
        } else if (
          missionStatus ===
            "failed" &&
          previous.missionStatus !==
            "failed"
        ) {
          notificationAudio
            .missionFailure();
        } else if (
          telemetry.state ===
            "docked" &&
          previous.state !== "docked"
        ) {
          notificationAudio
            .docked();
        }
      }
  
      savePrevious(
        telemetry,
        safe
      );
    }
  
    function dispose() {
      disposed = true;
  
      thrusterAudio?.dispose();
  
      masterGain?.disconnect();
  
      if (
        context &&
        context.state !== "closed"
      ) {
        context.close();
      }
  
      context = null;
      masterGain = null;
  
      thrusterAudio = null;
      notificationAudio = null;
    }
  
    return {
      unlock,
      setMuted,
      toggleMuted,
      isMuted,
  
      updateThrusters,
      handleTelemetry,
  
      dispose,
    };
  }