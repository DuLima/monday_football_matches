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
      'Esta ação apaga todos os jogos, resultados, convocatórias e MOTMs guardados. ' +
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
          className="rounded-full bg-brand-red px-3 py-1.5 font-semibold text-white shadow-sm ring-1 ring-brand-red-ring hover:bg-rose-700"
        >
          Entrar
        </button>
      )}
      {user && (
        <>
          <span
            className={
              'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ' +
              (isOwner ? 'bg-brand-red-soft text-brand-red ring-1 ring-brand-red-ring' : 'bg-slate-100 text-slate-600')
            }
          >
            {isOwner ? 'Modo edição' : 'Só leitura'}
          </span>
          <span className="hidden text-slate-500 sm:inline">{user.email}</span>
          {isOwner && (
            <>
              <button
                type="button"
                onClick={onImport}
                disabled={importing}
                className="rounded-full bg-white px-3 py-1 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-50 disabled:opacity-60"
                title="Adicionar os jogos do histórico que ainda não estão gravados"
              >
                {importing ? 'A importar…' : 'Importar histórico'}
              </button>
              <button
                type="button"
                onClick={onReset}
                disabled={resetting}
                className="rounded-full bg-white px-3 py-1 text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50 disabled:opacity-60"
                title="Substituir tudo pelos dados iniciais"
              >
                {resetting ? 'A repor…' : 'Repor época'}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => signOutNow()}
            className="rounded-full bg-white px-3 py-1 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Sair
          </button>
        </>
      )}
    </div>
  );
}
