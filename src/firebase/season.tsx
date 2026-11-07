import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { doc, onSnapshot, runTransaction, setDoc } from 'firebase/firestore';
import type { Injury, Match, Season, TeamId } from '../data/types';
import { season as staticSeason } from '../data/season';
import { firebaseEnabled, firestore } from './config';

type SeasonState = {
  season: Season;
  source: 'firestore' | 'static';
  loading: boolean;
  saveMatch: (id: string, patch: Partial<Match>) => Promise<void>;
  saveSeason: (next: Season) => Promise<void>;
  saveInjury: (name: string, injury: Injury) => Promise<void>;
  removeInjury: (name: string) => Promise<void>;
};

const SeasonContext = createContext<SeasonState | null>(null);

const SEASON_DOC = () => doc(firestore(), 'seasons', String(staticSeason.year));

// Team colours belong to the app's design, so the ones in code win over
// whatever an older saved season document still has.
function withCodeTeamColors(s: Season): Season {
  const teams = { ...s.teams };
  for (const id of Object.keys(staticSeason.teams) as TeamId[]) {
    const { color, colorSoft } = staticSeason.teams[id];
    teams[id] = { ...teams[id], color, colorSoft };
  }
  return { ...s, teams };
}

function stripUndefined<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [season, setSeason] = useState<Season>(staticSeason);
  const [source, setSource] = useState<'firestore' | 'static'>('static');
  const [loading, setLoading] = useState(firebaseEnabled);

  useEffect(() => {
    if (!firebaseEnabled) return;
    return onSnapshot(SEASON_DOC(), snap => {
      if (snap.exists()) {
        setSeason(withCodeTeamColors(snap.data() as Season));
        setSource('firestore');
      } else {
        setSeason(staticSeason);
        setSource('static');
      }
      setLoading(false);
    }, err => {
      console.warn('Season snapshot error; using static seed.', err);
      setSource('static');
      setLoading(false);
    });
  }, []);

  const value = useMemo<SeasonState>(() => {
    // Read-modify-write against the latest stored season, so edits made
    // elsewhere (another tab or device) since our last snapshot aren't lost.
    async function mutate(fn: (current: Season) => Season) {
      if (!firebaseEnabled) {
        setSeason(prev => fn(prev));
        return;
      }
      const ref = SEASON_DOC();
      await runTransaction(firestore(), async tx => {
        const snap = await tx.get(ref);
        const current = snap.exists() ? (snap.data() as Season) : staticSeason;
        tx.set(ref, stripUndefined(fn(current)));
      });
    }

    return {
      season,
      source,
      loading,
      saveMatch: (id, patch) => mutate(s => ({
        ...s,
        matches: s.matches.map(m => (m.id === id ? { ...m, ...patch } : m)),
      })),
      saveSeason: async next => {
        if (firebaseEnabled) {
          await setDoc(SEASON_DOC(), stripUndefined(next));
        } else {
          setSeason(next);
        }
      },
      saveInjury: (name, injury) => mutate(s => ({
        ...s,
        injuries: { ...(s.injuries ?? {}), [name]: injury },
      })),
      removeInjury: name => mutate(s => {
        const nextInjuries = { ...(s.injuries ?? {}) };
        delete nextInjuries[name];
        return { ...s, injuries: nextInjuries };
      }),
    };
  }, [season, source, loading]);

  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>;
}

export function useSeason(): SeasonState {
  const ctx = useContext(SeasonContext);
  if (!ctx) throw new Error('useSeason must be used inside <SeasonProvider>');
  return ctx;
}
