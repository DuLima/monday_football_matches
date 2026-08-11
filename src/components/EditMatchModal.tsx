import { useMemo, useState } from 'react';
import type { Match, MatchStatus, PlayerEntry, Season, TeamId } from '../data/types';
import { playerGoals, playerName } from '../data/types';
import { useSeason } from '../firebase/season';
import { formatDate } from '../lib/format';

type Props = { match: Match; season: Season; onClose: () => void };

function rosterToText(roster?: PlayerEntry[]): string {
  if (!roster || roster.length === 0) return '';
  return roster.map(e => {
    const n = playerName(e);
    const g = playerGoals(e);
    return g > 0 ? `${n} ${g}` : n;
  }).join('\n');
}

function textToRoster(text: string): PlayerEntry[] {
  return text.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
    // Match trailing integer as goals: "Luis Chiti 2" → { name: 'Luis Chiti', goals: 2 }
    const m = line.match(/^(.*\S)\s+(\d+)$/);
    if (m) return { name: m[1].trim(), goals: parseInt(m[2], 10) };
    return line;
  });
}

export function EditMatchModal({ match, season, onClose }: Props) {
  const { saveMatch } = useSeason();
  const [status, setStatus] = useState<MatchStatus>(match.status);
  const [homeScore, setHomeScore] = useState<string>(match.homeScore?.toString() ?? '');
  const [awayScore, setAwayScore] = useState<string>(match.awayScore?.toString() ?? '');
  const [homeRoster, setHomeRoster] = useState<string>(rosterToText(match.players?.[match.homeTeam]));
  const [awayRoster, setAwayRoster] = useState<string>(rosterToText(match.players?.[match.awayTeam]));
  const [motm, setMotm] = useState<string>(match.motm ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const home = season.teams[match.homeTeam];
  const away = season.teams[match.awayTeam];

  const allNames = useMemo(() => {
    const from = (t: string) => textToRoster(t).map(playerName);
    return Array.from(new Set([...from(homeRoster), ...from(awayRoster)]));
  }, [homeRoster, awayRoster]);

  const totalHomeGoals = useMemo(
    () => textToRoster(homeRoster).reduce((s, p) => s + playerGoals(p), 0),
    [homeRoster],
  );
  const totalAwayGoals = useMemo(
    () => textToRoster(awayRoster).reduce((s, p) => s + playerGoals(p), 0),
    [awayRoster],
  );

  async function onSave() {
    setError(null);
    setSaving(true);
    try {
      const patch: Partial<Match> = {
        status,
        homeScore: status === 'played' && homeScore !== '' ? parseInt(homeScore, 10) : undefined,
        awayScore: status === 'played' && awayScore !== '' ? parseInt(awayScore, 10) : undefined,
        players: status === 'played' ? {
          [match.homeTeam]: textToRoster(homeRoster),
          [match.awayTeam]: textToRoster(awayRoster),
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
        className="mt-8 w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">Editar jogo</div>
            <div className="text-lg font-bold text-slate-800">{formatDate(match.date)} · {home.name} vs {away.name}</div>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 hover:bg-slate-100">✕</button>
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
                  <div className="w-40 text-right text-sm font-semibold" style={{ color: home.color }}>{home.name}</div>
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
                  <div className="w-40 text-sm font-semibold" style={{ color: away.color }}>{away.name}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <RosterField
                  title={home.name} color={home.color}
                  value={homeRoster} onChange={setHomeRoster}
                  goalTotal={totalHomeGoals} expected={homeScore ? parseInt(homeScore, 10) : null}
                />
                <RosterField
                  title={away.name} color={away.color}
                  value={awayRoster} onChange={setAwayRoster}
                  goalTotal={totalAwayGoals} expected={awayScore ? parseInt(awayScore, 10) : null}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">Man of the Match</label>
                <select
                  value={motm}
                  onChange={e => setMotm(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">— nenhum —</option>
                  {allNames.map(n => <option key={n} value={n}>{n}</option>)}
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

function RosterField({
  title, color, value, onChange, goalTotal, expected,
}: {
  title: string; color: string; value: string; onChange: (v: string) => void;
  goalTotal: number; expected: number | null;
}) {
  const mismatch = expected !== null && goalTotal !== expected;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>{title}</label>
        <span className={'text-[11px] font-medium ' + (mismatch ? 'text-rose-600' : 'text-slate-500')}>
          {goalTotal} ⚽{expected !== null ? ` / ${expected}` : ''}
        </span>
      </div>
      <textarea
        rows={8}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={'Um por linha:\nAvante\nLuis Chiti 2\nDuarte Lima 1'}
        className="block w-full resize-y rounded-lg border border-slate-300 p-2 font-mono text-xs focus:border-emerald-500 focus:outline-none"
      />
      <div className="mt-1 text-[10px] text-slate-500">Um por linha. Adiciona um número no fim para golos: <code>Luis Chiti 2</code>.</div>
    </div>
  );
}
