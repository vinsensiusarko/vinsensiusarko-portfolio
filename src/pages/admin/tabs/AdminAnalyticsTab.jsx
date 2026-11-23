import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  setDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import {
  IconBrowser,
  IconChartBar,
  IconCpu,
  IconDeviceMobile,
  IconDevices,
  IconEye,
  IconFileDownload,
  IconSparkles,
  IconTrash,
  IconUsers
} from '@tabler/icons-react';
import { db } from '../../../services/firebase';
import { useConfirm } from '../../../context/ConfirmContext';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { Skeleton } from '../../../components/ui/skeleton';
import { AdminPageHeader } from '../components/AdminPageHeader';

const DEFAULT_SUMMARY = {
  totalViews: 0,
  uniqueVisitors: 0,
  cvDownloads: 0,
  devices: { Desktop: 0, Mobile: 0, Tablet: 0 },
  browsers: { Chrome: 0, Safari: 0, Firefox: 0, Edge: 0, Other: 0 },
  os: { Windows: 0, Android: 0, iOS: 0, macOS: 0, Linux: 0, Other: 0 }
};

export function AdminAnalyticsTab({ initialSummary = null, initialDaily = null, showToast }) {
  const confirm = useConfirm();
  const [summary, setSummary] = useState(initialSummary || DEFAULT_SUMMARY);
  const [dailyStats, setDailyStats] = useState(initialDaily || []);
  const [loading, setLoading] = useState(!initialSummary);
  const [processing, setProcessing] = useState(false);

  const loadAnalytics = useCallback(async () => {
    if (!db) return;
    try {
      setLoading(true);
      const sumSnap = await getDoc(doc(db, 'analytics_summary', 'overview'));
      if (sumSnap.exists()) {
        setSummary({ ...DEFAULT_SUMMARY, ...sumSnap.data() });
      }

      const q = query(collection(db, 'analytics_daily'), orderBy('date', 'desc'), limit(7));
      const dailySnap = await getDocs(q);
      const days = dailySnap.docs.map((d) => d.data()).reverse();

      setDailyStats(days);
    } catch (err) {
      console.warn('Error loading analytics from Firestore:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialSummary) {
      loadAnalytics();
    }
  }, [initialSummary, loadAnalytics]);

  const totalViews = summary.totalViews || 0;
  const uniqueVisitors = summary.uniqueVisitors || 0;
  const cvDownloads = summary.cvDownloads || 0;

  const devices = summary.devices || {};
  const totalDeviceViews = Object.values(devices).reduce((a, b) => a + Number(b || 0), 0) || 1;
  const mobileCount = Number(devices.Mobile || 0);
  const mobileSharePct = Math.round((mobileCount / totalDeviceViews) * 100);

  const browsers = summary.browsers || {};
  const totalBrowserViews = Object.values(browsers).reduce((a, b) => a + Number(b || 0), 0) || 1;

  const osList = summary.os || {};
  const totalOsViews = Object.values(osList).reduce((a, b) => a + Number(b || 0), 0) || 1;

  const maxDailyViews = Math.max(...dailyStats.map((d) => Number(d.views || 0)), 10);

  const handleReset = async () => {
    const ok = await confirm({
      title: 'Reset Analytics Data?',
      message:
        'Apakah Anda yakin ingin mereset seluruh data statistik dan traffic pengunjung? Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Ya, Reset Data',
      cancelText: 'Batal',
      variant: 'danger'
    });
    if (!ok) return;

    if (!db) {
      setSummary(DEFAULT_SUMMARY);
      setDailyStats([]);
      showToast('Analytics reset (local only)', 'info');
      return;
    }

    try {
      setProcessing(true);
      await deleteDoc(doc(db, 'analytics_summary', 'overview'));

      const dailySnap = await getDocs(collection(db, 'analytics_daily'));
      if (!dailySnap.empty) {
        const docs = dailySnap.docs;
        for (let i = 0; i < docs.length; i += 450) {
          const batch = writeBatch(db);
          docs.slice(i, i + 450).forEach((d) => batch.delete(d.ref));
          await batch.commit();
        }
      }

      setSummary(DEFAULT_SUMMARY);
      setDailyStats([]);
      showToast('All analytics data successfully reset!', 'info');
    } catch (err) {
      console.error('Error resetting analytics:', err);
      showToast('Failed to reset analytics: ' + err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleSeedDemoData = async () => {
    const ok = await confirm({
      title: 'Seed Demo Traffic Data?',
      message:
        'Ingin mengisi contoh data analytics untuk preview dashboard? Ini akan menggantikan statistik yang ada saat ini.',
      confirmText: 'Ya, Isi Demo Data',
      cancelText: 'Batal',
      variant: 'info'
    });
    if (!ok) return;

    const demoSummary = {
      totalViews: 1480,
      uniqueVisitors: 920,
      cvDownloads: 68,
      devices: { Desktop: 820, Mobile: 580, Tablet: 80 },
      browsers: { Chrome: 940, Safari: 320, Firefox: 120, Edge: 70, Other: 30 },
      os: { Windows: 720, Android: 410, iOS: 210, macOS: 110, Linux: 30 }
    };

    const today = new Date();
    const demoDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const views = Math.floor(140 + Math.random() * 120);
      const uniques = Math.floor(views * 0.65);
      demoDays.push({ date: dateStr, views, uniques });
    }

    if (!db) {
      setSummary(demoSummary);
      setDailyStats(demoDays);
      showToast('Demo analytics data loaded!', 'success');
      return;
    }

    try {
      setProcessing(true);
      await setDoc(doc(db, 'analytics_summary', 'overview'), demoSummary, { merge: true });

      const batch = writeBatch(db);
      demoDays.forEach((day) => {
        batch.set(doc(db, 'analytics_daily', day.date), day, { merge: true });
      });
      await batch.commit();

      setSummary(demoSummary);
      setDailyStats(demoDays);
      showToast('Demo analytics data successfully seeded to Firestore!', 'success');
    } catch (err) {
      console.error('Error seeding demo analytics:', err);
      showToast('Failed to seed analytics: ' + err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  const kpiCards = [
    {
      label: 'Total Page Views',
      value: totalViews.toLocaleString(),
      subtext: 'All visitor page loads',
      Icon: IconEye
    },
    {
      label: 'Unique Visitors',
      value: uniqueVisitors.toLocaleString(),
      subtext: 'Deduplicated sessions',
      Icon: IconUsers
    },
    {
      label: 'CV Resume Downloads',
      value: cvDownloads.toLocaleString(),
      subtext: 'Recruiter conversion rate',
      Icon: IconFileDownload
    },
    {
      label: 'Mobile Traffic Share',
      value: `${mobileSharePct}%`,
      subtext: `${mobileCount.toLocaleString()} mobile visits`,
      Icon: IconDeviceMobile
    }
  ];

  return (
    <section id="tab-analytics" className="flex flex-col gap-6">
      <AdminPageHeader
        title="Visitor Analytics & Traffic Insights"
        description="Real-time privacy-preserving portfolio metrics, device distribution, and conversion tracking."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSeedDemoData}
              disabled={processing}
              title="Populate demo statistics for visualization"
            >
              <IconSparkles className="size-4" stroke={1.75} data-icon="inline-start" aria-hidden="true" />
              Seed Demo Data
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleReset}
              disabled={processing}
              title="Reset all recorded traffic metrics"
            >
              <IconTrash className="size-4" stroke={1.75} data-icon="inline-start" aria-hidden="true" />
              Reset Analytics
            </Button>
          </>
        }
      />

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map(({ label, value, subtext, Icon }) => (
          <Card key={label} className="gap-3 py-5">
            <CardContent className="flex items-start justify-between gap-3 px-5">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="font-mono text-2xl font-semibold tracking-tight tabular-nums text-foreground">
                    {value}
                  </p>
                )}
                <span className="text-xs text-muted-foreground">{subtext}</span>
              </div>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
                <Icon className="size-5" stroke={1.75} aria-hidden="true" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 7-DAY TRAFFIC TREND (Pure CSS/Flex Bar Chart, no external chart libraries) */}
      <Card className="gap-4 py-5">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 px-5 pb-0">
          <div className="flex items-center gap-2">
            <IconChartBar className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
            <CardTitle className="font-display text-base font-semibold">
              7-Day Traffic Trend
            </CardTitle>
          </div>
          <CardDescription className="text-xs">Pageviews &amp; Unique Visitors</CardDescription>
        </CardHeader>

        <CardContent className="px-5">
          {loading ? (
            <div className="grid h-52 grid-cols-7 items-end gap-3 pt-4">
              {[40, 65, 55, 80, 90, 70, 95].map((h, i) => (
                <Skeleton key={i} className="w-full rounded-t-md" style={{ height: `${h}%` }} />
              ))}
            </div>
          ) : dailyStats.length === 0 ? (
            <div className="flex flex-col items-center gap-2.5 rounded-lg border border-dashed border-border py-12 text-center text-muted-foreground">
              <IconChartBar className="size-8 opacity-50" stroke={1.5} aria-hidden="true" />
              <p className="text-sm">
                No daily traffic data recorded yet. Click <strong>Seed Demo Data</strong> to preview chart.
              </p>
            </div>
          ) : (
            <div className="grid h-56 grid-cols-7 items-end gap-2 pt-6 sm:gap-4">
              {dailyStats.map((day) => {
                const heightPct = Math.max(Math.round(((day.views || 0) / maxDailyViews) * 100), 8);
                const dayLabel = day.date ? day.date.substring(5) : 'Day';
                return (
                  <div className="flex h-full flex-col items-center gap-2" key={day.date}>
                    <span className="font-mono text-[11px] font-medium tabular-nums text-muted-foreground">
                      {day.views}
                    </span>
                    <div className="flex w-full flex-1 items-end rounded-md bg-muted/50 p-1">
                      <div
                        className="w-full rounded-sm bg-foreground/85 transition-colors hover:bg-foreground"
                        style={{ height: `${heightPct}%` }}
                        title={`${day.date}: ${day.views} views, ${day.uniques || 0} unique visitors`}
                      />
                    </div>
                    <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                      {dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AUDIENCE BREAKDOWN CARDS */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="gap-4 py-5">
          <CardHeader className="px-5 pb-0">
            <CardTitle className="font-display flex items-center gap-2 text-base font-semibold">
              <IconDevices className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
              Device Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-5">
            {['Desktop', 'Mobile', 'Tablet'].map((dev) => {
              const count = Number(devices[dev] || 0);
              const pct = Math.round((count / totalDeviceViews) * 100);
              return (
                <div className="flex flex-col gap-1.5" key={dev}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{dev}</span>
                    <span className="font-mono tabular-nums text-muted-foreground">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <Progress value={pct} aria-label={`${dev} traffic share ${pct}%`} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="gap-4 py-5">
          <CardHeader className="px-5 pb-0">
            <CardTitle className="font-display flex items-center gap-2 text-base font-semibold">
              <IconBrowser className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
              Browser Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-5">
            {['Chrome', 'Safari', 'Firefox', 'Edge', ...(Number(browsers.Other || 0) > 0 ? ['Other'] : [])].map((brw) => {
              const count = Number(browsers[brw] || 0);
              const pct = Math.round((count / totalBrowserViews) * 100);
              return (
                <div className="flex flex-col gap-1.5" key={brw}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{brw}</span>
                    <span className="font-mono tabular-nums text-muted-foreground">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <Progress value={pct} aria-label={`${brw} browser share ${pct}%`} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="gap-4 py-5">
          <CardHeader className="px-5 pb-0">
            <CardTitle className="font-display flex items-center gap-2 text-base font-semibold">
              <IconCpu className="size-4 text-muted-foreground" stroke={1.75} aria-hidden="true" />
              Operating Systems
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-5">
            {['Windows', 'Android', 'iOS', 'macOS', 'Linux', ...(Number(osList.Other || 0) > 0 ? ['Other'] : [])].map((osName) => {
              const count = Number(osList[osName] || 0);
              const pct = Math.round((count / totalOsViews) * 100);
              return (
                <div className="flex flex-col gap-1.5" key={osName}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{osName}</span>
                    <span className="font-mono tabular-nums text-muted-foreground">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <Progress value={pct} aria-label={`${osName} operating system share ${pct}%`} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
