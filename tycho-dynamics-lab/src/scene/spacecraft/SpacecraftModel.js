import * as THREE from "three";

import {
  loadGLTFModel,
} from "../loaders/loadGLTFModel.js";

import {
  createDockingPortAnchor,
} from "../docking/DockingPortAnchor.js";

const ORION_MODEL_URL =
  "/models/orion-spacecraft.glb";

const ORION_SCALE = 0.4;

const ORION_X_ROTATION =
  -Math.PI / 2;

const ORION_Y_ROTATION = 0;

/*
 * Position relative to SpacecraftPhysicsRoot.
 *
 * Adjust only the Z value until the green marker
 * sits on the Orion docking-port face.
 */
const ORION_DOCKING_PORT_POSITION =
  new THREE.Vector3(
    0,
    0,
    -1.9
  );

function createPlaceholder() {
  const group = new THREE.Group();

  group.name =
    "SpacecraftPlaceholder";

  const hullMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.7,
      roughness: 0.35,
    });

  const darkMaterial =
    new THREE.MeshStandardMaterial({
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

  const bodyMesh = new THREE.Mesh(
    new THREE.BoxGeometry(
      1.6,
      0.8,
      3
    ),
    hullMaterial
  );

  group.add(bodyMesh);

  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(
      0.8,
      1.2,
      4
    ),
    hullMaterial
  );

  nose.rotation.x =
    -Math.PI / 2;

  nose.position.z = -2.1;

  group.add(nose);

  const leftWing = new THREE.Mesh(
    new THREE.BoxGeometry(
      2,
      0.12,
      1.4
    ),
    darkMaterial
  );

  leftWing.position.set(
    -1.5,
    0,
    0.3
  );

  group.add(leftWing);

  const rightWing =
    leftWing.clone();

  rightWing.position.x = 1.5;

  group.add(rightWing);

  const engine = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.45,
      0.45,
      0.25,
      24
    ),
    engineMaterial
  );

  engine.rotation.x =
    Math.PI / 2;

  engine.position.z = 1.6;

  group.add(engine);

  return group;
}

function prepareLoadedModel(model) {
  model.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    child.castShadow = true;
    child.receiveShadow = true;
  });
}

function disposeObject(object) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();

  object.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    if (
      child.geometry &&
      !geometries.has(
        child.geometry
      )
    ) {
      child.geometry.dispose();

      geometries.add(
        child.geometry
      );
    }

    const childMaterials =
      Array.isArray(child.material)
        ? child.material
        : [child.material];

    childMaterials.forEach(
      (material) => {
        if (
          !material ||
          materials.has(material)
        ) {
          return;
        }

        for (
          const value of
          Object.values(material)
        ) {
          if (
            value?.isTexture &&
            !textures.has(value)
          ) {
            value.dispose();
            textures.add(value);
          }
        }

        material.dispose();
        materials.add(material);
      }
    );
  });
}

