import { useEffect, useRef } from "react";
import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { createSpacecraft } from "./scene/Spacecraft.js";
import { createDockingStation } from "./scene/DockingStation.js";

const FIXED_TIME_STEP = 1 / 60;

export default function BasicScene() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let cancelled = false;
    let disposeScene = null;

    async function initialize() {
      await RAPIER.init();

      if (cancelled) {
        return;
      }

      // ==============================================
      // Three.js scene
      // ==============================================

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x030712);

      const camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth /
          container.clientHeight,
        0.1,
        2000
      );

      camera.position.set(7, 5, 10);
      camera.lookAt(0, 0, -2);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
      });

      renderer.setSize(
        container.clientWidth,
        container.clientHeight
      );

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
      );

      renderer.outputColorSpace =
        THREE.SRGBColorSpace;

      container.appendChild(
        renderer.domElement
      );

      // ==============================================
      // Camera controls
      // ==============================================

      const controls = new OrbitControls(
        camera,
        renderer.domElement
      );

      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      controls.minDistance = 3;
      controls.maxDistance = 40;

      controls.target.set(0, 0, -3);
      controls.update();

      // ==============================================
      // Lights
      // ==============================================

      const hemisphereLight =
        new THREE.HemisphereLight(
          0x9db7ff,
          0x050505,
          1.5
        );

      const sunLight =
        new THREE.DirectionalLight(
          0xffffff,
          3
        );

      sunLight.position.set(5, 8, 6);

      scene.add(
        hemisphereLight,
        sunLight
      );

      // ==============================================
      // Coordinate helpers
      // ==============================================

      const axesHelper =
        new THREE.AxesHelper(3);

      const gridHelper =
        new THREE.GridHelper(
          20,
          20,
          0x334155,
          0x172033
        );

      gridHelper.rotation.x = Math.PI / 2;
      gridHelper.position.z = -7;

      scene.add(
        axesHelper,
        gridHelper
      );

      // ==============================================
      // Rapier world
      // ==============================================

      const world = new RAPIER.World({
        x: 0,
        y: 0,
        z: 0,
      });

      world.timestep = FIXED_TIME_STEP;

      // ==============================================
      // Scene objects
      // ==============================================

      const spacecraft = createSpacecraft(
        scene,
        world,
        RAPIER
      );

      const station = createDockingStation(
        scene,
        world,
        RAPIER
      );

      // ==============================================
      // Input
      // ==============================================

      const pressedKeys = new Set();

      const controlledKeys = new Set([
        "KeyW",
        "KeyS",
        "KeyA",
        "KeyD",
        "KeyR",
        "KeyF",
        "KeyQ",
        "KeyE",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Space",
        "KeyX",
        "KeyT",
      ]);

      function handleMovementKeyDown(event) {
        if (
          !controlledKeys.has(event.code)
        ) {
          return;
        }

        event.preventDefault();
        pressedKeys.add(event.code);

        if (
          event.code === "Space" &&
          !event.repeat
        ) {
          spacecraft.stopLinearMotion();
        }

        if (
          event.code === "KeyX" &&
          !event.repeat
        ) {
          spacecraft.stopAngularMotion();
        }

        if (
          event.code === "KeyT" &&
          !event.repeat
        ) {
          spacecraft.reset();
        }
      }

      function handleMovementKeyUp(event) {
        pressedKeys.delete(event.code);
      }

      window.addEventListener(
        "keydown",
        handleMovementKeyDown
      );

      window.addEventListener(
        "keyup",
        handleMovementKeyUp
      );

      // ==============================================
      // Raycasting and selection
      // ==============================================

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      let selectedObject = null;

      const selectionBox =
        new THREE.BoxHelper(
          spacecraft.group,
          0x38bdf8
        );

      selectionBox.visible = false;

      scene.add(selectionBox);

      function findSelectableParent(object) {
        let currentObject = object;

        while (
          currentObject &&
          currentObject !== scene
        ) {
          if (
            currentObject.userData.selectable
          ) {
            return currentObject;
          }

          currentObject =
            currentObject.parent;
        }

        return null;
      }

      function handlePointerDown(event) {
        const canvasRect =
          renderer.domElement
            .getBoundingClientRect();

        pointer.x =
          ((event.clientX -
            canvasRect.left) /
            canvasRect.width) *
            2 -
          1;

        pointer.y =
          -(
            (event.clientY -
              canvasRect.top) /
            canvasRect.height
          ) *
            2 +
          1;

        raycaster.setFromCamera(
          pointer,
          camera
        );

        const intersections =
          raycaster.intersectObjects(
            [
              spacecraft.group,
              station.group,
            ],
            true
          );

        if (
          intersections.length === 0
        ) {
          selectedObject = null;
          selectionBox.visible = false;
          return;
        }

        selectedObject =
          findSelectableParent(
            intersections[0].object
          );

        if (!selectedObject) {
          selectionBox.visible = false;
          return;
        }

        selectionBox.setFromObject(
          selectedObject
        );

        selectionBox.visible = true;

        console.log(
          "Selected:",
          selectedObject.userData.label
        );
      }

      renderer.domElement.addEventListener(
        "pointerdown",
        handlePointerDown
      );

      // ==============================================
      // Camera presets
      // ==============================================

      const spacecraftCameraOffset =
        new THREE.Vector3(4, 2, 5);

      function setCameraView(view) {
        if (view === "overview") {
          camera.position.set(7, 5, 10);
          controls.target.set(0, 0, -3);
        }

        if (view === "spacecraft") {
          camera.position
            .copy(spacecraft.group.position)
            .add(spacecraftCameraOffset);

          controls.target.copy(
            spacecraft.group.position
          );
        }

        if (view === "docking") {
          camera.position.set(0, 1, 3);
          controls.target.copy(
            station.group.position
          );
        }

        controls.update();
      }

      function handleCameraKeyDown(event) {
        if (event.key === "1") {
          setCameraView("overview");
        }

        if (event.key === "2") {
          setCameraView("spacecraft");
        }

        if (event.key === "3") {
          setCameraView("docking");
        }
      }

      window.addEventListener(
        "keydown",
        handleCameraKeyDown
      );

      // ==============================================
      // Resize
      // ==============================================

      function handleResize() {
        const width =
          container.clientWidth;

        const height =
          container.clientHeight;

        if (width === 0 || height === 0) {
          return;
        }

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);

        renderer.setPixelRatio(
          Math.min(
            window.devicePixelRatio,
            2
          )
        );
      }

      window.addEventListener(
        "resize",
        handleResize
      );

      // ==============================================
      // Animation and physics loop
      // ==============================================

      const clock = new THREE.Clock();
      let accumulator = 0;

      function animate() {
        const frameTime = Math.min(
          clock.getDelta(),
          0.1
        );

        accumulator += frameTime;

        /*
         * Rapier advances using fixed 1/60 second
         * steps regardless of rendering frame rate.
         */
        while (
          accumulator >= FIXED_TIME_STEP
        ) {
          spacecraft.applyControls(
            pressedKeys
          );

          world.step();

          accumulator -= FIXED_TIME_STEP;
        }

        spacecraft.syncFromPhysics();
        spacecraft.updateVelocityArrow();

        station.ring.rotation.z +=
          0.08 * frameTime;

        if (selectedObject) {
          selectionBox.setFromObject(
            selectedObject
          );
        }

        controls.update();

        renderer.render(scene, camera);
      }

      renderer.setAnimationLoop(animate);

      // ==============================================
      // Cleanup
      // ==============================================

      disposeScene = () => {
        renderer.setAnimationLoop(null);

        controls.dispose();
        pressedKeys.clear();

        window.removeEventListener(
          "resize",
          handleResize
        );

        window.removeEventListener(
          "keydown",
          handleCameraKeyDown
        );

        window.removeEventListener(
          "keydown",
          handleMovementKeyDown
        );

        window.removeEventListener(
          "keyup",
          handleMovementKeyUp
        );

        renderer.domElement.removeEventListener(
          "pointerdown",
          handlePointerDown
        );

        const geometries = new Set();
        const materials = new Set();

        scene.traverse((object) => {
          if (object.geometry) {
            geometries.add(
              object.geometry
            );
          }

          if (object.material) {
            const objectMaterials =
              Array.isArray(
                object.material
              )
                ? object.material
                : [object.material];

            objectMaterials.forEach(
              (material) => {
                materials.add(material);
              }
            );
          }
        });

        geometries.forEach((geometry) => {
          geometry.dispose();
        });

        materials.forEach((material) => {
          material.dispose();
        });

        world.free();
        renderer.dispose();

        if (
          renderer.domElement
            .parentElement === container
        ) {
          container.removeChild(
            renderer.domElement
          );
        }
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
      disposeScene?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
    />
  );
}