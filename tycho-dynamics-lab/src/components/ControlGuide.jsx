const controls = [
    ["W / S", "Forward / backward"],
    ["A / D", "Left / right"],
    ["R / F", "Up / down"],
    ["Arrow keys", "Pitch / yaw"],
    ["Q / E", "Roll"],
    ["Space", "Stop movement"],
    ["T", "Reset simulation"],
    ["1 / 2 / 3", "Camera presets"],
  ];
  
  export default function ControlGuide() {
    return (
      <aside className="pointer-events-none absolute bottom-4 right-4 hidden w-[250px] rounded-xl border border-white/10 bg-slate-950/70 p-4 backdrop-blur-md md:block">
        <p className="mb-3 text-[10px] tracking-[0.3em] text-sky-400">
          FLIGHT CONTROLS
        </p>
  
        <div className="space-y-2">
          {controls.map(([key, description]) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4"
            >
              <kbd className="rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[10px] text-slate-200">
                {key}
              </kbd>
  
              <span className="text-right text-xs text-slate-400">
                {description}
              </span>
            </div>
          ))}
        </div>
      </aside>
    );
  }