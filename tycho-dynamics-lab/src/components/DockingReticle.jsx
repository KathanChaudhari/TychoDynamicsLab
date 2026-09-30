const MARKER_SIZE = 48;
const MARKER_TRAVEL = 110;

const STATE_COLORS = {
  approach: "#38bdf8",
  "in-range": "#facc15",
  capturing: "#c084fc",
  docked: "#4ade80",
  crashed: "#f87171",
};

const clamp = (value, minimum, maximum) =>
  Math.min(Math.max(value, minimum), maximum);

function getGuidance(telemetry) {
  const { state, insideSensor, checks, horizontalOffset, verticalOffset } = telemetry;

  if (state === "crashed") return "COLLISION — RESET REQUIRED";
  if (state === "docked") return "HARD LOCK CONFIRMED";
  if (state === "capturing") return "AUTOMATIC CAPTURE";
  if (!checks.alignment) return "CORRECT ATTITUDE";
  if (!checks.closingSpeed) return "REDUCE CLOSING SPEED";
  if (!checks.lateralSpeed) return "STOP LATERAL DRIFT";

  const horizontalError = Math.abs(horizontalOffset);
  const verticalError = Math.abs(verticalOffset);

  if (horizontalError > verticalError && horizontalError > 0.08) {
    return horizontalOffset > 0 ? "MOVE LEFT" : "MOVE RIGHT";
  }
  if (verticalError > 0.08) {
    return verticalOffset > 0 ? "MOVE DOWN" : "MOVE UP";
  }
  return insideSensor ? "HOLD COURSE" : "APPROACH GATEWAY";
}

const signed = (value) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;

export default function DockingReticle({ telemetry }) {
  const displayRange = Math.max(
    telemetry.limits.maximumLateralOffset * 3,
    1
  );
  const markerX =
    clamp(telemetry.horizontalOffset / displayRange, -1, 1) * MARKER_TRAVEL;
  const markerY =
    -clamp(telemetry.verticalOffset / displayRange, -1, 1) * MARKER_TRAVEL;
  const positionSafe = telemetry.checks.lateralOffset;
  const markerColor = positionSafe ? "#4ade80" : "#facc15";
  const stateColor = STATE_COLORS[telemetry.state] ?? STATE_COLORS.approach;

  return (
    <section className="pointer-events-none absolute inset-0 z-[5]">
      <div
        className="absolute"
        style={{
          width: MARKER_SIZE,
          height: MARKER_SIZE,
  
          left: `clamp(
            28px,
            calc(50% + ${markerX}px),
            calc(100% - 28px)
          )`,
  
          top: `clamp(
            28px,
            calc(50% + ${markerY}px),
            calc(100% - 70px)
          )`,
  
          transform:
            "translate(-50%, -50%)",
        }}
      >
        <span
          className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2"
          style={{
            backgroundColor:
              markerColor,
          }}
        />
  
        <span
          className="absolute bottom-0 left-1/2 h-3 w-px -translate-x-1/2"
          style={{
            backgroundColor:
              markerColor,
          }}
        />
  
        <span
          className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2"
          style={{
            backgroundColor:
              markerColor,
          }}
        />
  
        <span
          className="absolute right-0 top-1/2 h-px w-3 -translate-y-1/2"
          style={{
            backgroundColor:
              markerColor,
          }}
        />
  
        <span
          className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_8px_currentColor]"
          style={{
            color: markerColor,
            backgroundColor:
              markerColor,
          }}
        />
      </div>
  
      <div className="absolute bottom-8 left-1/2 w-56 -translate-x-1/2 text-center">
        <p
          className="font-mono text-[9px] font-semibold tracking-[0.12em]"
          style={{
            color: stateColor,
          }}
        >
          {getGuidance(telemetry)}
        </p>
  
        <div className="mt-1 flex justify-center gap-2 font-mono text-[9px] text-slate-300">
          <span>
            X{" "}
            {signed(
              telemetry.horizontalOffset
            )}
            m
          </span>
  
          <span>
            Y{" "}
            {signed(
              telemetry.verticalOffset
            )}
            m
          </span>
  
          <span>
            D{" "}
            {telemetry.axialDistance.toFixed(
              2
            )}
            m
          </span>
        </div>
      </div>
    </section>
  );

}