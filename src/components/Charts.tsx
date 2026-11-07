import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import type { Season } from '../data/types';
import { groupByMonth, isPlayed, outcomeFor, playerStats, teamStats, topScorersOverTime } from '../lib/stats';
import { activeInjuries, formatTimeGone } from '../lib/injuries';
import { formatDate } from '../lib/format';
import { MedicalIcon } from './MedicalIcon';
import { SectionTitle } from './ui';

const COLOR_CHITI = '#f0503f';
const COLOR_GRILO = '#f5c518';
const COLOR_DRAW = '#94a3b8';
const COLOR_TOTAL = '#c6f432';

const AXIS_LABEL = '#94a3b8';
const GRID = 'rgba(255,255,255,0.06)';

// Dark theme shared by every chart on this page.
Highcharts.setOptions({
  chart: {
    backgroundColor: 'transparent',
    style: { fontFamily: 'Inter, system-ui, sans-serif' },
    spacingTop: 8,
    spacingBottom: 8,
  },
  title: { text: undefined },
  credits: { enabled: false },
  xAxis: {
    lineColor: GRID,
    tickColor: GRID,
    labels: { style: { color: AXIS_LABEL, fontSize: '11px' } },
  },
  yAxis: {
    title: { text: null },
    gridLineColor: GRID,
    allowDecimals: false,
    labels: { style: { color: AXIS_LABEL } },
  },
  legend: {
    itemStyle: { color: '#cbd5e1', fontWeight: '500' },
    itemHoverStyle: { color: '#ffffff' },
    itemHiddenStyle: { color: '#475569' },
  },
  tooltip: {
    backgroundColor: 'rgba(10,14,24,0.95)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    shadow: false,
    style: { color: '#f1f5f9' },
  },
  plotOptions: {
    series: { animation: { duration: 900 } },
  },
});

function fade(hex: string, from: number, to: number): Highcharts.GradientColorObject {
  return {
    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
    stops: [
      [0, Highcharts.color(hex).setOpacity(from).get('rgba') as string],
      [1, Highcharts.color(hex).setOpacity(to).get('rgba') as string],
    ],
  };
}

