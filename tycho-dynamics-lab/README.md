# Tycho Dynamics Lab

3D spacecraft docking simulator built with Three.js, Rapier, React, and WebGL. 

Pilot an Orion-inspired spacecraft toward the Lunar Gateway, manage  velocity and alignment,  propellant, and controlled docking 


## About the Project

Tycho Dynamics Lab is a browser-based orbital docking simulation created to explore real-time 3D graphics, rigid-body physics, spacecraft controls, telemetry systems, and interactive simulation architecture.

The simulation includes:

- Six-degree-of-freedom spacecraft controls
- Physics-based thrust and rotation
- Relative docking telemetry
- Magnetic soft capture
- Fixed-joint hard docking
- Collision damage and mission failure
- Propellant consumption
- Mission scoring
- Multiple difficulty modes
- Probe launching and trajectory prediction
- Dynamic cameras and audio feedback

This is an educational simulation and is not intended to reproduce the exact flight dynamics of NASA spacecraft.

## Features

### Spacecraft Flight

- Local-space translation controls
- Pitch, yaw, and roll controls
- Force- and torque-based movement
- Linear and angular velocity management
- Visual thruster feedback
- Propellant consumption
- Velocity visualization

### Docking System

- Compound spacecraft colliders
- Gateway docking sensor
- Collision and contact-force events
- Relative closing-speed calculation
- Horizontal and vertical drift measurement
- Docking-port alignment calculation
- Lateral-offset monitoring
- Estimated time to contact
- Automatic soft-capture controller
- Fixed-joint hard lock
- Undocking and separation impulse

### Mission System

- Mission briefing and difficulty selection
- Live scoring
- Mission timer
- Fuel-use penalties
- Alignment and velocity bonuses
- Impact and hull-damage penalties
- Success and failure summaries
- Immediate mission restart

### Difficulty Modes

| Mode | Description |
|---|---|
| Easy | Wider docking tolerances, more propellant, stronger capture assistance, and reduced impact damage |
| Normal | Balanced flight controls, docking limits, fuel consumption, and damage |
| Hard | Strict docking tolerances, limited propellant, weaker capture assistance, and increased damage |

### Reliability

- React error boundary
- WebGL capability detection
- WebGL context-loss handling
- GLTF model fallbacks
- Model-loading warnings
- Friendly startup failure screen
- Reload and recovery controls
- Safe disposal of Three.js and Rapier resources

### Performance

- Fixed-timestep physics simulation
- Frame-time limiting
- Throttled telemetry updates
- Adaptive renderer resolution
- Optimized GLB assets
- Meshopt model decoding
- Lazy-loaded Rapier physics engine
- Separate application and physics bundles
- Explicit Three.js resource disposal

## Controls

| Input | Action |
|---|---|
| `W` / `S` | Move forward / backward |
| `A` / `D` | Move left / right |
| `R` / `F` | Move up / down |
| `Arrow Up` / `Arrow Down` | Pitch |
| `Arrow Left` / `Arrow Right` | Yaw |
| `Q` / `E` | Roll |
| `Space` | Stop linear motion |
| `X` | Stop angular motion |
| `P` | Launch probe |
| `V` | Toggle probe trajectory |
| `U` | Undock |
| `T` | Restart mission |
| `C` | Toggle collider and docking-port debug views |
| `1` / `2` / `3` | Change camera view |
| `Enter` | Start mission |

Mouse or trackpad input can be used to orbit, zoom, and inspect the scene.

## Docking Guidance

A safe docking requires control over several relative-flight measurements:

- Closing speed
- Lateral speed
- Angular speed
- Docking-port alignment
- Horizontal and vertical offset
- Distance from the docking port

The allowed limits depend on the selected difficulty.

During the final approach, the docking system progresses through these states:

1. `approach`
2. `in-range`
3. `capturing`
4. `docked`

An unsafe impact can instead move the simulation into the `crashed` state.

## Technology Stack

- [React](https://react.dev/)
- [Vite](https://vite.dev/)
- [Three.js](https://threejs.org/)
- [Rapier](https://rapier.rs/)
- [Tailwind CSS](https://tailwindcss.com/)
- WebGL
- Web Audio API
- GLTF / GLB
- Meshopt compression


## Getting Started

### Requirements

- Node.js 20 or newer
- npm
- A browser with WebGL support

### Installation

```bash
git clone <repository-url>
cd tycho-dynamics-lab
npm install
```

### Development

```bash
npm run dev
```

Open the local URL shown by Vite.

### Production Build

```bash
npm run build
```

### Preview the Production Build

```bash
npm run preview
```

## Bundle Optimization

Rapier is dynamically imported so the physics engine is separated from the initial application bundle.

Current production bundle structure:

| Bundle | Approximate size | Gzip |
|---|---:|---:|
| Main application | 974 KB | 265 KB |
| Rapier physics | 2.85 MB | 1.09 MB |
| Styles | 30 KB | 6 KB |

This allows the interface and loading state to initialize independently while the physics engine is downloaded.

The Gateway model was reduced from approximately 63 MB to approximately 4.5 MB through GLB optimization.

## 3D Model Credits

The original spacecraft and station assets were sourced from NASA's publicly available 3D resources and were adapted and optimized for browser rendering.

- [Orion Capsule – NASA 3D Resources](https://science.nasa.gov/3d-resources/orion-capsule/)
- [Gateway Lunar Space Station – NASA 3D Resources](https://science.nasa.gov/3d-resources/gateway-lunar-space-station/)

The Orion asset was modified and expanded for the simulation, including additional spacecraft components, materials, solar arrays, thrusters, and browser-ready GLB optimization.

NASA is not affiliated with or responsible for this project.



