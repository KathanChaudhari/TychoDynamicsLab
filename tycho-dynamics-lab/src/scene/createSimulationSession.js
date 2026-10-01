import {
  createAudioSystem,
} from "./audio/AudioSystem.js";

import {
  createCameraController,
} from "./camera/CameraController.js";

import {
  SIMULATION_CONFIG,
} from "./config/SimulationConfig.js";

import {
  createDisposalStack,
} from "./createDisposalStack.js";

import {
  createMissionActions,
} from "./createMissionActions.js";

import {
  createDockingStation,
} from "./docking/DockingStation.js";

import {
  createDockingSystem,
} from "./docking/DockingSystem.js";

import {
  createGatewayModel,
} from "./docking/visuals/GatewayModel.js";

import {
  createInteractionController,
} from "./InteractionController.js";

import {
  getDifficultyPreset,
} from "./mission/DifficultyConfig.js";

import {
  createMissionSystem,
} from "./mission/MissionSystem.js";

import {
  createPerformanceSystem,
} from "./performance/PerformanceSystem.js";

import {
  createPhysicsEventRouter,
} from "./PhysicsEventRouter.js";

import {
  createProbeSystem,
} from "./projectiles/ProbeSystem.js";

import {
  createTargetField,
} from "./projectiles/TargetField.js";

import {
  createSceneEnvironment,
} from "./SceneEnvironment.js";

import {
  startSimulationLoop,
} from "./SimulationLoop.js";

import {
  createSpacecraft,
} from "./spacecraft/Spacecraft.js";

function getReadyMessage(
  spacecraftLoaded,
  gatewayLoaded
) {
  if (
    !spacecraftLoaded &&
    !gatewayLoaded
  ) {
    return "Using primitive models";
  }

  if (!spacecraftLoaded) {
    return "Using primitive spacecraft";
  }

  if (!gatewayLoaded) {
    return "Using primitive station";
  }

  return "Simulation ready";
}

function setDebugVisibility(
  spacecraft,
  station
) {
  spacecraft
    .setColliderDebugVisible?.(
      SIMULATION_CONFIG.debug
    );

  spacecraft
    .setDockingPortDebugVisible?.(
      SIMULATION_CONFIG.debug
    );

  station
    .setColliderDebugVisible?.(
      SIMULATION_CONFIG.debug
    );

  station
    .setSensorDebugVisible?.(
      SIMULATION_CONFIG.debug
    );

  station
    .setDockingPortDebugVisible?.(
      SIMULATION_CONFIG.debug
    );
}

