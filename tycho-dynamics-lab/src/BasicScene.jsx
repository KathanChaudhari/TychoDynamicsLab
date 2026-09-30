import {
  useEffect,
  useRef,
} from "react";

import RAPIER from "@dimforge/rapier3d-compat";

import {
  createSimulationSession,
} from "./scene/createSimulationSession.js";

let rapierInitializationPromise =
  null;

function initializeRapier() {
  if (!rapierInitializationPromise) {
    rapierInitializationPromise =
      RAPIER.init();
  }

  return rapierInitializationPromise;
}

export default function BasicScene({
  selectedDifficulty,
  onTelemetry,
  onLoadingState,
  onAudioReady,
  onMissionReady,
  onPerformance,
}) {
  const containerRef =
    useRef(null);

  const difficultyRef =
    useRef(selectedDifficulty);

  const callbacksRef =
    useRef({});

  useEffect(() => {
    difficultyRef.current =
      selectedDifficulty;
  }, [selectedDifficulty]);

  useEffect(() => {
    callbacksRef.current = {
      onTelemetry,
      onLoadingState,
      onAudioReady,
      onMissionReady,
      onPerformance,
    };
  }, [
    onTelemetry,
    onLoadingState,
    onAudioReady,
    onMissionReady,
    onPerformance,
  ]);

  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) {
      return undefined;
    }

    let cancelled = false;
    let disposeSession = null;

    callbacksRef.current
      .onLoadingState?.({
        status: "loading",
        progress: 5,
        message:
          "Initializing physics",
      });

    initializeRapier()
      .then(() => {
        if (cancelled) {
          return;
        }

        disposeSession =
          createSimulationSession({
            container,
            RAPIER,

            getDifficulty: () =>
              difficultyRef.current,

            isCancelled: () =>
              cancelled,

            onTelemetry: (value) =>
              callbacksRef.current
                .onTelemetry?.(value),

            onLoadingState: (value) =>
              callbacksRef.current
                .onLoadingState?.(
                  value
                ),

            onAudioReady: (value) =>
              callbacksRef.current
                .onAudioReady?.(value),

            onMissionReady: (value) =>
              callbacksRef.current
                .onMissionReady?.(
                  value
                ),

            onPerformance: (value) =>
              callbacksRef.current
                .onPerformance?.(
                  value
                ),
          });
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error(
          "Simulation initialization failed:",
          error
        );

        callbacksRef.current
          .onLoadingState?.({
            status: "error",
            progress: 0,
            message:
              "Could not start simulation",
          });
      });

    return () => {
      cancelled = true;

      disposeSession?.();

      callbacksRef.current
        .onMissionReady?.(null);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
    />
  );
}