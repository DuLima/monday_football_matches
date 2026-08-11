import type { Match, Season } from '../data/types';
import { daysBetween, formatDateLong } from '../lib/format';
import { TeamBadge } from './TeamBadge';

type Props = {
  match: Match | null;
  season: Season;
  today: Date;
};

export function NextGameCard({ match, season, today }: Props) {
  if (!match) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border-l-4 border-brand-red bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-red">Próximo Jogo</div>
        <div className="mt-4 text-sm text-slate-500">Sem jogo agendado</div>
      </div>
    );
  }
  const days = daysBetween(today, new Date(match.date));
  const home = season.teams[match.homeTeam];
  const away = season.teams[match.awayTeam];

  return (
    <div className="flex h-full flex-col rounded-2xl border-l-4 border-brand-red bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-red">Próximo Jogo</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-4xl font-black tracking-tight text-brand-dark">{days}</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">dias</span>
      </div>
      <div className="mt-2 text-sm font-medium text-slate-700">{formatDateLong(match.date)}</div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-red-soft px-2 py-0.5 text-[11px] font-semibold text-brand-red ring-1 ring-brand-red-ring">
          ⏱ 22h30
        </span>
        {match.venue && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            🏟️ {match.venue}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-center justify-around">
        <TeamBadge team={home} size={60} />
        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">vs</div>
        <TeamBadge team={away} size={60} />
      </div>
    </div>
  );
}
