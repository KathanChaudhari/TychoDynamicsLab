import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function BasicScene() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);


    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
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

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);


    const controls = new OrbitControls(
      camera,
      renderer.domElement
    );

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    controls.minDistance = 3;
    controls.maxDistance = 30;

    controls.target.set(0, 0, -3);
    controls.update();


    const hemisphereLight = new THREE.HemisphereLight(
      0x9db7ff,
      0x050505,
      1.5
    );

    const sunLight = new THREE.DirectionalLight(
      0xffffff,
      3
    );

    sunLight.position.set(5, 8, 6);

    scene.add(hemisphereLight, sunLight);


    const axesHelper = new THREE.AxesHelper(3);

    const gridHelper = new THREE.GridHelper(
      20,
      20,
      0x334155,
      0x172033
    );

    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.z = -7;

    scene.add(axesHelper, gridHelper);


    const hullMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.7,
      roughness: 0.35,
    });

    const darkMaterial = new THREE.MeshStandardMaterial({
      color: 0x172033,
      metalness: 0.5,
      roughness: 0.5,
    });

    const engineMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x075985,
        emissiveIntensity: 3,
        metalness: 0.4,
        roughness: 0.3,
      });


    const spacecraft = new THREE.Group();

    spacecraft.userData.selectable = true;
    spacecraft.userData.label = "Prototype spacecraft";

    scene.add(spacecraft);

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.8, 3),
      hullMaterial
    );

    spacecraft.add(body);

    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(0.8, 1.2, 4),
      hullMaterial
    );

    nose.rotation.x = -Math.PI / 2;
    nose.position.z = -2.1;

    spacecraft.add(nose);

    const leftWing = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.12, 1.4),
      darkMaterial
    );

    leftWing.position.set(-1.5, 0, 0.3);

    spacecraft.add(leftWing);

    const rightWing = leftWing.clone();
    rightWing.position.x = 1.5;

    spacecraft.add(rightWing);

    const engine = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.45,
        0.45,
        0.25,
        24
      ),
      engineMaterial
    );

    engine.rotation.x = Math.PI / 2;
    engine.position.z = 1.6;

    spacecraft.add(engine);


    const dockingRingMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        metalness: 0.8,
        roughness: 0.3,
      });

    const dockingRing = new THREE.Mesh(
      new THREE.TorusGeometry(
        2.4,
        0.16,
        16,
        64
      ),
      dockingRingMaterial
    );

    dockingRing.position.z = -7;

    dockingRing.userData.selectable = true;
    dockingRing.userData.label = "Docking ring";

    scene.add(dockingRing);
    const ringMarkerMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xf97316,
        emissive: 0x7c2d12,
        emissiveIntensity: 2,
      });

    const ringMarker = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.7, 0.25),
      ringMarkerMaterial
    );

    ringMarker.position.y = 2.4;

    dockingRing.add(ringMarker);

    const dockingLight = new THREE.PointLight(
      0x38bdf8,
      15,
      10
    );

    dockingLight.position.set(0, 0, -6.5);

    scene.add(dockingLight);


    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    let selectedObject = null;

    const selectionBox = new THREE.BoxHelper(
      spacecraft,
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
        if (currentObject.userData.selectable) {
          return currentObject;
        }

        currentObject = currentObject.parent;
      }

      return null;
    }

    function handlePointerDown(event) {
      const canvasRect =
        renderer.domElement.getBoundingClientRect();

      pointer.x =
        ((event.clientX - canvasRect.left) /
          canvasRect.width) *
          2 -
        1;

      pointer.y =
        -(
          (event.clientY - canvasRect.top) /
          canvasRect.height
        ) *
          2 +
        1;

      raycaster.setFromCamera(pointer, camera);

      const intersections =
        raycaster.intersectObjects(
          [spacecraft, dockingRing],
          true
        );

      if (intersections.length === 0) {
        selectedObject = null;
        selectionBox.visible = false;
        return;
      }

      const clickedMesh = intersections[0].object;

      selectedObject =
        findSelectableParent(clickedMesh);

      if (!selectedObject) {
        selectionBox.visible = false;
        return;
      }

      selectionBox.setFromObject(selectedObject);
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


    function setCameraView(view) {
      if (view === "overview") {
        camera.position.set(7, 5, 10);
        controls.target.set(0, 0, -3);
      }

      if (view === "spacecraft") {
        camera.position.set(4, 2, 5);
        controls.target.copy(spacecraft.position);
      }

      if (view === "docking") {
        camera.position.set(0, 1, 3);
        controls.target.set(0, 0, -7);
      }

      controls.update();
    }

    function handleKeyDown(event) {
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
      handleKeyDown
    );


    const clock = new THREE.Clock();

    function animate() {
      const elapsedTime = clock.getElapsedTime();

      spacecraft.position.y =
        Math.sin(elapsedTime) * 0.15;

      spacecraft.rotation.z =
        Math.sin(elapsedTime * 0.6) * 0.05;

      dockingRing.rotation.z =
        elapsedTime * 0.08;

      if (selectedObject) {
        selectionBox.setFromObject(selectedObject);
      }

      controls.update();

      renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(animate);


    function handleResize() {
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);

      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
      );
    }

    window.addEventListener(
      "resize",
      handleResize
    );


    return () => {
      renderer.setAnimationLoop(null);

      controls.dispose();

      window.removeEventListener(
        "resize",
        handleResize
      );

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      renderer.domElement.removeEventListener(
        "pointerdown",
        handlePointerDown
      );

      const geometries = new Set();
      const materials = new Set();

      scene.traverse((object) => {
        if (object.geometry) {
          geometries.add(object.geometry);
        }

        if (object.material) {
          const objectMaterials = Array.isArray(
            object.material
          )
            ? object.material
            : [object.material];

          objectMaterials.forEach((material) => {
            materials.add(material);
          });
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
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
    />
  );
}