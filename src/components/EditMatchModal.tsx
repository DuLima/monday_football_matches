import { useMemo, useState } from 'react';
import type { Match, MatchPlayer, MatchStatus, PlayerEntry, Season, Team, TeamId } from '../data/types';
import { playerGoals, playerName } from '../data/types';
import { useSeason } from '../firebase/season';
import { formatDate } from '../lib/format';

type Props = { match: Match; season: Season; onClose: () => void };

function toMatchPlayers(roster?: PlayerEntry[]): MatchPlayer[] {
  return (roster ?? []).map(e => ({ name: playerName(e), goals: playerGoals(e) }));
}

export function EditMatchModal({ match, season, onClose }: Props) {
  const { saveMatch } = useSeason();
  const [status, setStatus] = useState<MatchStatus>(match.status);
  const [homeScore, setHomeScore] = useState<string>(match.homeScore?.toString() ?? '');
  const [awayScore, setAwayScore] = useState<string>(match.awayScore?.toString() ?? '');
  const [home, setHome] = useState<MatchPlayer[]>(toMatchPlayers(match.players?.[match.homeTeam]));
  const [away, setAway] = useState<MatchPlayer[]>(toMatchPlayers(match.players?.[match.awayTeam]));
  const [motm, setMotm] = useState<string>(match.motm ?? '');
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const homeTeam = season.teams[match.homeTeam];
  const awayTeam = season.teams[match.awayTeam];

  const allKnownPlayers = useMemo(() => {
    const s = new Set<string>();
    for (const m of season.matches) {
      if (!m.players) continue;
      for (const t of Object.keys(m.players) as TeamId[]) {
        for (const p of m.players[t] ?? []) s.add(playerName(p));
      }
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b, 'pt'));
  }, [season.matches]);

  const assigned = useMemo(() => {
    const s = new Set<string>();
    home.forEach(p => s.add(p.name));
    away.forEach(p => s.add(p.name));
    return s;
  }, [home, away]);

  const pool = useMemo(
    () => allKnownPlayers.filter(n => !assigned.has(n)),
    [allKnownPlayers, assigned],
  );

  const allInMatch = useMemo(
    () => [...home, ...away].map(p => p.name),
    [home, away],
  );

  const totalHomeGoals = home.reduce((s, p) => s + (p.goals ?? 0), 0);
  const totalAwayGoals = away.reduce((s, p) => s + (p.goals ?? 0), 0);

  function addToHome(name: string) {
    if (home.some(p => p.name === name)) return;
    setHome([...home, { name, goals: 0 }]);
  }
  function addToAway(name: string) {
    if (away.some(p => p.name === name)) return;
    setAway([...away, { name, goals: 0 }]);
  }
  function removeFromHome(name: string) {
    setHome(home.filter(p => p.name !== name));
    if (motm === name) setMotm('');
  }
  function removeFromAway(name: string) {
    setAway(away.filter(p => p.name !== name));
    if (motm === name) setMotm('');
  }
  function setHomeGoals(name: string, goals: number) {
    setHome(home.map(p => (p.name === name ? { ...p, goals: Math.max(0, goals) } : p)));
  }
  function setAwayGoals(name: string, goals: number) {
    setAway(away.map(p => (p.name === name ? { ...p, goals: Math.max(0, goals) } : p)));
  }
  function addNewToHome() {
    const n = newName.trim();
    if (!n) return;
    if (!home.some(p => p.name === n) && !away.some(p => p.name === n)) addToHome(n);
    setNewName('');
  }
  function addNewToAway() {
    const n = newName.trim();
    if (!n) return;
    if (!home.some(p => p.name === n) && !away.some(p => p.name === n)) addToAway(n);
    setNewName('');
  }

  async function onSave() {
    setError(null);
    setSaving(true);
    try {
      const patch: Partial<Match> = {
        status,
        homeScore: status === 'played' && homeScore !== '' ? parseInt(homeScore, 10) : undefined,
        awayScore: status === 'played' && awayScore !== '' ? parseInt(awayScore, 10) : undefined,
        players: status === 'played' ? {
          [match.homeTeam]: home,
          [match.awayTeam]: away,
        } as Partial<Record<TeamId, PlayerEntry[]>> : undefined,
        motm: status === 'played' && motm ? motm : undefined,
      };
      await saveMatch(match.id, patch);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={onClose}>
      <div
        className="mt-8 w-full max-w-4xl rounded-2xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">Editar jogo</div>
            <div className="text-lg font-bold text-slate-800">{formatDate(match.date)} · {homeTeam.name} vs {awayTeam.name}</div>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Fechar">✕</button>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</label>
            <div className="flex flex-wrap gap-2">
              {(['played', 'cancelled', 'scheduled'] as MatchStatus[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={
                    'rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-slate-200 ' +
                    (status === s
                      ? 'bg-emerald-600 text-white ring-emerald-700'
                      : 'bg-white text-slate-700 hover:bg-slate-50')
                  }
                >
                  {s === 'played' ? 'Jogado' : s === 'cancelled' ? 'Cancelado' : 'Agendado'}
                </button>
              ))}
            </div>
          </div>

          {status === 'played' && (
            <>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">Resultado</label>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-40 text-right text-sm font-semibold" style={{ color: homeTeam.color }}>{homeTeam.name}</div>
                  <input
                    type="number" min="0" value={homeScore}
                    onChange={e => setHomeScore(e.target.value)}
                    className="h-12 w-16 rounded-lg border border-slate-300 text-center text-xl font-bold focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="text-slate-400">–</span>
                  <input
                    type="number" min="0" value={awayScore}
                    onChange={e => setAwayScore(e.target.value)}
                    className="h-12 w-16 rounded-lg border border-slate-300 text-center text-xl font-bold focus:border-emerald-500 focus:outline-none"
                  />
                  <div className="w-40 text-sm font-semibold" style={{ color: awayTeam.color }}>{awayTeam.name}</div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">Convocatória</label>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <TeamRoster
                    team={homeTeam}
                    players={home}
                    goalTotal={totalHomeGoals}
                    expected={homeScore ? parseInt(homeScore, 10) : null}
                    onRemove={removeFromHome}
                    onGoals={setHomeGoals}
                    arrowSide="right"
                  />
                  <PoolColumn
                    pool={pool}
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                    onAddHome={addToHome}
                    onAddAway={addToAway}
                    newName={newName}
                    onNewName={setNewName}
                    onAddNewToHome={addNewToHome}
                    onAddNewToAway={addNewToAway}
                  />
                  <TeamRoster
                    team={awayTeam}
                    players={away}
                    goalTotal={totalAwayGoals}
                    expected={awayScore ? parseInt(awayScore, 10) : null}
                    onRemove={removeFromAway}
                    onGoals={setAwayGoals}
                    arrowSide="left"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">Man of the Match</label>
                <select
                  value={motm}
                  onChange={e => setMotm(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">— nenhum —</option>
                  {allInMatch.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </>
          )}

          {error && <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">{error}</div>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button
            type="button" onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="button" onClick={onSave} disabled={saving}
            className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? 'A guardar…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TeamRoster({
  team, players, goalTotal, expected, onRemove, onGoals, arrowSide,
}: {
  team: Team;
  players: MatchPlayer[];
  goalTotal: number;
  expected: number | null;
  onRemove: (name: string) => void;
  onGoals: (name: string, goals: number) => void;
  arrowSide: 'left' | 'right';
}) {
  const mismatch = expected !== null && goalTotal !== expected;
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/60">
      <div
        className="flex items-center justify-between rounded-t-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-white"
        style={{ backgroundColor: team.color }}
      >
        <span>{team.name}</span>
        <span className={'rounded-full bg-white/20 px-2 py-0.5 text-[10px] ' + (mismatch ? 'text-amber-100 ring-1 ring-amber-200/70' : '')}>
          {goalTotal} ⚽{expected !== null ? ` / ${expected}` : ''}
        </span>
      </div>
      <div className="max-h-72 overflow-y-auto p-2">
        {players.length === 0 && (
          <div className="p-3 text-center text-xs text-slate-400">Sem jogadores</div>
        )}
        <ul className="space-y-1">
          {players.map(p => (
            <li key={p.name} className="flex items-center gap-1.5 rounded-md bg-white px-2 py-1 text-xs shadow-sm ring-1 ring-slate-200">
              {arrowSide === 'left' && (
                <RemoveArrow direction="right" onClick={() => onRemove(p.name)} />
              )}
              <span className="flex-1 truncate font-medium text-slate-800">{p.name}</span>
              <input
                type="number" min="0" value={p.goals ?? 0}
                onChange={e => onGoals(p.name, parseInt(e.target.value || '0', 10))}
                className="h-7 w-12 rounded-md border border-slate-300 text-center text-sm font-bold focus:border-emerald-500 focus:outline-none"
                aria-label={`Golos de ${p.name}`}
              />
              {arrowSide === 'right' && (
                <RemoveArrow direction="left" onClick={() => onRemove(p.name)} />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PoolColumn({
  pool, homeTeam, awayTeam,
  onAddHome, onAddAway,
  newName, onNewName, onAddNewToHome, onAddNewToAway,
}: {
  pool: string[];
  homeTeam: Team; awayTeam: Team;
  onAddHome: (name: string) => void; onAddAway: (name: string) => void;
  newName: string; onNewName: (v: string) => void;
  onAddNewToHome: () => void; onAddNewToAway: () => void;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white">
      <div className="rounded-t-xl bg-slate-700 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-white">
        Jogadores
      </div>
      <div className="max-h-72 overflow-y-auto p-2">
        {pool.length === 0 && (
          <div className="p-3 text-center text-xs text-slate-400">Todos os jogadores conhecidos já estão convocados. Adiciona novos abaixo.</div>
        )}
        <ul className="space-y-1">
          {pool.map(name => (
            <li key={name} className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-xs ring-1 ring-slate-200">
              <AddArrow direction="left" color={homeTeam.color} onClick={() => onAddHome(name)} title={`Adicionar a ${homeTeam.name}`} />
              <span className="flex-1 truncate text-center font-medium text-slate-700">{name}</span>
              <AddArrow direction="right" color={awayTeam.color} onClick={() => onAddAway(name)} title={`Adicionar a ${awayTeam.name}`} />
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-slate-200 p-2">
        <input
          type="text" value={newName}
          onChange={e => onNewName(e.target.value)}
          placeholder="Novo jogador…"
          className="mb-1 w-full rounded-md border border-slate-300 px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none"
        />
        <div className="flex gap-1">
          <button
            type="button" onClick={onAddNewToHome}
            className="flex-1 rounded-md px-2 py-1 text-[10px] font-bold text-white"
            style={{ backgroundColor: homeTeam.color }}
          >← {homeTeam.shortName}</button>
          <button
            type="button" onClick={onAddNewToAway}
            className="flex-1 rounded-md px-2 py-1 text-[10px] font-bold text-white"
            style={{ backgroundColor: awayTeam.color }}
          >{awayTeam.shortName} →</button>
        </div>
      </div>
    </div>
  );
}

function AddArrow({ direction, color, onClick, title }: {
  direction: 'left' | 'right'; color: string; onClick: () => void; title: string;
}) {
  return (
    <button
      type="button" onClick={onClick} title={title}
      className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-white transition hover:opacity-90"
      style={{ backgroundColor: color }}
    >
      {direction === 'left' ? '←' : '→'}
    </button>
  );
}

function RemoveArrow({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      type="button" onClick={onClick} title="Remover"
      className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-300"
    >
      {direction === 'left' ? '←' : '→'}
    </button>
  );
}
