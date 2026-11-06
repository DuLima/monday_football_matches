import { useState } from 'react';
import type { Season } from '../data/types';
import { season as staticSeason } from '../data/season';
import { useAuth } from '../firebase/auth';
import { useSeason } from '../firebase/season';

export function OwnerBar() {
  const { enabled, loading, user, isOwner, signIn, signOutNow } = useAuth();
  const { season, saveSeason } = useSeason();
  const [resetting, setResetting] = useState(false);
  const [importing, setImporting] = useState(false);

  if (!enabled) return null;
  if (loading) return null;

  async function onReset() {
    const ok = window.confirm(
      'Repor os dados da época?\n\n' +
      'Esta ação apaga todos os jogos, resultados, convocatórias, MOTMs e lesões guardados. ' +
      'Ficam apenas os dados iniciais.',
    );
    if (!ok) return;
    setResetting(true);
    try {
      await saveSeason(staticSeason);
    } catch (err) {
      alert('Erro ao repor: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setResetting(false);
    }
  }

  async function onImport() {
    const existingDates = new Set(season.matches.map(m => m.date));
    const toAdd = staticSeason.matches.filter(m => !existingDates.has(m.date));
    if (toAdd.length === 0) {
      alert('Nada a importar — todas as datas do histórico já estão na época.');
      return;
    }
    const ok = window.confirm(
      `Adicionar ${toAdd.length} jogo(s) do histórico à época atual?\n\n` +
      'Os jogos que já existem ficam intactos; só se acrescentam os que ainda faltam.',
    );
    if (!ok) return;
    setImporting(true);
    try {
      const merged: Season = {
        ...season,
        matches: [...season.matches, ...toAdd].sort((a, b) => a.date.localeCompare(b.date)),
      };
      await saveSeason(merged);
    } catch (err) {
      alert('Erro ao importar: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {!user && (
        <button
          type="button"
          onClick={() => signIn().catch(err => alert('Erro ao entrar: ' + err.message))}
          className="rounded-full bg-gradient-to-r from-brand-red to-chiti px-4 py-1.5 font-semibold text-white shadow-[0_6px_20px_-6px_rgb(244_63_94/0.8)] transition hover:brightness-110"
        >
          Entrar
        </button>
      )}
      {user && (
        <>
          <span
            className={
              'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ' +
              (isOwner ? 'bg-brand-red-soft text-brand-red ring-1 ring-brand-red-ring' : 'bg-white/5 text-slate-400 ring-1 ring-white/10')
            }
          >
            {isOwner ? 'Modo edição' : 'Só leitura'}
          </span>
          <span className="hidden text-slate-400 lg:inline">{user.email}</span>
          {isOwner && (
            <>
              <button
                type="button"
                onClick={onImport}
                disabled={importing}
                className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-300 ring-1 ring-emerald-400/30 transition hover:bg-emerald-400/20 disabled:opacity-60"
                title="Adicionar os jogos do histórico que ainda não estão gravados"
              >
                {importing ? 'A importar…' : 'Importar histórico'}
              </button>
              <button
                type="button"
                onClick={onReset}
                disabled={resetting}
                className="rounded-full bg-rose-500/10 px-3 py-1 text-rose-300 ring-1 ring-rose-500/30 transition hover:bg-rose-500/20 disabled:opacity-60"
                title="Substituir tudo pelos dados iniciais"
              >
                {resetting ? 'A repor…' : 'Repor época'}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => signOutNow()}
            className="rounded-full bg-white/5 px-3 py-1 text-slate-300 ring-1 ring-white/10 transition hover:bg-white/10"
          >
            Sair
          </button>
        </>
      )}
    </div>
  );
}
