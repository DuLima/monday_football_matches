import type { Season, Match, TeamId } from './types';

const CHITI: TeamId = 'chiti';
const GRILO: TeamId = 'grilo';

const VENUE = 'Colégio Planalto';

const chitiRoster = [
  'Avante', 'Vinicius', 'Diogo Massano', 'Luis Chiti', 'Duarte Lima',
  'Pedro Martinho', 'Gonçalo Massano', 'Anderson Sá', 'Rui Chiti', 'Zé Pinto',
];
const griloRoster = [
  'José (GK)', 'Peres', 'Tempero', 'Garcia', 'Wilson Neto', 'João Tiago',
  'Diogo Correia', 'Filipe Oliveira', 'Pedro Melo', 'Figueiredo',
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
  players: { chiti: chitiRoster.slice(0, 8), grilo: griloRoster.slice(0, 8) },
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
  played('m01', '2026-01-05', 5, 9),
  played('m02', '2026-01-12', 6, 8, 'Peres'),
  played('m03', '2026-01-19', 4, 7),
  played('m04', '2026-01-26', 5, 5),
  played('m05', '2026-02-02', 8, 7),
  played('m06', '2026-02-09', 7, 8),
  played('m07', '2026-02-16', 8, 7),
  played('m08', '2026-02-23', 8, 7, 'Avante'),
  played('m09', '2026-03-02', 8, 10),
  played('m10', '2026-03-09', 7, 8),
  played('m11', '2026-03-16', 6, 5, 'Duarte Lima'),
  played('m12', '2026-03-23', 7, 16),
  played('m13', '2026-03-30', 15, 15, 'Avante'),

  played('m14', '2026-04-06', 9, 6),
  played('m15', '2026-04-13', 11, 8),
  played('m16', '2026-04-27', 7, 5),
  scheduled('c01', '2026-04-20'),

  played('m17', '2026-05-04', 9, 6, 'Anderson Sá'),
  played('m18', '2026-05-18', 4, 6),
  played('m19', '2026-05-25', 2, 4),
  scheduled('c02', '2026-05-11'),

  played('m20', '2026-06-01', 2, 10),
  played('m21', '2026-06-08', 6, 8),
  played('m22', '2026-06-15', 6, 4, 'Gonçalo Massano'),
  played('m23', '2026-06-22', 8, 8),
  played('m24', '2026-06-29', 4, 4, 'Avante'),

  played('m25', '2026-07-13', 10, 7),
  played('m26', '2026-07-20', 4, 6, 'Garcia', {
    players: {
      chiti: [
        'Avante', 'Vinicius',
        { name: 'Diogo Massano', goals: 1 },
        { name: 'Luis Chiti', goals: 2 },
        { name: 'Duarte Lima', goals: 1 },
        'Pedro Martinho', 'Gonçalo Massano', 'Anderson Sá',
      ],
      grilo: [
        'José (GK)',
        { name: 'Peres', goals: 1 },
        { name: 'Tempero', goals: 1 },
        { name: 'Garcia', goals: 3 },
        'Wilson Neto', 'João Tiago',
        { name: 'Diogo Correia', goals: 1 },
        'Filipe Oliveira',
      ],
    },
  }),
  scheduled('c03', '2026-07-06'),
  scheduled('c04', '2026-07-27'),

  scheduled('s01', '2026-08-17'),
  scheduled('s02', '2026-08-24'),
  scheduled('s03', '2026-08-31'),
  scheduled('s04', '2026-09-07'),
  scheduled('s05', '2026-09-14'),
  scheduled('s06', '2026-09-21'),
  scheduled('s07', '2026-09-28'),
  scheduled('c05', '2026-08-10'),
  scheduled('c06', '2026-08-03'),
  scheduled('c07', '2026-09-10'),
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
