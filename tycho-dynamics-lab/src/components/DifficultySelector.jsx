import { useId, useState } from "react";

import {
  DIFFICULTY_OPTIONS,
  getDifficultyPreset,
} from "../scene/mission/DifficultyConfig.js";

export default function DifficultySelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const selected = getDifficultyPreset(value);

  return (
    <div className="pointer-events-auto absolute right-2 top-40 z-40 md:right-4 md:top-16">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
        className="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-left backdrop-blur-md"
      >
        <span className="block text-[8px] tracking-[0.18em] text-slate-500">
          DIFFICULTY
        </span>
        <span className="mt-0.5 block text-[11px] font-semibold text-sky-300">
          {selected.label} <span aria-hidden="true">▾</span>
        </span>
      </button>

      {open && (
        <div
          id={menuId}
          className="mt-1 w-32 overflow-hidden rounded-lg border border-white/10 bg-slate-950/95 p-1 shadow-xl"
        >
          {DIFFICULTY_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onChange(option.id);
                setOpen(false);
              }}
              className={`block w-full rounded px-3 py-2 text-left text-xs ${
                option.id === selected.id
                  ? "bg-sky-400/10 text-sky-300"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
