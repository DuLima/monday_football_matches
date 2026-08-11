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
      <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b4d1f] to-[#062910] p-6 text-center text-white shadow-lg">
        <div className="text-sm font-bold uppercase tracking-widest text-lime-300">Próximo Jogo</div>
        <div className="mt-4 text-lg text-white/80">Sem jogo agendado</div>
      </div>
    );
  }
  const days = daysBetween(today, new Date(match.date));
  const home = season.teams[match.homeTeam];
  const away = season.teams[match.awayTeam];
  const time = new Date(match.date).getHours() ? undefined : '22h30';

  return (
    <div className="flex h-full flex-col rounded-2xl bg-gradient-to-br from-[#0b4d1f] to-[#062910] p-5 text-white shadow-lg ring-1 ring-white/10">
      <div className="text-center text-sm font-bold uppercase tracking-widest text-lime-300">Próximo Jogo</div>
      <div className="mt-2 text-center">
        <span className="text-3xl font-black text-lime-300">{days}</span>
        <span className="ml-2 text-xs font-semibold uppercase tracking-widest text-white/70">Dias</span>
      </div>
      <div className="mt-3 flex items-center justify-center">
        <div className="rounded-xl bg-black/25 px-4 py-2 text-center ring-1 ring-white/10">
          <div className="text-sm font-semibold">{formatDateLong(match.date)}</div>
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-lime-500/20 px-2 py-0.5 text-xs font-semibold text-lime-300">
            ⏱ {time ?? '22h30'}
          </div>
        </div>
      </div>
      {match.venue && (
        <div className="mt-3 flex justify-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1 text-xs font-medium text-lime-300 ring-1 ring-white/10">
            🏟️ {match.venue}
          </div>
        </div>
      )}
      <div className="mt-4 flex items-center justify-around">
        <TeamBadge team={home} size={72} />
        <div className="text-lg font-black text-white/80">vs</div>
        <TeamBadge team={away} size={72} />
      </div>
    </div>
  );
}
