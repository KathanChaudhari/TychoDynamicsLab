const RETICLE_SIZE = 260;
const RETICLE_CENTER =
  RETICLE_SIZE / 2;

const MARKER_TRAVEL = 88;
const DRIFT_LENGTH = 55;

const STATE_COLORS = {
  approach: "#38bdf8",
  "in-range": "#facc15",
  capturing: "#c084fc",
  docked: "#4ade80",
  crashed: "#f87171",
};

function clamp(
  value,
  minimum,
  maximum
) {
  return Math.min(
    Math.max(value, minimum),
    maximum
  );
}

function getGuidance(
  telemetry
) {
  const {
    state,
    insideSensor,
    checks,
    horizontalOffset,
    verticalOffset,
  } = telemetry;

  if (state === "crashed") {
    return "COLLISION — RESET REQUIRED";
  }

  if (state === "docked") {
    return "HARD LOCK CONFIRMED";
  }

  if (state === "capturing") {
    return "AUTOMATIC CAPTURE";
  }

  if (!checks.alignment) {
    return "CORRECT ATTITUDE";
  }

  if (!checks.closingSpeed) {
    return "REDUCE CLOSING SPEED";
  }

  if (!checks.lateralSpeed) {
    return "STOP LATERAL DRIFT";
  }

  const horizontalError =
    Math.abs(horizontalOffset);

  const verticalError =
    Math.abs(verticalOffset);

  if (
    horizontalError >
      verticalError &&
    horizontalError > 0.08
  ) {
    return horizontalOffset > 0
      ? "MOVE LEFT"
      : "MOVE RIGHT";
  }

  if (verticalError > 0.08) {
    return verticalOffset > 0
      ? "MOVE DOWN"
      : "MOVE UP";
  }

  if (!insideSensor) {
    return "APPROACH GATEWAY";
  }

  return "HOLD COURSE";
}

export default function DockingReticle({
  telemetry,
}) {
  const limits =
    telemetry.limits;

  /*
   * Display a wider range than the actual
   * capture limit so the marker remains useful
   * during the approach.
   */
  const displayRange =
    Math.max(
      limits.maximumLateralOffset *
        3,
      1
    );

  const normalizedX =
    clamp(
      telemetry.horizontalOffset /
        displayRange,
      -1,
      1
    );

  const normalizedY =
    clamp(
      telemetry.verticalOffset /
        displayRange,
      -1,
      1
    );

  const markerX =
    normalizedX *
    MARKER_TRAVEL;

  /*
   * Positive Three.js Y means up.
   * Positive CSS Y moves down, so invert it.
   */
  const markerY =
    -normalizedY *
    MARKER_TRAVEL;

  const maximumDrift =
    Math.max(
      limits.maximumLateralSpeed,
      0.01
    );

  const driftX =
    clamp(
      telemetry.horizontalSpeed /
        maximumDrift,
      -1,
      1
    ) * DRIFT_LENGTH;

  const driftY =
    clamp(
      -telemetry.verticalSpeed /
        maximumDrift,
      -1,
      1
    ) * DRIFT_LENGTH;

  const markerScreenX =
    RETICLE_CENTER + markerX;

  const markerScreenY =
    RETICLE_CENTER + markerY;

  const driftEndX =
    markerScreenX + driftX;

  const driftEndY =
    markerScreenY + driftY;

  const color =
    STATE_COLORS[
      telemetry.state
    ] ?? STATE_COLORS.approach;

  const positionSafe =
    telemetry.checks
      .lateralOffset;

  const velocitySafe =
    telemetry.checks
      .lateralSpeed;

  const guidance =
    getGuidance(telemetry);

  const distanceProgress =
    clamp(
      1 -
        telemetry.axialDistance /
          7,
      0,
      1
    );

  const distanceRadius =
    104 -
    distanceProgress * 24;

  return (
    <section className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
      <div
        className="relative"
        style={{
          width: RETICLE_SIZE,
          height: RETICLE_SIZE,
        }}
      >
        <svg
          className="absolute inset-0"
          viewBox={`0 0 ${RETICLE_SIZE} ${RETICLE_SIZE}`}
          aria-hidden="true"
        >
          <circle
            cx={RETICLE_CENTER}
            cy={RETICLE_CENTER}
            r={distanceRadius}
            fill="none"
            stroke={color}
            strokeWidth="1"
            strokeOpacity="0.35"
            strokeDasharray="7 8"
          />

          <circle
            cx={RETICLE_CENTER}
            cy={RETICLE_CENTER}
            r="58"
            fill="none"
            stroke={color}
            strokeWidth="1"
            strokeOpacity="0.45"
          />

          <circle
            cx={RETICLE_CENTER}
            cy={RETICLE_CENTER}
            r="18"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeOpacity="0.85"
          />

          <line
            x1={RETICLE_CENTER}
            y1="22"
            x2={RETICLE_CENTER}
            y2="63"
            stroke={color}
            strokeOpacity="0.5"
          />

          <line
            x1={RETICLE_CENTER}
            y1="197"
            x2={RETICLE_CENTER}
            y2="238"
            stroke={color}
            strokeOpacity="0.5"
          />

          <line
            x1="22"
            y1={RETICLE_CENTER}
            x2="63"
            y2={RETICLE_CENTER}
            stroke={color}
            strokeOpacity="0.5"
          />

          <line
            x1="197"
            y1={RETICLE_CENTER}
            x2="238"
            y2={RETICLE_CENTER}
            stroke={color}
            strokeOpacity="0.5"
          />

          <line
            x1={markerScreenX}
            y1={markerScreenY}
            x2={driftEndX}
            y2={driftEndY}
            stroke={
              velocitySafe
                ? "#22d3ee"
                : "#fb7185"
            }
            strokeWidth="2"
            strokeOpacity="0.9"
          />

          <circle
            cx={driftEndX}
            cy={driftEndY}
            r="3"
            fill={
              velocitySafe
                ? "#22d3ee"
                : "#fb7185"
            }
          />
        </svg>

        <div
          className="absolute h-6 w-6"
          style={{
            left: `calc(50% + ${markerX}px)`,
            top: `calc(50% + ${markerY}px)`,
            transform:
              "translate(-50%, -50%)",
          }}
        >
          <span
            className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2"
            style={{
              backgroundColor:
                positionSafe
                  ? "#4ade80"
                  : "#facc15",
            }}
          />

          <span
            className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2"
            style={{
              backgroundColor:
                positionSafe
                  ? "#4ade80"
                  : "#facc15",
            }}
          />

          <span
            className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border"
            style={{
              borderColor:
                positionSafe
                  ? "#4ade80"
                  : "#facc15",
            }}
          />
        </div>

        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_white]" />

        <div className="absolute left-1/2 top-full mt-3 w-72 -translate-x-1/2 text-center">
          <p
            className="font-mono text-[11px] font-semibold tracking-[0.18em]"
            style={{
              color,
            }}
          >
            {guidance}
          </p>

          <div className="mt-2 flex justify-center gap-4 font-mono text-[10px] text-slate-400">
            <span>
              X{" "}
              {telemetry
                .horizontalOffset >= 0
                ? "+"
                : ""}
              {telemetry
                .horizontalOffset
                .toFixed(2)}
            </span>

            <span>
              Y{" "}
              {telemetry
                .verticalOffset >= 0
                ? "+"
                : ""}
              {telemetry
                .verticalOffset
                .toFixed(2)}
            </span>

            <span>
              Z{" "}
              {telemetry.axialDistance.toFixed(
                2
              )}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}