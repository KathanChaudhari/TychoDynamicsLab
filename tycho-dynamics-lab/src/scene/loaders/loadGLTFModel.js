import {
  GLTFLoader,
} from "three/addons/loaders/GLTFLoader.js";

import {
  MeshoptDecoder,
} from "three/addons/libs/meshopt_decoder.module.js";

const loader =
  new GLTFLoader();

loader.setMeshoptDecoder(
  MeshoptDecoder
);

export function loadGLTFModel(
  url,
  onProgress
) {
  return new Promise(
    (resolve, reject) => {
      loader.load(
        url,

        (gltf) => {
          resolve(gltf);
        },

        (event) => {
          if (
            !event.total ||
            event.total <= 0
          ) {
            onProgress?.(50);
            return;
          }

          const progress =
            (event.loaded /
              event.total) *
            100;

          onProgress?.(
            Math.round(
              Math.min(
                Math.max(progress, 0),
                100
              )
            )
          );
        },

        (error) => {
          reject(
            error instanceof Error
              ? error
              : new Error(
                  `Failed to load ${url}`
                )
          );
        }
      );
    }
  );
}
