import {
  DIFFICULTY_OPTIONS,
  getDifficultyPreset,
} from "../scene/mission/DifficultyConfig.js";

function degrees(radians) {
  return Math.round(
    (radians * 180) /
      Math.PI
  );
}

export default function MissionBriefing({
  mission,
  selectedDifficulty,
  onDifficultyChange,
}) {
  if (
    mission?.status !==
    "briefing"
  ) {
    return null;
  }

  const difficulty =
    getDifficultyPreset(
      selectedDifficulty
    );

  return (
    <section className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
      <div className="w-[520px] max-w-[calc(100vw-2rem)] rounded-2xl border border-sky-400/20 bg-slate-950/95 p-7 shadow-2xl">
        <p className="text-[10px] tracking-[0.35em] text-sky-400">
          TYCHO DYNAMICS LAB
        </p>

        <h1 className="mt-4 text-2xl font-semibold text-slate-100">
          Gateway Docking Trial
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Select a flight profile,
          approach Gateway and establish
          a safe hard lock.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {DIFFICULTY_OPTIONS.map(
            (option) => {
              const selected =
                option.id ===
                selectedDifficulty;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    onDifficultyChange(
                      option.id
                    )
                  }
                  className={`rounded-lg border p-3 text-left transition ${
                    selected
                      ? "border-sky-400 bg-sky-400/10"
                      : "border-white/10 bg-white/5 hover:border-white/25"
                  }`}
                >
                  <span
                    className={`text-xs font-semibold ${
                      selected
                        ? "text-sky-300"
                        : "text-slate-200"
                    }`}
                  >
                    {option.label}
                  </span>

                  <span className="mt-2 block text-[10px] leading-4 text-slate-500">
                    {
                      option.description
                    }
                  </span>
                </button>
              );
            }
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Metric
            label="CLOSING SPEED"
            value={`≤ ${difficulty.docking.maximumClosingSpeed.toFixed(
              2
            )} m/s`}
          />

          <Metric
            label="LATERAL SPEED"
            value={`≤ ${difficulty.docking.maximumLateralSpeed.toFixed(
              2
            )} m/s`}
          />

          <Metric
            label="ALIGNMENT"
            value={`≤ ${degrees(
              difficulty.docking
                .maximumAlignmentAngle
            )} degrees`}
          />

          <Metric
            label="STARTING FUEL"
            value={`${difficulty.propellant.capacity} kg`}
          />

          <Metric
            label="CRASH FORCE"
            value={`${difficulty.docking.crashForce} N`}
          />

          <Metric
            label="SCORE MULTIPLIER"
            value={`${difficulty.mission.scoreMultiplier.toFixed(
              2
            )}×`}
          />
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
          <span className="text-xs text-slate-500">
            Dock gently and conserve
            propellant.
          </span>

          <span className="rounded-md border border-sky-400/30 bg-sky-400/10 px-4 py-2 font-mono text-xs text-sky-300">
            PRESS ENTER
          </span>
        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <p className="text-[9px] tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-mono text-sm text-slate-200">
        {value}
      </p>
    </div>
  );
}