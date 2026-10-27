import type { Injury, Season } from '../data/types';

export function getInjury(season: Season, name: string): Injury | undefined {
  return season.injuries?.[name];
}

export function isInjured(season: Season, name: string): boolean {
  const inj = getInjury(season, name);
  if (!inj) return false;
  const today = new Date().toISOString().slice(0, 10);
  return inj.expectedReturn >= today;
}

export function daysUntilReturn(injury: Injury): number {
  const today = new Date();
  const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const [y, m, d] = injury.expectedReturn.split('-').map(Number);
  const retUTC = Date.UTC(y, m - 1, d);
  const ms = retUTC - todayUTC;
  return Math.max(0, Math.round(ms / 86400000));
}

export function formatTimeGone(injury: Injury): string {
  const days = daysUntilReturn(injury);
  if (days === 0) return 'Regressa hoje';
  if (days === 1) return '1 dia';
  if (days < 14) return `${days} dias`;
  const weeks = Math.round(days / 7);
  return `${weeks} semanas`;
}

export function activeInjuries(season: Season): Array<{ name: string; injury: Injury }> {
  const map = season.injuries ?? {};
  const today = new Date().toISOString().slice(0, 10);
  return Object.entries(map)
    .filter(([, inj]) => inj.expectedReturn >= today)
    .map(([name, injury]) => ({ name, injury }))
    .sort((a, b) => a.injury.expectedReturn.localeCompare(b.injury.expectedReturn));
}
