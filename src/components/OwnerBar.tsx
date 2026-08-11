import { useState } from 'react';
import { season as staticSeason } from '../data/season';
import { useAuth } from '../firebase/auth';
import { useSeason } from '../firebase/season';

export function OwnerBar() {
  const { enabled, loading, user, isOwner, signIn, signOutNow } = useAuth();
  const { saveSeason } = useSeason();
  const [resetting, setResetting] = useState(false);

  if (!enabled) return null;
  if (loading) return null;

  async function onReset() {
    const ok = window.confirm(
      'Repor os dados da época?\n\n' +
      'Esta ação apaga todos os jogos, resultados, convocatórias e MOTMs guardados. ' +
      'Ficam apenas os dados iniciais (jogo de 10/08 + próximas segundas por jogar).',
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

  return (
    <div className="flex items-center gap-2 text-xs">
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
            <button
              type="button"
              onClick={onReset}
              disabled={resetting}
              className="rounded-full bg-white px-3 py-1 text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50 disabled:opacity-60"
              title="Repor os dados da época ao seed inicial"
            >
              {resetting ? 'A repor…' : 'Repor época'}
            </button>
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
