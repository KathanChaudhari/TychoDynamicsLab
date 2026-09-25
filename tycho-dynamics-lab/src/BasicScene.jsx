import { useEffect, useRef } from "react";
import RAPIER from "@dimforge/rapier3d-compat";

import { createSceneEnvironment } from "./scene/SceneEnvironment";
import { createInteractionController } from "./scene/InteractionController";
import { startSimulationLoop } from "./scene/SimulationLoop";

import { createSpacecraft } from "./scene/spacecraft/Spacecraft";
import { createDockingStation } from "./scene/docking/DockingStation";
import { createDockingSystem } from "./scene/docking/DockingSystem";

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

    async function initialize() {
      await initializeRapier();

      if (cancelled) {
        return;
      }

      const environment =
        createSceneEnvironment(container);

      const {
        scene,
        camera,
        renderer,
        controls,
      } = environment;

      const world = new RAPIER.World({
        x: 0,
        y: 0,
        z: 0,
      });

      const eventQueue =
        new RAPIER.EventQueue(true);

      const spacecraft = createSpacecraft(
        scene,
        world,
        RAPIER
      );

      const station =
        createDockingStation(
          scene,
          world,
          RAPIER
        );

      const dockingSystem =
        createDockingSystem({
          eventQueue,
          spacecraft,
          station,
        });

      const interactions =
        createInteractionController({
          scene,
          camera,
          renderer,
          controls,
          spacecraft,

          onReset() {
            dockingSystem.reset();

            onTelemetry?.(
              dockingSystem.getTelemetry()
            );
          },
        });

      const simulation =
        startSimulationLoop({
          renderer,
          scene,
          camera,
          world,
          eventQueue,
          spacecraft,
          dockingSystem,
          pressedKeys:
            interactions.pressedKeys,
          onTelemetry,
        });

      onTelemetry?.(
        dockingSystem.getTelemetry()
      );

      cleanupScene = () => {
        simulation.stop();
        interactions.dispose();

        eventQueue.free();
        world.free();

        environment.dispose();
      };
    }

    initialize();

    return () => {
      cancelled = true;
      cleanupScene?.();
    };
  }, [onTelemetry]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
    />
  );
}