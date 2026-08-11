import { useAuth } from '../firebase/auth';

export function OwnerBar() {
  const { enabled, loading, user, isOwner, signIn, signOutNow } = useAuth();
  if (!enabled) return null;
  if (loading) return null;

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
