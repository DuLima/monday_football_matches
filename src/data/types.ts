export type TeamId = 'chiti' | 'grilo';

export type Team = {
  id: TeamId;
  name: string;
  shortName: string;
  logo: string;
  color: string;
  colorSoft: string;
};

export type MatchStatus = 'played' | 'cancelled' | 'scheduled';

export type MatchPlayer = { name: string; goals?: number; ownGoals?: number };
export type PlayerEntry = string | MatchPlayer;

export type Match = {
  id: string;
  date: string;
  status: MatchStatus;
  homeTeam: TeamId;
  awayTeam: TeamId;
  homeScore?: number;
  awayScore?: number;
  venue?: string;
  players?: Partial<Record<TeamId, PlayerEntry[]>>;
  goalkeeper?: Partial<Record<TeamId, string>>;
  motm?: string;
};

export function playerName(p: PlayerEntry): string {
  return typeof p === 'string' ? p : p.name;
}
export function playerGoals(p: PlayerEntry): number {
  return typeof p === 'string' ? 0 : (p.goals ?? 0);
}
export function playerOwnGoals(p: PlayerEntry): number {
  return typeof p === 'string' ? 0 : (p.ownGoals ?? 0);
}

export type Season = {
  year: number;
  startDate: string;
  endDate: string;
  teams: Record<TeamId, Team>;
  matches: Match[];
};
