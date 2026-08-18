import type { Match, Season, TeamId } from '../data/types';
import { playerGoals, playerName, playerOwnGoals } from '../data/types';
import { monthKey, monthLabel } from './format';

export type MatchOutcome = 'V' | 'E' | 'D';

export function isPlayed(m: Match): m is Match & { homeScore: number; awayScore: number } {
  return m.status === 'played' && m.homeScore !== undefined && m.awayScore !== undefined;
}

export function outcomeFor(team: TeamId, m: Match): MatchOutcome | null {
  if (!isPlayed(m)) return null;
  const teamScore = team === m.homeTeam ? m.homeScore : m.awayScore;
  const oppScore = team === m.homeTeam ? m.awayScore : m.homeScore;
  if (teamScore > oppScore) return 'V';
  if (teamScore < oppScore) return 'D';
  return 'E';
}

export function goalsFor(team: TeamId, m: Match): number {
  if (!isPlayed(m)) return 0;
  return team === m.homeTeam ? m.homeScore : m.awayScore;
}
export function goalsAgainst(team: TeamId, m: Match): number {
  if (!isPlayed(m)) return 0;
  return team === m.homeTeam ? m.awayScore : m.homeScore;
}

export type TeamStats = {
  team: TeamId;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  ppg: number;
  gpg: number;
  goalsPerWin: number;
  form: MatchOutcome[];
};

export function teamStats(team: TeamId, matches: Match[]): TeamStats {
  const played = matches.filter(isPlayed);
  const sorted = played.slice().sort((a, b) => a.date.localeCompare(b.date));
  let wins = 0, draws = 0, losses = 0, gf = 0, ga = 0;
  for (const m of played) {
    const o = outcomeFor(team, m)!;
    if (o === 'V') wins++;
    else if (o === 'E') draws++;
    else losses++;
    gf += goalsFor(team, m);
    ga += goalsAgainst(team, m);
  }
  const pts = wins * 3 + draws;
  const form: MatchOutcome[] = sorted.slice(-5).map(m => outcomeFor(team, m)!);
  return {
    team,
    played: played.length,
    wins, draws, losses,
    goalsFor: gf,
    goalsAgainst: ga,
    goalDiff: gf - ga,
    points: pts,
    ppg: played.length ? pts / played.length : 0,
    gpg: played.length ? gf / played.length : 0,
    goalsPerWin: wins ? gf / wins : 0,
    form,
  };
}

export function seasonProgress(season: Season, today: Date) {
  const start = new Date(season.startDate);
  const end = new Date(season.endDate);
  const total = season.matches.length;
  const played = season.matches.filter(m => m.status === 'played').length;
  const cancelled = season.matches.filter(m => m.status === 'cancelled').length;
  const scheduled = total - played - cancelled;
  const elapsedMs = Math.max(0, Math.min(today.getTime(), end.getTime()) - start.getTime());
  const totalMs = end.getTime() - start.getTime();
  const seasonPct = Math.round((elapsedMs / totalMs) * 100);
  return {
    played,
    cancelled,
    scheduled,
    total,
    playedPct: Math.round((played / total) * 100),
    cancelledPct: Math.round((cancelled / total) * 100),
    scheduledPct: Math.round((scheduled / total) * 100),
    seasonPct,
  };
}

export function nextMatch(season: Season, today: Date): Match | null {
  const upcoming = season.matches
    .filter(m => m.status === 'scheduled' && new Date(m.date) >= new Date(today.toDateString()))
    .sort((a, b) => a.date.localeCompare(b.date));
  return upcoming[0] ?? null;
}

export type MonthGroup = {
  key: string;
  label: string;
  matches: Match[];
};

export function groupByMonth(matches: Match[]): MonthGroup[] {
  const map = new Map<string, Match[]>();
  for (const m of matches) {
    const k = monthKey(m.date);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(m);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, ms]) => ({ key, label: monthLabel(key), matches: ms }));
}

export type Rankings = {
  highestScoring: { match: Match; total: number } | null;
  lowestScoring: { match: Match; total: number } | null;
  biggestWin: { match: Match; margin: number; winner: TeamId } | null;
  bestStreak: { team: TeamId; length: number; from: string; to: string } | null;
  monthMostGoals: { key: string; label: string; goals: number; games: number } | null;
  monthLeastGoals: { key: string; label: string; goals: number; games: number } | null;
  averageGoals: { avg: number; total: number; games: number };
};

export function computeRankings(season: Season): Rankings {
  const played = season.matches.filter(isPlayed);
  if (played.length === 0) {
    return {
      highestScoring: null,
      lowestScoring: null,
      biggestWin: null,
      bestStreak: null,
      monthMostGoals: null,
      monthLeastGoals: null,
      averageGoals: { avg: 0, total: 0, games: 0 },
    };
  }

  let highest = played[0], lowest = played[0];
  let biggest = played[0];
  for (const m of played) {
    const total = m.homeScore! + m.awayScore!;
    if (total > highest.homeScore! + highest.awayScore!) highest = m;
    if (total < lowest.homeScore! + lowest.awayScore!) lowest = m;
    const margin = Math.abs(m.homeScore! - m.awayScore!);
    const bigMargin = Math.abs(biggest.homeScore! - biggest.awayScore!);
    if (margin > bigMargin) biggest = m;
  }

  const streak = bestWinStreak(played);

  const months = groupByMonth(played);
  const monthTotals = months.map(g => ({
    key: g.key,
    label: g.label,
    games: g.matches.length,
    goals: g.matches.reduce((s, m) => s + m.homeScore! + m.awayScore!, 0),
  }));
  const mostMonth = monthTotals.slice().sort((a, b) => b.goals - a.goals)[0];
  const leastMonth = monthTotals.slice().sort((a, b) => a.goals - b.goals)[0];

  const totalGoals = played.reduce((s, m) => s + m.homeScore! + m.awayScore!, 0);

  return {
    highestScoring: { match: highest, total: highest.homeScore! + highest.awayScore! },
    lowestScoring: { match: lowest, total: lowest.homeScore! + lowest.awayScore! },
    biggestWin: {
      match: biggest,
      margin: Math.abs(biggest.homeScore! - biggest.awayScore!),
      winner: biggest.homeScore! > biggest.awayScore! ? biggest.homeTeam : biggest.awayTeam,
    },
    bestStreak: streak,
    monthMostGoals: mostMonth,
    monthLeastGoals: leastMonth,
    averageGoals: {
      avg: totalGoals / played.length,
      total: totalGoals,
      games: played.length,
    },
  };
}

