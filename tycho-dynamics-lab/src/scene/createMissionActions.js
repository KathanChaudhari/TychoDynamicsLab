import {
  getDifficultyPreset,
} from "./mission/DifficultyConfig.js";

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
  function restartMission(
    difficultyId =
      getDifficulty()
  ) {
    const difficulty =
      getDifficultyPreset(
        difficultyId
      );

    spacecraft.configureDifficulty(
      difficulty
    );

    dockingSystem.setDifficulty(
      difficulty
    );

    dockingSystem.reset();
    spacecraft.reset();

    const { remaining } =
      spacecraft
        .getPropellantTelemetry();

    missionSystem.reset(
      remaining
    );

    missionSystem.setDifficulty(
      difficulty
    );

    missionSystem.start(
      remaining
    );

    cameraController.setMode(
      "overview"
    );

    publishTelemetry();
  }

  function canRestartMission() {
    return isMissionReady();
  }

  return {
    onStartMission() {
      if (
        !canRestartMission() ||
        missionSystem
          .getTelemetry()
          .status !== "briefing"
      ) {
        return false;
      }

      audioSystem.unlock();
      restartMission();

      return true;
    },

    onReset() {
      if (!canRestartMission()) {
        return false;
      }

      restartMission();

      return true;
    },

    onDifficultyChange(
      difficultyId
    ) {
      if (!canRestartMission()) {
        return false;
      }

      restartMission(
        difficultyId
      );

      return true;
    },

    onUndock() {
      if (
        !missionSystem.canControl()
      ) {
        return false;
      }

      dockingSystem.undock();
      publishTelemetry();

      return true;
    },

    onLaunchProbe() {
      if (
        !missionSystem.canControl()
      ) {
        return false;
      }

      probeSystem.launch();

      return true;
    },

    onToggleTrajectory() {
      probeSystem
        .toggleTrajectory();

      return true;
    },
  };
}