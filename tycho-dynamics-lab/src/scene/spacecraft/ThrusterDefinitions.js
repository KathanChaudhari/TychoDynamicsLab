import * as THREE from "three";

const vector = (x, y, z) => new THREE.Vector3(x, y, z);

const translation = (axis, sign, position, direction) => ({
  source: "translation",
  axis,
  sign,
  position: vector(...position),
  direction: vector(...direction),
});

const rotation = (axis, sign, position, direction) => ({
  source: "rotation",
  axis,
  sign,
  position: vector(...position),
  direction: vector(...direction),
});

export function createThrusterDefinitions() {
  return [
    translation("z", -1, [-0.3, 0, 1.2], [0, 0, 1]),
    translation("z", -1, [0.3, 0, 1.2], [0, 0, 1]),

    translation("z", 1, [-0.25, 0, -1.55], [0, 0, -1]),
    translation("z", 1, [0.25, 0, -1.55], [0, 0, -1]),

    translation("x", 1, [-0.68, 0.25, 0.25], [-1, 0, 0]),
    translation("x", 1, [-0.68, -0.25, 0.25], [-1, 0, 0]),

    translation("x", -1, [0.68, 0.25, 0.25], [1, 0, 0]),
    translation("x", -1, [0.68, -0.25, 0.25], [1, 0, 0]),

    translation("y", 1, [-0.25, -0.68, 0.25], [0, -1, 0]),
    translation("y", 1, [0.25, -0.68, 0.25], [0, -1, 0]),

    translation("y", -1, [-0.25, 0.68, 0.25], [0, 1, 0]),
    translation("y", -1, [0.25, 0.68, 0.25], [0, 1, 0]),

    rotation("x", 1, [0, -0.62, -0.9], [0, -1, 0]),
    rotation("x", 1, [0, 0.62, 0.9], [0, 1, 0]),

    rotation("x", -1, [0, 0.62, -0.9], [0, 1, 0]),
    rotation("x", -1, [0, -0.62, 0.9], [0, -1, 0]),

    rotation("y", 1, [0.62, 0, -0.9], [1, 0, 0]),
    rotation("y", 1, [-0.62, 0, 0.9], [-1, 0, 0]),

    rotation("y", -1, [-0.62, 0, -0.9], [-1, 0, 0]),
    rotation("y", -1, [0.62, 0, 0.9], [1, 0, 0]),

    rotation("z", 1, [0.62, 0, 0.3], [0, -1, 0]),
    rotation("z", 1, [-0.62, 0, 0.3], [0, 1, 0]),

    rotation("z", -1, [0.62, 0, 0.3], [0, 1, 0]),
    rotation("z", -1, [-0.62, 0, 0.3], [0, -1, 0]),
  ];
}
