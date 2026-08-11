import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import type { Season } from '../data/types';
import { groupByMonth, isPlayed, outcomeFor, teamStats } from '../lib/stats';

const COLOR_CHITI = '#c0392b';
const COLOR_GRILO = '#1f4e78';
const COLOR_DRAW = '#f5b100';
const COLOR_TOTAL = '#8e44ad';

const BASE_CHART: Highcharts.ChartOptions = {
  backgroundColor: 'transparent',
  style: { fontFamily: 'inherit' },
  spacingTop: 8,
  spacingBottom: 8,
};

const NO_CREDITS = { enabled: false };

export function Charts({ season }: { season: Season }) {
  const chiti = teamStats('chiti', season.matches);
  const grilo = teamStats('grilo', season.matches);

  const winsDraws: Highcharts.Options = {
    chart: { ...BASE_CHART, type: 'column', height: 320 },
    title: { text: undefined },
    xAxis: {
      categories: [season.teams.chiti.name, 'Empates', season.teams.grilo.name],
      lineColor: '#e5e7eb',
      tickColor: '#e5e7eb',
      labels: { style: { color: '#334155', fontSize: '12px' } },
    },
    yAxis: {
      title: { text: null },
      gridLineColor: '#e5e7eb',
      allowDecimals: false,
      labels: { style: { color: '#334155' } },
    },
    legend: { enabled: false },
    tooltip: { shared: true },
    credits: NO_CREDITS,
    plotOptions: { column: { borderRadius: 4, borderWidth: 0 } },
    series: [{
      type: 'column',
      name: 'Total',
      colorByPoint: true,
      colors: [COLOR_CHITI, COLOR_DRAW, COLOR_GRILO],
      data: [chiti.wins, chiti.draws, grilo.wins],
    }],
  };

  const goalsChart: Highcharts.Options = {
    chart: { ...BASE_CHART, type: 'column', height: 320 },
    title: { text: undefined },
    xAxis: {
      categories: [season.teams.chiti.name, season.teams.grilo.name],
      lineColor: '#e5e7eb',
      tickColor: '#e5e7eb',
      labels: { style: { color: '#334155', fontSize: '12px' } },
    },
    yAxis: {
      title: { text: null },
      gridLineColor: '#e5e7eb',
      allowDecimals: false,
      labels: { style: { color: '#334155' } },
    },
    legend: { enabled: false },
    tooltip: { shared: true },
    credits: NO_CREDITS,
    plotOptions: { column: { borderRadius: 4, borderWidth: 0 } },
    series: [{
      type: 'column',
      name: 'Golos',
      colorByPoint: true,
      colors: [COLOR_CHITI, COLOR_GRILO],
      data: [chiti.goalsFor, grilo.goalsFor],
    }],
  };

  const months = groupByMonth(season.matches.filter(isPlayed));
  const monthCategories = months.map(g => g.label);
  const chitiGoalsByMonth = months.map(g =>
    g.matches.reduce((s, m) => s + (m.homeTeam === 'chiti' ? m.homeScore! : m.awayScore!), 0),
  );
  const griloGoalsByMonth = months.map(g =>
    g.matches.reduce((s, m) => s + (m.homeTeam === 'grilo' ? m.homeScore! : m.awayScore!), 0),
  );
  const totalGoalsByMonth = chitiGoalsByMonth.map((v, i) => v + griloGoalsByMonth[i]);

  const monthlyGoals: Highcharts.Options = {
    chart: { ...BASE_CHART, type: 'line', height: 340 },
    title: { text: undefined },
    xAxis: { categories: monthCategories, labels: { style: { color: '#334155', fontSize: '11px' } } },
    yAxis: {
      title: { text: null },
      gridLineColor: '#e5e7eb',
      allowDecimals: false,
      labels: { style: { color: '#334155' } },
    },
    legend: { enabled: true, itemStyle: { color: '#334155' } },
    tooltip: { shared: true },
    credits: NO_CREDITS,
    plotOptions: { line: { marker: { radius: 4 } } },
    series: [
      { type: 'line', name: season.teams.chiti.name, data: chitiGoalsByMonth, color: COLOR_CHITI, lineWidth: 3 },
      { type: 'line', name: season.teams.grilo.name, data: griloGoalsByMonth, color: COLOR_GRILO, lineWidth: 3 },
      { type: 'line', name: 'Total de Golos', data: totalGoalsByMonth, color: COLOR_TOTAL, dashStyle: 'ShortDash', lineWidth: 2 },
    ],
  };

  const chitiWinsByMonth: number[] = [];
  const griloWinsByMonth: number[] = [];
  const drawsByMonth: number[] = [];
  for (const g of months) {
    let cw = 0, gw = 0, dr = 0;
    for (const m of g.matches) {
      const o = outcomeFor('chiti', m);
      if (o === 'V') cw++;
      else if (o === 'D') gw++;
      else if (o === 'E') dr++;
    }
    chitiWinsByMonth.push(cw);
    griloWinsByMonth.push(gw);
    drawsByMonth.push(dr);
  }

  const monthlyResults: Highcharts.Options = {
    chart: { ...BASE_CHART, type: 'line', height: 340 },
    title: { text: undefined },
    xAxis: { categories: monthCategories, labels: { style: { color: '#334155', fontSize: '11px' } } },
    yAxis: {
      title: { text: null },
      gridLineColor: '#e5e7eb',
      allowDecimals: false,
      labels: { style: { color: '#334155' } },
    },
    legend: { enabled: true, itemStyle: { color: '#334155' } },
    tooltip: { shared: true },
    credits: NO_CREDITS,
    plotOptions: { line: { marker: { radius: 4 } } },
    series: [
      { type: 'line', name: `Vitórias ${season.teams.chiti.name}`, data: chitiWinsByMonth, color: COLOR_CHITI, lineWidth: 3 },
      { type: 'line', name: `Vitórias ${season.teams.grilo.name}`, data: griloWinsByMonth, color: COLOR_GRILO, lineWidth: 3 },
      { type: 'line', name: 'Empates', data: drawsByMonth, color: COLOR_DRAW, dashStyle: 'ShortDash', lineWidth: 2 },
    ],
  };

  return (
    <div className="space-y-8">
      <section>
        <SectionTitle>Gráficos Gerais</SectionTitle>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel title="Vitórias / Empates">
            <HighchartsReact highcharts={Highcharts} options={winsDraws} />
          </Panel>
          <Panel title="Golos">
            <HighchartsReact highcharts={Highcharts} options={goalsChart} />
          </Panel>
        </div>
      </section>

      <section>
        <SectionTitle>Gráficos Mensais</SectionTitle>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel title="Golos Marcados por Mês">
            <HighchartsReact highcharts={Highcharts} options={monthlyGoals} />
          </Panel>
          <Panel title="Resultados Mensais">
            <HighchartsReact highcharts={Highcharts} options={monthlyResults} />
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
