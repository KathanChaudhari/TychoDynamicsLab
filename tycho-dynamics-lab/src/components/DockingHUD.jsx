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

const DAMAGE_STYLES = {
  nominal: {
    bar: "bg-emerald-400",
    text: "text-emerald-400",
    label: "NOMINAL",
  },

  degraded: {
    bar: "bg-sky-400",
    text: "text-sky-400",
    label: "DEGRADED",
  },

  damaged: {
    bar: "bg-amber-400",
    text: "text-amber-400",
    label: "DAMAGED",
  },

  critical: {
    bar: "bg-orange-500",
    text: "text-orange-400",
    label: "CRITICAL",
  },

  destroyed: {
    bar: "bg-rose-500",
    text: "text-rose-400",
    label: "DESTROYED",
  },
};

const PROPELLANT_STYLES = {
  nominal: {
    bar: "bg-emerald-400",
    text: "text-emerald-400",
    label: "NOMINAL",
  },

  low: {
    bar: "bg-amber-400",
    text: "text-amber-400",
    label: "LOW",
  },

  critical: {
    bar: "bg-orange-500",
    text: "text-orange-400",
    label: "CRITICAL",
  },

  empty: {
    bar: "bg-rose-500",
    text: "text-rose-400",
    label: "EMPTY",
  },
};

function DamagePanel({
  damage,
}) {
  const status =
    damage?.status ??
    "nominal";

  const style =
    DAMAGE_STYLES[status] ??
    DAMAGE_STYLES.nominal;

  const percentage =
    Math.max(
      0,
      Math.min(
        damage?.percentage ?? 100,
        100
      )
    );

  return (
    <section className="border-t border-white/10 px-5 py-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-[0.18em] text-slate-400">
          HULL INTEGRITY
        </span>

        <span
          className={`text-[10px] font-semibold tracking-wider ${style.text}`}
        >
          {style.label}
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-[width] duration-150 ${style.bar}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between font-mono text-xs">
        <span className="text-slate-200">
          {percentage.toFixed(1)}%
        </span>

        <span className="text-slate-500">
          {damage?.impactCount ?? 0} impacts
        </span>

        <span className="text-slate-500">
          -{(damage?.lastDamage ?? 0).toFixed(
            1
          )}
        </span>
      </div>
    </section>
  );
}

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

function PropellantPanel({
  propellant,
}) {
  const status =
    propellant?.status ??
    "nominal";

  const style =
    PROPELLANT_STYLES[status] ??
    PROPELLANT_STYLES.nominal;

  const percentage =
    Math.max(
      0,
      Math.min(
        propellant?.percentage ??
          100,
        100
      )
    );

  return (
    <section className="border-t border-white/10 px-5 py-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-[0.18em] text-slate-400">
          RCS PROPELLANT
        </span>

        <span
          className={`text-[10px] font-semibold tracking-wider ${style.text}`}
        >
          {style.label}
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-[width] duration-150 ${style.bar}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <div>
          <p className="text-[9px] tracking-wider text-slate-500">
            REMAINING
          </p>

          <p className="mt-1 font-mono text-xs text-slate-200">
            {formatNumber(
              propellant?.remaining,
              1
            )}{" "}
            kg
          </p>
        </div>

        <div>
          <p className="text-[9px] tracking-wider text-slate-500">
            FLOW
          </p>

          <p className="mt-1 font-mono text-xs text-slate-200">
            {formatNumber(
              propellant?.flowRate,
              2
            )}{" "}
            kg/s
          </p>
        </div>

        <div>
          <p className="text-[9px] tracking-wider text-slate-500">
            MASS
          </p>

          <p className="mt-1 font-mono text-xs text-slate-200">
            {formatNumber(
              propellant?.estimatedMass,
              0
            )}{" "}
            kg
          </p>
        </div>
      </div>
    </section>
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
          good={checks.alignment}
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
          good={checks.distance}
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

      <DamagePanel
  damage={telemetry.damage}
/>


      <PropellantPanel
        propellant={
          telemetry.propellant
        }
      />

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