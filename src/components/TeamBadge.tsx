import type { Team } from '../data/types';
import { ChitiLogo } from './icons/ChitiLogo';
import { GriloLogo } from './icons/GriloLogo';

export function TeamBadge({ team, size = 72 }: { team: Team; size?: number }) {
  if (team.id === 'chiti') return <ChitiLogo size={size} />;
  if (team.id === 'grilo') return <GriloLogo size={size} />;
  return null;
}
