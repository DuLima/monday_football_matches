import type { MatchOutcome } from '../lib/stats';

const COLOR: Record<MatchOutcome, string> = {
  V: 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/40',
  E: 'bg-amber-400/15 text-amber-300 ring-amber-400/40',
  D: 'bg-rose-500/15 text-rose-300 ring-rose-500/40',
};

export function FormPills({ form }: { form: MatchOutcome[] }) {
  if (!form.length) return <span className="text-slate-500">—</span>;
  return (
    <div className="flex items-center gap-1.5">
      {form.map((o, i) => (
        <span
          key={i}
          className={`inline-flex h-6 w-6 animate-pop items-center justify-center rounded-lg text-[11px] font-black ring-1 transition-transform hover:scale-125 ${COLOR[o]}`}
          style={{ animationDelay: `${i * 70}ms` }}
        >
          {o}
        </span>
      ))}
    </div>
  );
}
