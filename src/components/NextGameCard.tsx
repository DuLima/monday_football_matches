import { useEffect, useState } from 'react';
import type { Match, Season } from '../data/types';
import { formatDateLong } from '../lib/format';
import { TeamBadge } from './TeamBadge';

type Props = {
  match: Match | null;
  season: Season;
};

const KICKOFF = { hours: 22, minutes: 30 };

function useNow(intervalMs: number): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function kickoffOf(match: Match): Date {
  const [y, m, d] = match.date.split('-').map(Number);
  return new Date(y, m - 1, d, KICKOFF.hours, KICKOFF.minutes);
}

export function NextGameCard({ match, season }: Props) {
  const now = useNow(1000);

  if (!match) {
    return (
      <div className="card flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-red">Próximo Jogo</div>
        <div className="mt-4 text-sm text-slate-400">Sem jogo agendado</div>
      </div>
    );
  }

  const home = season.teams[match.homeTeam];
  const away = season.teams[match.awayTeam];
  const diff = Math.max(0, kickoffOf(match).getTime() - now.getTime());
  const started = diff === 0;
  const parts = [
    { label: 'Dias', value: Math.floor(diff / 86_400_000) },
    { label: 'Horas', value: Math.floor(diff / 3_600_000) % 24 },
    { label: 'Min', value: Math.floor(diff / 60_000) % 60 },
    { label: 'Seg', value: Math.floor(diff / 1000) % 60 },
  ];

  return (
    <div className="card relative flex h-full flex-col overflow-hidden p-5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl"
        style={{ background: home.color }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full opacity-40 blur-3xl"
        style={{ background: away.color }}
      />

      <div className="relative flex items-center gap-2">
        <span className="h-2 w-2 animate-pulse-dot rounded-full bg-brand-red" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-red">Próximo Jogo</span>
      </div>

      <div className="relative mt-4 flex items-center justify-between gap-2">
        <div className="flex flex-1 flex-col items-center gap-2 text-center">
          <div className="transition-transform duration-300 hover:-rotate-6 hover:scale-110">
            <TeamBadge team={home} size={88} />
          </div>
          <span className="text-xs font-semibold text-slate-300">{home.shortName}</span>
        </div>
        <div className="font-display text-sm font-bold uppercase tracking-widest text-slate-500">vs</div>
        <div className="flex flex-1 flex-col items-center gap-2 text-center">
          <div className="transition-transform duration-300 hover:rotate-6 hover:scale-110">
            <TeamBadge team={away} size={88} />
          </div>
          <span className="text-xs font-semibold text-slate-300">{away.shortName}</span>
        </div>
      </div>

      {started ? (
        <div className="relative mt-5 rounded-xl bg-brand-red-soft py-3 text-center font-display text-lg font-bold text-brand-red ring-1 ring-brand-red-ring">
          É hoje! Bola a rolar ⚽
        </div>
      ) : (
        <div className="relative mt-5 grid grid-cols-4 gap-2">
          {parts.map(p => (
            <div key={p.label} className="rounded-xl bg-white/5 py-2 text-center ring-1 ring-white/10">
              <div className="font-display text-2xl font-bold tabular-nums text-white">
                {String(p.value).padStart(2, '0')}
              </div>
              <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">{p.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="relative mt-4 text-sm font-medium text-slate-300">{formatDateLong(match.date)}</div>
      <div className="relative mt-2 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-red-soft px-2.5 py-0.5 text-[11px] font-semibold text-brand-red ring-1 ring-brand-red-ring">
          ⏱ 22h30
        </span>
        {match.venue && (
          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-slate-300 ring-1 ring-white/10">
            🏟️ {match.venue}
          </span>
        )}
      </div>
    </div>
  );
}
