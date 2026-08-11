import type { MatchOutcome } from '../lib/stats';

const COLOR: Record<MatchOutcome, string> = {
  V: 'bg-emerald-500 text-white',
  E: 'bg-amber-400 text-white',
  D: 'bg-rose-500 text-white',
};

export function FormPills({ form }: { form: MatchOutcome[] }) {
  if (!form.length) return <span className="text-slate-400">—</span>;
  return (
    <div className="flex items-center gap-1.5">
      {form.map((o, i) => (
        <span
          key={i}
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black shadow-sm ${COLOR[o]}`}
        >
          {o}
        </span>
      ))}
    </div>
  );
}
