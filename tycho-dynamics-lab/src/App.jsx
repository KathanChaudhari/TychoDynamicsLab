import BasicScene from "./BasicScene";

export default function App() {
  return (
    <main className="relative h-full w-full overflow-hidden bg-slate-950 text-slate-200">
      <BasicScene />

      <section className="pointer-events-none absolute left-6 top-6 w-[min(320px,calc(100%-3rem))] rounded-xl border border-slate-400/20 bg-slate-950/80 p-5 backdrop-blur-xl">
        <p className="mb-2 text-[11px] font-bold tracking-[0.18em] text-sky-400">
          TYCHO DYNAMICS LAB
        </p>

        <h1 className="text-2xl font-semibold">Docking Bay 01</h1>
        <p className="mb-5 mt-1 text-slate-400">
          Three.js fundamentals
        </p>

        <dl className="grid gap-2.5 text-sm">
          <Status label="Physics" value="Offline" />
          <Status label="Spacecraft" value="Prototype" />
          <Status label="Coordinates" value="1 unit = 1 metre" />
        </dl>
      </section>
    </main>
  );
}

function Status({ label, value }) {
  return (
    <div className="flex justify-between gap-5">
      <dt className="text-slate-500">{label}</dt>
      <dd className="m-0 text-slate-200">{value}</dd>
    </div>
  );
}