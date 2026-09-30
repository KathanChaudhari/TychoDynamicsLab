import * as THREE from "three";

export function createDockingPortAnchor({
  parent,
  name,
  position,
  direction,
  color,
}) {
  const anchor =
    new THREE.Object3D();

  anchor.name = name;
  anchor.position.copy(position);

  parent.add(anchor);

  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.1,
      16,
      16
    ),
    new THREE.MeshBasicMaterial({
      color,
      depthTest: false,
    })
  );

  marker.renderOrder = 1000;

  anchor.add(marker);

  const arrow =
    new THREE.ArrowHelper(
      direction.clone().normalize(),
      new THREE.Vector3(0, 0, 0),
      0.8,
      color,
      0.2,
      0.1
    );

  arrow.renderOrder = 1000;

  anchor.add(arrow);

  function setDebugVisible(visible) {
    marker.visible = visible;
    arrow.visible = visible;
  }

  function dispose() {
    parent.remove(anchor);

    marker.geometry.dispose();
    marker.material.dispose();

    arrow.dispose?.();
  }

  return {
    anchor,
    marker,
    arrow,
    setDebugVisible,
    dispose,
  };
}
