import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import type { Season } from '../data/types';
import { isPlayed, outcomeFor, teamStats, groupByMonth } from '../lib/stats';
import { monthLabel } from '../lib/format';

const COLOR_CHITI = '#c0392b';
const COLOR_GRILO = '#1f4e78';
const COLOR_DRAW = '#f5b100';
const COLOR_TOTAL = '#8e44ad';

export function Charts({ season }: { season: Season }) {
  const chiti = teamStats('chiti', season.matches);
  const grilo = teamStats('grilo', season.matches);

  const wdData = [
    { name: season.teams.chiti.name, value: chiti.wins, fill: COLOR_CHITI },
    { name: 'Empates', value: chiti.draws, fill: COLOR_DRAW },
    { name: season.teams.grilo.name, value: grilo.wins, fill: COLOR_GRILO },
  ];
  const goalsData = [
    { name: season.teams.chiti.name, value: chiti.goalsFor, fill: COLOR_CHITI },
    { name: season.teams.grilo.name, value: grilo.goalsFor, fill: COLOR_GRILO },
  ];

  const months = groupByMonth(season.matches.filter(isPlayed));
  const monthlyGoals = months.map(g => {
    const chi = g.matches.reduce((s, m) => s + (m.homeTeam === 'chiti' ? m.homeScore! : m.awayScore!), 0);
    const gri = g.matches.reduce((s, m) => s + (m.homeTeam === 'grilo' ? m.homeScore! : m.awayScore!), 0);
    return {
      label: g.label,
      Chiti: chi,
      Grilo: gri,
      Total: chi + gri,
    };
  });

  const monthlyResults = months.map(g => {
    let chiWins = 0, griWins = 0, draws = 0;
    for (const m of g.matches) {
      const o = outcomeFor('chiti', m);
      if (o === 'V') chiWins++;
      else if (o === 'D') griWins++;
      else if (o === 'E') draws++;
    }
    return { label: g.label, Chiti: chiWins, Grilo: griWins, Empates: draws };
  });

  return (
    <div className="space-y-8">
      <section>
        <SectionTitle>Gráficos Gerais</SectionTitle>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel title="Vitórias / Empates">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wdData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
          <Panel title="Golos">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={goalsData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </div>
      </section>

      <section>
        <SectionTitle>Gráficos Mensais</SectionTitle>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel title="Golos Marcados por Mês">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyGoals}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Chiti" stroke={COLOR_CHITI} strokeWidth={2.5} name={season.teams.chiti.name} />
                <Line type="monotone" dataKey="Grilo" stroke={COLOR_GRILO} strokeWidth={2.5} name={season.teams.grilo.name} />
                <Line type="monotone" dataKey="Total" stroke={COLOR_TOTAL} strokeWidth={2} strokeDasharray="5 5" name="Total de Golos" />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
          <Panel title="Resultados Mensais">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyResults}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Chiti" stroke={COLOR_CHITI} strokeWidth={2.5} name={`Vitórias ${season.teams.chiti.name}`} />
                <Line type="monotone" dataKey="Grilo" stroke={COLOR_GRILO} strokeWidth={2.5} name={`Vitórias ${season.teams.grilo.name}`} />
                <Line type="monotone" dataKey="Empates" stroke={COLOR_DRAW} strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="relative inline-block pb-1 text-2xl font-bold text-slate-800">
      {children}
      <span className="absolute -bottom-0.5 left-0 h-1 w-16 rounded-full bg-lime-500" />
    </h2>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-center text-sm font-bold text-slate-700">{title}</div>
      {children}
    </div>
  );
}

// keep monthLabel import used
void monthLabel;
