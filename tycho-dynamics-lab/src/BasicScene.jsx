import { useEffect, useRef } from "react";
import RAPIER from "@dimforge/rapier3d-compat";

import { createSceneEnvironment } from "./scene/SceneEnvironment.js";
import { createInteractionController } from "./scene/InteractionController.js";
import { startSimulationLoop } from "./scene/SimulationLoop.js";

import { createSpacecraft } from "./scene/spacecraft/Spacecraft.js";

import { createDockingStation } from "./scene/docking/DockingStation.js";
import { createDockingSystem } from "./scene/docking/DockingSystem.js";

export default function BasicScene() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    let cancelled = false;
    let cleanup = null;

    async function initialize() {
      await RAPIER.init();

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


      const world =
        new RAPIER.World({
          x: 0,
          y: 0,
          z: 0,
        });

      const eventQueue =
        new RAPIER.EventQueue(true);


      const spacecraft =
        createSpacecraft(
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
          station,

          onReset: () => {
            dockingSystem.reset();
          },
        });


      const simulation =
        startSimulationLoop({
          scene,
          camera,
          renderer,
          controls,
          world,
          eventQueue,
          spacecraft,
          station,
          interactions,
          dockingSystem,
        });

      cleanup = () => {
        simulation.stop();
        interactions.dispose();

        eventQueue.free();
        world.free();

        environment.dispose();
      };
    }

    initialize().catch((error) => {
      console.error(
        "Failed to initialize scene:",
        error
      );
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
    />
  );
}