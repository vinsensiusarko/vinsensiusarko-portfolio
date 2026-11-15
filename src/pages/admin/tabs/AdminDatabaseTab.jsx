import { useState, useEffect, useRef } from 'react';
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
  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewJsonText, setPreviewJsonText] = useState('');
  const [dbStats, setDbStats] = useState({
    projectsCount: 0,
    skillsCount: 0,
    hasProfile: false,
    hasContact: false,
    hasPrivacy: false,
    loading: true
  });

  const restoreInputRef = useRef(null);

  // Load database live health stats
  useEffect(() => {
    async function loadStats() {
      if (!db) {
        setDbStats((prev) => ({ ...prev, loading: false }));
        return;
      }
      try {
        const [projSnap, skillSnap, siteSnap, contactSnap, privacySnap] = await Promise.all([
          getDocs(collection(db, 'projects')),
          getDocs(collection(db, 'skills')),
          getDoc(doc(db, 'settings', 'site_settings')),
          getDoc(doc(db, 'settings', 'contact_settings')),
          getDoc(doc(db, 'settings', 'privacy_policy'))
        ]);

        setDbStats({
          projectsCount: projSnap.size,
          skillsCount: skillSnap.size,
          hasProfile: siteSnap.exists(),
          hasContact: contactSnap.exists(),
          hasPrivacy: privacySnap.exists(),
          loading: false
        });
      } catch (err) {
        console.error('Error loading DB stats:', err);
        setDbStats((prev) => ({ ...prev, loading: false }));
      }
    }
    loadStats();
  }, [seeding, restoring]);

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

  const generateBackupData = async () => {
    if (!db) throw new Error('Firebase not connected.');

    const [projSnap, skillSnap, siteSnap, contactSnap, privacySnap] = await Promise.all([
      getDocs(collection(db, 'projects')),
      getDocs(collection(db, 'skills')),
      getDoc(doc(db, 'settings', 'site_settings')),
      getDoc(doc(db, 'settings', 'contact_settings')),
      getDoc(doc(db, 'settings', 'privacy_policy'))
    ]);

    const backup = {
      version: '1.0',
      app: 'Arko Portfolio CMS',
      exportedAt: new Date().toISOString(),
      metadata: {
        totalProjects: projSnap.size,
        totalSkills: skillSnap.size,
        hasSiteSettings: siteSnap.exists(),
        hasContactSettings: contactSnap.exists(),
        hasPrivacyPolicy: privacySnap.exists()
      },
      projects: projSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      skills: skillSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      site_settings: siteSnap.exists() ? siteSnap.data() : {},
      contact_settings: contactSnap.exists() ? contactSnap.data() : {},
      privacy_policy: privacySnap.exists() ? privacySnap.data() : {}
    };

    return backup;
  };

  const handleExportBackup = async () => {
    if (!db) {
      showToast('Database connection unavailable.', 'error');
      return;
    }

    setExporting(true);
    try {
      showToast('Generating comprehensive JSON backup...', 'info');
      const backup = await generateBackupData();

      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json;charset=utf-8'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arko-cms-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      showToast(
        `Backup downloaded successfully! (${backup.projects.length} projects, ${backup.skills.length} skills)`,
        'success'
      );
    } catch (err) {
      console.error('Export error:', err);
      showToast('Export failed: ' + err.message, 'error');
    } finally {
      setExporting(false);
    }
  };

  const handlePreviewBackup = async () => {
    if (!db) return;
    try {
      showToast('Generating backup preview...', 'info');
      const backup = await generateBackupData();
      setPreviewJsonText(JSON.stringify(backup, null, 2));
      setShowPreviewModal(true);
    } catch (err) {
      showToast('Preview error: ' + err.message, 'error');
    }
  };

  const handleImportBackup = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !db) return;

    setRestoring(true);
    try {
      const text = await file.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('File bukan format JSON yang valid.');
      }

      const projectsCount = Array.isArray(data.projects) ? data.projects.length : 0;
      const skillsCount = Array.isArray(data.skills) ? data.skills.length : 0;

      const ok = await confirm({
        title: 'Restore Database Backup?',
        message: `File backup valid ditemukan: ${projectsCount} Projects, ${skillsCount} Skills, dan Pengaturan Sistem. Yakin ingin me-restore data ini ke database Firestore?`,
        confirmText: 'Ya, Jalankan Restore',
        cancelText: 'Batal',
        variant: 'warning',
        icon: 'fa-solid fa-file-import'
      });
      if (!ok) {
        setRestoring(false);
        e.target.value = '';
        return;
      }

      showToast('Memproses restore ke Firestore...', 'info');

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

      showToast(
        `Backup berhasil direstore! (${projectsCount} projects, ${skillsCount} skills)`,
        'success'
      );
      await reloadAll();
    } catch (err) {
      console.error('Import error:', err);
      showToast('Gagal restore JSON: ' + err.message, 'error');
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
            <h2 className="card-title">
              <i className="fa-solid fa-database"></i> Database &amp; Backup Center
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Comprehensive database management: instant full JSON backup download, schema
              inspection, one-click restore, and starter data seeding.
            </p>
          </div>
        </div>

        {/* DATABASE HEALTH SUMMARY STATS */}
        <div className="db-health-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="db-stat-card" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-card-alt)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Projects Collection
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {dbStats.loading ? '...' : `${dbStats.projectsCount} Documents`}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '0.2rem' }}>
              <i className="fa-solid fa-check-circle"></i> Synced with Firestore
            </div>
          </div>

          <div className="db-stat-card" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-card-alt)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Skills Collection
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {dbStats.loading ? '...' : `${dbStats.skillsCount} Documents`}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '0.2rem' }}>
              <i className="fa-solid fa-check-circle"></i> Active Technologies
            </div>
          </div>

          <div className="db-stat-card" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-card-alt)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              System Settings
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.6rem' }}>
              Profile • Contact • Policy
            </div>
            <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '0.2rem' }}>
              <i className="fa-solid fa-shield-halved"></i> Configured
            </div>
          </div>
        </div>

        {/* OPERATIONS GRID */}
        <div className="form-row">
          {/* BACKUP & RESTORE CARD */}
          <div className="card" style={{ marginBottom: 0, background: 'var(--bg-card-alt)', flex: 1.3 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <i className="fa-solid fa-file-export"></i> Full JSON Backup &amp; Restore
            </h3>
            <p
              style={{
                fontSize: '0.86rem',
                color: 'var(--text-muted)',
                marginBottom: '1.25rem',
                lineHeight: 1.5
              }}
            >
              Ekspor seluruh database Cloud Firestore Anda (Projects, Skills, Pengaturan Profil,
              Kontak, dan Privacy Policy) ke dalam satu file <code>.json</code> terstruktur. File
              backup dapat disimpan dengan aman di komputer Anda atau digunakan untuk restore instan.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                id="btn-export-json"
                className="btn btn-primary"
                disabled={exporting}
                onClick={handleExportBackup}
              >
                <i className={`fa-solid ${exporting ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>{' '}
                {exporting ? 'Generating...' : 'Download Full Backup (.json)'}
              </button>

              <button
                type="button"
                id="btn-preview-json"
                className="btn btn-secondary"
                onClick={handlePreviewBackup}
              >
                <i className="fa-regular fa-eye"></i> Preview Backup Data
              </button>

              <button
                type="button"
                id="btn-import-json"
                className="btn btn-secondary"
                disabled={restoring}
                onClick={() => restoreInputRef.current?.click()}
              >
                <i className={`fa-solid ${restoring ? 'fa-spinner fa-spin' : 'fa-upload'}`}></i>{' '}
                {restoring ? 'Restoring...' : 'Restore from JSON'}
              </button>

              <input
                ref={restoreInputRef}
                type="file"
                id="input-import-json"
                aria-label="Upload Backup JSON File"
                accept="application/json"
                style={{ display: 'none' }}
                onChange={handleImportBackup}
              />
            </div>
          </div>

          {/* SEEDER CARD */}
          <div className="card" style={{ marginBottom: 0, background: 'var(--bg-card-alt)', flex: 1 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <i className="fa-solid fa-seedling"></i> Initial Database Seeder
            </h3>
            <p
              style={{
                fontSize: '0.86rem',
                color: 'var(--text-muted)',
                marginBottom: '1.25rem',
                lineHeight: 1.5
              }}
            >
              Mengisi ulang database Firestore secara otomatis dengan data awal bawaan: 9 portfolio
              projects, 11 tech skills, serta profil &amp; bio standar.
            </p>
            <button
              type="button"
              id="btn-seed-database"
              className="btn btn-secondary"
              onClick={handleSeedAll}
              disabled={seeding}
            >
              {seeding ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Seeding...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-bolt"></i> Run Initial Seeder
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* JSON PREVIEW MODAL */}
      {showPreviewModal && (
        <div
          id="backup-preview-modal"
          className="modal-backdrop show"
          onClick={(e) => {
            if (e.target.id === 'backup-preview-modal') setShowPreviewModal(false);
          }}
        >
          <div className="modal-content" style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem' }}>
                <i className="fa-solid fa-file-code"></i> Raw JSON Backup Preview
              </h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setShowPreviewModal(false)}
                aria-label="Close modal"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <pre
                style={{
                  maxHeight: '380px',
                  overflowY: 'auto',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card-alt)',
                  color: 'var(--text-main)',
                  fontSize: '0.78rem',
                  fontFamily: 'monospace',
                  lineHeight: 1.45,
                  border: '1px solid var(--border-color)'
                }}
              >
                {previewJsonText}
              </pre>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  navigator.clipboard.writeText(previewJsonText);
                  showToast('JSON copied to clipboard!', 'info');
                }}
              >
                <i className="fa-regular fa-copy"></i> Copy JSON
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setShowPreviewModal(false);
                  handleExportBackup();
                }}
              >
                <i className="fa-solid fa-download"></i> Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
