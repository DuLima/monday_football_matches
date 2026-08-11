import type { Season } from '../data/types';
import { formatDate } from '../lib/format';
import { seasonProgress } from '../lib/stats';

export function SeasonProgressCard({ season, today }: { season: Season; today: Date }) {
  const p = seasonProgress(season, today);

  return (
    <div className="flex h-full flex-col rounded-2xl bg-gradient-to-br from-[#0e1f38] to-[#0a1628] p-5 text-white shadow-lg ring-1 ring-white/5">
      <div className="text-sm font-bold uppercase tracking-widest text-sky-300">Progresso da Época</div>

      <Legend />

      <div className="mt-3 h-4 w-full overflow-hidden rounded-full bg-slate-700/40 ring-1 ring-white/5">
        <div className="flex h-full w-full">
          <div className="h-full bg-emerald-500" style={{ width: `${p.playedPct}%` }} />
          <div className="h-full bg-rose-500" style={{ width: `${p.cancelledPct}%` }} />
          <div className="h-full bg-slate-500" style={{ width: `${p.scheduledPct}%` }} />
        </div>
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-white/60">
        <span>{formatDate(season.startDate)}</span>
        <span>{formatDate(season.endDate)}</span>
      </div>

      <div className="mt-4 grid flex-1 grid-cols-2 gap-2 sm:grid-cols-5">
        <Stat label="Jogados" sub={`${p.playedPct}% jogados`} value={p.played} color="text-emerald-400" />
        <Stat label="Cancelados" sub={`${p.cancelledPct}% cancelados`} value={p.cancelled} color="text-rose-400" />
        <Stat label="Por Jogar" sub={`${p.scheduledPct}% por jogar`} value={p.scheduled} color="text-slate-300" />
        <Stat label="Total Segundas" sub="" value={p.total} color="text-sky-300" />
        <Stat label="Época Decorrida" sub="" value={`${p.seasonPct}%`} color="text-amber-300" />
      </div>
    </div>
  );
}

function Stat({ label, sub, value, color }: { label: string; sub: string; value: number | string; color: string }) {
  return (
    <div className="rounded-xl bg-black/20 p-3 ring-1 ring-white/5">
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      {sub && <div className="text-[10px] font-semibold uppercase tracking-wide text-white/60">{sub}</div>}
      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/50">{label}</div>
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-2 flex items-center gap-4 text-xs text-white/80">
      <LegendDot color="bg-emerald-500" label="Jogados" />
      <LegendDot color="bg-rose-500" label="Cancelados" />
      <LegendDot color="bg-slate-500" label="Por Jogar" />
    </div>
  );
}
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
