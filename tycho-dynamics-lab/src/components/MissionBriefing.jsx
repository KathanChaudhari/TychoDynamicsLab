export default function MissionBriefing({
    mission,
  }) {
    if (
      mission?.status !==
      "briefing"
    ) {
      return null;
    }
  
    return (
      <section className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
        <div className="w-[440px] rounded-2xl border border-sky-400/20 bg-slate-950/90 p-7 shadow-2xl">
          <p className="text-[10px] tracking-[0.35em] text-sky-400">
            TYCHO DYNAMICS LAB
          </p>
  
          <h1 className="mt-4 text-2xl font-semibold text-slate-100">
            Gateway Docking Trial
          </h1>
  
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Pilot the Orion spacecraft
            through the approach corridor
            and establish a safe hard lock
            with Gateway.
          </p>
  
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-[9px] tracking-wider text-slate-500">
                CLOSING SPEED
              </p>
  
              <p className="mt-1 font-mono text-sm text-slate-200">
                ≤ 0.25 m/s
              </p>
            </div>
  
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-[9px] tracking-wider text-slate-500">
                LATERAL SPEED
              </p>
  
              <p className="mt-1 font-mono text-sm text-slate-200">
                ≤ 0.12 m/s
              </p>
            </div>
  
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-[9px] tracking-wider text-slate-500">
                ALIGNMENT
              </p>
  
              <p className="mt-1 font-mono text-sm text-slate-200">
                ≤ 7 degrees
              </p>
            </div>
  
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-[9px] tracking-wider text-slate-500">
                STARTING FUEL
              </p>
  
              <p className="mt-1 font-mono text-sm text-slate-200">
                120 kg
              </p>
            </div>
          </div>
  
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
            <span className="text-xs text-slate-500">
              Dock gently and conserve
              propellant.
            </span>
  
            <span className="rounded-md border border-sky-400/30 bg-sky-400/10 px-4 py-2 font-mono text-xs text-sky-300">
              PRESS ENTER
            </span>
          </div>
        </div>
      </section>
    );
  }