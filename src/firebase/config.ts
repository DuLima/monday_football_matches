import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const OWNER_EMAIL: string = import.meta.env.VITE_OWNER_EMAIL ?? '';
export const firebaseEnabled = Boolean(cfg.apiKey && cfg.projectId && cfg.appId);

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function firebaseApp(): FirebaseApp {
  if (!firebaseEnabled) throw new Error('Firebase not configured');
  if (!_app) _app = initializeApp(cfg);
  return _app;
}
export function firebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(firebaseApp());
  return _auth;
}
export function firestore(): Firestore {
  if (!_db) _db = getFirestore(firebaseApp());
  return _db;
}
export const googleProvider = new GoogleAuthProvider();
