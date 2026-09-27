export default function LoadingScreen({
    loadingState,
  }) {
    if (
      !loadingState ||
      loadingState.status === "ready"
    ) {
      return null;
    }
  
    const progress = Math.min(
      Math.max(
        loadingState.progress ?? 0,
        0
      ),
      100
    );
  
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950">
        <div className="w-full max-w-sm px-6">
          <p className="text-xs tracking-[0.35em] text-sky-400">
            TYCHO DYNAMICS LAB
          </p>
  
          <h1 className="mt-3 text-xl font-semibold text-slate-100">
            Initializing simulation
          </h1>
  
          <p className="mt-2 text-sm text-slate-400">
            {loadingState.message}
          </p>
  
          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-sky-400 transition-[width] duration-200"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
  
          <div className="mt-2 flex justify-between font-mono text-xs text-slate-500">
            <span>ASSET PIPELINE</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    );
  }