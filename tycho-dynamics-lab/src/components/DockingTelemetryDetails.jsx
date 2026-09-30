const DAMAGE_STYLES = {
  nominal: ["bg-emerald-400", "text-emerald-400", "NOMINAL"],
  degraded: ["bg-sky-400", "text-sky-400", "DEGRADED"],
  damaged: ["bg-amber-400", "text-amber-400", "DAMAGED"],
  critical: ["bg-orange-500", "text-orange-400", "CRITICAL"],
  destroyed: ["bg-rose-500", "text-rose-400", "DESTROYED"],
};

const PROPELLANT_STYLES = {
  nominal: ["bg-emerald-400", "text-emerald-400", "NOMINAL"],
  low: ["bg-amber-400", "text-amber-400", "LOW"],
  critical: ["bg-orange-500", "text-orange-400", "CRITICAL"],
  empty: ["bg-rose-500", "text-rose-400", "EMPTY"],
};

const clampPercentage = (value) => Math.max(0, Math.min(value ?? 100, 100));
const formatNumber = (value, digits = 2) =>
  Number.isFinite(value) ? value.toFixed(digits) : "—";
const formatSigned = (value, digits = 2) => {
  if (!Number.isFinite(value)) {
    return "—";
  }
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}`;
};

function MetricRow({ label, value, unit, good, showStatus = true }) {
  return (
    <div className="grid grid-cols-[1fr_auto_48px] items-center gap-2 border-b border-white/5 py-2 last:border-b-0">
      <span className="text-[10px] tracking-[0.06em] text-slate-400">{label}</span>
      <span className="font-mono text-xs text-slate-100">
        {value}
        {unit && <span className="ml-1 text-[10px] text-slate-500">{unit}</span>}
      </span>
      {showStatus ? (
        <span
          className={`text-right text-[9px] font-semibold tracking-wider ${
            good ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {good ? "GOOD" : "WARN"}
        </span>
      ) : (
        <span />
      )}
    </div>
  );
}

function ResourcePanel({ title, status, percentage, styles, children }) {
  const [barColor, textColor, label] = styles[status] ?? styles.nominal;

  return (
    <section className="border-t border-white/10 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-[9px] tracking-[0.16em] text-slate-400">{title}</span>
        <span className={`text-[9px] font-semibold tracking-wider ${textColor}`}>
          {label}
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-[width] duration-150 ${barColor}`}
          style={{ width: `${clampPercentage(percentage)}%` }}
        />
      </div>
      {children}
    </section>
  );
}

function DamagePanel({ damage }) {
  const percentage = clampPercentage(damage?.percentage);

  return (
    <ResourcePanel
      title="HULL INTEGRITY"
      status={damage?.status ?? "nominal"}
      percentage={percentage}
      styles={DAMAGE_STYLES}
    >
      <div className="mt-2 flex justify-between font-mono text-[10px]">
        <span className="text-slate-200">{percentage.toFixed(1)}%</span>
        <span className="text-slate-500">{damage?.impactCount ?? 0} impacts</span>
        <span className="text-slate-500">-{(damage?.lastDamage ?? 0).toFixed(1)}</span>
      </div>
    </ResourcePanel>
  );
}

function PropellantPanel({ propellant }) {
  return (
    <ResourcePanel
      title="RCS PROPELLANT"
      status={propellant?.status ?? "nominal"}
      percentage={propellant?.percentage}
      styles={PROPELLANT_STYLES}
    >
      <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-[10px] text-slate-200">
        <span>{formatNumber(propellant?.remaining, 1)} kg</span>
        <span>{formatNumber(propellant?.flowRate, 2)} kg/s</span>
        <span>{formatNumber(propellant?.estimatedMass, 0)} kg</span>
      </div>
    </ResourcePanel>
  );
}

export default function DockingTelemetryDetails({ telemetry }) {
  const checks = telemetry?.checks ?? {};
  const timeToContact = telemetry?.timeToContact;
  const timeDisplay = Number.isFinite(timeToContact)
    ? formatNumber(timeToContact, 1)
    : "—";

  return (
    <>
      <div className="px-4 py-2">
        <MetricRow label="CLOSING SPEED" value={formatSigned(telemetry.closingSpeed)} unit="m/s" good={checks.closingSpeed} />
        <MetricRow label="LATERAL SPEED" value={formatNumber(telemetry.lateralSpeed)} unit="m/s" good={checks.lateralSpeed} />
        <MetricRow label="ANGULAR SPEED" value={formatNumber(telemetry.angularSpeed)} unit="rad/s" good={checks.angularSpeed} />
        <MetricRow label="ALIGNMENT" value={formatNumber(telemetry.alignmentAngle, 1)} unit="deg" good={checks.alignment} />
        <MetricRow label="HORIZONTAL ERROR" value={formatSigned(telemetry.horizontalOffset)} unit="m" good={checks.lateralOffset} />
        <MetricRow label="VERTICAL ERROR" value={formatSigned(telemetry.verticalOffset)} unit="m" good={checks.lateralOffset} />
        <MetricRow label="LATERAL OFFSET" value={formatNumber(telemetry.lateralOffset)} unit="m" good={checks.lateralOffset} />
        <MetricRow label="AXIAL DISTANCE" value={formatNumber(telemetry.axialDistance)} unit="m" good={checks.distance} />
        <MetricRow label="TIME TO CONTACT" value={timeDisplay} unit={Number.isFinite(timeToContact) ? "s" : ""} showStatus={false} />
        <MetricRow label="LAST IMPACT" value={formatNumber(telemetry.impactForce, 0)} unit="N" good={telemetry.impactForce < telemetry.limits.crashForce} />
      </div>

      <DamagePanel damage={telemetry.damage} />
      <PropellantPanel propellant={telemetry.propellant} />

      <footer className="border-t border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${telemetry.insideSensor ? "bg-sky-400 shadow-[0_0_10px_#38bdf8]" : "bg-slate-600"}`} />
          <span className="text-[9px] tracking-[0.1em] text-slate-400">
            {telemetry.insideSensor ? "DOCKING SIGNAL ACQUIRED" : "SEARCHING FOR DOCKING SIGNAL"}
          </span>
        </div>
      </footer>
    </>
  );
}
