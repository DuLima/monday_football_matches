import type { Season } from '../data/types';
import { formatDate } from '../lib/format';
import { seasonProgress } from '../lib/stats';

export function SeasonProgressCard({ season, today }: { season: Season; today: Date }) {
  const p = seasonProgress(season, today);

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Progresso da Época</div>
        <Legend />
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="flex h-full w-full">
          <div className="h-full bg-brand-red" style={{ width: `${p.playedPct}%` }} />
          <div className="h-full bg-rose-300" style={{ width: `${p.cancelledPct}%` }} />
          <div className="h-full bg-slate-200" style={{ width: `${p.scheduledPct}%` }} />
        </div>
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>{formatDate(season.startDate)}</span>
        <span>{formatDate(season.endDate)}</span>
      </div>

      <div className="mt-4 grid flex-1 grid-cols-2 gap-2 sm:grid-cols-5">
        <Stat label="Jogados" value={p.played} tone="red" />
        <Stat label="Cancelados" value={p.cancelled} tone="rose-light" />
        <Stat label="Por Jogar" value={p.scheduled} tone="slate" />
        <Stat label="Total" value={p.total} tone="slate" />
        <Stat label="Época" value={`${p.seasonPct}%`} tone="amber" />
      </div>
    </div>
  );
}

const TONES: Record<string, string> = {
  red: 'bg-brand-red-soft text-brand-red ring-brand-red-ring',
  'rose-light': 'bg-rose-50 text-rose-500 ring-rose-100',
  slate: 'bg-slate-50 text-slate-600 ring-slate-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
};

function Stat({ label, value, tone }: { label: string; value: number | string; tone: string }) {
  return (
    <div className={`rounded-xl p-3 ring-1 ${TONES[tone]}`}>
      <div className="text-xl font-black leading-none">{value}</div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-3 text-[10px] text-slate-500">
      <LegendDot color="bg-brand-red" label="Jogados" />
      <LegendDot color="bg-rose-300" label="Cancelados" />
      <LegendDot color="bg-slate-200" label="Por jogar" />
    </div>
  );
}
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}
