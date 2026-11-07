import { useMemo, useState } from 'react';
import type { Match, MatchPlayer, MatchStatus, PlayerEntry, Season, Team, TeamId } from '../data/types';
import { playerGoals, playerName, playerOwnGoals } from '../data/types';
import { useSeason } from '../firebase/season';
import { textOn } from '../lib/color';
import { formatDate } from '../lib/format';
import { isInjured } from '../lib/injuries';
import { MedicalIcon } from './MedicalIcon';

type Props = { match: Match; season: Season; onClose: () => void };

function toMatchPlayers(roster?: PlayerEntry[]): MatchPlayer[] {
  return (roster ?? []).map(e => ({ name: playerName(e), goals: playerGoals(e), ownGoals: playerOwnGoals(e) }));
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

  const homeFieldGoals = home.reduce((s, p) => s + (p.goals ?? 0), 0);
  const awayFieldGoals = away.reduce((s, p) => s + (p.goals ?? 0), 0);
  const homeOwnGoals = home.reduce((s, p) => s + (p.ownGoals ?? 0), 0);
  const awayOwnGoals = away.reduce((s, p) => s + (p.ownGoals ?? 0), 0);
  const homeExpected = homeFieldGoals + awayOwnGoals;
  const awayExpected = awayFieldGoals + homeOwnGoals;

  function addToHome(name: string) {
    if (home.some(p => p.name === name)) return;
    setHome([...home, { name, goals: 0, ownGoals: 0 }]);
  }
  function addToAway(name: string) {
    if (away.some(p => p.name === name)) return;
    setAway([...away, { name, goals: 0, ownGoals: 0 }]);
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
  function setHomeOG(name: string, og: number) {
    setHome(home.map(p => (p.name === name ? { ...p, ownGoals: Math.max(0, og) } : p)));
  }
  function setAwayOG(name: string, og: number) {
    setAway(away.map(p => (p.name === name ? { ...p, ownGoals: Math.max(0, og) } : p)));
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
    const isScore = (v: string) => /^\d+$/.test(v.trim());
    if (status === 'played' && (!isScore(homeScore) || !isScore(awayScore))) {
      setError('Indica o resultado das duas equipas (números inteiros, 0 ou mais).');
      return;
    }
    setSaving(true);
    try {
      const patch: Partial<Match> = {
        status,
        homeScore: status === 'played' ? parseInt(homeScore, 10) : undefined,
        awayScore: status === 'played' ? parseInt(awayScore, 10) : undefined,
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
    <div className="fixed inset-0 z-50 flex animate-[fade-up_0.2s_ease-out_both] items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mt-8 w-full max-w-4xl animate-pop rounded-3xl border border-white/10 bg-ink-900/95 shadow-[0_40px_80px_-20px_rgb(0_0_0/0.9)] backdrop-blur-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-red">Editar jogo</div>
            <div className="mt-0.5 font-display text-lg font-bold text-white">{formatDate(match.date)} · {homeTeam.name} vs {awayTeam.name}</div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:rotate-90 hover:bg-white/10 hover:text-white" aria-label="Fechar">✕</button>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Estado</label>
            <div className="flex flex-wrap gap-2">
              {(['played', 'cancelled', 'scheduled'] as MatchStatus[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={
                    'rounded-full px-3.5 py-1 text-xs font-semibold ring-1 transition ' +
                    (status === s
                      ? 'bg-brand-red text-white ring-brand-red shadow-[0_6px_18px_-6px_rgb(244_63_94/0.9)]'
                      : 'bg-white/5 text-slate-300 ring-white/10 hover:bg-white/10')
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
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Resultado</label>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex w-40 items-center justify-end gap-2 text-right text-sm font-semibold text-white">{homeTeam.name}<span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: homeTeam.color }} /></div>
                  <input
                    type="number" min="0" value={homeScore}
                    onChange={e => setHomeScore(e.target.value)}
                    className="field h-14 w-20 text-center font-display text-2xl font-bold"
                  />
                  <span className="text-slate-500">–</span>
                  <input
                    type="number" min="0" value={awayScore}
                    onChange={e => setAwayScore(e.target.value)}
                    className="field h-14 w-20 text-center font-display text-2xl font-bold"
                  />
                  <div className="flex w-40 items-center gap-2 text-sm font-semibold text-white"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: awayTeam.color }} />{awayTeam.name}</div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Convocatória</label>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <TeamRoster
                    team={homeTeam}
                    players={home}
                    goalTotal={homeExpected}
                    expected={homeScore ? parseInt(homeScore, 10) : null}
                    onRemove={removeFromHome}
                    onGoals={setHomeGoals}
                    onOwnGoals={setHomeOG}
                    arrowSide="right"
                    season={season}
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
                    goalTotal={awayExpected}
                    expected={awayScore ? parseInt(awayScore, 10) : null}
                    onRemove={removeFromAway}
                    onGoals={setAwayGoals}
                    onOwnGoals={setAwayOG}
                    arrowSide="left"
                    season={season}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Man of the Match</label>
                <select
                  value={motm}
                  onChange={e => setMotm(e.target.value)}
                  className="field w-full px-3 py-2 text-sm"
                >
                  <option value="">— nenhum —</option>
                  {allInMatch.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </>
          )}

          {error && <div className="animate-pop rounded-xl bg-rose-500/10 p-3 text-sm text-rose-300 ring-1 ring-rose-500/30">{error}</div>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-white/10 px-6 py-4">
          <button
            type="button" onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            type="button" onClick={onSave} disabled={saving}
            className="rounded-full bg-gradient-to-r from-brand-red to-chiti px-6 py-2 text-sm font-bold text-white shadow-[0_8px_24px_-6px_rgb(244_63_94/0.8)] transition hover:brightness-110 disabled:opacity-60"
          >
            {saving ? 'A guardar…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TeamRoster({
  team, players, goalTotal, expected, onRemove, onGoals, onOwnGoals, arrowSide, season,
}: {
  team: Team;
  players: MatchPlayer[];
  goalTotal: number;
  expected: number | null;
  onRemove: (name: string) => void;
  onGoals: (name: string, goals: number) => void;
  onOwnGoals: (name: string, og: number) => void;
  arrowSide: 'left' | 'right';
  season: Season;
}) {
  const mismatch = expected !== null && goalTotal !== expected;
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div
        className="flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider"
        style={{ backgroundColor: team.color, color: textOn(team.color) }}
      >
        <span>{team.name}</span>
        <span className={'rounded-full bg-white/20 px-2 py-0.5 text-[10px] ' + (mismatch ? 'animate-pulse !bg-black/50 text-amber-200 ring-1 ring-amber-200/70' : '')}>
          {goalTotal} ⚽{expected !== null ? ` / ${expected}` : ''}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_36px_36px] items-center gap-1 px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
        <span />
        <span className="text-center" title="Golos">⚽</span>
        <span className="text-center" title="Auto-golos">AG</span>
      </div>
      <div className="max-h-72 overflow-y-auto px-2 pb-2">
        {players.length === 0 && (
          <div className="p-3 text-center text-xs text-slate-500">Sem jogadores</div>
        )}
        <ul className="space-y-1">
          {players.map(p => (
            <li key={p.name} className="flex animate-pop items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-xs ring-1 ring-white/10">
              {arrowSide === 'left' && (
                <RemoveArrow direction="right" onClick={() => onRemove(p.name)} />
              )}
              <span className="flex flex-1 items-center gap-1 truncate font-medium text-slate-100">
                {isInjured(season, p.name) && <MedicalIcon size={12} />}
                <span className="truncate">{p.name}</span>
              </span>
              <input
                type="number" min="0" value={p.goals ?? 0}
                onChange={e => onGoals(p.name, parseInt(e.target.value || '0', 10))}
                className="field h-7 w-9 text-center text-sm font-bold"
                aria-label={`Golos de ${p.name}`}
              />
              <input
                type="number" min="0" value={p.ownGoals ?? 0}
                onChange={e => onOwnGoals(p.name, parseInt(e.target.value || '0', 10))}
                className={
                  'field h-7 w-9 text-center text-sm font-bold ' +
                  ((p.ownGoals ?? 0) > 0 ? '!border-rose-400/60 !bg-rose-500/15 !text-rose-300' : '')
                }
                aria-label={`Auto-golos de ${p.name}`}
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
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="bg-white/10 px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-white">
        Jogadores
      </div>
      <div className="max-h-72 overflow-y-auto p-2">
        {pool.length === 0 && (
          <div className="p-3 text-center text-xs text-slate-500">Todos os jogadores conhecidos já estão convocados. Adiciona novos abaixo.</div>
        )}
        <ul className="space-y-1">
          {pool.map(name => (
            <li key={name} className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1 text-xs ring-1 ring-white/10 transition hover:bg-white/10">
              <AddArrow direction="left" color={homeTeam.color} onClick={() => onAddHome(name)} title={`Adicionar a ${homeTeam.name}`} />
              <span className="flex-1 truncate text-center font-medium text-slate-200">{name}</span>
              <AddArrow direction="right" color={awayTeam.color} onClick={() => onAddAway(name)} title={`Adicionar a ${awayTeam.name}`} />
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-white/10 p-2">
        <input
          type="text" value={newName}
          onChange={e => onNewName(e.target.value)}
          placeholder="Novo jogador…"
          className="field mb-1 w-full px-2 py-1 text-xs"
        />
        <div className="flex gap-1">
          <button
            type="button" onClick={onAddNewToHome}
            className="flex-1 rounded-md px-2 py-1 text-[10px] font-bold transition hover:brightness-125"
            style={{ backgroundColor: homeTeam.color, color: textOn(homeTeam.color) }}
          >← {homeTeam.shortName}</button>
          <button
            type="button" onClick={onAddNewToAway}
            className="flex-1 rounded-md px-2 py-1 text-[10px] font-bold transition hover:brightness-125"
            style={{ backgroundColor: awayTeam.color, color: textOn(awayTeam.color) }}
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
      className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold transition hover:scale-110 hover:brightness-125"
      style={{ backgroundColor: color, color: textOn(color) }}
    >
      {direction === 'left' ? '←' : '→'}
    </button>
  );
}

function RemoveArrow({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      type="button" onClick={onClick} title="Remover"
      className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-xs font-bold text-slate-300 transition hover:bg-rose-500/30 hover:text-white"
    >
      {direction === 'left' ? '←' : '→'}
    </button>
  );
}
