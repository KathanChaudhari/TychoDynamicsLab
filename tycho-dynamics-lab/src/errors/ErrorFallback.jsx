export default function ErrorFallback({
    title =
      "Simulation unavailable",
    message,
    error,
    onRetry,
  }) {
    const technicalMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : null;
  
    function reloadPage() {
      window.location.reload();
    }
  
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
        <section className="w-full max-w-lg rounded-2xl border border-rose-400/20 bg-slate-900/80 p-7 shadow-2xl">
          <p className="text-[10px] tracking-[0.35em] text-sky-400">
            TYCHO DYNAMICS LAB
          </p>
  
          <div className="mt-5 flex h-11 w-11 items-center justify-center rounded-full border border-rose-400/30 bg-rose-400/10 text-xl text-rose-300">
            !
          </div>
  
          <h1 className="mt-5 text-2xl font-semibold">
            {title}
          </h1>
  
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {message ??
              "The simulation encountered an unexpected problem."}
          </p>
  
          {technicalMessage && (
            <details className="mt-5 rounded-lg border border-white/10 bg-black/20 p-3">
              <summary className="cursor-pointer text-xs text-slate-400">
                Technical details
              </summary>
  
              <p className="mt-2 break-words font-mono text-[11px] leading-5 text-rose-300">
                {technicalMessage}
              </p>
            </details>
          )}
  
          <div className="mt-6 flex flex-wrap gap-3">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-lg border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-300 transition hover:bg-sky-400/20"
              >
                Try again
              </button>
            )}
  
            <button
              type="button"
              onClick={reloadPage}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
            >
              Reload page
            </button>
          </div>
  
          <p className="mt-5 text-xs leading-5 text-slate-500">
            Make sure hardware
            acceleration and WebGL are
            enabled in your browser.
          </p>
        </section>
      </main>
    );
  }