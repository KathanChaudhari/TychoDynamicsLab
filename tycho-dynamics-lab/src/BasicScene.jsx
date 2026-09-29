import {
  useEffect,
  useRef,
} from "react";

import RAPIER from "@dimforge/rapier3d-compat";

import {
  createSceneEnvironment,
} from "./scene/SceneEnvironment.js";

import {
  createInteractionController,
} from "./scene/InteractionController.js";

import {
  startSimulationLoop,
} from "./scene/SimulationLoop.js";

import {
  createPhysicsEventRouter,
} from "./scene/PhysicsEventRouter.js";

import {
  createSpacecraft,
} from "./scene/spacecraft/Spacecraft.js";

import {
  createDockingStation,
} from "./scene/docking/DockingStation.js";

import {
  createDockingSystem,
} from "./scene/docking/DockingSystem.js";

import {
  createTargetField,
} from "./scene/projectiles/TargetField.js";

import {
  createProbeSystem,
} from "./scene/projectiles/ProbeSystem.js";

import {
  createGatewayModel,
} from "./scene/docking/visuals/GatewayModel.js";

import {
  createMissionSystem,
} from "./scene/mission/MissionSystem.js";

import {
  createCameraController,
} from "./scene/camera/CameraController.js";

import {
  getDifficultyPreset,
} from "./scene/mission/DifficultyConfig.js";


