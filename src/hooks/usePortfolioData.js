import { useState, useEffect } from 'react';
import { collection, doc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import {
  FALLBACK_PROJECTS,
  FALLBACK_SKILLS,
  FALLBACK_SITE_SETTINGS,
  FALLBACK_CONTACT_SETTINGS
} from '../data/fallbackData';

const CACHE_KEYS = {
  PROJECTS: 'portfolio_projects_cache',
  SKILLS: 'portfolio_skills_cache',
  SITE_SETTINGS: 'portfolio_site_settings_cache',
  CONTACT_SETTINGS: 'portfolio_contact_settings_cache'
};

function getCachedData(key, fallback) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(fallback)) {
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } else if (parsed && typeof parsed === 'object') {
          return { ...fallback, ...parsed };
        }
      }
    }
  } catch {
    // ignore
  }
  return fallback;
}

function setCachedData(key, data) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(data));
    }
  } catch {
    // ignore
  }
}

function normalizeAssetPath(path, defaultPath) {
  if (!path) return defaultPath;
  if (
    path === '/assets/images/arko-pic.png' ||
    path === 'assets/images/arko-pic.png'
  ) {
    return FALLBACK_SITE_SETTINGS.heroImage;
  }
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

const VALID_AVAILABILITY_STATUSES = new Set(['hidden', 'available', 'freelance', 'busy']);

function normalizeSiteSettings(raw = {}) {
  const availabilityStatus = VALID_AVAILABILITY_STATUSES.has(raw.availabilityStatus)
    ? raw.availabilityStatus
    : FALLBACK_SITE_SETTINGS.availabilityStatus;

  return {
    ...FALLBACK_SITE_SETTINGS,
    ...raw,
    heroImage: normalizeAssetPath(raw.heroImage, FALLBACK_SITE_SETTINGS.heroImage),
    aboutImage: normalizeAssetPath(raw.aboutImage, FALLBACK_SITE_SETTINGS.aboutImage),
    cvUrl: normalizeAssetPath(raw.cvUrl, FALLBACK_SITE_SETTINGS.cvUrl),
    availabilityStatus,
    availabilityText:
      typeof raw.availabilityText === 'string'
        ? raw.availabilityText
        : FALLBACK_SITE_SETTINGS.availabilityText,
    timeline: Array.isArray(raw.timeline) ? raw.timeline : FALLBACK_SITE_SETTINGS.timeline
  };
}

export function usePortfolioData() {
  const [projects, setProjects] = useState(() =>
    getCachedData(CACHE_KEYS.PROJECTS, FALLBACK_PROJECTS)
  );
  const [skills, setSkills] = useState(() =>
    getCachedData(CACHE_KEYS.SKILLS, FALLBACK_SKILLS)
  );
  const [siteSettings, setSiteSettings] = useState(() =>
    normalizeSiteSettings(getCachedData(CACHE_KEYS.SITE_SETTINGS, FALLBACK_SITE_SETTINGS))
  );
  const [contactSettings, setContactSettings] = useState(() =>
    getCachedData(CACHE_KEYS.CONTACT_SETTINGS, FALLBACK_CONTACT_SETTINGS)
  );

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
          setCachedData(CACHE_KEYS.PROJECTS, items);
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
          setSkills((prevSkills) => {
            if (prevSkills && prevSkills.length === items.length) {
              const isSame = prevSkills.every((prev, i) => {
                const next = items[i];
                const prevKey = (prev.name || prev.id || '').toLowerCase().trim();
                const nextKey = (next.name || next.id || '').toLowerCase().trim();
                return (
                  prevKey === nextKey &&
                  prev.level === next.level &&
                  prev.category === next.category &&
                  prev.iconClass === next.iconClass &&
                  prev.iconType === next.iconType &&
                  prev.iconUrl === next.iconUrl &&
                  prev.order === next.order
                );
              });
              if (isSame) return prevSkills;
            }
            setCachedData(CACHE_KEYS.SKILLS, items);
            return items;
          });
        }
      },
      (err) => console.warn('Firestore skills listener (using fallback):', err)
    );

    const unsubSite = onSnapshot(
      doc(db, 'settings', 'site_settings'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const next = normalizeSiteSettings(data);
          setSiteSettings(next);
          setCachedData(CACHE_KEYS.SITE_SETTINGS, next);
        }
      },
      (err) => console.warn('Firestore site_settings listener (using fallback):', err)
    );

    const unsubContact = onSnapshot(
      doc(db, 'settings', 'contact_settings'),
      (docSnap) => {
        if (docSnap.exists()) {
          const next = { ...FALLBACK_CONTACT_SETTINGS, ...docSnap.data() };
          setContactSettings(next);
          setCachedData(CACHE_KEYS.CONTACT_SETTINGS, next);
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
