import { useState, useRef } from 'react';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useConfirm } from '../../../context/ConfirmContext';
import {
  FALLBACK_PROJECTS,
  FALLBACK_SKILLS,
  FALLBACK_SITE_SETTINGS,
  FALLBACK_CONTACT_SETTINGS,
  FALLBACK_PRIVACY_POLICY
} from '../../../data/fallbackData';

export function AdminDatabaseTab({ reloadAll, showToast }) {
  const confirm = useConfirm();
  const [seeding, setSeeding] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const restoreInputRef = useRef(null);

  const handleSeedAll = async () => {
    if (!db) return;
    const ok = await confirm({
      title: 'Seed Firestore Database?',
      message:
        'Tindakan ini akan mengisi database Firestore dengan data bawaan: 9 proyek, 11 skills, dan pengaturan profil. Lanjutkan?',
      confirmText: 'Ya, Jalankan Seeder',
      cancelText: 'Batal',
      variant: 'warning',
      icon: 'fa-solid fa-database'
    });
    if (!ok) return;

    setSeeding(true);
    try {
      showToast('Seeding projects, skills & settings to Firestore...', 'info');

      for (const proj of FALLBACK_PROJECTS) {
        const { id: _ignoredId, ...projData } = proj;
        await addDoc(collection(db, 'projects'), {
          ...projData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      for (const sk of FALLBACK_SKILLS) {
        const { id: _ignoredId, ...skillData } = sk;
        await addDoc(collection(db, 'skills'), {
          ...skillData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      await setDoc(
        doc(db, 'settings', 'site_settings'),
        {
          ...FALLBACK_SITE_SETTINGS,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      await setDoc(
        doc(db, 'settings', 'contact_settings'),
        {
          ...FALLBACK_CONTACT_SETTINGS,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      await setDoc(
        doc(db, 'settings', 'privacy_policy'),
        {
          ...FALLBACK_PRIVACY_POLICY,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      showToast('Database successfully seeded with all portfolio content!', 'success');
      await reloadAll();
    } catch (err) {
      console.error('Seeder error:', err);
      showToast('Seeding failed: ' + err.message, 'error');
    } finally {
      setSeeding(false);
    }
  };

  const handleExportBackup = async () => {
    if (!db) return;
    try {
      showToast('Generating JSON backup...', 'info');
      const [projSnap, skillSnap, siteSnap, contactSnap, privacySnap] = await Promise.all([
        getDocs(collection(db, 'projects')),
        getDocs(collection(db, 'skills')),
        getDoc(doc(db, 'settings', 'site_settings')),
        getDoc(doc(db, 'settings', 'contact_settings')),
        getDoc(doc(db, 'settings', 'privacy_policy'))
      ]);

      const backup = {
        exportedAt: new Date().toISOString(),
        projects: projSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        skills: skillSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        site_settings: siteSnap.exists() ? siteSnap.data() : {},
        contact_settings: contactSnap.exists() ? contactSnap.data() : {},
        privacy_policy: privacySnap.exists() ? privacySnap.data() : {}
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arka-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup JSON downloaded!', 'success');
    } catch (err) {
      console.error('Export error:', err);
      showToast('Export failed: ' + err.message, 'error');
    }
  };

  const handleImportBackup = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !db) return;

    setRestoring(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const ok = await confirm({
        title: 'Restore Backup Data?',
        message: 'Masukkan data dari file JSON backup ini ke database Firestore?',
        confirmText: 'Ya, Restore',
        cancelText: 'Batal',
        variant: 'warning',
        icon: 'fa-solid fa-file-import'
      });
      if (!ok) {
        setRestoring(false);
        return;
      }

      showToast('Restoring backup to Firestore...', 'info');

      if (Array.isArray(data.projects)) {
        for (const p of data.projects) {
          const { id, ...rest } = p;
          if (id) {
            await setDoc(doc(db, 'projects', id), rest, { merge: true });
          } else {
            await addDoc(collection(db, 'projects'), rest);
          }
        }
      }

      if (Array.isArray(data.skills)) {
        for (const s of data.skills) {
          const { id, ...rest } = s;
          if (id) {
            await setDoc(doc(db, 'skills', id), rest, { merge: true });
          } else {
            await addDoc(collection(db, 'skills'), rest);
          }
        }
      }

      if (data.site_settings) {
        await setDoc(doc(db, 'settings', 'site_settings'), data.site_settings, { merge: true });
      }
      if (data.contact_settings) {
        await setDoc(doc(db, 'settings', 'contact_settings'), data.contact_settings, {
          merge: true
        });
      }
      if (data.privacy_policy) {
        await setDoc(doc(db, 'settings', 'privacy_policy'), data.privacy_policy, { merge: true });
      }

      showToast('Backup restored successfully!', 'success');
      await reloadAll();
    } catch (err) {
      console.error('Import error:', err);
      showToast('Failed to restore JSON: ' + err.message, 'error');
    } finally {
      setRestoring(false);
      e.target.value = '';
    }
  };

  return (
    <section id="tab-database" className="tab-section">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Database Seeder &amp; Backup Utility</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              One-click migration of your existing static HTML portfolio data into Cloud Firestore,
              plus full JSON export/restore.
            </p>
          </div>
        </div>

        <div className="form-row">
          <div className="card" style={{ marginBottom: 0, background: 'var(--bg-card-alt)' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>
              <i className="fa-solid fa-seedling"></i> 1-Click Initial Data Seeder
            </h3>
            <p
              style={{
                fontSize: '0.86rem',
                color: 'var(--text-muted)',
                marginBottom: '1.25rem'
              }}
            >
              Populate Firestore with your 9 current portfolio projects (Solo Parent, K3RS,
              BMDynamic, SIM KKL, Trash Dash, etc.), 11 technical skills, and profile bio.
            </p>
            <button
              type="button"
              id="btn-seed-database"
              className="btn btn-primary"
              onClick={handleSeedAll}
              disabled={seeding}
            >
              {seeding ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Seeding...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-bolt"></i> Seed Initial Database
                </>
              )}
            </button>
          </div>

          <div className="card" style={{ marginBottom: 0, background: 'var(--bg-card-alt)' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>
              <i className="fa-solid fa-file-export"></i> Full JSON Backup &amp; Restore
            </h3>
            <p
              style={{
                fontSize: '0.86rem',
                color: 'var(--text-muted)',
                marginBottom: '1.25rem'
              }}
            >
              Download all your Firestore documents (Projects, Skills, Settings, Privacy Policy) as
              a single <code>.json</code> backup file, or restore from a backup.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                id="btn-export-json"
                className="btn btn-secondary"
                onClick={handleExportBackup}
              >
                <i className="fa-solid fa-download"></i> Export Database (.json)
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={restoring}
                onClick={() => restoreInputRef.current?.click()}
              >
                <i className="fa-solid fa-upload"></i>{' '}
                {restoring ? 'Restoring...' : 'Restore from JSON'}
              </button>
              <input
                ref={restoreInputRef}
                type="file"
                id="input-import-json"
                accept="application/json"
                style={{ display: 'none' }}
                onChange={handleImportBackup}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
