import { getAuth } from 'firebase/auth';
import { app } from './firebase';

let auth = null;

try {
  if (app) {
    auth = getAuth(app);
  }
} catch (err) {
  console.warn('Firebase Auth initialization warning:', err);
}

export { auth };
