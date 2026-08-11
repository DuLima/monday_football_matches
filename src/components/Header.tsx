export type TabId = 'stats' | 'charts' | 'monthly' | 'players' | 'results';

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'stats',    label: 'Estatísticas', icon: '📊' },
  { id: 'charts',   label: 'Gráficos',     icon: '📈' },
  { id: 'monthly',  label: 'Mensal',       icon: '🗓️' },
  { id: 'players',  label: 'Jogadores',    icon: '👤' },
  { id: 'results',  label: 'Resultados',   icon: '📋' },
];

type Props = {
  active: TabId;
  onChange: (id: TabId) => void;
};

export function Header({ active, onChange }: Props) {
  return (
    <header className="sticky top-0 z-30 overflow-hidden bg-gradient-to-b from-[#073615] to-[#0b4d1f] shadow-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 overflow-hidden px-4 py-2">
        <div className="flex items-center gap-3 pr-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0e6b2b] text-2xl font-bold text-white shadow-inner ring-2 ring-lime-400/40">
            ⚽
          </div>
          <div className="hidden text-white sm:block">
            <div className="text-xs font-semibold uppercase tracking-widest text-lime-300">Segundas</div>
            <div className="-mt-0.5 text-lg font-black tracking-wider">Mágicas</div>
          </div>
        </div>
        <nav className="flex flex-1 flex-wrap items-center gap-1 overflow-hidden">
          {TABS.map(tab => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={
                  'group relative flex items-center gap-1.5 whitespace-nowrap rounded-t-md px-2.5 py-2 text-xs font-semibold transition sm:gap-2 sm:px-4 sm:py-3 sm:text-sm ' +
                  (isActive
                    ? 'bg-white/5 text-lime-300 ring-1 ring-lime-400/40'
                    : 'text-white/80 hover:bg-white/5 hover:text-white')
                }
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {isActive && <span className="absolute -bottom-[2px] left-0 h-[3px] w-full rounded-full bg-lime-400" />}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
