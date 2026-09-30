import { getDifficultyPreset } from "./mission/DifficultyConfig.js";

export function createMissionActions({
  getDifficulty,
  missionSystem,
  dockingSystem,
  spacecraft,
  cameraController,
  probeSystem,
  audioSystem,
  publishTelemetry,
  isMissionReady,
}) {
  function resetMission(publish = true) {
    dockingSystem.reset();
    spacecraft.reset();

    const { remaining } = spacecraft.getPropellantTelemetry();
    missionSystem.reset(remaining);
    cameraController.setMode("overview");
    if (publish) {
      publishTelemetry();
    }
  }

  return {
    onStartMission() {
      if (
        !isMissionReady() ||
        missionSystem.getTelemetry().status !== "briefing"
      ) {
        return;
      }

      audioSystem.unlock();

      const difficulty = getDifficultyPreset(getDifficulty());
      spacecraft.configureDifficulty(difficulty);
      dockingSystem.setDifficulty(difficulty);
      missionSystem.setDifficulty(difficulty);

      resetMission(false);

      const { remaining } = spacecraft.getPropellantTelemetry();
      missionSystem.start(remaining);
      publishTelemetry();
    },

    onReset() {
      resetMission();
    },

    onUndock() {
      if (!missionSystem.canControl()) {
        return;
      }

      dockingSystem.undock();
      publishTelemetry();
    },

    onLaunchProbe() {
      if (missionSystem.canControl()) {
        probeSystem.launch();
      }
    },

    onToggleTrajectory() {
      probeSystem.toggleTrajectory();
    },
  };
}
