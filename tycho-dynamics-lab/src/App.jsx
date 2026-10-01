import {
  useCallback,
  useRef,
  useState,
} from "react";

import BasicScene from "./BasicScene";

import AssetWarning from "./components/AssetWarning";
import AudioControl from "./components/AudioControl";
import ControlGuide from "./components/ControlGuide";
import DifficultySelector from "./components/DifficultySelector";
import DockingHUD from "./components/DockingHUD";
import DockingReticle from "./components/DockingReticle";
import LoadingScreen from "./components/LoadingScreen";
import MissionBriefing from "./components/MissionBriefing";
import MissionResult from "./components/MissionResult";
import MissionStatus from "./components/MissionStatus";
import PerformancePanel from "./components/PerformancePanel";

import ErrorFallback from "./errors/ErrorFallback.jsx";

import {
  getWebGLSupport,
} from "./errors/WebGLSupport.js";

import {
  INITIAL_LOADING_STATE,
  INITIAL_TELEMETRY,
} from "./config/initialAppState.js";

import {
  SIMULATION_CONFIG,
} from "./scene/config/SimulationConfig.js";

export default function App() {
  const audioControllerRef =
    useRef(null);

  const missionControllerRef =
    useRef(null);

  const [
    audioAvailable,
    setAudioAvailable,
  ] = useState(false);

  const [
    audioMuted,
    setAudioMuted,
  ] = useState(false);

  const [
    performance,
    setPerformance,
  ] = useState(null);

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

  const [
    selectedDifficulty,
    setSelectedDifficulty,
  ] = useState("normal");

  const [
    simulationKey,
    setSimulationKey,
  ] = useState(0);

  const [
    fatalError,
    setFatalError,
  ] = useState(null);

  const [
    assetWarnings,
    setAssetWarnings,
  ] = useState([]);

  const [
    webGLSupport,
  ] = useState(
    () => getWebGLSupport()
  );

  const mission =
    telemetry.mission;

  const missionActive =
    mission?.status ===
    "active";

  const handleAudioReady =
    useCallback((controller) => {
      audioControllerRef.current =
        controller;

      setAudioAvailable(
        Boolean(controller)
      );

      if (controller) {
        setAudioMuted(
          controller.isMuted()
        );
      }
    }, []);

  const handleToggleAudio =
    useCallback(() => {
      const controller =
        audioControllerRef.current;

      if (!controller) {
        return;
      }

      setAudioMuted(
        controller.toggleMuted()
      );
    }, []);

  const handleMissionReady =
    useCallback((controller) => {
      missionControllerRef.current =
        controller;
    }, []);

  const handleStartMission =
    useCallback(() => {
      missionControllerRef.current
        ?.start();
    }, []);

  const handleDifficultyChange =
    useCallback(
      (difficultyId) => {
        setSelectedDifficulty(
          difficultyId
        );

        if (
          mission?.status ===
          "briefing"
        ) {
          return;
        }

        missionControllerRef.current
          ?.changeDifficulty(
            difficultyId
          );
      },
      [mission?.status]
    );

  const handleFatalError =
    useCallback((error) => {
      const normalizedError =
        error instanceof Error
          ? error
          : new Error(
              String(error)
            );

      console.error(
        "Fatal simulation error:",
        normalizedError
      );

      setFatalError(
        normalizedError
      );
    }, []);

  const handleAssetWarning =
    useCallback((warning) => {
      setAssetWarnings(
        (currentWarnings) => {
          const remainingWarnings =
            currentWarnings.filter(
              (currentWarning) =>
                currentWarning.id !==
                warning.id
            );

          return [
            ...remainingWarnings,
            warning,
          ];
        }
      );
    }, []);

  const handleDismissWarning =
    useCallback((warningId) => {
      setAssetWarnings(
        (currentWarnings) =>
          currentWarnings.filter(
            (warning) =>
              warning.id !==
              warningId
          )
      );
    }, []);

  const handleRetrySimulation =
    useCallback(() => {
      audioControllerRef.current =
        null;

      missionControllerRef.current =
        null;

      setAudioAvailable(false);
      setAudioMuted(false);
      setFatalError(null);
      setAssetWarnings([]);
      setPerformance(null);

      setTelemetry({
        ...INITIAL_TELEMETRY,
      });

      setLoadingState({
        ...INITIAL_LOADING_STATE,
      });

      setSimulationKey(
        (currentKey) =>
          currentKey + 1
      );
    }, []);

  if (!webGLSupport.supported) {
    return (
      <ErrorFallback
        title="WebGL is unavailable"
        message={
          webGLSupport.reason
        }
      />
    );
  }

  if (fatalError) {
    return (
      <ErrorFallback
        title="Simulation stopped"
        message="The graphics or physics system could not continue safely."
        error={fatalError}
        onRetry={
          handleRetrySimulation
        }
      />
    );
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-950">
      <BasicScene
        key={simulationKey}
        selectedDifficulty={
          selectedDifficulty
        }
        onTelemetry={
          setTelemetry
        }
        onLoadingState={
          setLoadingState
        }
        onAudioReady={
          handleAudioReady
        }
        onMissionReady={
          handleMissionReady
        }
        onPerformance={
          setPerformance
        }
        onAssetWarning={
          handleAssetWarning
        }
        onFatalError={
          handleFatalError
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
        "ready" &&
        mission?.status !==
          "briefing" && (
          <DifficultySelector
            value={
              selectedDifficulty
            }
            onChange={
              handleDifficultyChange
            }
          />
        )}

      {loadingState.status ===
        "ready" && (
        <MissionBriefing
          missionStatus={
            mission?.status
          }
          selectedDifficulty={
            selectedDifficulty
          }
          onDifficultyChange={
            handleDifficultyChange
          }
          onStartMission={
            handleStartMission
          }
        />
      )}

      <MissionResult
        result={
          mission?.result
        }
      />

      <LoadingScreen
        loadingState={
          loadingState
        }
        onRetry={
          handleRetrySimulation
        }
      />

      <PerformancePanel
        performance={
          performance
        }
        visible={
          SIMULATION_CONFIG.debug
        }
      />

      <AssetWarning
        warnings={
          assetWarnings
        }
        onDismiss={
          handleDismissWarning
        }
      />

      {loadingState.status ===
        "ready" && (
        <AudioControl
          muted={audioMuted}
          available={
            audioAvailable
          }
          onToggle={
            handleToggleAudio
          }
        />
      )}
    </main>
  );
}