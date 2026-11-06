import type { Match, Season } from '../data/types';
import { teamStats } from '../lib/stats';
import { fmt1, fmtSigned } from '../lib/format';
import { FormPills } from './FormPills';

type Props = {
  season: Season;
  matches?: Match[];
  showForm?: boolean;
};

export function StatsTable({ season, matches, showForm = true }: Props) {
  const ms = matches ?? season.matches;
  const grilo = teamStats('grilo', ms);
  const chiti = teamStats('chiti', ms);
  const ranked = [grilo, chiti].sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff);

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-xs sm:text-sm">
          <thead className="border-b border-white/10 text-slate-400">
            <tr>
              <Th align="left" className="pl-5">Equipa</Th>
              <Th>J</Th>
              <Th>Pts</Th>
              <Th>V</Th>
              <Th>E</Th>
              <Th>D</Th>
              <Th>GM</Th>
              <Th>GS</Th>
              <Th>DG</Th>
              {showForm && <Th>Últimos 5</Th>}
              <Th>PPJ</Th>
              <Th>MGJ</Th>
              <Th>MGV</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {ranked.map((s, i) => {
              const team = season.teams[s.team];
              return (
                <tr key={s.team} className="text-slate-300 transition-colors hover:bg-white/[0.04]">
                  <Td align="left" className="pl-5">
                    <span className="flex items-center gap-3">
                      <span className={'font-display text-lg font-bold ' + (i === 0 ? 'text-lime' : 'text-slate-500')}>{i + 1}</span>
                      <span className="h-8 w-1 rounded-full" style={{ background: team.color }} />
                      <span className="whitespace-nowrap font-semibold text-white">{team.name}</span>
                    </span>
                  </Td>
                  <Td>{s.played}</Td>
                  <Td className="font-display text-base font-bold text-white">{s.points}</Td>
                  <Td>{s.wins}</Td>
                  <Td>{s.draws}</Td>
                  <Td>{s.losses}</Td>
                  <Td>{s.goalsFor}</Td>
                  <Td>{s.goalsAgainst}</Td>
                  <Td className={s.goalDiff > 0 ? 'font-semibold text-emerald-300' : s.goalDiff < 0 ? 'font-semibold text-rose-300' : ''}>
                    {fmtSigned(s.goalDiff)}
                  </Td>
                  {showForm && (
                    <Td>
                      <div className="flex justify-center"><FormPills form={s.form} /></div>
                    </Td>
                  )}
                  <Td>{fmt1(s.ppg)}</Td>
                  <Td>{fmt1(s.gpg)}</Td>
                  <Td>{s.wins ? fmt1(s.goalsPerWin) : '—'}</Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children, align = 'center', className = '' }: { children: React.ReactNode; align?: 'left' | 'center'; className?: string }) {
  return (
    <th className={`px-3 py-3 text-[11px] font-semibold uppercase tracking-wider ${align === 'left' ? 'text-left' : 'text-center'} ${className}`}>
      {children}
    </th>
  );
}
function Td({ children, align = 'center', className = '' }: { children: React.ReactNode; align?: 'left' | 'center'; className?: string }) {
  return (
    <td className={`px-3 py-3 ${align === 'left' ? 'text-left' : 'text-center'} ${className}`}>
      {children}
    </td>
  );
}
