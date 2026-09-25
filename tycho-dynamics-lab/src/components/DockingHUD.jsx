const STATUS_STYLES = {
    approach: {
      label: "APPROACH",
      color: "text-slate-200",
      background: "bg-slate-500/20",
      border: "border-slate-400/40",
    },
    "in-range": {
      label: "IN RANGE",
      color: "text-sky-300",
      background: "bg-sky-500/20",
      border: "border-sky-400/40",
    },
    docked: {
      label: "DOCKED",
      color: "text-emerald-300",
      background: "bg-emerald-500/20",
      border: "border-emerald-400/40",
    },
    crashed: {
      label: "CRASHED",
      color: "text-red-300",
      background: "bg-red-500/20",
      border: "border-red-400/40",
    },
  };
  
  function MetricRow({
    label,
    value,
    unit,
    valid,
    showCondition = true,
  }) {
    return (
      <div className="flex items-center justify-between gap-6 border-b border-white/5 py-2 last:border-none">
        <span className="text-xs tracking-wider text-slate-400">
          {label}
        </span>
  
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-slate-100">
            {value}{" "}
            <span className="text-xs text-slate-500">
              {unit}
            </span>
          </span>
  
          {showCondition && (
            <span
              className={`w-12 text-right text-[10px] font-semibold tracking-wider ${
                valid
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {valid ? "GOOD" : "WARN"}
            </span>
          )}
        </div>
      </div>
    );
  }
  
  export default function DockingHUD({ telemetry }) {
    if (!telemetry) {
      return null;
    }
  
    const status =
      STATUS_STYLES[telemetry.state] ??
      STATUS_STYLES.approach;
  
    return (
      <section className="pointer-events-none absolute left-4 top-4 w-[320px] overflow-hidden rounded-xl border border-white/10 bg-slate-950/75 shadow-2xl backdrop-blur-md">
        <header className="border-b border-white/10 px-4 py-3">
          <p className="text-[10px] tracking-[0.3em] text-sky-400">
            TYCHO DYNAMICS LAB
          </p>
  
          <div className="mt-2 flex items-center justify-between">
            <h1 className="text-sm font-semibold text-slate-100">
              Docking Computer
            </h1>
  
            <span
              className={`rounded border px-2 py-1 text-[10px] font-semibold tracking-wider ${status.color} ${status.background} ${status.border}`}
            >
              {status.label}
            </span>
          </div>
        </header>
  
        <div className="px-4 py-2">
          <MetricRow
            label="SPEED"
            value={telemetry.speed.toFixed(2)}
            unit="m/s"
            valid={telemetry.checks.speed}
          />
  
          <MetricRow
            label="ANGULAR SPEED"
            value={telemetry.angularSpeed.toFixed(2)}
            unit="rad/s"
            valid={telemetry.checks.angularSpeed}
          />
  
          <MetricRow
            label="ALIGNMENT"
            value={telemetry.alignmentAngle.toFixed(1)}
            unit="deg"
            valid={telemetry.checks.alignment}
          />
  
          <MetricRow
            label="LATERAL OFFSET"
            value={telemetry.lateralOffset.toFixed(2)}
            unit="m"
            valid={telemetry.checks.lateralOffset}
          />
  
          <MetricRow
            label="DISTANCE"
            value={telemetry.distance.toFixed(2)}
            unit="m"
            showCondition={false}
          />
  
          <MetricRow
            label="LAST IMPACT"
            value={telemetry.impactForce.toFixed(0)}
            unit="N"
            valid={
              telemetry.impactForce <
              telemetry.limits.crashForce
            }
          />
        </div>
  
        <footer className="border-t border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                telemetry.insideSensor
                  ? "bg-sky-400 shadow-[0_0_8px_#38bdf8]"
                  : "bg-slate-600"
              }`}
            />
  
            <span className="text-[10px] tracking-wider text-slate-400">
              {telemetry.insideSensor
                ? "DOCKING SENSOR ACTIVE"
                : "SEARCHING FOR DOCKING SIGNAL"}
            </span>
          </div>
        </footer>
      </section>
    );
  }