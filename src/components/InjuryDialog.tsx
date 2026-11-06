import { useState } from 'react';
import type { Injury } from '../data/types';
import { useSeason } from '../firebase/season';
import { todayISO } from '../lib/format';

type Props = {
  name: string;
  current: Injury | undefined;
  onClose: () => void;
};

const COMMON_TYPES = [
  'Rotura muscular',
  'Rotura dos ligamentos do joelho',
  'Entorse',
  'Luxação',
  'Fractura',
  'Lesão ligamentar',
  'Tendinite',
  'Contusão',
  'Outra',
];

export function InjuryDialog({ name, current, onClose }: Props) {
  const { saveInjury, removeInjury } = useSeason();
  const initialPreset = current && COMMON_TYPES.includes(current.type) ? current.type : (current ? 'Outra' : '');
  const [preset, setPreset] = useState<string>(initialPreset);
  const [customType, setCustomType] = useState<string>(current && !COMMON_TYPES.includes(current.type) ? current.type : '');
  const [expectedReturn, setExpectedReturn] = useState<string>(current?.expectedReturn ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!current;
  const type = preset === 'Outra' ? customType : preset;

  async function onSave() {
    setError(null);
    if (!type.trim()) {
      setError('Indica o tipo de lesão.');
      return;
    }
    if (!expectedReturn) {
      setError('Indica a data prevista de regresso.');
      return;
    }
    if (expectedReturn < todayISO()) {
      setError('A data prevista de regresso não pode ser no passado.');
      return;
    }
    setSaving(true);
    try {
      const injury: Injury = {
        type: type.trim(),
        startDate: current?.startDate ?? todayISO(),
        expectedReturn,
      };
      await saveInjury(name, injury);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function onRemove() {
    const ok = window.confirm(`Remover a lesão de ${name}?`);
    if (!ok) return;
    setSaving(true);
    try {
      await removeInjury(name);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex animate-[fade-up_0.2s_ease-out_both] items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="mt-16 w-full max-w-md animate-pop rounded-3xl border border-white/10 bg-ink-900/95 shadow-[0_40px_80px_-20px_rgb(0_0_0/0.9)] backdrop-blur-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-red">
              {isEdit ? 'Editar lesão' : 'Introduzir lesão'}
            </div>
            <div className="mt-0.5 font-display text-lg font-bold text-white">{name}</div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:rotate-90 hover:bg-white/10 hover:text-white" aria-label="Fechar">✕</button>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tipo de lesão</label>
            <select
              value={preset}
              onChange={e => setPreset(e.target.value)}
              className="field w-full px-3 py-2 text-sm"
            >
              <option value="" disabled>Selecciona…</option>
              {COMMON_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {preset === 'Outra' && (
              <input
                type="text"
                value={customType}
                onChange={e => setCustomType(e.target.value)}
                placeholder="Descreve a lesão"
                className="field mt-2 w-full px-3 py-2 text-sm"
              />
            )}
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Data prevista de regresso</label>
            <input
              type="date"
              min={todayISO()}
              value={expectedReturn}
              onChange={e => setExpectedReturn(e.target.value)}
              className="field w-full px-3 py-2 text-sm"
            />
          </div>

          {error && <div className="animate-pop rounded-xl bg-rose-500/10 p-3 text-sm text-rose-300 ring-1 ring-rose-500/30">{error}</div>}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/10 px-6 py-4">
          <div>
            {isEdit && (
              <button
                type="button" onClick={onRemove} disabled={saving}
                className="rounded-full px-3 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-60"
              >
                Remover lesão
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button" onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="button" onClick={onSave} disabled={saving}
              className="rounded-full bg-gradient-to-r from-brand-red to-chiti px-6 py-2 text-sm font-bold text-white shadow-[0_8px_24px_-6px_rgb(244_63_94/0.8)] transition hover:brightness-110 disabled:opacity-60"
            >
              {saving ? 'A guardar…' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
