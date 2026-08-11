import { useState } from 'react';
import type { Match, Season, TeamId } from '../data/types';
import { playerGoals, playerName } from '../data/types';
import { useAuth } from '../firebase/auth';
import { formatDate } from '../lib/format';
import { isPlayed } from '../lib/stats';
import { EditMatchModal } from './EditMatchModal';

export function ResultsTable({ season }: { season: Season }) {
  const { isOwner } = useAuth();
  const todayStr = new Date().toISOString().slice(0, 10);
  const rows = season.matches
    .filter(m => m.date <= todayStr)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  const [openId, setOpenId] = useState<string | null>(rows.find(isPlayed)?.id ?? null);
  const [editing, setEditing] = useState<Match | null>(null);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-[110px_1fr_120px_1fr_40px] items-center bg-[#0b4d1f] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white">
        <div>Data</div>
        <div>Equipa da Casa</div>
        <div className="text-center">Resultado</div>
        <div>Equipa Visitante</div>
        <div />
      </div>
      <ul className="divide-y divide-slate-100">
        {rows.map(m => {
          const isOpen = openId === m.id;
          const played = isPlayed(m);
          return (
            <li key={m.id} className={isOpen ? 'bg-emerald-50/60' : ''}>
              <div className="grid w-full grid-cols-[110px_1fr_120px_1fr_40px] items-center px-4 py-3 text-sm">
                <button
                  type="button"
                  onClick={() => played && setOpenId(isOpen ? null : m.id)}
                  className={'text-left text-slate-600 ' + (played ? 'cursor-pointer hover:underline' : 'cursor-default')}
                >
                  {formatDate(m.date)}
                </button>
                <div className="font-medium text-slate-800">{season.teams[m.homeTeam].name}</div>
                <div className="text-center">
                  {played ? (
                    <span className="text-base font-bold text-slate-900">
                      {m.homeScore} <span className="mx-1 text-slate-400">–</span> {m.awayScore}
                    </span>
                  ) : (
                    <StatusPill status={m.status} />
                  )}
                </div>
                <div className="font-medium text-slate-800">{season.teams[m.awayTeam].name}</div>
                <div className="flex items-center justify-end gap-1">
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => setEditing(m)}
                      className="rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm hover:bg-emerald-700"
                    >
                      Editar
                    </button>
                  )}
                  {played && (
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : m.id)}
                      className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
                      aria-label="Expandir"
                    >
                      {isOpen ? '▲' : '▼'}
                    </button>
                  )}
                </div>
              </div>
              {isOpen && played && <MatchDetail match={m} season={season} />}
            </li>
          );
        })}
        {rows.length === 0 && (
          <li className="p-6 text-center text-slate-500">Sem jogos registados.</li>
        )}
      </ul>

      {editing && (
        <EditMatchModal match={editing} season={season} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function StatusPill({ status }: { status: Match['status'] }) {
  if (status === 'cancelled') {
    return <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">Cancelado</span>;
  }
  if (status === 'scheduled') {
    return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">Agendado</span>;
  }
  return null;
}

function MatchDetail({ match, season }: { match: Match; season: Season }) {
  const teams: TeamId[] = [match.homeTeam, match.awayTeam];
  return (
    <div className="border-t border-emerald-100 bg-emerald-50/40 px-6 py-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {teams.map(t => {
          const team = season.teams[t];
          const players = match.players?.[t] ?? [];
          return (
            <div key={t}>
              <div className="mb-2 inline-block rounded-md px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: team.color }}>
                {team.name}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {players.length === 0 && <span className="text-xs text-slate-400">Sem jogadores registados</span>}
                {players.map(entry => {
                  const name = playerName(entry);
                  const goals = playerGoals(entry);
                  return (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm"
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: team.color }} />
                      {name}
                      {goals > 0 && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                          {goals} ⚽
                        </span>
                      )}
                      {match.motm === name && (
                        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">⭐ MOTM</span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {match.motm && (
        <div className="mt-4 rounded-lg bg-amber-50 py-2 text-center text-sm text-amber-900 ring-1 ring-amber-200">
          ⭐ Man of the Match: <span className="font-bold">{match.motm}</span>
        </div>
      )}
    </div>
  );
}
