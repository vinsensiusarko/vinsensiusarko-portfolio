import { useState, useEffect, useRef, useCallback } from 'react';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  IconBolt,
  IconCircleCheck,
  IconCopy,
  IconDatabase,
  IconDownload,
  IconEye,
  IconFileCode,
  IconLoader2,
  IconSeeding,
  IconShieldCheck,
  IconUpload
} from '@tabler/icons-react';
import { db } from '../../../services/firebase';
import { useConfirm } from '../../../context/ConfirmContext';
import {
  FALLBACK_PROJECTS,
  FALLBACK_SKILLS,
  FALLBACK_SITE_SETTINGS,
  FALLBACK_CONTACT_SETTINGS,
  FALLBACK_PRIVACY_POLICY
} from '../../../data/fallbackData';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../../../components/ui/dialog';
import { Skeleton } from '../../../components/ui/skeleton';
import { AdminPageHeader } from '../components/AdminPageHeader';

export function AdminDatabaseTab({ reloadAll, showToast }) {
  const confirm = useConfirm();
  const [seeding, setSeeding] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
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

  const loadStats = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleSeedAll = async () => {
    if (!db) return;
    const ok = await confirm({
      title: 'Seed Firestore Database?',
      message:
        'Tindakan ini akan mengisi database Firestore dengan data bawaan: 9 proyek, 11 skills, dan pengaturan profil. Lanjutkan?',
      confirmText: 'Ya, Jalankan Seeder',
      cancelText: 'Batal',
      variant: 'warning'
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
      await loadStats();
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

    return {
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
    if (!db || previewing) return;
    setPreviewing(true);
    try {
      showToast('Generating backup preview...', 'info');
      const backup = await generateBackupData();
      setPreviewJsonText(JSON.stringify(backup, null, 2));
      setShowPreviewModal(true);
    } catch (err) {
      showToast('Preview error: ' + err.message, 'error');
    } finally {
      setPreviewing(false);
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
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Struktur JSON backup tidak valid.');
      }

      const projectsCount = Array.isArray(data.projects) ? data.projects.length : 0;
      const skillsCount = Array.isArray(data.skills) ? data.skills.length : 0;

      const ok = await confirm({
        title: 'Restore Database Backup?',
        message: `File backup valid ditemukan: ${projectsCount} Projects, ${skillsCount} Skills, dan Pengaturan Sistem. Yakin ingin me-restore data ini ke database Firestore?`,
        confirmText: 'Ya, Jalankan Restore',
        cancelText: 'Batal',
        variant: 'warning'
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
      await loadStats();
    } catch (err) {
      console.error('Import error:', err);
      showToast('Gagal restore JSON: ' + err.message, 'error');
    } finally {
      setRestoring(false);
      e.target.value = '';
    }
  };

  return (
    <section id="tab-database" className="flex flex-col gap-6">
      <AdminPageHeader
        title="Database & Backup Center"
        badge="Storage Mode: Base64 Direct"
        description="Comprehensive Firestore management: instant full JSON backup download, schema inspection, one-click restore, and starter data seeding."
      />

      {/* DATABASE HEALTH STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="gap-2 py-5">
          <CardContent className="flex flex-col gap-1.5 px-5">
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Projects Collection
            </span>
            {dbStats.loading ? (
              <Skeleton className="h-7 w-28" />
            ) : (
              <div className="font-mono text-2xl font-semibold tabular-nums text-foreground">
                {dbStats.projectsCount} Documents
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs font-medium text-success">
              <IconCircleCheck className="size-3.5" stroke={1.75} aria-hidden="true" />
              Synced with Firestore
            </div>
          </CardContent>
        </Card>

        <Card className="gap-2 py-5">
          <CardContent className="flex flex-col gap-1.5 px-5">
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Skills Collection
            </span>
            {dbStats.loading ? (
              <Skeleton className="h-7 w-28" />
            ) : (
              <div className="font-mono text-2xl font-semibold tabular-nums text-foreground">
                {dbStats.skillsCount} Documents
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs font-medium text-success">
              <IconCircleCheck className="size-3.5" stroke={1.75} aria-hidden="true" />
              Active Technologies
            </div>
          </CardContent>
        </Card>

        <Card className="gap-2 py-5">
          <CardContent className="flex flex-col gap-1.5 px-5">
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              System Settings
            </span>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <Badge variant={dbStats.hasProfile ? 'secondary' : 'outline'} className="text-xs">
                Profile
              </Badge>
              <Badge variant={dbStats.hasContact ? 'secondary' : 'outline'} className="text-xs">
                Contact
              </Badge>
              <Badge variant={dbStats.hasPrivacy ? 'secondary' : 'outline'} className="text-xs">
                Policy
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 pt-0.5 text-xs font-medium text-muted-foreground">
              {dbStats.loading ? (
                <span>Checking configuration...</span>
              ) : dbStats.hasProfile && dbStats.hasContact && dbStats.hasPrivacy ? (
                <span className="inline-flex items-center gap-1.5 text-success">
                  <IconShieldCheck className="size-3.5" stroke={1.75} aria-hidden="true" />
                  All Configured
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-warning">
                  <IconShieldCheck className="size-3.5" stroke={1.75} aria-hidden="true" />
                  Partial Configuration
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OPERATIONS GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="gap-4 py-5 lg:col-span-7">
          <CardHeader className="px-5 pb-0">
            <CardTitle className="font-display flex items-center gap-2 text-base font-semibold">
              <IconDatabase className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
              Full JSON Backup &amp; Restore
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Export your complete Cloud Firestore dataset (Projects, Skills, Profile, Contact, and Privacy Policy) into one structured <code className="font-mono">.json</code> file for local archiving or instant restore.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2.5 px-5">
            <Button
              type="button"
              id="btn-export-json"
              disabled={exporting}
              onClick={handleExportBackup}
            >
              {exporting ? (
                <IconLoader2
                  className="size-4 animate-spin"
                  stroke={1.75}
                  data-icon="inline-start"
                  aria-hidden="true"
                />
              ) : (
                <IconDownload
                  className="size-4"
                  stroke={1.75}
                  data-icon="inline-start"
                  aria-hidden="true"
                />
              )}
              {exporting ? 'Generating...' : 'Download Full Backup (.json)'}
            </Button>

            <Button
              type="button"
              id="btn-preview-json"
              variant="outline"
              disabled={previewing}
              onClick={handlePreviewBackup}
            >
              <IconEye className="size-4" stroke={1.75} data-icon="inline-start" aria-hidden="true" />
              Preview Backup Data
            </Button>

            <Button
              type="button"
              id="btn-import-json"
              variant="outline"
              disabled={restoring}
              onClick={() => restoreInputRef.current?.click()}
            >
              {restoring ? (
                <IconLoader2
                  className="size-4 animate-spin"
                  stroke={1.75}
                  data-icon="inline-start"
                  aria-hidden="true"
                />
              ) : (
                <IconUpload
                  className="size-4"
                  stroke={1.75}
                  data-icon="inline-start"
                  aria-hidden="true"
                />
              )}
              {restoring ? 'Restoring...' : 'Restore from JSON'}
            </Button>

            <input
              ref={restoreInputRef}
              type="file"
              id="input-import-json"
              aria-label="Upload Backup JSON File"
              accept="application/json"
              className="hidden"
              onChange={handleImportBackup}
            />
          </CardContent>
        </Card>

        <Card className="gap-4 border-warning/40 py-5 lg:col-span-5">
          <CardHeader className="px-5 pb-0">
            <CardTitle className="font-display flex items-center gap-2 text-base font-semibold">
              <IconSeeding className="size-4 text-warning" stroke={1.75} aria-hidden="true" />
              Initial Database Seeder
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Populate Firestore with starter portfolio content: 9 portfolio projects, 11 tech skills, and baseline profile, contact, and privacy settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5">
            <Button
              type="button"
              id="btn-seed-database"
              variant="outline"
              onClick={handleSeedAll}
              disabled={seeding}
            >
              {seeding ? (
                <>
                  <IconLoader2
                    className="size-4 animate-spin"
                    stroke={1.75}
                    data-icon="inline-start"
                    aria-hidden="true"
                  />
                  Seeding...
                </>
              ) : (
                <>
                  <IconBolt
                    className="size-4"
                    stroke={1.75}
                    data-icon="inline-start"
                    aria-hidden="true"
                  />
                  Run Initial Seeder
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* RAW JSON BACKUP PREVIEW DIALOG */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2 text-lg">
              <IconFileCode className="size-5 text-muted-foreground" stroke={1.75} aria-hidden="true" />
              Raw JSON Backup Preview
            </DialogTitle>
            <DialogDescription>
              Read-only snapshot of your current Firestore collections and settings.
            </DialogDescription>
          </DialogHeader>

          <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-xs leading-relaxed text-foreground">
            {previewJsonText}
          </pre>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                if (!navigator.clipboard?.writeText) {
                  showToast('Clipboard API not supported in this browser.', 'warning');
                  return;
                }
                try {
                  await navigator.clipboard.writeText(previewJsonText);
                  showToast('JSON copied to clipboard!', 'info');
                } catch (err) {
                  showToast('Failed to copy JSON: ' + err.message, 'error');
                }
              }}
            >
              <IconCopy className="size-4" stroke={1.75} data-icon="inline-start" aria-hidden="true" />
              Copy JSON
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowPreviewModal(false);
                handleExportBackup();
              }}
            >
              <IconDownload className="size-4" stroke={1.75} data-icon="inline-start" aria-hidden="true" />
              Download File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
