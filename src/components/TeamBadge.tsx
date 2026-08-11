import type { Team } from '../data/types';

const EMOJI_BY_TEAM: Record<string, string> = {
  chiti: '🦅',
  grilo: '🕷️',
};

export function TeamBadge({ team, size = 72 }: { team: Team; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-black text-white shadow-lg ring-2 ring-white/40"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 25%, ${lighten(team.color, 20)}, ${team.color} 65%, ${darken(team.color, 25)} 100%)`,
        fontSize: size * 0.32,
      }}
      title={team.name}
    >
      <span>{EMOJI_BY_TEAM[team.id] ?? '⚽'}</span>
    </div>
  );
}

export function TeamPill({ team }: { team: Team }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white"
      style={{ backgroundColor: team.color }}
    >
      {team.name}
    </span>
  );
}

export function PlayerChip({ team, name, isMotm }: { team: Team; name: string; isMotm?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: team.color }} />
      {name}
      {isMotm && (
        <span className="ml-1 rounded-full bg-amber-100 px-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
          ⭐ MOTM
        </span>
      )}
    </span>
  );
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}
function lighten(hex: string, amt: number) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(r + amt, g + amt, b + amt);
}
function darken(hex: string, amt: number) {
  return lighten(hex, -amt);
}
