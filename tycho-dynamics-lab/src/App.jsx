import { useState } from "react";

import BasicScene from "./BasicScene";

import DockingHUD from "./components/DockingHUD";
import DockingReticle from "./components/DockingReticle";
import ControlGuide from "./components/ControlGuide";
import LoadingScreen from "./components/LoadingScreen";

import MissionBriefing from "./components/MissionBriefing";
import MissionStatus from "./components/MissionStatus";
import MissionResult from "./components/MissionResult";

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
  crashReason: null,

damage: {
  integrity: 100,
  maximumIntegrity: 100,
  percentage: 100,
  status: "nominal",
  impactCount: 0,
  lastDamage: 0,
  lastImpactForce: 0,
  maximumImpactForce: 0,
  destroyed: false,
},

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

  propellant: {
    capacity: 120,
    remaining: 120,
    percentage: 100,
    flowRate: 0,
    dryMass: 880,
    estimatedMass: 1000,
    status: "nominal",
  },

  mission: {
    status: "briefing",
    elapsedTime: 0,
    score: 1000,
    propellantUsed: 0,
    maximumImpact: 0,
    result: null,
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

  const mission =
    telemetry.mission;

  const missionActive =
    mission?.status === "active";

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

      {missionActive && (
        <DockingReticle
          telemetry={telemetry}
        />
      )}

      <MissionStatus
        mission={mission}
      />

      <ControlGuide />

      {loadingState.status ===
        "ready" && (
        <MissionBriefing
          mission={mission}
        />
      )}

      <MissionResult
        mission={mission}
      />

      <LoadingScreen
        loadingState={loadingState}
      />
    </main>
  );
}