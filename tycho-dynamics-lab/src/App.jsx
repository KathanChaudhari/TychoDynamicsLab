import { useCallback, useRef, useState } from "react";

import BasicScene from "./BasicScene";
import AudioControl from "./components/AudioControl";
import ControlGuide from "./components/ControlGuide";
import DockingHUD from "./components/DockingHUD";
import DockingReticle from "./components/DockingReticle";
import LoadingScreen from "./components/LoadingScreen";
import MissionBriefing from "./components/MissionBriefing";
import MissionResult from "./components/MissionResult";
import MissionStatus from "./components/MissionStatus";
import PerformancePanel from "./components/PerformancePanel";
import {
  INITIAL_LOADING_STATE,
  INITIAL_TELEMETRY,
} from "./config/initialAppState.js";
import { SIMULATION_CONFIG } from "./scene/config/SimulationConfig.js";

export default function App() {
  const audioControllerRef = useRef(null);
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [performance, setPerformance] = useState(null);
  const [telemetry, setTelemetry] = useState(INITIAL_TELEMETRY);
  const [loadingState, setLoadingState] = useState(INITIAL_LOADING_STATE);
  const [selectedDifficulty, setSelectedDifficulty] = useState("standard");

  const handleAudioReady = useCallback((controller) => {
    audioControllerRef.current = controller;
    setAudioAvailable(Boolean(controller));

    if (controller) {
      setAudioMuted(controller.isMuted());
    }
  }, []);

  const handleToggleAudio = useCallback(() => {
    const controller = audioControllerRef.current;

    if (controller) {
      setAudioMuted(controller.toggleMuted());
    }
  }, []);

  const mission = telemetry.mission;
  const missionActive = mission?.status === "active";

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-950">
      <BasicScene
        selectedDifficulty={selectedDifficulty}
        onTelemetry={setTelemetry}
        onLoadingState={setLoadingState}
        onAudioReady={handleAudioReady}
        onPerformance={setPerformance}
      />

      <DockingHUD telemetry={telemetry} />
      {missionActive && <DockingReticle telemetry={telemetry} />}
      <MissionStatus mission={mission} />
      <ControlGuide />

      {loadingState.status === "ready" && (
        <MissionBriefing
          missionStatus={mission?.status}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
        />
      )}

      <MissionResult result={mission?.result} />
      <LoadingScreen loadingState={loadingState} />
      <PerformancePanel
        performance={performance}
        visible={SIMULATION_CONFIG.debug}
      />

      {loadingState.status === "ready" && (
        <AudioControl
          muted={audioMuted}
          available={audioAvailable}
          onToggle={handleToggleAudio}
        />
      )}
    </main>
  );
}
