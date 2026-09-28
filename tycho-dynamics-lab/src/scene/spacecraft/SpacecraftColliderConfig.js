export const SPACECRAFT_COLLIDERS =
  Object.freeze({
    serviceModule: Object.freeze({
      shape: "cylinder",

      halfHeight: 0.8,
      radius: 0.62,

      position: Object.freeze({
        x: 0,
        y: 0,
        z: 0.35,
      }),

      rotationX: Math.PI / 2,

      mass: 550,
      color: 0x38bdf8,
    }),

    crewCapsule: Object.freeze({
      shape: "cone",

      halfHeight: 0.7,
      radius: 0.75,

      position: Object.freeze({
        x: 0,
        y: 0,
        z: -0.9,
      }),

      /*
       * Three.js and Rapier cones point along
       * their local Y axis by default.
       *
       * Rotate -90 degrees around X so the
       * capsule points toward local -Z.
       */
      rotationX: -Math.PI / 2,

      mass: 400,
      color: 0xfacc15,
    }),

    dockingMechanism: Object.freeze({
      shape: "cylinder",

      halfHeight: 0.15,
      radius: 0.23,

      position: Object.freeze({
        x: 0,
        y: 0,
        z: -1.72,
      }),

      rotationX: Math.PI / 2,

      mass: 50,
      color: 0x4ade80,
    }),
  });

export const SPACECRAFT_MASS =
  Object.values(
    SPACECRAFT_COLLIDERS
  ).reduce(
    (total, collider) =>
      total + collider.mass,
    0
  );