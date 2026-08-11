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
    <div className="min-h-screen bg-slate-100">
      <Header active={tab} onChange={setTab} />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[300px_1fr]">
          <NextGameCard match={next} season={season} today={today} />
          <SeasonProgressCard season={season} today={today} />
        </div>

        <div className="mt-8">
          {tab === 'stats' && (
            <section className="space-y-8">
              <section>
                <SectionTitle>Estatísticas Gerais</SectionTitle>
                <div className="mt-4">
                  <StatsTable season={season} />
                </div>
              </section>
              <section>
                <SectionTitle>Rankings</SectionTitle>
                <div className="mt-4">
                  <RankingsGrid season={season} />
                </div>
              </section>
            </section>
          )}
          {tab === 'charts' && <Charts season={season} />}
          {tab === 'monthly' && (
            <section>
              <SectionTitle>Estatísticas Mensais</SectionTitle>
              <div className="mt-4">
                <MonthlyStats season={season} />
              </div>
            </section>
          )}
          {tab === 'players' && (
            <section>
              <SectionTitle>Jogadores</SectionTitle>
              <div className="mt-4">
                <PlayersTable season={season} />
              </div>
            </section>
          )}
          {tab === 'results' && (
            <section>
              <SectionTitle>Resultados Jogos</SectionTitle>
              <div className="mt-4">
                <ResultsTable season={season} />
              </div>
            </section>
          )}
        </div>

        <footer className="mt-16 pb-8 text-center text-xs text-slate-400">
          Segundas Mágicas · Época {season.year}
        </footer>
      </main>
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

export default App;
