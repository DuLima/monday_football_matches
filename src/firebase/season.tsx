import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import type { Match, Season } from '../data/types';
import { season as staticSeason } from '../data/season';
import { firebaseEnabled, firestore } from './config';

type SeasonState = {
  season: Season;
  source: 'firestore' | 'static';
  loading: boolean;
  saveMatch: (id: string, patch: Partial<Match>) => Promise<void>;
  saveSeason: (next: Season) => Promise<void>;
};

const SeasonContext = createContext<SeasonState | null>(null);

const SEASON_DOC = () => doc(firestore(), 'seasons', String(staticSeason.year));

function stripUndefined<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [season, setSeason] = useState<Season>(staticSeason);
  const [source, setSource] = useState<'firestore' | 'static'>('static');
  const [loading, setLoading] = useState(firebaseEnabled);

  useEffect(() => {
    if (!firebaseEnabled) {
      setLoading(false);
      return;
    }
    return onSnapshot(SEASON_DOC(), snap => {
      if (snap.exists()) {
        setSeason(snap.data() as Season);
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

  const value = useMemo<SeasonState>(() => ({
    season,
    source,
    loading,
    saveMatch: async (id, patch) => {
      const next: Season = {
        ...season,
        matches: season.matches.map(m => (m.id === id ? { ...m, ...patch } : m)),
      };
      if (firebaseEnabled) {
        await setDoc(SEASON_DOC(), stripUndefined(next));
      } else {
        setSeason(next);
      }
    },
    saveSeason: async next => {
      if (firebaseEnabled) {
        await setDoc(SEASON_DOC(), stripUndefined(next));
      } else {
        setSeason(next);
      }
    },
  }), [season, source, loading]);

  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>;
}

export function useSeason(): SeasonState {
  const ctx = useContext(SeasonContext);
  if (!ctx) throw new Error('useSeason must be used inside <SeasonProvider>');
  return ctx;
}
