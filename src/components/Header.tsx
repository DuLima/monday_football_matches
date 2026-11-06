import { useLayoutEffect, useRef, useState } from 'react';
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

type Box = { left: number; width: number };

export function Header({ active, onChange }: Props) {
  const navRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<Box | null>(null);

  // Keep the sliding pill under the active tab, including on resize.
  useLayoutEffect(() => {
    const el = navRef.current?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (!el) return;
    const ro = new ResizeObserver(() => setIndicator({ left: el.offsetLeft, width: el.offsetWidth }));
    ro.observe(el);
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    return () => ro.disconnect();
  }, [active]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-red to-chiti shadow-[0_8px_30px_-6px_rgb(244_63_94/0.7)]">
            <WandBallIcon size={30} />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-red">Segundas</div>
            <div className="-mt-0.5 font-display text-lg font-bold leading-tight tracking-tight text-white">Mágicas</div>
          </div>
        </div>

        <div className="order-3 w-full overflow-x-auto sm:order-none sm:ml-4 sm:w-auto [scrollbar-width:none]">
          <nav
            ref={navRef}
            className="relative flex w-max items-center gap-1 rounded-full bg-white/5 p-1 ring-1 ring-white/10"
          >
            {indicator && (
              <span
                aria-hidden="true"
                className="absolute inset-y-1 rounded-full bg-gradient-to-r from-brand-red to-chiti shadow-[0_6px_20px_-4px_rgb(244_63_94/0.7)] transition-all duration-300 ease-out"
                style={{ left: indicator.left, width: indicator.width }}
              />
            )}
            {TABS.map(tab => {
              const isActive = tab.id === active;
              return (
                <button
                  key={tab.id}
                  data-tab={tab.id}
                  type="button"
                  onClick={() => onChange(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={
                    'relative z-10 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ' +
                    (isActive ? 'text-white' : 'text-slate-400 hover:text-white')
                  }
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <OwnerBar />
        </div>
      </div>
    </header>
  );
}
