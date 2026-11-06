import type { Season, TeamId } from '../data/types';
import { computeRankings, ownGoalsByTeam, teamStats, topOwnGoalPlayers } from '../lib/stats';
import { formatDate, fmt1 } from '../lib/format';

export function RankingsGrid({ season }: { season: Season }) {
  const r = computeRankings(season);
  const chiti = teamStats('chiti', season.matches);
  const grilo = teamStats('grilo', season.matches);
  const og = ownGoalsByTeam(season);
  const ogTeamLeader: TeamId | null = og.chiti === 0 && og.grilo === 0
    ? null
    : og.chiti >= og.grilo ? 'chiti' : 'grilo';
  const ogPlayers = topOwnGoalPlayers(season);
  const topOgPlayer = ogPlayers[0] ?? null;

  return (
    <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
              <span className="mx-1 text-slate-500">–</span>
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
              <span className="mx-1 text-slate-500">–</span>
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
              <span className="mx-1 text-slate-500">–</span>
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

      <Card border="rose" icon="🙈" title="Equipa com Mais Auto-Golos">
        {ogTeamLeader ? (
          <>
            <Value>{season.teams[ogTeamLeader].name}</Value>
            <Sub>{og[ogTeamLeader]} auto-golo(s) esta época</Sub>
          </>
        ) : (
          <Sub>Ainda sem auto-golos.</Sub>
        )}
      </Card>

      <Card border="rose" icon="😅" title="Jogador com Mais Auto-Golos">
        {topOgPlayer ? (
          <>
            <Value>{topOgPlayer.name}</Value>
            <Sub>{topOgPlayer.ownGoals} auto-golo(s) · {season.teams[topOgPlayer.team].name}</Sub>
          </>
        ) : (
          <Sub>Ainda sem auto-golos.</Sub>
        )}
      </Card>
    </div>
  );
}

const ACCENT: Record<string, string> = {
  emerald: 'from-lime/80 to-emerald-400/0',
  rose: 'from-brand-red/80 to-brand-red/0',
  slate: 'from-grilo/80 to-grilo/0',
};
const GLOW: Record<string, string> = {
  emerald: 'bg-lime/10 ring-lime/25',
  rose: 'bg-brand-red-soft ring-brand-red-ring',
  slate: 'bg-grilo/10 ring-grilo/30',
};

function Card({ children, title, icon, border }: { children: React.ReactNode; title: string; icon: string; border: 'emerald' | 'rose' | 'slate' }) {
  return (
    <div className="card card-hover group relative overflow-hidden p-5">
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${ACCENT[border]}`} />
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ring-1 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${GLOW[border]}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</div>
          <div className="mt-1.5">{children}</div>
        </div>
      </div>
    </div>
  );
}
function Value({ children }: { children: React.ReactNode }) {
  return <div className="font-display text-lg font-bold leading-snug text-white">{children}</div>;
}
function Sub({ children }: { children: React.ReactNode }) {
  return <div className="mt-1 text-xs text-slate-400">{children}</div>;
}
function Empty() { return <div className="text-slate-500">Sem dados</div>; }
