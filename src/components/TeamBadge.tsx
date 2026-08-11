import type { Team } from '../data/types';
import { ChitiLogo } from './icons/ChitiLogo';
import { GriloLogo } from './icons/GriloLogo';

export function TeamBadge({ team, size = 72 }: { team: Team; size?: number }) {
  if (team.id === 'chiti') return <ChitiLogo size={size} />;
  if (team.id === 'grilo') return <GriloLogo size={size} />;
  return null;
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
