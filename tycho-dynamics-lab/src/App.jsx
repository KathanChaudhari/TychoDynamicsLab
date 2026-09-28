import { useState } from "react";

import BasicScene from "./BasicScene";

import DockingHUD from "./components/DockingHUD";
import DockingReticle from "./components/DockingReticle";
import ControlGuide from "./components/ControlGuide";
import LoadingScreen from "./components/LoadingScreen";

const INITIAL_TELEMETRY = {
  state: "approach",
  insideSensor: false,

  speed: 0,
  closingSpeed: 0,
  lateralSpeed: 0,

  horizontalSpeed: 0,
  verticalSpeed: 0,

  angularSpeed: 0,
  alignmentAngle: 0,

  horizontalOffset: 0,
  verticalOffset: 0,
  lateralOffset: 0,

  axialDistance: 7,
  distance: 7,

  timeToContact: null,
  impactForce: 0,

  checks: {
    speed: true,
    closingSpeed: true,
    lateralSpeed: true,
    angularSpeed: true,
    alignment: true,
    lateralOffset: true,
    distance: false,
  },

  limits: {
    maximumClosingSpeed: 0.25,
    maximumLateralSpeed: 0.12,
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
  const [
    telemetry,
    setTelemetry,
  ] = useState(
    INITIAL_TELEMETRY
  );

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

      <DockingReticle
        telemetry={telemetry}
      />

      <ControlGuide />

      <LoadingScreen
        loadingState={loadingState}
      />
    </main>
  );
}