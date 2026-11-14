import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBXMcjGa-20keXC67MIwiaG3seex-_DDNw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'vinsensiusarko.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'vinsensiusarko',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'vinsensiusarko.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '639316523712',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:639316523712:web:2a379691ff732f8c8a0b25',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-VV3XL63SER'
};

let app = null;
let db = null;
let auth = null;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (err) {
  console.warn('Firebase initialization warning (using static fallback data):', err);
}

export { app, db, auth };
