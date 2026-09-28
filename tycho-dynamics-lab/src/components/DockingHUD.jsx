const STATE_STYLES = {
  approach:
    "border-slate-600 bg-slate-800/70 text-slate-200",

  "in-range":
    "border-sky-500/60 bg-sky-500/10 text-sky-300",

  capturing:
    "border-purple-500/60 bg-purple-500/10 text-purple-300",

  docked:
    "border-emerald-500/60 bg-emerald-500/10 text-emerald-300",

  crashed:
    "border-red-500/60 bg-red-500/10 text-red-300",
};

function formatNumber(
  value,
  digits = 2
) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(digits);
}

function formatSigned(
  value,
  digits = 2
) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  const prefix =
    value > 0 ? "+" : "";

  return `${prefix}${value.toFixed(
    digits
  )}`;
}

function MetricRow({
  label,
  value,
  unit,
  good,
  showStatus = true,
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_54px] items-center gap-3 border-b border-white/5 py-2.5 last:border-b-0">
      <span className="text-[11px] tracking-[0.08em] text-slate-400">
        {label}
      </span>

      <span className="font-mono text-sm text-slate-100">
        {value}

        {unit && (
          <span className="ml-2 text-xs text-slate-500">
            {unit}
          </span>
        )}
      </span>

      {showStatus ? (
        <span
          className={
            good
              ? "text-right text-[10px] font-semibold tracking-wider text-emerald-400"
              : "text-right text-[10px] font-semibold tracking-wider text-rose-400"
          }
        >
          {good ? "GOOD" : "WARN"}
        </span>
      ) : (
        <span />
      )}
    </div>
  );
}

export default function DockingHUD({
  telemetry,
}) {
  const state =
    telemetry?.state ??
    "approach";

  const checks =
    telemetry?.checks ?? {};

  const timeToContact =
    telemetry?.timeToContact;

  const timeDisplay =
    Number.isFinite(timeToContact)
      ? formatNumber(
          timeToContact,
          1
        )
      : "—";

  const impactGood =
    telemetry.impactForce <
    telemetry.limits.crashForce;

  return (
    <aside className="pointer-events-none absolute left-4 top-4 hidden max-h-[calc(100vh-2rem)] w-[390px] overflow-y-auto rounded-xl border border-white/10 bg-slate-950/75 backdrop-blur-md md:block">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-[10px] tracking-[0.35em] text-sky-400">
            TYCHO DYNAMICS LAB
          </p>

          <h2 className="mt-3 text-sm font-semibold text-slate-100">
            Relative Flight Director
          </h2>
        </div>

        <span
          className={`rounded-md border px-3 py-2 text-[10px] font-semibold tracking-wider ${
            STATE_STYLES[state] ??
            STATE_STYLES.approach
          }`}
        >
          {state
            .replace("-", " ")
            .toUpperCase()}
        </span>
      </header>

      <div className="px-5 py-3">
        <MetricRow
          label="CLOSING SPEED"
          value={formatSigned(
            telemetry.closingSpeed
          )}
          unit="m/s"
          good={
            checks.closingSpeed
          }
        />

        <MetricRow
          label="LATERAL SPEED"
          value={formatNumber(
            telemetry.lateralSpeed
          )}
          unit="m/s"
          good={
            checks.lateralSpeed
          }
        />

        <MetricRow
          label="ANGULAR SPEED"
          value={formatNumber(
            telemetry.angularSpeed
          )}
          unit="rad/s"
          good={
            checks.angularSpeed
          }
        />

        <MetricRow
          label="ALIGNMENT"
          value={formatNumber(
            telemetry.alignmentAngle,
            1
          )}
          unit="deg"
          good={
            checks.alignment
          }
        />

        <MetricRow
          label="HORIZONTAL ERROR"
          value={formatSigned(
            telemetry.horizontalOffset
          )}
          unit="m"
          good={
            checks.lateralOffset
          }
        />

        <MetricRow
          label="VERTICAL ERROR"
          value={formatSigned(
            telemetry.verticalOffset
          )}
          unit="m"
          good={
            checks.lateralOffset
          }
        />

        <MetricRow
          label="LATERAL OFFSET"
          value={formatNumber(
            telemetry.lateralOffset
          )}
          unit="m"
          good={
            checks.lateralOffset
          }
        />

        <MetricRow
          label="AXIAL DISTANCE"
          value={formatNumber(
            telemetry.axialDistance
          )}
          unit="m"
          good={
            checks.distance
          }
        />

        <MetricRow
          label="TIME TO CONTACT"
          value={timeDisplay}
          unit={
            Number.isFinite(
              timeToContact
            )
              ? "s"
              : ""
          }
          showStatus={false}
        />

        <MetricRow
          label="LAST IMPACT"
          value={formatNumber(
            telemetry.impactForce,
            0
          )}
          unit="N"
          good={impactGood}
        />
      </div>

      <footer className="border-t border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <span
            className={`h-2 w-2 rounded-full ${
              telemetry.insideSensor
                ? "bg-sky-400 shadow-[0_0_10px_#38bdf8]"
                : "bg-slate-600"
            }`}
          />

          <span className="text-[10px] tracking-[0.12em] text-slate-400">
            {telemetry.insideSensor
              ? "DOCKING SIGNAL ACQUIRED"
              : "SEARCHING FOR DOCKING SIGNAL"}
          </span>
        </div>
      </footer>
    </aside>
  );
}