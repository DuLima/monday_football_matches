import type { Season, TeamId } from '../data/types';
import { playerStats } from '../lib/stats';

export function PlayersTable({ season }: { season: Season }) {
  const players = playerStats(season);
  const orderedTeams: TeamId[] = ['chiti', 'grilo'];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="-mx-px overflow-x-auto">
        <table className="w-full min-w-[900px] text-xs sm:text-sm">
          <thead className="bg-brand-dark text-white">
            <tr>
              <Th align="left" className="pl-5">Jogador</Th>
              <Th align="left">Jogos</Th>
              <Th align="left">Equipa(s)</Th>
              <Th align="left">Golos</Th>
              <Th align="left">A. Golos</Th>
              <Th align="left">MOTM</Th>
              <Th align="left">Vitórias</Th>
              <Th align="left">Empates</Th>
              <Th align="left">Derrotas</Th>
              <Th align="left">% Vitórias</Th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => {
              const teams = orderedTeams
                .filter(t => (p.perTeam[t] ?? 0) > 0)
                .sort((a, b) => (p.perTeam[b] ?? 0) - (p.perTeam[a] ?? 0));
              return (
                <tr key={p.name} className={i % 2 ? 'bg-slate-50' : 'bg-white'}>
                  <Td align="left" className="pl-5 font-semibold text-slate-800">{p.name}</Td>
                  <Td align="left">{p.games}</Td>
                  <Td align="left">
                    <div className="flex flex-wrap gap-1.5">
                      {teams.map(t => {
                        const team = season.teams[t];
                        return (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold text-white"
                            style={{ backgroundColor: team.color }}
                          >
                            {team.name} ({p.perTeam[t]})
                          </span>
                        );
                      })}
                    </div>
                  </Td>
                  <Td align="left">
                    {p.goals > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {p.goals} ⚽
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </Td>
                  <Td align="left">
                    {p.ownGoals > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700" title="Auto-golos">
                        {p.ownGoals} AG
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </Td>
                  <Td align="left">
                    {p.motm > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                        ⭐ {p.motm}
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </Td>
                  <Td align="left">{p.wins}</Td>
                  <Td align="left">{p.draws}</Td>
                  <Td align="left">{p.losses}</Td>
                  <Td align="left">{p.winPct}%</Td>
                </tr>
              );
            })}
            {players.length === 0 && (
              <tr>
                <td colSpan={10} className="p-6 text-center text-slate-500">Sem jogadores registados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, align = 'center', className = '' }: { children: React.ReactNode; align?: 'left' | 'center'; className?: string }) {
  return (
    <th className={`px-3 py-2.5 text-xs font-semibold uppercase tracking-wider ${align === 'left' ? 'text-left' : 'text-center'} ${className}`}>
      {children}
    </th>
  );
}
function Td({ children, align = 'center', className = '' }: { children: React.ReactNode; align?: 'left' | 'center'; className?: string }) {
  return (
    <td className={`px-3 py-2.5 ${align === 'left' ? 'text-left' : 'text-center'} ${className}`}>{children}</td>
  );
}
