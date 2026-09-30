function formatNumber(value, digits = 0) {
  return Number.isFinite(value) ? value.toFixed(digits) : "—";
}

function PerformanceRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono text-slate-200">{value}</span>
    </div>
  );
}

export default function PerformancePanel({ performance, visible }) {
  if (!visible || !performance) {
    return null;
  }

  return (
    <aside className="pointer-events-none absolute right-4 top-20 z-30 w-[220px] rounded-xl border border-amber-400/20 bg-slate-950/85 p-4 text-[11px] shadow-xl backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <p className="tracking-[0.22em] text-amber-300">PERFORMANCE</p>
        <span
          className={performance.fps >= 50 ? "text-emerald-400" : "text-rose-400"}
        >
          {formatNumber(performance.fps)} FPS
        </span>
      </div>

      <div className="space-y-2">
        <PerformanceRow
          label="Frame time"
          value={`${formatNumber(performance.frameTime, 1)} ms`}
        />
        <PerformanceRow
          label="Pixel ratio"
          value={formatNumber(performance.pixelRatio, 2)}
        />
        <PerformanceRow label="Draw calls" value={formatNumber(performance.drawCalls)} />
        <PerformanceRow label="Triangles" value={formatNumber(performance.triangles)} />
        <PerformanceRow label="Geometries" value={formatNumber(performance.geometries)} />
        <PerformanceRow label="Textures" value={formatNumber(performance.textures)} />
      </div>
    </aside>
  );
}