export function createSimulationSession({
  container,
  RAPIER,
  getDifficulty,
  isCancelled,
  onTelemetry,
  onLoadingState,
  onAudioReady,
  onMissionReady,
  onPerformance,
  onAssetWarning,
  onFatalError,
}) {
  const disposal =
    createDisposalStack();

  function setLoadingState(
    status,
    progress,
    message
  ) {
    if (
      !isCancelled() &&
      !disposal.disposed
    ) {
      onLoadingState?.({
        status,
        progress,
        message,
      });
    }
  }

  try {
    setLoadingState(
      "loading",
      10,
      "Building scene"
    );

    const environment =
    createSceneEnvironment(
      container,
      {
        onContextLost(error) {
          if (
            !isCancelled() &&
            !disposal.disposed
          ) {
            onFatalError?.(error);
          }
        },
      }
    );

    disposal.add(
      environment.dispose
    );

    const {
      scene,
      camera,
      renderer,
      controls,
      resizeRenderer,
    } = environment;

    const audioSystem =
      createAudioSystem();

    disposal.add(
      audioSystem.dispose
    );

    disposal.add(() => {
      onAudioReady?.(null);
    });

    onAudioReady?.({
      toggleMuted:
        audioSystem.toggleMuted,

      setMuted:
        audioSystem.setMuted,

      isMuted:
        audioSystem.isMuted,
    });

    const performanceSystem =
      createPerformanceSystem({
        renderer,
        resizeRenderer,

        configuration:
          SIMULATION_CONFIG
            .performance,

        onUpdate:
          SIMULATION_CONFIG.debug
            ? onPerformance
            : undefined,
      });

    disposal.add(
      performanceSystem.dispose
    );

    const world =
      new RAPIER.World({
        x: 0,
        y: 0,
        z: 0,
      });

    disposal.add(() => {
      world.free();
    });

    const eventQueue =
      new RAPIER.EventQueue(
        true
      );

    disposal.add(() => {
      eventQueue.free();
    });

    const physicsEvents =
      createPhysicsEventRouter(
        eventQueue
      );

    disposal.add(
      physicsEvents.clear
    );

    const initialDifficulty =
      getDifficultyPreset(
        getDifficulty()
      );

    const spacecraft =
      createSpacecraft(
        scene,
        world,
        RAPIER,
        {
          difficulty:
            initialDifficulty,

          onLoadingChange(state) {
            if (
              state.status ===
              "loading"
            ) {
              const progress =
                10 +
                (state.progress ??
                  0) *
                  0.75;

              setLoadingState(
                "loading",
                Math.round(
                  progress
                ),
                `Loading ${state.asset}`
              );

              return;
            }

            if (
              state.status ===
              "ready"
            ) {
              setLoadingState(
                "loading",
                88,
                "Preparing simulation"
              );

              return;
            }

            if (
              state.status === "error"
            ) {
              console.warn(
                "Orion loading failed:",
                state.error
              );
            
              onAssetWarning?.({
                id: "orion-model",
                title:
                  "ORION MODEL UNAVAILABLE",
                message:
                  "The detailed Orion model could not be loaded. The simulation is using its primitive fallback.",
              });
            
              setLoadingState(
                "loading",
                88,
                "Using fallback spacecraft"
              );
            }
            
          },
        }
      );

    disposal.add(
      spacecraft.dispose
    );

    const station =
      createDockingStation(
        scene,
        world,
        RAPIER
      );

    disposal.add(
      station.dispose
    );

    const cameraController =
      createCameraController({
        camera,
        controls,
        spacecraft,
        station,
      });

    disposal.add(
      cameraController.dispose
    );

    setDebugVisibility(
      spacecraft,
      station
    );

    const gateway =
      createGatewayModel({
        stationGroup:
          station.group,

        onLoadingChange(state) {
          if (
            state.status ===
            "loading"
          ) {
            const progress =
              35 +
              (state.progress ??
                0) *
                0.55;

            setLoadingState(
              "loading",
              Math.round(
                progress
              ),
              "Loading Gateway core"
            );

            return;
          }

          if (
            state.status ===
            "ready"
          ) {
            setLoadingState(
              "loading",
              92,
              "Preparing docking systems"
            );

            return;
          }

          if (
            state.status === "error"
          ) {
            console.warn(
              "Gateway loading failed:",
              state.error
            );
          
            onAssetWarning?.({
              id: "gateway-model",
              title:
                "GATEWAY MODEL UNAVAILABLE",
              message:
                "The detailed Gateway model could not be loaded. The simulation is using its primitive fallback.",
            });
          
            setLoadingState(
              "loading",
              92,
              "Using primitive station"
            );
          }
          
        },
      });

    disposal.add(
      gateway.dispose
    );

    const targetField =
      createTargetField({
        scene,
        world,
        RAPIER,
      });

    disposal.add(
      targetField.dispose
    );

    const dockingSystem =
      createDockingSystem({
        world,
        RAPIER,
        spacecraft,
        station,

        difficulty:
          initialDifficulty,
      });

    disposal.add(
      dockingSystem.dispose
    );

    const missionSystem =
      createMissionSystem({
        difficulty:
          initialDifficulty,
      });

    const probeSystem =
      createProbeSystem({
        scene,
        world,
        RAPIER,
        spacecraft,
        station,
        targetField,
      });

    disposal.add(
      probeSystem.dispose
    );

    function getCombinedTelemetry() {
      return {
        ...dockingSystem
          .getTelemetry(),

        mission:
          missionSystem
            .getTelemetry(),
      };
    }

    function publishTelemetry() {
      if (
        isCancelled() ||
        disposal.disposed
      ) {
        return;
      }

      onTelemetry?.(
        getCombinedTelemetry()
      );
    }

    disposal.add(
      physicsEvents.addListener(
        dockingSystem
      )
    );

    disposal.add(
      physicsEvents.addListener(
        probeSystem
      )
    );

    let missionReady = false;

    const missionActions =
      createMissionActions({
        getDifficulty,
        missionSystem,
        dockingSystem,
        spacecraft,
        cameraController,
        probeSystem,
        audioSystem,
        publishTelemetry,

        isMissionReady:
          () => missionReady,
      });

    const missionController = {
      start() {
        return missionActions
          .onStartMission();
      },

      changeDifficulty(
        difficultyId
      ) {
        return missionActions
          .onDifficultyChange(
            difficultyId
          );
      },

      reset() {
        return missionActions
          .onReset();
      },
    };

    onMissionReady?.(
      missionController
    );

    disposal.add(() => {
      onMissionReady?.(null);
    });

    const interactions =
      createInteractionController({
        scene,
        camera,
        renderer,
        spacecraft,
        station,
        cameraController,

        onStartMission:
          missionActions
            .onStartMission,

        onReset:
          missionActions.onReset,

        onUndock:
          missionActions.onUndock,

        onLaunchProbe:
          missionActions
            .onLaunchProbe,

        onToggleTrajectory:
          missionActions
            .onToggleTrajectory,
      });

    disposal.add(
      interactions.dispose
    );

    const simulation =
      startSimulationLoop({
        renderer,
        scene,
        camera,
        world,
        eventQueue,
        physicsEvents,
        spacecraft,
        dockingSystem,
        missionSystem,
        probeSystem,
        cameraController,
        interactions,
        audioSystem,
        performanceSystem,

        pressedKeys:
          interactions.pressedKeys,

        onTelemetry,
      });

    disposal.add(
      simulation.stop
    );

    publishTelemetry();

    Promise.all([
      spacecraft.modelReady,
      gateway.ready,
    ]).then(
      ([
        spacecraftLoaded,
        gatewayLoaded,
      ]) => {
        if (
          isCancelled() ||
          disposal.disposed
        ) {
          return;
        }

        missionReady = true;

        setLoadingState(
          "ready",
          100,
          getReadyMessage(
            spacecraftLoaded,
            gatewayLoaded
          )
        );

        publishTelemetry();
      }
    );

    return disposal.dispose;
  } catch (error) {
    disposal.dispose();
    throw error;
  }
}