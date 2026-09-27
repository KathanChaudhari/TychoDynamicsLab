import {
  useEffect,
  useRef,
} from "react";

import RAPIER from "@dimforge/rapier3d-compat";

import {
  createSceneEnvironment,
} from "./scene/SceneEnvironment";

import {
  createInteractionController,
} from "./scene/InteractionController";

import {
  startSimulationLoop,
} from "./scene/SimulationLoop";

import {
  createPhysicsEventRouter,
} from "./scene/PhysicsEventRouter";

import {
  createSpacecraft,
} from "./scene/spacecraft/Spacecraft";

import {
  createDockingStation,
} from "./scene/docking/DockingStation";

import {
  createDockingSystem,
} from "./scene/docking/DockingSystem";

import {
  createTargetField,
} from "./scene/projectiles/TargetField";

import {
  createProbeSystem,
} from "./scene/projectiles/ProbeSystem";

import {
  createGatewayModel,
} from "./scene/docking/visuals/GatewayModel";

let rapierInitializationPromise = null;

function initializeRapier() {
  if (!rapierInitializationPromise) {
    rapierInitializationPromise =
      RAPIER.init();
  }

  return rapierInitializationPromise;
}

export default function BasicScene({
  onTelemetry,
  onLoadingState,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container =
      containerRef.current;

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

    
      const spacecraft =
        createSpacecraft(
          scene,
          world,
          RAPIER,
          {
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

      const station =
        createDockingStation(
          scene,
          world,
          RAPIER
        );
        const gateway =
  createGatewayModel({
    stationGroup:
      station.group,

    onLoadingChange(state) {
      if (
        state.status === "loading"
      ) {
        const progress =
          state.progress ?? 0;

       
        const mappedProgress =
          35 + progress * 0.55;

        setLoadingState(
          "loading",
          Math.round(
            mappedProgress
          ),
          "Loading Gateway core"
        );
      }

      if (
        state.status === "ready"
      ) {
        setLoadingState(
          "loading",
          92,
          "Preparing docking systems"
        );
      }

      if (
        state.status === "error"
      ) {
        console.warn(
          "Gateway loading failed:",
          state.error
        );
      }
    },
  });

      const targetField =
        createTargetField({
          scene,
          world,
          RAPIER,
        });

      const dockingSystem =
        createDockingSystem({
          world,
          RAPIER,
          spacecraft,
          station,
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

      const removeDockingListener =
        physicsEvents.addListener(
          dockingSystem
        );

      const removeProbeListener =
        physicsEvents.addListener(
          probeSystem
        );

      const interactions =
        createInteractionController({
          scene,
          camera,
          renderer,
          controls,
          spacecraft,
          station,

          onReset() {
            dockingSystem.reset();
            spacecraft.reset();

            onTelemetry?.(
              dockingSystem.getTelemetry()
            );
          },

          onUndock() {
            dockingSystem.undock();

            onTelemetry?.(
              dockingSystem.getTelemetry()
            );
          },

          onLaunchProbe() {
            probeSystem.launch();
          },

          onToggleTrajectory() {
            probeSystem.toggleTrajectory();
          },
        });

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
          probeSystem,

          pressedKeys:
            interactions.pressedKeys,

          onTelemetry,
        });

      onTelemetry?.(
        dockingSystem.getTelemetry()
      );

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
        }
      );

      cleanupScene = () => {
        simulation.stop();
        interactions.dispose();

        removeDockingListener();
        removeProbeListener();

        physicsEvents.clear();

        probeSystem.dispose();
        targetField.dispose();

        gateway.dispose();
        spacecraft.dispose();
        
        eventQueue.free();
        world.free();

        environment.dispose();
      };
    }

    initialize().catch((error) => {
      console.error(
        "Simulation initialization failed:",
        error
      );

      setLoadingState(
        "error",
        0,
        "Could not start simulation"
      );
    });

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