import type { Season, Match, TeamId } from './types';

const CHITI: TeamId = 'chiti';
const GRILO: TeamId = 'grilo';

const VENUE = 'Colégio Planalto';

const chitiRoster = [
  'Avante', 'Vinicius', 'Diogo Massano', 'Luis Chiti', 'Duarte Lima',
  'Pedro Martinho', 'Gonçalo Massano', 'Anderson Sá',
];
const griloRoster = [
  'José (GK)', 'Peres', 'Tempero', 'Garcia', 'Wilson Neto', 'João Tiago',
  'Diogo Correia', 'Filipe Oliveira',
];

const played = (
  id: string,
  date: string,
  homeScore: number,
  awayScore: number,
  motm?: string,
  extras: Partial<Match> = {},
): Match => ({
  id,
  date,
  status: 'played',
  homeTeam: CHITI,
  awayTeam: GRILO,
  homeScore,
  awayScore,
  venue: VENUE,
  players: { chiti: chitiRoster, grilo: griloRoster },
  motm,
  ...extras,
});

const scheduled = (id: string, date: string): Match => ({
  id,
  date,
  status: 'scheduled',
  homeTeam: CHITI,
  awayTeam: GRILO,
  venue: VENUE,
});

const matches: Match[] = [
  played('m01', '2026-08-10', 8, 8),

  scheduled('s01', '2026-08-17'),
  scheduled('s02', '2026-08-24'),
  scheduled('s03', '2026-08-31'),
  scheduled('s04', '2026-09-07'),
  scheduled('s05', '2026-09-14'),
  scheduled('s06', '2026-09-21'),
  scheduled('s07', '2026-09-28'),
  scheduled('s08', '2026-10-05'),
  scheduled('s09', '2026-10-12'),
  scheduled('s10', '2026-10-19'),
  scheduled('s11', '2026-10-26'),
  scheduled('s12', '2026-11-02'),
  scheduled('s13', '2026-11-09'),
  scheduled('s14', '2026-11-16'),
  scheduled('s15', '2026-11-23'),
  scheduled('s16', '2026-11-30'),
  scheduled('s17', '2026-12-07'),
  scheduled('s18', '2026-12-14'),
  scheduled('s19', '2026-12-21'),
  scheduled('s20', '2026-12-28'),
];

export const season: Season = {
  year: 2026,
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  teams: {
    chiti: {
      id: 'chiti',
      name: 'SL Amigos do Chiti',
      shortName: 'Chiti',
      logo: '/logos/chiti.png',
      color: '#c0392b',
      colorSoft: '#f5b7b1',
    },
    grilo: {
      id: 'grilo',
      name: 'Túnel do Grilo FC',
      shortName: 'Grilo',
      logo: '/logos/grilo.png',
      color: '#1f4e78',
      colorSoft: '#a9c4de',
    },
  },
  matches,
};
