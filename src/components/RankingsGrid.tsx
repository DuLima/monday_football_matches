import type { Season } from '../data/types';
import { computeRankings, teamStats } from '../lib/stats';
import { formatDate, fmt1 } from '../lib/format';

export function RankingsGrid({ season }: { season: Season }) {
  const r = computeRankings(season);
  const chiti = teamStats('chiti', season.matches);
  const grilo = teamStats('grilo', season.matches);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card border="emerald" icon="🏆" title="Mês com Mais Golos">
        {r.monthMostGoals ? (
          <>
            <Value>{r.monthMostGoals.label}</Value>
            <Sub>{r.monthMostGoals.goals} golos em {r.monthMostGoals.games} jogos</Sub>
          </>
        ) : <Empty />}
      </Card>

      <Card border="rose" icon="📉" title="Mês com Menos Golos">
        {r.monthLeastGoals ? (
          <>
            <Value>{r.monthLeastGoals.label}</Value>
            <Sub>{r.monthLeastGoals.goals} golos em {r.monthLeastGoals.games} jogos</Sub>
          </>
        ) : <Empty />}
      </Card>

      <Card border="emerald" icon="⚽" title="Jogo com Mais Golos">
        {r.highestScoring ? (
          <>
            <Value>
              {season.teams[r.highestScoring.match.homeTeam].name} {r.highestScoring.match.homeScore}
              <span className="mx-1 text-slate-400">–</span>
              {r.highestScoring.match.awayScore} {season.teams[r.highestScoring.match.awayTeam].name}
            </Value>
            <Sub>{r.highestScoring.total} golos · {formatDate(r.highestScoring.match.date)}</Sub>
          </>
        ) : <Empty />}
      </Card>

      <Card border="rose" icon="🔒" title="Jogo com Menos Golos">
        {r.lowestScoring ? (
          <>
            <Value>
              {season.teams[r.lowestScoring.match.homeTeam].name} {r.lowestScoring.match.homeScore}
              <span className="mx-1 text-slate-400">–</span>
              {r.lowestScoring.match.awayScore} {season.teams[r.lowestScoring.match.awayTeam].name}
            </Value>
            <Sub>{r.lowestScoring.total} golos · {formatDate(r.lowestScoring.match.date)}</Sub>
          </>
        ) : <Empty />}
      </Card>

      <Card border="emerald" icon="🥇" title="Maior Vitória">
        {r.biggestWin ? (
          <>
            <Value>
              {season.teams[r.biggestWin.match.homeTeam].name} {r.biggestWin.match.homeScore}
              <span className="mx-1 text-slate-400">–</span>
              {r.biggestWin.match.awayScore} {season.teams[r.biggestWin.match.awayTeam].name}
            </Value>
            <Sub>{season.teams[r.biggestWin.winner].name} ganhou por {r.biggestWin.margin} · {formatDate(r.biggestWin.match.date)}</Sub>
          </>
        ) : <Empty />}
      </Card>

      <Card border="emerald" icon="🔥" title="Melhor Sequência de Vitórias">
        {r.bestStreak ? (
          <>
            <Value>{season.teams[r.bestStreak.team].name} — {r.bestStreak.length} seguidas</Value>
            <Sub>De {formatDate(r.bestStreak.from)} a {formatDate(r.bestStreak.to)}</Sub>
          </>
        ) : <Empty />}
      </Card>

      <Card border="slate" icon="📊" title="Média de Golos por Jogo">
        <Value>{fmt1(r.averageGoals.avg)}</Value>
        <Sub>{r.averageGoals.total} golos em {r.averageGoals.games} jogos</Sub>
      </Card>

      <Card border="emerald" icon="🥇" title="Jogador com Mais Alcunhas">
        <Value>Avante</Value>
        <Sub>Impossível de manter registo, mas tem muitas! 😊</Sub>
      </Card>

      <Card border="slate" icon="🎯" title="Golos para Vencer — SL Amigos do Chiti">
        <Value>{chiti.wins ? fmt1(chiti.goalsPerWin) : '—'} golos/vitória</Value>
        <Sub>{chiti.goalsFor} golos em {chiti.wins} vitórias</Sub>
      </Card>

      <Card border="slate" icon="🎯" title="Golos para Vencer — Túnel do Grilo FC">
        <Value>{grilo.wins ? fmt1(grilo.goalsPerWin) : '—'} golos/vitória</Value>
        <Sub>{grilo.goalsFor} golos em {grilo.wins} vitórias</Sub>
      </Card>
    </div>
  );
}

const BORDER: Record<string, string> = {
  emerald: 'border-l-brand-red',
  rose: 'border-l-rose-400',
  slate: 'border-l-slate-300',
};

function Card({ children, title, icon, border }: { children: React.ReactNode; title: string; icon: string; border: 'emerald' | 'rose' | 'slate' }) {
  return (
    <div className={`rounded-2xl border-l-4 ${BORDER[border]} bg-white p-5 text-center shadow-sm ring-1 ring-slate-100`}>
      <div className="text-3xl">{icon}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-slate-500">{title}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}
function Value({ children }: { children: React.ReactNode }) {
  return <div className="text-lg font-black text-brand-dark">{children}</div>;
}
function Sub({ children }: { children: React.ReactNode }) {
  return <div className="mt-1 text-xs text-slate-500">{children}</div>;
}
function Empty() { return <div className="text-slate-400">Sem dados</div>; }
