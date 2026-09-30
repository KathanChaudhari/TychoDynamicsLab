import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { disposeObject3D } from "./utils/disposeObject3D.js";

export function createSceneEnvironment(container) {
  const width = Math.max(
    container.clientWidth,
    1
  );

  const height = Math.max(
    container.clientHeight,
    1
  );

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030712);


  const camera = new THREE.PerspectiveCamera(
    60,
    width / height,
    0.1,
    2000
  );

  camera.position.set(7, 5, 10);
  camera.lookAt(0, 0, -2);


  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });

  let pixelRatio = Math.min(
    window.devicePixelRatio || 1,
    2
  );

  renderer.setSize(width, height);
  renderer.setPixelRatio(pixelRatio);

  renderer.outputColorSpace =
    THREE.SRGBColorSpace;

  container.appendChild(renderer.domElement);


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


  function resizeRenderer(nextPixelRatio = pixelRatio) {
    pixelRatio = nextPixelRatio;

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
    renderer.setPixelRatio(pixelRatio);
  }

  function handleResize() {
    resizeRenderer();
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

    disposeObject3D(scene);

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
    resizeRenderer,
    dispose,
  };
}
