import { useState } from 'react';
import type { Match, Season, TeamId } from '../data/types';
import { playerGoals, playerName, playerOwnGoals } from '../data/types';
import { useAuth } from '../firebase/auth';
import { formatDate, todayISO } from '../lib/format';
import { isInjured } from '../lib/injuries';
import { isPlayed } from '../lib/stats';
import { EditMatchModal } from './EditMatchModal';
import { MedicalIcon } from './MedicalIcon';

export function ResultsTable({ season }: { season: Season }) {
  const { isOwner } = useAuth();
  const todayStr = todayISO();
  const rows = season.matches
    .filter(m => m.date <= todayStr)
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));

  const [openId, setOpenId] = useState<string | null>(rows[0]?.id ?? null);
  const [editing, setEditing] = useState<Match | null>(null);

  return (
    <div className="card overflow-x-auto">
      <div className="grid min-w-[560px] grid-cols-[110px_1fr_120px_1fr_40px] items-center border-b border-white/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        <div>Data</div>
        <div>Equipa da Casa</div>
        <div className="text-center">Resultado</div>
        <div>Equipa Visitante</div>
        <div />
      </div>
      <ul className="divide-y divide-white/5">
        {rows.map(m => {
          const isOpen = openId === m.id;
          const played = isPlayed(m);
          return (
            <li key={m.id} className={'transition-colors ' + (isOpen ? 'bg-white/[0.04]' : 'hover:bg-white/[0.025]')}>
              <div className="grid w-full min-w-[560px] grid-cols-[110px_1fr_120px_1fr_40px] items-center px-4 py-3 text-sm">
                <button
                  type="button"
                  onClick={() => played && setOpenId(isOpen ? null : m.id)}
                  className={'text-left tabular-nums text-slate-400 ' + (played ? 'cursor-pointer hover:text-white' : 'cursor-default')}
                >
                  {formatDate(m.date)}
                </button>
                <TeamName team={season.teams[m.homeTeam]} won={played && m.homeScore! > m.awayScore!} />
                <div className="text-center">
                  {played ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1 font-display text-base font-bold tabular-nums text-white ring-1 ring-white/10">
                      {m.homeScore} <span className="text-slate-500">–</span> {m.awayScore}
                    </span>
                  ) : (
                    <StatusPill status={m.status} />
                  )}
                </div>
                <TeamName team={season.teams[m.awayTeam]} won={played && m.awayScore! > m.homeScore!} />
                <div className="flex items-center justify-end gap-1">
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => setEditing(m)}
                      className="rounded-lg bg-brand-red-soft px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-red ring-1 ring-brand-red-ring transition hover:bg-brand-red hover:text-white"
                    >
                      Editar
                    </button>
                  )}
                  {played && (
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : m.id)}
                      className="rounded-md p-1 text-slate-500 transition hover:bg-white/10 hover:text-white"
                      aria-label="Expandir"
                    >
                      <span className={'inline-block transition-transform duration-300 ' + (isOpen ? 'rotate-180' : '')}>▼</span>
                    </button>
                  )}
                </div>
              </div>
              {isOpen && played && <MatchDetail match={m} season={season} />}
            </li>
          );
        })}
        {rows.length === 0 && (
          <li className="p-6 text-center text-slate-400">Sem jogos registados.</li>
        )}
      </ul>

      {editing && (
        <EditMatchModal match={editing} season={season} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function TeamName({ team, won }: { team: Season['teams'][TeamId]; won: boolean }) {
  return (
    <div className={'flex items-center gap-2 font-medium ' + (won ? 'text-white' : 'text-slate-400')}>
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: team.color }} />
      <span className="truncate">{team.name}</span>
      {won && <span className="text-[10px] font-bold text-lime">V</span>}
    </div>
  );
}

function StatusPill({ status }: { status: Match['status'] }) {
  if (status === 'cancelled') {
    return <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-300 ring-1 ring-rose-500/30">Cancelado</span>;
  }
  if (status === 'scheduled') {
    return <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-slate-400 ring-1 ring-white/10">Agendado</span>;
  }
  return null;
}

function MatchDetail({ match, season }: { match: Match; season: Season }) {
  const teams: TeamId[] = [match.homeTeam, match.awayTeam];
  return (
    <div className="animate-fade-up border-t border-white/5 px-6 py-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {teams.map(t => {
          const team = season.teams[t];
          const players = match.players?.[t] ?? [];
          return (
            <div key={t}>
              <div className="mb-3 inline-block rounded-lg px-3 py-1 text-xs font-bold text-white shadow-lg" style={{ backgroundColor: team.color }}>
                {team.name}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {players.length === 0 && <span className="text-xs text-slate-500">Sem jogadores registados</span>}
                {players.map(entry => {
                  const name = playerName(entry);
                  const goals = playerGoals(entry);
                  const ownGoals = playerOwnGoals(entry);
                  const injured = isInjured(season, name);
                  return (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/10 transition hover:bg-white/10"
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: team.color }} />
                      {injured && <MedicalIcon size={12} />}
                      {name}
                      {goals > 0 && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {goals} ⚽
                        </span>
                      )}
                      {ownGoals > 0 && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-bold text-rose-300" title="Auto-golos">
                          {ownGoals} AG
                        </span>
                      )}
                      {match.motm === name && (
                        <span className="rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">⭐ MOTM</span>
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
        <div className="mt-5 rounded-xl bg-gradient-to-r from-amber-400/5 via-amber-400/15 to-amber-400/5 py-2.5 text-center text-sm text-amber-200 ring-1 ring-amber-400/25">
          ⭐ Man of the Match: <span className="font-bold text-amber-100">{match.motm}</span>
        </div>
      )}
    </div>
  );
}
