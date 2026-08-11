import { WandBallIcon } from './icons/WandBallIcon';
import { OwnerBar } from './OwnerBar';

export type TabId = 'stats' | 'charts' | 'monthly' | 'players' | 'results';

const TABS: { id: TabId; label: string }[] = [
  { id: 'stats',    label: 'Estatísticas' },
  { id: 'charts',   label: 'Gráficos' },
  { id: 'monthly',  label: 'Mensal' },
  { id: 'players',  label: 'Jogadores' },
  { id: 'results',  label: 'Resultados' },
];

type Props = {
  active: TabId;
  onChange: (id: TabId) => void;
};

export function Header({ active, onChange }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-page-cream/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red shadow-sm ring-1 ring-brand-red-ring">
            <WandBallIcon size={30} />
          </div>
          <div className="text-brand-dark">
            <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-red">Segundas</div>
            <div className="-mt-0.5 text-base font-bold tracking-tight">Mágicas</div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 order-3 sm:order-none">
          <OwnerBar />
        </div>

        <nav className="flex w-full flex-wrap items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm sm:ml-4 sm:w-auto">
          {TABS.map(tab => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={
                  'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:text-sm ' +
                  (isActive
                    ? 'bg-brand-red text-white shadow-sm'
                    : 'text-slate-600 hover:bg-brand-red-soft hover:text-brand-red')
                }
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
