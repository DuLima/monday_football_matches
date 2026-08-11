import { useAuth } from '../firebase/auth';

export function OwnerBar() {
  const { enabled, loading, user, isOwner, signIn, signOutNow } = useAuth();
  if (!enabled) return null;
  if (loading) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-white/80">
      {!user && (
        <button
          type="button"
          onClick={() => signIn().catch(err => alert('Erro ao entrar: ' + err.message))}
          className="rounded-md bg-white/10 px-3 py-1.5 font-semibold text-white ring-1 ring-white/20 hover:bg-white/15"
        >
          Entrar
        </button>
      )}
      {user && (
        <>
          <span
            className={
              'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ' +
              (isOwner ? 'bg-lime-400/20 text-lime-300 ring-1 ring-lime-400/40' : 'bg-white/10 text-white/70')
            }
          >
            {isOwner ? 'Modo edição' : 'Só leitura'}
          </span>
          <span className="hidden sm:inline text-white/70">{user.email}</span>
          <button
            type="button"
            onClick={() => signOutNow()}
            className="rounded-md bg-white/10 px-2 py-1 text-white/80 ring-1 ring-white/20 hover:bg-white/15"
          >
            Sair
          </button>
        </>
      )}
    </div>
  );
}
