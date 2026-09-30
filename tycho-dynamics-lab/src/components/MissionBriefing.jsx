import {
  memo,
  useEffect,
} from "react";

import {
  DIFFICULTY_OPTIONS,
  getDifficultyPreset,
} from "../scene/mission/DifficultyConfig.js";

function MissionBriefing({
  missionStatus,
  selectedDifficulty,
  onDifficultyChange,
  onStartMission,
}) {
  const selected =
    getDifficultyPreset(
      selectedDifficulty
    );

  useEffect(() => {
    if (
      missionStatus !==
      "briefing"
    ) {
      return undefined;
    }

    function changeDifficulty(
      direction
    ) {
      const currentIndex =
        DIFFICULTY_OPTIONS
          .findIndex(
            (option) =>
              option.id ===
              selected.id
          );

      const nextIndex =
        (
          currentIndex +
          direction +
          DIFFICULTY_OPTIONS.length
        ) %
        DIFFICULTY_OPTIONS.length;

      onDifficultyChange(
        DIFFICULTY_OPTIONS[
          nextIndex
        ].id
      );
    }

    function handleKeyDown(event) {
      if (
        event.code ===
          "ArrowLeft" ||
        event.code === "KeyA"
      ) {
        event.preventDefault();
        changeDifficulty(-1);
        return;
      }

      if (
        event.code ===
          "ArrowRight" ||
        event.code === "KeyD"
      ) {
        event.preventDefault();
        changeDifficulty(1);
        return;
      }

      if (
        event.code === "Enter"
      ) {
        event.preventDefault();
        onStartMission?.();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    missionStatus,
    selected.id,
    onDifficultyChange,
    onStartMission,
  ]);

  if (
    missionStatus !==
    "briefing"
  ) {
    return null;
  }

  return (
    <section className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
      <div className="w-[420px] max-w-[calc(100vw-2rem)] rounded-2xl border border-sky-400/20 bg-slate-950/95 p-6 shadow-2xl">
        <p className="text-[10px] tracking-[0.35em] text-sky-400">
          TYCHO DYNAMICS LAB
        </p>

        <h1 className="mt-4 text-2xl font-semibold text-slate-100">
          Gateway Docking Trial
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Select difficulty and
          begin.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {DIFFICULTY_OPTIONS.map(
            (option) => {
              const isSelected =
                option.id ===
                selected.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={
                    isSelected
                  }
                  onClick={() =>
                    onDifficultyChange(
                      option.id
                    )
                  }
                  className={`rounded-lg border px-3 py-3 text-center text-xs font-semibold transition ${
                    isSelected
                      ? "border-sky-400 bg-sky-400/10 text-sky-300"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-white/25 hover:bg-white/10"
                  }`}
                >
                  {option.label}
                </button>
              );
            }
          )}
        </div>

       

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
          <span className="text-xs text-slate-500">
            Selected:{" "}
            <span className="text-slate-300">
              {selected.label}
            </span>
          </span>

          <button
            type="button"
            onClick={
              onStartMission
            }
            className="rounded-md border border-sky-400/30 bg-sky-400/10 px-4 py-2 font-mono text-xs text-sky-300 transition hover:border-sky-300 hover:bg-sky-400/20 focus:outline-none focus:ring-2 focus:ring-sky-400/50"
          >
            START 
          </button>
        </div>
      </div>
    </section>
  );
}

export default memo(
  MissionBriefing
);