import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, inMemoryPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);

// Use inMemoryPersistence as the base; sessions persist as long as the app is
// open. For cross-session persistence, set up a custom persistence adapter
// using @react-native-async-storage/async-storage with your Firebase version.
let _auth;
try {
  _auth = initializeAuth(app, {
    persistence: inMemoryPersistence,
  });
} catch (err) {
  // initializeAuth can throw if called more than once (e.g. hot reload).
  // Fall back to getAuth which returns the already-initialised instance.
  console.warn('[Firebase] initializeAuth fallback:', err);
  _auth = getAuth(app);
}

export const auth = _auth;
export const db = getFirestore(app);
