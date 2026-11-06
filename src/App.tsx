import { useState } from 'react';
import { Header, type TabId } from './components/Header';
import { NextGameCard } from './components/NextGameCard';
import { SeasonProgressCard } from './components/SeasonProgressCard';
import { StatsTable } from './components/StatsTable';
import { RankingsGrid } from './components/RankingsGrid';
import { Charts } from './components/Charts';
import { MonthlyStats } from './components/MonthlyStats';
import { PlayersTable } from './components/PlayersTable';
import { ResultsTable } from './components/ResultsTable';
import { nextMatch } from './lib/stats';
import { AuthProvider } from './firebase/auth';
import { SeasonProvider, useSeason } from './firebase/season';
import { SectionTitle } from './components/ui';

function App() {
  return (
    <AuthProvider>
      <SeasonProvider>
        <AppInner />
      </SeasonProvider>
    </AuthProvider>
  );
}

function AppInner() {
  const { season } = useSeason();
  const [tab, setTab] = useState<TabId>('stats');
  const today = new Date();
  const next = nextMatch(season, today);

  return (
    <div className="min-h-screen">
      <Header active={tab} onChange={setTab} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <div className="stagger grid grid-cols-1 gap-4 lg:grid-cols-[minmax(320px,380px)_1fr]">
          <NextGameCard match={next} season={season} />
          <SeasonProgressCard season={season} today={today} />
        </div>

        <div key={tab} className="mt-10 animate-fade-up">
          {tab === 'stats' && (
            <section className="space-y-10">
              <section>
                <SectionTitle eyebrow="Classificação">Estatísticas Gerais</SectionTitle>
                <div className="mt-5">
                  <StatsTable season={season} />
                </div>
              </section>
              <section>
                <SectionTitle eyebrow="Recordes">Rankings</SectionTitle>
                <div className="mt-5">
                  <RankingsGrid season={season} />
                </div>
              </section>
            </section>
          )}
          {tab === 'charts' && <Charts season={season} />}
          {tab === 'monthly' && (
            <section>
              <SectionTitle eyebrow="Mês a mês">Estatísticas Mensais</SectionTitle>
              <div className="mt-5">
                <MonthlyStats season={season} />
              </div>
            </section>
          )}
          {tab === 'players' && (
            <section>
              <SectionTitle eyebrow="Plantel">Jogadores</SectionTitle>
              <div className="mt-5">
                <PlayersTable season={season} />
              </div>
            </section>
          )}
          {tab === 'results' && (
            <section>
              <SectionTitle eyebrow="Histórico">Resultados Jogos</SectionTitle>
              <div className="mt-5">
                <ResultsTable season={season} />
              </div>
            </section>
          )}
        </div>

        <footer className="mt-20 pb-8 text-center text-xs tracking-wider text-slate-500">
          Segundas Mágicas · Época {season.year}
        </footer>
      </main>
    </div>
  );
}

export default App;
