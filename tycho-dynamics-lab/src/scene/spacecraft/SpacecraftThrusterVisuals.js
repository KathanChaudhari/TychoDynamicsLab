import * as THREE from "three";

const PLUME_LENGTH = 0.4;
const PLUME_RADIUS = 0.09;

const BASE_DIRECTION =
  new THREE.Vector3(0, -1, 0);

function vector(x, y, z) {
  return new THREE.Vector3(
    x,
    y,
    z
  );
}

export function createSpacecraftThrusterVisuals(
  spacecraftGroup
) {
  const group =
    new THREE.Group();

  group.name =
    "SpacecraftThrusterVisuals";

  spacecraftGroup.add(group);

  /*
   * ConeGeometry points along local Y.
   * Moving it downward places the cone's
   * tip at the thruster nozzle.
   */
  const plumeGeometry =
    new THREE.ConeGeometry(
      PLUME_RADIUS,
      PLUME_LENGTH,
      12,
      1,
      true
    );

  plumeGeometry.translate(
    0,
    -PLUME_LENGTH / 2,
    0
  );

  const definitions = [
    // Forward force: local -Z, exhaust +Z
    {
      source: "translation",
      axis: "z",
      sign: -1,
      position: vector(
        -0.3,
        0,
        1.2
      ),
      direction: vector(0, 0, 1),
    },
    {
      source: "translation",
      axis: "z",
      sign: -1,
      position: vector(
        0.3,
        0,
        1.2
      ),
      direction: vector(0, 0, 1),
    },

    // Backward force: local +Z, exhaust -Z
    {
      source: "translation",
      axis: "z",
      sign: 1,
      position: vector(
        -0.25,
        0,
        -1.55
      ),
      direction: vector(0, 0, -1),
    },
    {
      source: "translation",
      axis: "z",
      sign: 1,
      position: vector(
        0.25,
        0,
        -1.55
      ),
      direction: vector(0, 0, -1),
    },

    // Right force: local +X, exhaust -X
    {
      source: "translation",
      axis: "x",
      sign: 1,
      position: vector(
        -0.68,
        0.25,
        0.25
      ),
      direction: vector(-1, 0, 0),
    },
    {
      source: "translation",
      axis: "x",
      sign: 1,
      position: vector(
        -0.68,
        -0.25,
        0.25
      ),
      direction: vector(-1, 0, 0),
    },

    // Left force: local -X, exhaust +X
    {
      source: "translation",
      axis: "x",
      sign: -1,
      position: vector(
        0.68,
        0.25,
        0.25
      ),
      direction: vector(1, 0, 0),
    },
    {
      source: "translation",
      axis: "x",
      sign: -1,
      position: vector(
        0.68,
        -0.25,
        0.25
      ),
      direction: vector(1, 0, 0),
    },

    // Up force: local +Y, exhaust -Y
    {
      source: "translation",
      axis: "y",
      sign: 1,
      position: vector(
        -0.25,
        -0.68,
        0.25
      ),
      direction: vector(0, -1, 0),
    },
    {
      source: "translation",
      axis: "y",
      sign: 1,
      position: vector(
        0.25,
        -0.68,
        0.25
      ),
      direction: vector(0, -1, 0),
    },

    // Down force: local -Y, exhaust +Y
    {
      source: "translation",
      axis: "y",
      sign: -1,
      position: vector(
        -0.25,
        0.68,
        0.25
      ),
      direction: vector(0, 1, 0),
    },
    {
      source: "translation",
      axis: "y",
      sign: -1,
      position: vector(
        0.25,
        0.68,
        0.25
      ),
      direction: vector(0, 1, 0),
    },

    // Positive pitch torque
    {
      source: "rotation",
      axis: "x",
      sign: 1,
      position: vector(
        0,
        -0.62,
        -0.9
      ),
      direction: vector(0, -1, 0),
    },
    {
      source: "rotation",
      axis: "x",
      sign: 1,
      position: vector(
        0,
        0.62,
        0.9
      ),
      direction: vector(0, 1, 0),
    },

    // Negative pitch torque
    {
      source: "rotation",
      axis: "x",
      sign: -1,
      position: vector(
        0,
        0.62,
        -0.9
      ),
      direction: vector(0, 1, 0),
    },
    {
      source: "rotation",
      axis: "x",
      sign: -1,
      position: vector(
        0,
        -0.62,
        0.9
      ),
      direction: vector(0, -1, 0),
    },

    // Positive yaw torque
    {
      source: "rotation",
      axis: "y",
      sign: 1,
      position: vector(
        0.62,
        0,
        -0.9
      ),
      direction: vector(1, 0, 0),
    },
    {
      source: "rotation",
      axis: "y",
      sign: 1,
      position: vector(
        -0.62,
        0,
        0.9
      ),
      direction: vector(-1, 0, 0),
    },

    // Negative yaw torque
    {
      source: "rotation",
      axis: "y",
      sign: -1,
      position: vector(
        -0.62,
        0,
        -0.9
      ),
      direction: vector(-1, 0, 0),
    },
    {
      source: "rotation",
      axis: "y",
      sign: -1,
      position: vector(
        0.62,
        0,
        0.9
      ),
      direction: vector(1, 0, 0),
    },

    // Positive roll torque
    {
      source: "rotation",
      axis: "z",
      sign: 1,
      position: vector(
        0.62,
        0,
        0.3
      ),
      direction: vector(0, -1, 0),
    },
    {
      source: "rotation",
      axis: "z",
      sign: 1,
      position: vector(
        -0.62,
        0,
        0.3
      ),
      direction: vector(0, 1, 0),
    },

    // Negative roll torque
    {
      source: "rotation",
      axis: "z",
      sign: -1,
      position: vector(
        0.62,
        0,
        0.3
      ),
      direction: vector(0, 1, 0),
    },
    {
      source: "rotation",
      axis: "z",
      sign: -1,
      position: vector(
        -0.62,
        0,
        0.3
      ),
      direction: vector(0, -1, 0),
    },
  ];

  function createPlume(
    definition,
    index
  ) {
    const material =
      new THREE.MeshBasicMaterial({
        color: 0x67e8f9,
        transparent: true,
        opacity: 0,
        blending:
          THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      });

    const mesh =
      new THREE.Mesh(
        plumeGeometry,
        material
      );

    mesh.name =
      `RCSPlume-${index}`;

    mesh.position.copy(
      definition.position
    );

    mesh.quaternion
      .setFromUnitVectors(
        BASE_DIRECTION,
        definition.direction
          .clone()
          .normalize()
      );

    mesh.visible = false;
    mesh.frustumCulled = false;

    mesh.userData.intensity = 0;
    mesh.userData.phase =
      index * 0.73;

    group.add(mesh);

    return {
      ...definition,
      mesh,
      material,
    };
  }

  const plumes =
    definitions.map(
      createPlume
    );

  let elapsedTime = 0;

  function getRequestedIntensity(
    plume,
    controlState
  ) {
    const vectorState =
      controlState?.[
        plume.source
      ];

    if (!vectorState) {
      return 0;
    }

    const value =
      vectorState[plume.axis] ?? 0;

    if (
      Math.sign(value) !==
      plume.sign
    ) {
      return 0;
    }

    const thrustScale =
    controlState.thrustScale ?? 1;
  
  return (
    Math.abs(value) *
    thrustScale
  );
  }

  function update(
    controlState,
    deltaTime
  ) {
    elapsedTime += deltaTime;

    const response =
      1 -
      Math.exp(
        -24 * deltaTime
      );

    for (const plume of plumes) {
      const targetIntensity =
        getRequestedIntensity(
          plume,
          controlState
        );

      const currentIntensity =
        plume.mesh.userData
          .intensity;

      const intensity =
        THREE.MathUtils.lerp(
          currentIntensity,
          targetIntensity,
          response
        );

      plume.mesh.userData.intensity =
        intensity;

      if (intensity < 0.015) {
        plume.mesh.visible = false;
        continue;
      }

      plume.mesh.visible = true;

      const flicker =
        1 +
        Math.sin(
          elapsedTime * 45 +
            plume.mesh.userData
              .phase
        ) *
          0.16;

      plume.mesh.scale.set(
        0.7 + intensity * 0.5,
        intensity * flicker,
        0.7 + intensity * 0.5
      );

      plume.material.opacity =
        0.25 +
        intensity * 0.7;
    }
  }

  function reset() {
    for (const plume of plumes) {
      plume.mesh.visible = false;
      plume.mesh.userData.intensity =
        0;

      plume.material.opacity = 0;
    }
  }

  function dispose() {
    spacecraftGroup.remove(group);

    for (const plume of plumes) {
      plume.material.dispose();
    }

    plumeGeometry.dispose();
  }

  return {
    group,
    update,
    reset,
    dispose,
  };
}