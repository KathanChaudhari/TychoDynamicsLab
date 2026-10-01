export default function AssetWarning({
    warnings,
    onDismiss,
  }) {
    if (!warnings?.length) {
      return null;
    }
  
    return (
      <aside className="pointer-events-auto absolute bottom-4 left-1/2 z-40 w-[360px] max-w-[calc(100vw-2rem)] -translate-x-1/2 space-y-2">
        {warnings.map(
          (warning) => (
            <div
              key={warning.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-amber-400/20 bg-slate-950/90 p-3 shadow-xl backdrop-blur-md"
            >
              <div>
                <p className="text-[10px] font-semibold tracking-wider text-amber-300">
                  {warning.title}
                </p>
  
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {warning.message}
                </p>
              </div>
  
              <button
                type="button"
                aria-label="Dismiss warning"
                onClick={() =>
                  onDismiss(
                    warning.id
                  )
                }
                className="text-sm text-slate-500 transition hover:text-slate-200"
              >
                ×
              </button>
            </div>
          )
        )}
      </aside>
    );
  }