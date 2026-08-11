import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { OWNER_EMAIL, firebaseAuth, firebaseEnabled, googleProvider } from './config';

type AuthState = {
  user: User | null;
  loading: boolean;
  isOwner: boolean;
  enabled: boolean;
  signIn: () => Promise<void>;
  signOutNow: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: false,
  isOwner: false,
  enabled: false,
  signIn: async () => {},
  signOutNow: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(firebaseEnabled);

  useEffect(() => {
    if (!firebaseEnabled) return;
    return onAuthStateChanged(firebaseAuth(), u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const value: AuthState = {
    user,
    loading,
    isOwner: !!user && !!OWNER_EMAIL && user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase(),
    enabled: firebaseEnabled,
    signIn: async () => {
      await signInWithPopup(firebaseAuth(), googleProvider);
    },
    signOutNow: async () => {
      await signOut(firebaseAuth());
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