function bestWinStreak(played: Match[]): Rankings['bestStreak'] {
  const sorted = played.slice().sort((a, b) => a.date.localeCompare(b.date));
  const teams: TeamId[] = ['chiti', 'grilo'];
  let best: Rankings['bestStreak'] = null;
  for (const t of teams) {
    let cur = 0;
    let curFrom = '';
    for (const m of sorted) {
      const o = outcomeFor(t, m);
      if (o === 'V') {
        if (cur === 0) curFrom = m.date;
        cur++;
        if (!best || cur > best.length) {
          best = { team: t, length: cur, from: curFrom, to: m.date };
        }
      } else {
        cur = 0;
      }
    }
  }
  return best;
}

export type PlayerStat = {
  name: string;
  games: number;
  perTeam: Partial<Record<TeamId, number>>;
  motm: number;
  wins: number;
  draws: number;
  losses: number;
  winPct: number;
  goals: number;
  ownGoals: number;
};

export function playerStats(season: Season): PlayerStat[] {
  const map = new Map<string, PlayerStat>();
  for (const m of season.matches) {
    if (!m.players) continue;
    for (const team of Object.keys(m.players) as TeamId[]) {
      const roster = m.players[team] ?? [];
      const outcome = isPlayed(m) ? outcomeFor(team, m) : null;
      for (const entry of roster) {
        const name = playerName(entry);
        const goals = playerGoals(entry);
        const og = playerOwnGoals(entry);
        const stat = map.get(name) ?? {
          name, games: 0, perTeam: {}, motm: 0, wins: 0, draws: 0, losses: 0, winPct: 0, goals: 0, ownGoals: 0,
        };
        stat.games += 1;
        stat.perTeam[team] = (stat.perTeam[team] ?? 0) + 1;
        stat.goals += goals;
        stat.ownGoals += og;
        if (outcome === 'V') stat.wins++;
        else if (outcome === 'E') stat.draws++;
        else if (outcome === 'D') stat.losses++;
        if (m.motm === name) stat.motm++;
        map.set(name, stat);
      }
    }
  }
  const out = Array.from(map.values());
  for (const p of out) {
    p.winPct = p.games ? Math.round((p.wins / p.games) * 100) : 0;
  }
  return out.sort((a, b) => b.games - a.games || b.wins - a.wins);
}

export type TopScorerSeries = {
  name: string;
  totalGoals: number;
  cumulative: number[];
};

function matchHasScorerData(m: Match): boolean {
  if (!m.players) return false;
  for (const t of Object.keys(m.players) as TeamId[]) {
    for (const p of m.players[t] ?? []) {
      if (playerGoals(p) > 0) return true;
    }
  }
  return false;
}

export function topScorersOverTime(season: Season, limit = 5): { dates: string[]; series: TopScorerSeries[] } {
  const played = season.matches
    .filter(isPlayed)
    .filter(matchHasScorerData)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));
  const perMatch = new Map<string, number[]>();
  played.forEach((m, i) => {
    if (!m.players) return;
    for (const t of Object.keys(m.players) as TeamId[]) {
      for (const entry of m.players[t] ?? []) {
        const name = playerName(entry);
        const g = playerGoals(entry);
        if (g === 0) continue;
        if (!perMatch.has(name)) perMatch.set(name, new Array(played.length).fill(0));
        perMatch.get(name)![i] += g;
      }
    }
  });
  const series: TopScorerSeries[] = Array.from(perMatch.entries()).map(([name, arr]) => {
    let cum = 0;
    const cumulative = arr.map(g => { cum += g; return cum; });
    return { name, totalGoals: cum, cumulative };
  });
  return {
    dates: played.map(m => m.date),
    series: series.sort((a, b) => b.totalGoals - a.totalGoals).slice(0, limit),
  };
}

export function ownGoalsByTeam(season: Season): Record<TeamId, number> {
  const totals: Record<TeamId, number> = { chiti: 0, grilo: 0 };
  for (const m of season.matches) {
    if (!m.players) continue;
    for (const team of Object.keys(m.players) as TeamId[]) {
      for (const entry of m.players[team] ?? []) {
        totals[team] += playerOwnGoals(entry);
      }
    }
  }
  return totals;
}

export type TopOgPlayer = { name: string; ownGoals: number; team: TeamId };
export function topOwnGoalPlayers(season: Season): TopOgPlayer[] {
  const players = playerStats(season).filter(p => p.ownGoals > 0);
  return players
    .map(p => {
      const teams = (Object.entries(p.perTeam) as [TeamId, number][])
        .sort((a, b) => b[1] - a[1]);
      return { name: p.name, ownGoals: p.ownGoals, team: teams[0]?.[0] ?? 'chiti' };
    })
    .sort((a, b) => b.ownGoals - a.ownGoals);
}
