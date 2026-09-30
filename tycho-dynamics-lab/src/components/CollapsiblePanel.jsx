import { useId, useState } from "react";

export default function CollapsiblePanel({
  title,
  badge,
  summary,
  children,
  className = "",
}) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  return (
    <aside
      className={`pointer-events-auto overflow-hidden rounded-xl border border-white/10 bg-slate-950/75 backdrop-blur-md ${className}`}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={() => setExpanded((current) => !current)}
        className="block w-full px-4 py-3 text-left"
      >
        <span className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-semibold tracking-[0.24em] text-sky-400">
            {title}
          </span>

          <span className="flex items-center gap-2">
            {badge}
            <span
              aria-hidden="true"
              className={`text-xs text-slate-400 transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
            >
              ▾
            </span>
          </span>
        </span>

        {!expanded && <span className="mt-2 block">{summary}</span>}
      </button>

      {expanded && (
        <div id={contentId} className="border-t border-white/10">
          {children}
        </div>
      )}
    </aside>
  );
}
