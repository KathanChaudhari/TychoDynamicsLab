import {
  memo,
} from "react";

function LoadingScreen({
  loadingState,
  onRetry,
}) {
  if (
    !loadingState ||
    loadingState.status ===
      "ready"
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

  const failed =
    loadingState.status ===
    "error";

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-sm px-6">
        <p className="text-xs tracking-[0.35em] text-sky-400">
          TYCHO DYNAMICS LAB
        </p>

        <h1 className="mt-3 text-xl font-semibold text-slate-100">
          {failed
            ? "Initialization failed"
            : "Initializing simulation"}
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          {loadingState.message}
        </p>

        {!failed && (
          <>
            <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-sky-400 transition-[width] duration-200"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <div className="mt-2 flex justify-between font-mono text-xs text-slate-500">
              <span>
                ASSET PIPELINE
              </span>

              <span>
                {progress}%
              </span>
            </div>
          </>
        )}

        {failed && (
          <div className="mt-6 flex gap-3">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-lg border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm text-sky-300"
              >
                Try again
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
            >
              Reload
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(
  LoadingScreen
);