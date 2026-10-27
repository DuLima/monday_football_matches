import { useState } from 'react';
import type { Injury } from '../data/types';
import { useSeason } from '../firebase/season';

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

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={onClose}>
      <div className="mt-16 w-full max-w-md rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {isEdit ? 'Editar lesão' : 'Introduzir lesão'}
            </div>
            <div className="text-lg font-bold text-brand-dark">{name}</div>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Fechar">✕</button>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Tipo de lesão</label>
            <select
              value={preset}
              onChange={e => setPreset(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
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
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
              />
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Data prevista de regresso</label>
            <input
              type="date"
              value={expectedReturn}
              onChange={e => setExpectedReturn(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
            />
          </div>

          {error && <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">{error}</div>}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-6 py-4">
          <div>
            {isEdit && (
              <button
                type="button" onClick={onRemove} disabled={saving}
                className="rounded-md px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
              >
                Remover lesão
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button" onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="button" onClick={onSave} disabled={saving}
              className="rounded-md bg-brand-red px-5 py-2 text-sm font-bold text-white shadow hover:bg-rose-700 disabled:opacity-60"
            >
              {saving ? 'A guardar…' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
