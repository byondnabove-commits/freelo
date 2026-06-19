export default function Overview() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Fluid Gradient Greeting Canvas Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-purple-400 via-pink-400 to-indigo-400 p-8 text-white shadow-sm">
        <span className="text-[11px] font-bold tracking-wider uppercase text-white/80">
          Thursday, June 11th
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight mt-1">
          Good Morning, Alex
        </h2>
      </div>
      <div className="border border-dashed border-slate-200 rounded-2xl bg-white p-8 font-medium text-sm text-slate-400">
        Page Module View Contents: Overview
      </div>
    </div>
  );
}