export function Charts({ season }: { season: Season }) {
  const chiti = teamStats('chiti', season.matches);
  const grilo = teamStats('grilo', season.matches);

  const columnPlot: Highcharts.PlotOptions = {
    column: { borderRadius: 8, borderWidth: 0, pointPadding: 0.12, groupPadding: 0.1 },
  };

  const winsDraws: Highcharts.Options = {
    chart: { type: 'column', height: 320 },
    xAxis: { categories: [season.teams.chiti.name, 'Empates', season.teams.grilo.name], crosshair: false },
    legend: { enabled: false },
    tooltip: { shared: true },
    plotOptions: columnPlot,
    series: [{
      type: 'column',
      name: 'Total',
      colorByPoint: true,
      colors: [fade(COLOR_CHITI, 1, 0.35), fade(COLOR_DRAW, 1, 0.35), fade(COLOR_GRILO, 1, 0.35)],
      data: [chiti.wins, chiti.draws, grilo.wins],
      dataLabels: { enabled: true, style: { color: '#fff', textOutline: 'none', fontSize: '13px' } },
    }],
  };

  const goalsChart: Highcharts.Options = {
    chart: { type: 'column', height: 320 },
    xAxis: { categories: [season.teams.chiti.name, season.teams.grilo.name], crosshair: false },
    legend: { enabled: false },
    tooltip: { shared: true },
    plotOptions: columnPlot,
    series: [{
      type: 'column',
      name: 'Golos',
      colorByPoint: true,
      colors: [fade(COLOR_CHITI, 1, 0.35), fade(COLOR_GRILO, 1, 0.35)],
      data: [chiti.goalsFor, grilo.goalsFor],
      dataLabels: { enabled: true, style: { color: '#fff', textOutline: 'none', fontSize: '13px' } },
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
    chart: { height: 340 },
    xAxis: { categories: monthCategories, crosshair: { color: GRID } },
    legend: { enabled: true },
    tooltip: { shared: true },
    plotOptions: { areaspline: { marker: { radius: 3 }, lineWidth: 3 } },
    series: [
      { type: 'areaspline', name: season.teams.chiti.name, data: chitiGoalsByMonth, color: COLOR_CHITI, fillColor: fade(COLOR_CHITI, 0.35, 0) },
      { type: 'areaspline', name: season.teams.grilo.name, data: griloGoalsByMonth, color: COLOR_GRILO, fillColor: fade(COLOR_GRILO, 0.35, 0) },
      { type: 'spline', name: 'Total de Golos', data: totalGoalsByMonth, color: COLOR_TOTAL, dashStyle: 'ShortDash', lineWidth: 2, marker: { radius: 3 } },
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

  const motmSlices = playerStats(season)
    .filter(p => p.motm > 0)
    .sort((a, b) => b.motm - a.motm)
    .map(p => ({ name: p.name, y: p.motm }));
  const motmPalette = ['#f43f5e', '#fb923c', '#fbbf24', '#c6f432', '#34d399', '#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#2dd4bf'];
  const motmChart: Highcharts.Options = {
    chart: { type: 'pie', height: 340 },
    tooltip: { pointFormat: '<b>{point.y}</b> MOTM ({point.percentage:.0f}%)' },
    plotOptions: {
      pie: {
        innerSize: '62%',
        borderWidth: 3,
        borderColor: '#0a0e18',
        borderRadius: 6,
        dataLabels: {
          enabled: true,
          format: '{point.name} · {point.y}',
          style: { color: '#cbd5e1', fontSize: '11px', fontWeight: '500', textOutline: 'none' },
          connectorColor: 'rgba(255,255,255,0.2)',
          distance: 14,
        },
      },
    },
    series: motmSlices.length === 0
      ? [{ type: 'pie', name: 'MOTM', data: [{ name: 'Sem MOTM registados', y: 1, color: 'rgba(255,255,255,0.08)' }] }]
      : [{
        type: 'pie',
        name: 'MOTM',
        data: motmSlices.map((s, i) => ({ ...s, color: motmPalette[i % motmPalette.length] })),
      }],
  };

  const topScorers = topScorersOverTime(season, 5);
  const scorerPalette = ['#f43f5e', '#fbbf24', '#38bdf8', '#c6f432', '#c084fc'];
  const topScorersChart: Highcharts.Options = {
    chart: { type: 'spline', height: 340 },
    xAxis: { categories: topScorers.dates.map(d => formatDate(d)), crosshair: { color: GRID } },
    legend: { enabled: true },
    tooltip: { shared: true, valueSuffix: ' ⚽' },
    plotOptions: { spline: { marker: { radius: 3 } } },
    series: topScorers.series.length === 0
      ? [{ type: 'spline', name: 'Sem golos ainda', data: [] }]
      : topScorers.series.map((s, i) => ({
        type: 'spline',
        name: `${s.name} · ${s.totalGoals}`,
        data: s.cumulative,
        color: scorerPalette[i % scorerPalette.length],
        lineWidth: 2.5,
      })),
  };

  const monthlyResults: Highcharts.Options = {
    chart: { type: 'column', height: 340 },
    xAxis: { categories: monthCategories, crosshair: false },
    legend: { enabled: true },
    tooltip: { shared: true },
    plotOptions: { column: { borderRadius: 4, borderWidth: 0, stacking: 'normal', pointPadding: 0.08 } },
    series: [
      { type: 'column', name: `Vitórias ${season.teams.chiti.name}`, data: chitiWinsByMonth, color: COLOR_CHITI },
      { type: 'column', name: 'Empates', data: drawsByMonth, color: COLOR_DRAW },
      { type: 'column', name: `Vitórias ${season.teams.grilo.name}`, data: griloWinsByMonth, color: COLOR_GRILO },
    ],
  };

  return (
    <div className="space-y-10">
      <section>
        <SectionTitle eyebrow="Visão geral">Gráficos Gerais</SectionTitle>
        <div className="stagger mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel title="Vitórias / Empates">
            <HighchartsReact highcharts={Highcharts} options={winsDraws} />
          </Panel>
          <Panel title="Golos">
            <HighchartsReact highcharts={Highcharts} options={goalsChart} />
          </Panel>
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Tendências">Gráficos Mensais</SectionTitle>
        <div className="stagger mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel title="Golos Marcados por Mês">
            <HighchartsReact highcharts={Highcharts} options={monthlyGoals} />
          </Panel>
          <Panel title="Resultados Mensais">
            <HighchartsReact highcharts={Highcharts} options={monthlyResults} />
          </Panel>
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Destaques">Top Marcadores &amp; MOTM</SectionTitle>
        <div className="stagger mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel title="Golos Acumulados — Top 5 Jogadores">
            <HighchartsReact highcharts={Highcharts} options={topScorersChart} />
          </Panel>
          <Panel title="Distribuição de MOTM por Jogador">
            <HighchartsReact highcharts={Highcharts} options={motmChart} />
          </Panel>
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Boletim clínico">Lesões Ativas</SectionTitle>
        <div className="mt-5">
          <InjuryList season={season} />
        </div>
      </section>
    </div>
  );
}

function InjuryList({ season }: { season: Season }) {
  const injured = activeInjuries(season);
  if (injured.length === 0) {
    return (
      <div className="card p-6 text-center text-sm text-slate-400">
        Nenhum jogador lesionado neste momento. 💪
      </div>
    );
  }
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-xs sm:text-sm">
          <thead className="border-b border-white/10 text-slate-400">
            <tr>
              <th className="px-3 py-3 pl-5 text-left text-[11px] font-semibold uppercase tracking-wider">Jogador</th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Tipo de lesão</th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Regresso previsto</th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Tempo fora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {injured.map(({ name, injury }) => (
              <tr key={name} className="transition-colors hover:bg-white/[0.04]">
                <td className="px-3 py-3 pl-5 text-left font-semibold text-white">
                  <span className="inline-flex items-center gap-1.5">
                    <MedicalIcon size={14} />
                    {name}
                  </span>
                </td>
                <td className="px-3 py-3 text-left text-slate-300">{injury.type}</td>
                <td className="px-3 py-3 text-left tabular-nums text-slate-300">{formatDate(injury.expectedReturn)}</td>
                <td className="px-3 py-3 text-left font-semibold text-rose-300">{formatTimeGone(injury)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card card-hover p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <span className="h-4 w-1 rounded-full bg-gradient-to-b from-brand-red to-chiti" />
        {title}
      </div>
      {children}
    </div>
  );
}
