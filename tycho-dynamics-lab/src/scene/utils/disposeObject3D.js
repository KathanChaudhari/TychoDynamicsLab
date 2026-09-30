function getMaterials(material) {
  if (!material) {
    return [];
  }

  return Array.isArray(material) ? material : [material];
}

export function disposeObject3D(root) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();

  root.traverse((object) => {
    if (object.geometry) {
      geometries.add(object.geometry);
    }

    for (const material of getMaterials(object.material)) {
      if (!material) {
        continue;
      }

      materials.add(material);

      for (const value of Object.values(material)) {
        if (value?.isTexture) {
          textures.add(value);
        }
      }
    }
  });

  for (const texture of textures) {
    texture.dispose();
  }
  for (const material of materials) {
    material.dispose();
  }
  for (const geometry of geometries) {
    geometry.dispose();
  }
}
