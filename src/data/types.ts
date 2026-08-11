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

export type Match = {
  id: string;
  date: string;
  status: MatchStatus;
  homeTeam: TeamId;
  awayTeam: TeamId;
  homeScore?: number;
  awayScore?: number;
  venue?: string;
  players?: Partial<Record<TeamId, string[]>>;
  goalkeeper?: Partial<Record<TeamId, string>>;
  motm?: string;
};

export type Season = {
  year: number;
  startDate: string;
  endDate: string;
  teams: Record<TeamId, Team>;
  matches: Match[];
};
