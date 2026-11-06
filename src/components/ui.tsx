import { useEffect, useRef, useState, type ReactNode } from 'react';

export function SectionTitle({ eyebrow, children }: { eyebrow?: string; children: ReactNode }) {
  return (
    <div className="animate-fade-up">
      {eyebrow && (
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-red">{eyebrow}</div>
      )}
      <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {children}
      </h2>
      <div className="mt-2 h-1 w-14 origin-left animate-grow-x rounded-full bg-gradient-to-r from-brand-red via-chiti to-grilo" />
    </div>
  );
}

/** Animates a number from its previous value to `value`. */
export function CountUp({ value, decimals = 0, duration = 900 }: { value: number; decimals?: number; duration?: number }) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const total = reduced ? 0 : duration;
    const start = performance.now();
    const origin = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const p = total ? Math.min(1, (t - start) / total) : 1;
      const eased = 1 - Math.pow(1 - p, 3);
      const v = origin + (value - origin) * eased;
      from.current = v;
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{shown.toFixed(decimals)}</>;
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="card p-8 text-center text-sm text-slate-400">{children}</div>
  );
}
