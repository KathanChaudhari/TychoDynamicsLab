import CollapsiblePanel from "./CollapsiblePanel.jsx";
import DockingTelemetryDetails from "./DockingTelemetryDetails.jsx";

const STATE_STYLES = {
  approach: "border-slate-600 bg-slate-800/70 text-slate-200",
  "in-range": "border-sky-500/60 bg-sky-500/10 text-sky-300",
  capturing: "border-purple-500/60 bg-purple-500/10 text-purple-300",
  docked: "border-emerald-500/60 bg-emerald-500/10 text-emerald-300",
  crashed: "border-red-500/60 bg-red-500/10 text-red-300",
};

function CompactMetric({ label, value, unit, good }) {
  return (
    <span>
      <span className="block text-[8px] tracking-wider text-slate-500">{label}</span>
      <span className={`font-mono text-[11px] ${good ? "text-emerald-300" : "text-rose-300"}`}>
        {value} <span className="text-[9px] text-slate-500">{unit}</span>
      </span>
    </span>
  );
}

const format = (value) => (Number.isFinite(value) ? value.toFixed(2) : "—");

export default function DockingHUD({ telemetry }) {
  const state = telemetry?.state ?? "approach";
  const checks = telemetry?.checks ?? {};
  const stateLabel = state.replace("-", " ").toUpperCase();

  const badge = (
    <span
      className={`rounded border px-2 py-1 text-[9px] font-semibold tracking-wider ${
        STATE_STYLES[state] ?? STATE_STYLES.approach
      }`}
    >
      {stateLabel}
    </span>
  );

  const summary = (
    <span className="grid grid-cols-3 gap-3">
      <CompactMetric
        label="CLOSING"
        value={format(telemetry.closingSpeed)}
        unit="m/s"
        good={checks.closingSpeed}
      />
      <CompactMetric
        label="OFFSET"
        value={format(telemetry.lateralOffset)}
        unit="m"
        good={checks.lateralOffset}
      />
      <CompactMetric
        label="DISTANCE"
        value={format(telemetry.axialDistance)}
        unit="m"
        good={checks.distance}
      />
    </span>
  );

  return (
    <CollapsiblePanel
      title="FLIGHT DIRECTOR"
      badge={badge}
      summary={summary}
      className="absolute left-2 top-2 z-30 w-[calc(100vw-1rem)] max-w-[360px] md:left-4 md:top-4"
    >
      <div className="max-h-[calc(100vh-6rem)] overflow-y-auto">
        <DockingTelemetryDetails telemetry={telemetry} />
      </div>
    </CollapsiblePanel>
  );
}
