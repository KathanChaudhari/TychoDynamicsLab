import { memo } from "react";

function AudioControl({ muted, available, onToggle }) {
  return (
    <button
      type="button"
      disabled={!available}
      onClick={onToggle}
      className="pointer-events-auto absolute right-2 top-24 z-30 rounded-lg border border-white/10 bg-slate-950/75 px-4 py-3 text-xs text-slate-300 backdrop-blur-md transition hover:border-sky-400/40 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-40 md:right-4 md:top-4"
    >
      <span className="mr-2">{muted ? "○" : "◉"}</span>
      {muted ? "SOUND OFF" : "SOUND ON"}
    </button>
  );
}

export default memo(AudioControl);
