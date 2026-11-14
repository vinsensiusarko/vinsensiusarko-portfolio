import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FALLBACK_PRIVACY_POLICY } from '../data/fallbackData';

export function usePrivacyPolicy() {
  const [policy, setPolicy] = useState(FALLBACK_PRIVACY_POLICY);

  useEffect(() => {
    if (!db) return;

    const unsub = onSnapshot(
      doc(db, 'settings', 'privacy_policy'),
      (docSnap) => {
        if (docSnap.exists()) {
          setPolicy((prev) => ({ ...prev, ...docSnap.data() }));
        }
      },
      (err) => console.warn('Firestore privacy_policy listener (using fallback):', err)
    );

    return () => unsub();
  }, []);

  return { policy };
}
