import type { Season } from '../data/types';
import { groupByMonth, isPlayed } from '../lib/stats';
import { StatsTable } from './StatsTable';

export function MonthlyStats({ season }: { season: Season }) {
  const groups = groupByMonth(season.matches.filter(isPlayed));

  return (
    <div className="space-y-6">
      {groups.map(g => (
        <section key={g.key}>
          <h3 className="mb-2 text-lg font-bold text-slate-800">{g.label}</h3>
          <StatsTable season={season} matches={g.matches} showForm={false} />
        </section>
      ))}
      {groups.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Ainda não há jogos disputados.
        </div>
      )}
    </div>
  );
}
