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
    controls.maxDistance = 40;

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


    const ringMarker = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.7, 0.25),
      new THREE.MeshStandardMaterial({
        color: 0xf97316,
        emissive: 0x7c2d12,
        emissiveIntensity: 2,
      })
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

    
    const spacecraftMass = 1000;
    const thrustForce = 250;
    const rotationSpeed = 1.2;

    const velocity = new THREE.Vector3();
    const acceleration = new THREE.Vector3();

    const localThrust = new THREE.Vector3();
    const worldThrust = new THREE.Vector3();

    const movementDirection = new THREE.Vector3();

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
      "KeyT",
    ]);

    function resetSpacecraft() {
      spacecraft.position.set(0, 0, 0);
      spacecraft.rotation.set(0, 0, 0);

      velocity.set(0, 0, 0);
      acceleration.set(0, 0, 0);

      localThrust.set(0, 0, 0);
      worldThrust.set(0, 0, 0);
    }

    function handleMovementKeyDown(event) {
      if (!controlledKeys.has(event.code)) {
        return;
      }

      event.preventDefault();

      pressedKeys.add(event.code);

      if (event.code === "Space") {
        velocity.set(0, 0, 0);
      }

      if (
        event.code === "KeyT" &&
        !event.repeat
      ) {
        resetSpacecraft();
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

    function updateTranslation(deltaTime) {
      localThrust.set(0, 0, 0);

      if (pressedKeys.has("KeyW")) {
        localThrust.z -= 1;
      }

      if (pressedKeys.has("KeyS")) {
        localThrust.z += 1;
      }

      if (pressedKeys.has("KeyA")) {
        localThrust.x -= 1;
      }

      if (pressedKeys.has("KeyD")) {
        localThrust.x += 1;
      }

      if (pressedKeys.has("KeyR")) {
        localThrust.y += 1;
      }

      if (pressedKeys.has("KeyF")) {
        localThrust.y -= 1;
      }

      if (localThrust.lengthSq() > 0) {
        localThrust.normalize();
        localThrust.multiplyScalar(thrustForce);
      }


      worldThrust
        .copy(localThrust)
        .applyQuaternion(spacecraft.quaternion);

   
      acceleration
        .copy(worldThrust)
        .divideScalar(spacecraftMass);

      velocity.addScaledVector(
        acceleration,
        deltaTime
      );

      spacecraft.position.addScaledVector(
        velocity,
        deltaTime
      );
    }

  
    function updateRotation(deltaTime) {
      const rotationAmount =
        rotationSpeed * deltaTime;

      if (pressedKeys.has("ArrowUp")) {
        spacecraft.rotateX(rotationAmount);
      }

      if (pressedKeys.has("ArrowDown")) {
        spacecraft.rotateX(-rotationAmount);
      }

      if (pressedKeys.has("ArrowLeft")) {
        spacecraft.rotateY(rotationAmount);
      }

      if (pressedKeys.has("ArrowRight")) {
        spacecraft.rotateY(-rotationAmount);
      }

      if (pressedKeys.has("KeyQ")) {
        spacecraft.rotateZ(rotationAmount);
      }

      if (pressedKeys.has("KeyE")) {
        spacecraft.rotateZ(-rotationAmount);
      }
    }

    

    const velocityArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, -1),
      spacecraft.position,
      1,
      0x22c55e,
      0.3,
      0.15
    );

    velocityArrow.visible = false;

    scene.add(velocityArrow);

    function updateVelocityArrow() {
      const speed = velocity.length();

      velocityArrow.position.copy(
        spacecraft.position
      );

      if (speed < 0.001) {
        velocityArrow.visible = false;
        return;
      }

      movementDirection
        .copy(velocity)
        .normalize();

      velocityArrow.setDirection(
        movementDirection
      );

      velocityArrow.setLength(
        Math.min(speed * 4, 6),
        0.3,
        0.15
      );

      velocityArrow.visible = true;
    }

   
    function setCameraView(view) {
      if (view === "overview") {
        camera.position.set(7, 5, 10);
        controls.target.set(0, 0, -3);
      }

      if (view === "spacecraft") {
        camera.position
          .copy(spacecraft.position)
          .add(new THREE.Vector3(4, 2, 5));

        controls.target.copy(
          spacecraft.position
        );
      }

      if (view === "docking") {
        camera.position.set(0, 1, 3);
        controls.target.set(0, 0, -7);
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


    const clock = new THREE.Clock();

    function animate() {
      const rawDeltaTime = clock.getDelta();

      const deltaTime = Math.min(
        rawDeltaTime,
        1 / 30
      );

      updateRotation(deltaTime);
      updateTranslation(deltaTime);
      updateVelocityArrow();

      dockingRing.rotation.z +=
        0.08 * deltaTime;

      if (selectedObject) {
        selectionBox.setFromObject(
          selectedObject
        );
      }

      controls.update();

      renderer.render(scene, camera);
    }

    renderer.setAnimationLoop(animate);

    
    function handleResize() {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (width === 0 || height === 0) {
        return;
      }

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