function ResultMetric({
    label,
    value,
  }) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-3">
        <p className="text-[9px] tracking-wider text-slate-500">
          {label}
        </p>
  
        <p className="mt-1 font-mono text-sm text-slate-100">
          {value}
        </p>
      </div>
    );
  }
  
  export default function MissionResult({
    mission,
  }) {
    const result =
      mission?.result;
  
    if (!result) {
      return null;
    }
  
    const succeeded =
      result.outcome ===
      "success";
  
    return (
      <section className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-slate-950/60 backdrop-blur-md">
        <div className="w-[460px] rounded-2xl border border-white/10 bg-slate-950/95 p-7 shadow-2xl">
          <p
            className={`text-[10px] tracking-[0.35em] ${
              succeeded
                ? "text-emerald-400"
                : "text-rose-400"
            }`}
          >
            {succeeded
              ? "MISSION COMPLETE"
              : "MISSION FAILED"}
          </p>
  
          <div className="mt-5 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-100">
                {result.reason}
              </h2>
  
              <p className="mt-2 text-sm text-slate-400">
                {succeeded
                  ? "Gateway reports a stable docking connection."
                  : "The approach exceeded safe collision limits."}
              </p>
            </div>
  
            <div className="text-center">
              <p className="text-[9px] tracking-wider text-slate-500">
                GRADE
              </p>
  
              <p
                className={`font-mono text-5xl font-bold ${
                  succeeded
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {result.grade}
              </p>
            </div>
          </div>
  
          <div className="mt-6 grid grid-cols-2 gap-3">
            <ResultMetric
              label="FINAL SCORE"
              value={result.score}
            />
  
            <ResultMetric
              label="MISSION TIME"
              value={`${result.duration.toFixed(
                1
              )} s`}
            />
  
            <ResultMetric
              label="PROPELLANT USED"
              value={`${result.propellantUsed.toFixed(
                1
              )} kg`}
            />
  
            <ResultMetric
              label="MAXIMUM IMPACT"
              value={`${result.maximumImpact.toFixed(
                0
              )} N`}
            />
  
            <ResultMetric
              label="CLOSING SPEED"
              value={`${result.finalClosingSpeed.toFixed(
                3
              )} m/s`}
            />
  
            <ResultMetric
              label="FINAL ALIGNMENT"
              value={`${result.finalAlignment.toFixed(
                2
              )}°`}
            />
          </div>
  
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
            <span className="text-xs text-slate-500">
              Reset the simulator for
              another attempt.
            </span>
  
            <span className="rounded-md border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs text-slate-200">
              PRESS T
            </span>
          </div>
        </div>
      </section>
    );
  }