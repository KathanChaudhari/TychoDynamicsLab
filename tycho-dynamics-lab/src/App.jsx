import { useState } from "react";

import BasicScene from "./BasicScene";

import DockingHUD from "./components/DockingHUD";
import ControlGuide from "./components/ControlGuide";
import LoadingScreen from "./components/LoadingScreen";

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
    distance: true,
  },

  limits: {
    maximumSpeed: 0.25,
    maximumAngularSpeed: 0.15,
    maximumAlignmentAngle: 7,
    maximumLateralOffset: 0.35,
    maximumCaptureDistance: 0.8,
    crashForce: 5000,
  },
};

const INITIAL_LOADING_STATE = {
  status: "loading",
  progress: 0,
  message: "Preparing simulation",
};

export default function App() {
  const [telemetry, setTelemetry] =
    useState(INITIAL_TELEMETRY);

  const [
    loadingState,
    setLoadingState,
  ] = useState(
    INITIAL_LOADING_STATE
  );

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-950">
      <BasicScene
        onTelemetry={setTelemetry}
        onLoadingState={
          setLoadingState
        }
      />

      <DockingHUD
        telemetry={telemetry}
      />

      <ControlGuide />

      <LoadingScreen
        loadingState={loadingState}
      />
    </main>
  );
}