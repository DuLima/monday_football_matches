import type { Season } from '../data/types';
import { formatDate } from '../lib/format';
import { seasonProgress } from '../lib/stats';
import { CountUp } from './ui';

export function SeasonProgressCard({ season, today }: { season: Season; today: Date }) {
  const p = seasonProgress(season, today);

  return (
    <div className="card flex h-full flex-col p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">Progresso da Época</div>
        <Legend />
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-5 sm:flex-row sm:items-center">
        <ProgressRing pct={p.seasonPct} />

        <div className="flex-1">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
            <div className="flex h-full w-full origin-left animate-grow-x">
              <div className="h-full bg-gradient-to-r from-brand-red to-chiti" style={{ width: `${p.playedPct}%` }} />
              <div className="h-full bg-rose-300/50" style={{ width: `${p.cancelledPct}%` }} />
              <div className="h-full bg-white/10" style={{ width: `${p.scheduledPct}%` }} />
            </div>
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-slate-500">
            <span>{formatDate(season.startDate)}</span>
            <span>{formatDate(season.endDate)}</span>
          </div>

          <div className="stagger mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Jogados" value={p.played} tone="red" />
            <Stat label="Cancelados" value={p.cancelled} tone="rose" />
            <Stat label="Por Jogar" value={p.scheduled} tone="slate" />
            <Stat label="Total" value={p.total} tone="slate" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto h-32 w-32 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-lime)" />
            <stop offset="100%" stopColor="var(--color-grilo)" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke="url(#ring-grad)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          className="transition-[stroke-dashoffset] duration-1000 ease-out starting:[stroke-dashoffset:264]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display text-3xl font-bold text-white"><CountUp value={pct} />%</div>
        <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">da época</div>
      </div>
    </div>
  );
}

const TONES: Record<string, string> = {
  red: 'bg-brand-red-soft text-brand-red ring-brand-red-ring',
  rose: 'bg-rose-300/10 text-rose-300 ring-rose-300/20',
  slate: 'bg-white/5 text-slate-200 ring-white/10',
};

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={`card-hover rounded-xl p-3 ring-1 ${TONES[tone]}`}>
      <div className="font-display text-2xl font-bold leading-none"><CountUp value={value} /></div>
      <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-3 text-[10px] text-slate-400">
      <LegendDot color="bg-brand-red" label="Jogados" />
      <LegendDot color="bg-rose-300/50" label="Cancelados" />
      <LegendDot color="bg-white/20" label="Por jogar" />
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
