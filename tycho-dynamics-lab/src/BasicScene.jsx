import {
  useEffect,
  useRef,
} from "react";

import {
  createSimulationSession,
} from "./scene/createSimulationSession.js";

let rapierInitializationPromise = null;

function normalizeError(error) {
  if (error instanceof Error) {
    return error;
  }

  return new Error(String(error));
}

function initializeRapier() {
  if (!rapierInitializationPromise) {
    rapierInitializationPromise = import(
      "@dimforge/rapier3d-compat"
    )
      .then(async (module) => {
        const RAPIER =
          module.default ?? module;

        await RAPIER.init();

        return RAPIER;
      })
      .catch((error) => {
        rapierInitializationPromise =
          null;

        throw error;
      });
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
  onAssetWarning,
  onFatalError,
}) {
  const containerRef = useRef(null);

  const difficultyRef = useRef(
    selectedDifficulty
  );

  const callbacksRef = useRef({});

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
      onAssetWarning,
      onFatalError,
    };
  }, [
    onTelemetry,
    onLoadingState,
    onAudioReady,
    onMissionReady,
    onPerformance,
    onAssetWarning,
    onFatalError,
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
      .then((RAPIER) => {
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

            onTelemetry: (value) => {
              callbacksRef.current
                .onTelemetry?.(value);
            },

            onLoadingState: (
              value
            ) => {
              callbacksRef.current
                .onLoadingState?.(
                  value
                );
            },

            onAudioReady: (value) => {
              callbacksRef.current
                .onAudioReady?.(value);
            },

            onMissionReady: (
              value
            ) => {
              callbacksRef.current
                .onMissionReady?.(
                  value
                );
            },

            onPerformance: (
              value
            ) => {
              callbacksRef.current
                .onPerformance?.(
                  value
                );
            },

            onAssetWarning: (
              value
            ) => {
              callbacksRef.current
                .onAssetWarning?.(
                  value
                );
            },

            onFatalError: (error) => {
              callbacksRef.current
                .onFatalError?.(
                  normalizeError(
                    error
                  )
                );
            },
          });
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        const normalizedError =
          normalizeError(error);

        console.error(
          "Simulation initialization failed:",
          normalizedError
        );

        callbacksRef.current
          .onLoadingState?.({
            status: "error",
            progress: 0,
            message:
              "Could not start simulation",
          });

        callbacksRef.current
          .onFatalError?.(
            normalizedError
          );
      });

    return () => {
      cancelled = true;

      disposeSession?.();

      callbacksRef.current
        .onAudioReady?.(null);

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