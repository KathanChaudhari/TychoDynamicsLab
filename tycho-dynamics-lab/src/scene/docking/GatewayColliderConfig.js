export const GATEWAY_STATION_Z = -7;

export const GATEWAY_COLLIDERS =
  Object.freeze({
    dockingAdapter: Object.freeze({
      shape: "cylinder",

      radius: 0.65,
      halfHeight: 0.45,

      position: Object.freeze({
        x: 0,
        y: 0,
        z: -0.55,
      }),

      rotationX: Math.PI / 2,
      color: 0x4ade80,
    }),

    forwardModule: Object.freeze({
      shape: "cylinder",

      radius: 1,
      halfHeight: 0.9,

      position: Object.freeze({
        x: 0,
        y: 0,
        z: -1.9,
      }),

      rotationX: Math.PI / 2,
      color: 0xf97316,
    }),

    coreModule: Object.freeze({
      shape: "cuboid",

      halfExtents: Object.freeze({
        x: 0.95,
        y: 0.8,
        z: 0.9,
      }),

      position: Object.freeze({
        x: 0,
        y: -0.25,
        z: -3.55,
      }),

      rotationX:
        Math.PI / -7.2,

      color: 0xef4444,
    }),

    sideModule: Object.freeze({
      shape: "cuboid",

      halfExtents: Object.freeze({
        x: 0.65,
        y: 0.65,
        z: 0.85,
      }),

      position: Object.freeze({
        x: 1.15,
        y: 0.2,
        z: -2.9,
      }),

      rotationX:
        Math.PI / -7.2,

      color: 0xa855f7,
    }),
  });

export const GATEWAY_SENSOR =
  Object.freeze({
    halfExtents: Object.freeze({
      x: 1.2,
      y: 0.7,
      z: 0.75,
    }),

    /*
     * The sensor is in front of the docking
     * port, toward the approaching Orion.
     */
    position: Object.freeze({
      x: 0,
      y: 0,
      z: 1.25,
    }),

    color: 0x22d3ee,
  });