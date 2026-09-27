import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();

export async function loadGLTFModel(
  url,
  onProgress
) {
  const gltf = await loader.loadAsync(
    url,
    (event) => {
      if (!onProgress) {
        return;
      }

      if (!event.total) {
        onProgress(null);
        return;
      }

      const percentage = Math.round(
        (event.loaded / event.total) * 100
      );

      onProgress(percentage);
    }
  );

  return gltf;
}