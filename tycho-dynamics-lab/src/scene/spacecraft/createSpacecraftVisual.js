import * as THREE from "three";

import { loadGLTFModel } from "../loaders/loadGLTFModel";

const ORION_MODEL_URL =
  "/models/orion-spacecraft.glb";


const ORION_SCALE = 0.4;


const ORION_Y_ROTATION = Math.PI;

function createTemporarySpacecraft() {
  const placeholder = new THREE.Group();

  const hullMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.7,
      roughness: 0.35,
    });

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.8, 3),
    hullMaterial
  );

  placeholder.add(body);

  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(
      0.8,
      1.2,
      4
    ),
    hullMaterial
  );

  nose.rotation.x = -Math.PI / 2;
  nose.position.z = -2.1;

  placeholder.add(nose);

  return placeholder;
}

function prepareModel(model) {
  model.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    child.castShadow = true;
    child.receiveShadow = true;

    if (child.material) {
      child.material =
        child.material.clone();
    }
  });
}

function disposeObject(object) {
  object.traverse((child) => {
    if (!child.isMesh) {
      return;
    }

    child.geometry?.dispose();

    const materials = Array.isArray(
      child.material
    )
      ? child.material
      : [child.material];

    materials.forEach((material) => {
      material?.map?.dispose();
      material?.normalMap?.dispose();
      material?.roughnessMap?.dispose();
      material?.metalnessMap?.dispose();
      material?.emissiveMap?.dispose();
      material?.dispose();
    });
  });
}

export function createSpacecraftVisual({
  parent,
  onLoadingChange,
}) {
 
  const modelRoot = new THREE.Group();

  modelRoot.name = "OrionModelRoot";

  parent.add(modelRoot);

  const placeholder =
    createTemporarySpacecraft();

  modelRoot.add(placeholder);

  let orionModel = null;
  let disposed = false;

  onLoadingChange?.({
    asset: "Orion spacecraft",
    status: "loading",
    progress: 0,
  });

  const ready = loadGLTFModel(
    ORION_MODEL_URL,
    (progress) => {
      onLoadingChange?.({
        asset: "Orion spacecraft",
        status: "loading",
        progress,
      });
    }
  )
    .then((gltf) => {
      if (disposed) {
        disposeObject(gltf.scene);
        return null;
      }

      orionModel = gltf.scene;
      orionModel.name = "OrionSpacecraft";

      prepareModel(orionModel);

      orionModel.scale.setScalar(
        ORION_SCALE
      );

      orionModel.rotation.y =
        ORION_Y_ROTATION;

     
      orionModel.position.set(0, 0, 0);

      modelRoot.add(orionModel);

    
      modelRoot.remove(placeholder);
      disposeObject(placeholder);

      const boundingBox =
        new THREE.Box3().setFromObject(
          orionModel
        );

      const modelSize =
        new THREE.Vector3();

      boundingBox.getSize(modelSize);

      console.log(
        "Orion loaded successfully"
      );

      console.log("Orion visual size:", {
        x: modelSize.x,
        y: modelSize.y,
        z: modelSize.z,
      });

      onLoadingChange?.({
        asset: "Orion spacecraft",
        status: "ready",
        progress: 100,
      });

      return orionModel;
    })
    .catch((error) => {
      console.error(
        "Failed to load Orion:",
        error
      );

     
      onLoadingChange?.({
        asset: "Orion spacecraft",
        status: "error",
        progress: null,
        error: error.message,
      });

      return null;
    });

  function dispose() {
    disposed = true;

    if (orionModel) {
      modelRoot.remove(orionModel);
      disposeObject(orionModel);
    }

    if (placeholder.parent) {
      modelRoot.remove(placeholder);
      disposeObject(placeholder);
    }

    parent.remove(modelRoot);
  }

  return {
    modelRoot,
    ready,
    get model() {
      return orionModel;
    },
    dispose,
  };
}