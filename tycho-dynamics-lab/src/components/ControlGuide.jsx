import { memo } from "react";

import CollapsiblePanel from "./CollapsiblePanel.jsx";

const controls = [
  ["W / S", "Forward / backward"],
  ["A / D", "Left / right"],
  ["R / F", "Up / down"],
  ["Arrow keys", "Pitch / yaw"],
  ["Q / E", "Roll"],
  ["Space", "Stop movement"],
  ["X", "Stop rotation"],
  ["P", "Launch probe"],
  ["V", "Toggle trajectory"],
  ["C", "Toggle colliders"],
  ["U", "Undock"],
  ["T", "Reset simulation"],
  ["1 / 2 / 3 / 4", "Camera modes"],
];

function ControlGuide() {
  return (
    <CollapsiblePanel
      title="FLIGHT CONTROLS"
      summary={
        <span className="text-[10px] text-slate-400">
          WASD/RF Move · Arrows/QE Rotate · T Reset
        </span>
      }
      className="absolute bottom-2 right-2 z-30 w-[calc(100vw-1rem)] max-w-[280px] md:bottom-4 md:right-4"
    >
      <div className="max-h-[60vh] space-y-2 overflow-y-auto p-4">
        {controls.map(([key, description]) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <kbd className="rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] text-slate-200">
              {key}
            </kbd>
            <span className="text-right text-xs text-slate-400">{description}</span>
          </div>
        ))}
      </div>
    </CollapsiblePanel>
  );
}

export default memo(ControlGuide);
