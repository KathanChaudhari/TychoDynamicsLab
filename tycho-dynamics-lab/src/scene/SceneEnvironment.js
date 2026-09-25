import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function createSceneEnvironment(container) {
  const width = Math.max(
    container.clientWidth,
    1
  );

  const height = Math.max(
    container.clientHeight,
    1
  );

  // Scene

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030712);

  // Camera

  const camera = new THREE.PerspectiveCamera(
    60,
    width / height,
    0.1,
    2000
  );

  camera.position.set(7, 5, 10);
  camera.lookAt(0, 0, -2);

  // Renderer

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });

  renderer.setSize(width, height);

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );

  renderer.outputColorSpace =
    THREE.SRGBColorSpace;

  container.appendChild(renderer.domElement);

  // Camera controls

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

  // Lighting

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

  // Helpers

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

  // Resize handling

  function handleResize() {
    const nextWidth =
      container.clientWidth;

    const nextHeight =
      container.clientHeight;

    if (
      nextWidth === 0 ||
      nextHeight === 0
    ) {
      return;
    }

    camera.aspect =
      nextWidth / nextHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      nextWidth,
      nextHeight
    );

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

  function dispose() {
    renderer.setAnimationLoop(null);

    window.removeEventListener(
      "resize",
      handleResize
    );

    controls.dispose();

    const geometries = new Set();
    const materials = new Set();

    scene.traverse((object) => {
      if (object.geometry) {
        geometries.add(object.geometry);
      }

      if (object.material) {
        const objectMaterials =
          Array.isArray(object.material)
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

    renderer.dispose();

    if (
      renderer.domElement.parentElement ===
      container
    ) {
      container.removeChild(
        renderer.domElement
      );
    }
  }

  return {
    scene,
    camera,
    renderer,
    controls,
    dispose,
  };
}