let rapierInitializationPromise = null;

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
}) {
  const containerRef =
    useRef(null);

    const difficultyRef =
    useRef(selectedDifficulty);

  
  useEffect(() => {
    const container =
      containerRef.current;
      difficultyRef.current =
      selectedDifficulty;
    if (!container) {
      return undefined;
    }

    let cancelled = false;
    let cleanupScene = null;

    function setLoadingState(
      status,
      progress,
      message
    ) {
      if (cancelled) {
        return;
      }

      onLoadingState?.({
        status,
        progress,
        message,
      });
    }

    async function initialize() {
      setLoadingState(
        "loading",
        5,
        "Initializing physics"
      );

      await initializeRapier();

      if (cancelled) {
        return;
      }

      setLoadingState(
        "loading",
        10,
        "Building scene"
      );

      // ========================================
      // Three.js environment
      // ========================================

      const environment =
        createSceneEnvironment(
          container
        );

      const {
        scene,
        camera,
        renderer,
        controls,
      } = environment;

      // ========================================
      // Rapier world and events
      // ========================================

      const world =
        new RAPIER.World({
          x: 0,
          y: 0,
          z: 0,
        });

      const eventQueue =
        new RAPIER.EventQueue(true);

      const physicsEvents =
        createPhysicsEventRouter(
          eventQueue
        );

      // ========================================
      // Orion spacecraft
      // ========================================

      const initialDifficulty =
      getDifficultyPreset(
        difficultyRef.current
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
                const modelProgress =
                  state.progress ?? 0;

                const mappedProgress =
                  10 +
                  modelProgress * 0.75;

                setLoadingState(
                  "loading",
                  Math.round(
                    mappedProgress
                  ),
                  `Loading ${state.asset}`
                );
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
              }

              if (
                state.status ===
                "error"
              ) {
                console.warn(
                  "Orion loading failed:",
                  state.error
                );

                setLoadingState(
                  "loading",
                  88,
                  "Using fallback spacecraft"
                );
              }
            },
          }
        );

      // ========================================
      // Gateway station physics
      // ========================================

      
      const station =
        createDockingStation(
          scene,
          world,
          RAPIER
        );

        const cameraController =
  createCameraController({
    camera,
    controls,
    spacecraft,
    station,
  });

      // ========================================
      // Gateway GLB model
      // ========================================

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
                state.progress ?? 0;

              const mappedProgress =
                35 +
                progress * 0.55;

              setLoadingState(
                "loading",
                Math.round(
                  mappedProgress
                ),
                "Loading Gateway core"
              );
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
            }

            if (
              state.status ===
              "error"
            ) {
              console.warn(
                "Gateway loading failed:",
                state.error
              );

              setLoadingState(
                "loading",
                92,
                "Using primitive station"
              );
            }
          },
        });

      // ========================================
      // Projectile target field
      // ========================================

      const targetField =
        createTargetField({
          scene,
          world,
          RAPIER,
        });

      // ========================================
      // Docking system
      // ========================================

      const dockingSystem =
      createDockingSystem({
        world,
        RAPIER,
        spacecraft,
        station,
    
        difficulty:
          initialDifficulty,
      });

      // ========================================
      // Mission lifecycle
      // ========================================

      const missionSystem =
      createMissionSystem({
        difficulty:
          initialDifficulty,
      });
      /*
       * Prevent Enter from starting the mission
       * while models are still loading.
       */
      let missionReady = false;

      // ========================================
      // Probe system
      // ========================================

      const probeSystem =
        createProbeSystem({
          scene,
          world,
          RAPIER,
          spacecraft,
          station,
          targetField,
        });

      // ========================================
      // Combined React telemetry
      // ========================================

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
        if (cancelled) {
          return;
        }

        onTelemetry?.(
          getCombinedTelemetry()
        );
      }

      // ========================================
      // Physics event listeners
      // ========================================

      const removeDockingListener =
        physicsEvents.addListener(
          dockingSystem
        );

      const removeProbeListener =
        physicsEvents.addListener(
          probeSystem
        );

      // ========================================
      // Keyboard and pointer interactions
      // ========================================

      const interactions =
        createInteractionController({
          scene,
          camera,
          renderer,
          controls,
          spacecraft,
          station,
          cameraController,

          onStartMission() {
            if (!missionReady) {
              return;
            }
          
            const missionTelemetry =
              missionSystem.getTelemetry();
          
            if (
              missionTelemetry.status !==
              "briefing"
            ) {
              return;
            }
          
            const difficulty =
              getDifficultyPreset(
                difficultyRef.current
              );
          
            spacecraft.configureDifficulty(
              difficulty
            );
          
            dockingSystem.setDifficulty(
              difficulty
            );
          
            missionSystem.setDifficulty(
              difficulty
            );
          
            dockingSystem.reset();
            spacecraft.reset();
          
            const propellant =
              spacecraft
                .getPropellantTelemetry();
          
            missionSystem.reset(
              propellant.remaining
            );
          
            missionSystem.start(
              propellant.remaining
            );
          
            cameraController.setMode(
              "overview"
            );
          
            publishTelemetry();
          },

          onReset() {
            dockingSystem.reset();
            spacecraft.reset();
          
            const propellant =
              spacecraft
                .getPropellantTelemetry();
          
            missionSystem.reset(
              propellant.remaining
            );
          
            cameraController.setMode(
              "overview"
            );
          
            publishTelemetry();
          },

          onUndock() {
            /*
             * Only allow manual undocking while
             * the mission is active.
             */
            if (
              !missionSystem
                .canControl()
            ) {
              return;
            }

            dockingSystem.undock();
            publishTelemetry();
          },

          onLaunchProbe() {
            if (
              !missionSystem
                .canControl()
            ) {
              return;
            }

            probeSystem.launch();
          },

          onToggleTrajectory() {
            probeSystem
              .toggleTrajectory();
          },
        });

      // ========================================
      // Main render and physics loop
      // ========================================

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

          pressedKeys:
            interactions.pressedKeys,

          onTelemetry,
        });

      /*
       * Initial telemetry shows the mission
       * briefing state.
       */
      publishTelemetry();

      // ========================================
      // Wait for both GLB models
      // ========================================

      Promise.all([
        spacecraft.modelReady,
        gateway.ready,
      ]).then(
        ([
          loadedSpacecraft,
          loadedGateway,
        ]) => {
          if (cancelled) {
            return;
          }

          missionReady = true;

          let message =
            "Simulation ready";

          if (
            !loadedSpacecraft &&
            !loadedGateway
          ) {
            message =
              "Using primitive models";
          } else if (
            !loadedSpacecraft
          ) {
            message =
              "Using primitive spacecraft";
          } else if (
            !loadedGateway
          ) {
            message =
              "Using primitive station";
          }

          setLoadingState(
            "ready",
            100,
            message
          );

          /*
           * Publish again so React immediately
           * receives the briefing state when the
           * loading screen disappears.
           */
          publishTelemetry();
        }
      );

      // ========================================
      // Cleanup
      // ========================================

      cleanupScene = () => {
        simulation.stop();
        interactions.dispose();

        removeDockingListener();
        removeProbeListener();

        physicsEvents.clear();

        probeSystem.dispose();
        targetField.dispose();

        /*
         * Gateway is a child of station.group,
         * so dispose it before the station.
         */
        gateway.dispose();
        station.dispose();
        spacecraft.dispose();

        eventQueue.free();
        world.free();

        environment.dispose();
        cameraController.dispose();
      };
    }

    initialize().catch(
      (error) => {
        console.error(
          "Simulation initialization failed:",
          error
        );

        setLoadingState(
          "error",
          0,
          "Could not start simulation"
        );
      }
    );

    return () => {
      cancelled = true;
      cleanupScene?.();
    };
  }, [
    onTelemetry,
    onLoadingState,
  ]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
    />
  );
}