export function createSpacecraftModel(
  scene,
  options = {}
) {
  /*
   * This group follows the Rapier rigid body.
   */
  const group = new THREE.Group();

  group.name =
    "SpacecraftPhysicsRoot";

  group.userData.selectable = true;

  group.userData.label =
    "Orion spacecraft";

  scene.add(group);

  /*
   * Visual corrections are applied below this
   * group so they do not affect Rapier.
   */
  const modelRoot =
    new THREE.Group();

  modelRoot.name =
    "OrionVisualRoot";

  group.add(modelRoot);

  /*
   * The docking anchor belongs directly to the
   * physics group, not the scaled visual model.
   */
  const dockingPort =
    createDockingPortAnchor({
      parent: group,

      name:
        "OrionDockingPort",

      position:
        ORION_DOCKING_PORT_POSITION,

      direction:
        new THREE.Vector3(
          0,
          0,
          -1
        ),

      color: 0x22c55e,
    });

  const placeholder =
    createPlaceholder();

  modelRoot.add(placeholder);

  let orionModel = null;
  let disposed = false;

  options.onLoadingChange?.({
    asset: "Orion spacecraft",
    status: "loading",
    progress: 0,
  });

  const ready = loadGLTFModel(
    ORION_MODEL_URL,

    (progress) => {
      options.onLoadingChange?.({
        asset: "Orion spacecraft",
        status: "loading",
        progress,
      });
    }
  )
    .then((gltf) => {
      /*
       * The loader can finish after React has
       * already unmounted the scene.
       */
      if (disposed) {
        disposeObject(gltf.scene);
        return null;
      }

      orionModel = gltf.scene;

      orionModel.name =
        "OrionSpacecraft";

      prepareLoadedModel(
        orionModel
      );

      orionModel.scale.setScalar(
        ORION_SCALE
      );

      orionModel.rotation.set(
        ORION_X_ROTATION,
        ORION_Y_ROTATION,
        0
      );

      orionModel.position.set(
        0,
        0,
        0
      );

      modelRoot.add(
        orionModel
      );

      /*
       * Only remove the primitive after the GLB
       * has loaded successfully.
       */
      modelRoot.remove(
        placeholder
      );

      disposeObject(
        placeholder
      );

      const boundingBox =
        new THREE.Box3().setFromObject(
          orionModel
        );

      const visualSize =
        boundingBox.getSize(
          new THREE.Vector3()
        );

      console.log(
        "Orion loaded:",
        orionModel
      );

      console.log(
        "Orion visual dimensions:",
        {
          x: visualSize.x,
          y: visualSize.y,
          z: visualSize.z,
        }
      );

      options.onLoadingChange?.({
        asset: "Orion spacecraft",
        status: "ready",
        progress: 100,
      });

      return orionModel;
    })
    .catch((error) => {
      console.error(
        "Could not load Orion model:",
        error
      );

      options.onLoadingChange?.({
        asset: "Orion spacecraft",
        status: "error",
        progress: null,
        error: error.message,
      });

      /*
       * The primitive placeholder remains visible.
       */
      return null;
    });

  const velocityArrow =
    new THREE.ArrowHelper(
      new THREE.Vector3(
        0,
        0,
        -1
      ),
      new THREE.Vector3(
        0,
        0,
        0
      ),
      1,
      0x22c55e,
      0.3,
      0.15
    );

  velocityArrow.visible = false;

  scene.add(velocityArrow);

  const velocityDirection =
    new THREE.Vector3();

  function syncTransform(
    position,
    rotation
  ) {
    group.position.set(
      position.x,
      position.y,
      position.z
    );

    group.quaternion.set(
      rotation.x,
      rotation.y,
      rotation.z,
      rotation.w
    );
  }

  function updateVelocityArrow(
    linearVelocity
  ) {
    velocityDirection.set(
      linearVelocity.x,
      linearVelocity.y,
      linearVelocity.z
    );

    const speed =
      velocityDirection.length();

    velocityArrow.position.copy(
      group.position
    );

    if (speed < 0.001) {
      velocityArrow.visible = false;
      return;
    }

    velocityDirection.normalize();

    velocityArrow.setDirection(
      velocityDirection
    );

    velocityArrow.setLength(
      Math.min(
        speed * 4,
        6
      ),
      0.3,
      0.15
    );

    velocityArrow.visible = true;
  }

  function hideVelocityArrow() {
    velocityArrow.visible = false;
  }

  function dispose() {
    disposed = true;

    /*
     * Remove the docking-port marker and arrow.
     */
    dockingPort.dispose();

    if (orionModel) {
      modelRoot.remove(
        orionModel
      );

      disposeObject(
        orionModel
      );

      orionModel = null;
    }

    /*
     * The placeholder only has a parent when
     * model loading failed or hasn't completed.
     */
    if (placeholder.parent) {
      modelRoot.remove(
        placeholder
      );

      disposeObject(
        placeholder
      );
    }

    scene.remove(
      velocityArrow
    );

    scene.remove(group);

    velocityArrow.dispose?.();
  }

  return {
    group,
    modelRoot,
    velocityArrow,
    ready,

    dockingPort:
      dockingPort.anchor,

    setDockingPortDebugVisible:
      dockingPort.setDebugVisible,

    get orionModel() {
      return orionModel;
    },

    syncTransform,
    updateVelocityArrow,
    hideVelocityArrow,
    dispose,
  };
}