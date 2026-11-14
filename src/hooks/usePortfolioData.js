import { useState, useEffect } from 'react';
import { collection, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import {
  FALLBACK_PROJECTS,
  FALLBACK_SKILLS,
  FALLBACK_SITE_SETTINGS,
  FALLBACK_CONTACT_SETTINGS
} from '../data/fallbackData';

function normalizeAssetPath(path, defaultPath) {
  if (!path) return defaultPath;
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('/')
  ) {
    return path;
  }
  return `/${path}`;
}

export function usePortfolioData() {
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);
  const [skills, setSkills] = useState(FALLBACK_SKILLS);
  const [siteSettings, setSiteSettings] = useState(FALLBACK_SITE_SETTINGS);
  const [contactSettings, setContactSettings] = useState(FALLBACK_CONTACT_SETTINGS);

  useEffect(() => {
    if (!db) return;

    const unsubProjects = onSnapshot(
      query(collection(db, 'projects'), orderBy('order', 'asc')),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            items.push({
              id: docSnap.id,
              ...data,
              image: normalizeAssetPath(data.image, '/assets/images/portfolio-1.png')
            });
          });
          setProjects(items);
        }
      },
      (err) => console.warn('Firestore projects listener (using fallback):', err)
    );

    const unsubSkills = onSnapshot(
      query(collection(db, 'skills'), orderBy('order', 'asc')),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = [];
          snapshot.forEach((docSnap) => {
            items.push({ id: docSnap.id, ...docSnap.data() });
          });
          setSkills(items);
        }
      },
      (err) => console.warn('Firestore skills listener (using fallback):', err)
    );

    const unsubSite = onSnapshot(
      doc(db, 'settings', 'site_settings'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSiteSettings((prev) => ({
            ...prev,
            ...data,
            heroImage: normalizeAssetPath(data.heroImage, prev.heroImage),
            aboutImage: normalizeAssetPath(data.aboutImage, prev.aboutImage),
            cvUrl: normalizeAssetPath(data.cvUrl, prev.cvUrl)
          }));
        }
      },
      (err) => console.warn('Firestore site_settings listener (using fallback):', err)
    );

    const unsubContact = onSnapshot(
      doc(db, 'settings', 'contact_settings'),
      (docSnap) => {
        if (docSnap.exists()) {
          setContactSettings((prev) => ({ ...prev, ...docSnap.data() }));
        }
      },
      (err) => console.warn('Firestore contact_settings listener (using fallback):', err)
    );

    return () => {
      unsubProjects();
      unsubSkills();
      unsubSite();
      unsubContact();
    };
  }, []);

  return { projects, skills, siteSettings, contactSettings };
}
