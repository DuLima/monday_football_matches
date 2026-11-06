import type { Season } from '../data/types';
import { groupByMonth, isPlayed } from '../lib/stats';
import { StatsTable } from './StatsTable';
import { Empty } from './ui';

export function MonthlyStats({ season }: { season: Season }) {
  const groups = groupByMonth(season.matches.filter(isPlayed)).slice().reverse();

  return (
    <div className="stagger space-y-8">
      {groups.map(g => (
        <section key={g.key}>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-white">
            <span className="h-2 w-2 rounded-full bg-brand-red" />
            {g.label}
          </h3>
          <StatsTable season={season} matches={g.matches} showForm={false} />
        </section>
      ))}
      {groups.length === 0 && (
        <Empty>Ainda não há jogos disputados.</Empty>
      )}
    </div>
  );
}
