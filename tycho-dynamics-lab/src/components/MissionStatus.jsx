export default function MissionStatus({
    mission,
  }) {
    if (
      mission?.status !== "active"
    ) {
      return null;
    }
  
    return (
      <section className="pointer-events-none absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-6 rounded-lg border border-white/10 bg-slate-950/70 px-5 py-3 backdrop-blur-md">
        <div>
          <p className="text-[8px] tracking-[0.2em] text-slate-500">
            MISSION TIME
          </p>
  
          <p className="mt-1 font-mono text-sm text-slate-100">
            {mission.elapsedTime.toFixed(
              1
            )}{" "}
            s
          </p>
        </div>
  
        <div className="h-7 w-px bg-white/10" />
  
        <div>
          <p className="text-[8px] tracking-[0.2em] text-slate-500">
            LIVE SCORE
          </p>
  
          <p className="mt-1 font-mono text-sm text-sky-300">
            {mission.score}
          </p>
        </div>
  
        <div className="h-7 w-px bg-white/10" />
  
        <div>
          <p className="text-[8px] tracking-[0.2em] text-slate-500">
            FUEL USED
          </p>
  
          <p className="mt-1 font-mono text-sm text-slate-100">
            {mission.propellantUsed.toFixed(
              1
            )}{" "}
            kg
          </p>
        </div>
      </section>
    );
  }