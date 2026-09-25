import { useState } from "react";

import BasicScene from "./BasicScene";
import DockingHUD from "./components/DockingHUD";
import ControlGuide from "./components/ControlGuide";

const INITIAL_TELEMETRY = {
  state: "approach",
  insideSensor: false,

  speed: 0,
  angularSpeed: 0,
  alignmentAngle: 0,
  lateralOffset: 0,
  distance: 7,
  impactForce: 0,

  checks: {
    speed: true,
    angularSpeed: true,
    alignment: true,
    lateralOffset: true,
  },

  limits: {
    maximumSpeed: 0.25,
    maximumAngularSpeed: 0.15,
    maximumAlignmentAngle: 7,
    maximumLateralOffset: 0.35,
    crashForce: 5000,
  },
};

export default function App() {
  const [telemetry, setTelemetry] =
    useState(INITIAL_TELEMETRY);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-950">
      <BasicScene
        onTelemetry={setTelemetry}
      />

      <DockingHUD
        telemetry={telemetry}
      />

      <ControlGuide />
    </main>
  );
}