import * as THREE from "three";
import {
  loadGLTFModel,
} from "../../loaders/loadGLTFModel.js";
import { disposeObject3D } from "../../utils/disposeObject3D.js";



const GATEWAY_MODEL_URL =
  "/models/gateway-core-optimized.glb";

const GATEWAY_TARGET_SIZE = 12;

const GATEWAY_POSITION =
  new THREE.Vector3(
    0,
    0,
    -3.5
  );
const GATEWAY_ROTATION =
  new THREE.Euler(
    THREE.MathUtils.degToRad(-25),
    0,
    THREE.MathUtils.degToRad(-2)
  );

function prepareModel(model) {
  model.traverse((object) => {
    if (!object.isMesh) {
      return;
    }

    object.castShadow = true;
    object.receiveShadow = true;

    object.frustumCulled = false;
  });
}

function normalizeModelSize(model) {
  model.rotation.copy(
    GATEWAY_ROTATION
  );

  model.updateMatrixWorld(true);

  const initialBox =
    new THREE.Box3().setFromObject(
      model
    );

  const initialSize =
    initialBox.getSize(
      new THREE.Vector3()
    );

  const largestDimension = Math.max(
    initialSize.x,
    initialSize.y,
    initialSize.z
  );

  if (largestDimension > 0) {
    const scale =
      GATEWAY_TARGET_SIZE /
      largestDimension;

    model.scale.setScalar(scale);
  }

  model.updateMatrixWorld(true);

  const scaledBox =
    new THREE.Box3().setFromObject(
      model
    );

  const center =
    scaledBox.getCenter(
      new THREE.Vector3()
    );

  model.position.sub(center);

  model.position.add(
    GATEWAY_POSITION
  );

  model.updateMatrixWorld(true);

  const finalBox =
    new THREE.Box3().setFromObject(
      model
    );

  const finalSize =
    finalBox.getSize(
      new THREE.Vector3()
    );

  console.log(
    "Gateway visual dimensions:",
    {
      x: finalSize.x,
      y: finalSize.y,
      z: finalSize.z,
    }
  );
}

export function createGatewayModel({
  stationGroup,
  onLoadingChange,
}) {
  const modelRoot =
    new THREE.Group();

  modelRoot.name =
    "GatewayVisualRoot";

  stationGroup.add(modelRoot);

  const dockingTargetMarker =
  new THREE.Mesh(
    new THREE.SphereGeometry(
      0.16,
      16,
      16
    ),
    new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      depthTest: false,
    })
  );

dockingTargetMarker.name =
  "GatewayDockingTargetMarker";

dockingTargetMarker.renderOrder =
  1000;

dockingTargetMarker.position.set(
  0,
  0,
  0
);

stationGroup.add(
  dockingTargetMarker
);

  let gatewayModel = null;
  let disposed = false;

  onLoadingChange?.({
    asset: "Gateway core",
    status: "loading",
    progress: 0,
  });

  const ready = loadGLTFModel(
    GATEWAY_MODEL_URL,
    (progress) => {
      onLoadingChange?.({
        asset: "Gateway core",
        status: "loading",
        progress,
      });
    }
  )
    .then((gltf) => {
      if (disposed) {
        disposeObject3D(gltf.scene);
        return null;
      }

      gatewayModel = gltf.scene;

      gatewayModel.name =
        "GatewayCore";

      prepareModel(gatewayModel);
      normalizeModelSize(gatewayModel);

      modelRoot.add(gatewayModel);

      console.log(
        "Gateway loaded:",
        gatewayModel
      );

      onLoadingChange?.({
        asset: "Gateway core",
        status: "ready",
        progress: 100,
      });

      return gatewayModel;
    })
    .catch((error) => {
      console.error(
        "Could not load Gateway:",
        error
      );

      onLoadingChange?.({
        asset: "Gateway core",
        status: "error",
        progress: null,
        error: error.message,
      });

      return null;
    });

  function dispose() {
    disposed = true;

    if (gatewayModel) {
      modelRoot.remove(
        gatewayModel
      );

      disposeObject3D(
        gatewayModel
      );

      gatewayModel = null;
    }

    stationGroup.remove(
      modelRoot
    );

    stationGroup.remove(
        dockingTargetMarker
      );
      
      dockingTargetMarker.geometry.dispose();
      
      dockingTargetMarker.material.dispose();
  }

  return {
    modelRoot,
    ready,

    get model() {
      return gatewayModel;
    },

    dispose,
  };
}
