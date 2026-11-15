import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, collection, getDocs, query, orderBy, limit, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { useConfirm } from '../../../context/ConfirmContext';

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
      // Load overview summary
      const sumSnap = await getDoc(doc(db, 'analytics_summary', 'overview'));
      if (sumSnap.exists()) {
        setSummary({ ...DEFAULT_SUMMARY, ...sumSnap.data() });
      }

      // Load last 7 daily buckets efficiently
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

  // 7-day max views for proportional bar heights
  const maxDailyViews = Math.max(...dailyStats.map((d) => Number(d.views || 0)), 10);

  const handleReset = async () => {
    const ok = await confirm({
      title: 'Reset Analytics Data?',
      message: 'Apakah Anda yakin ingin mereset seluruh data statistik dan traffic pengunjung? Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Ya, Reset Data',
      cancelText: 'Batal',
      variant: 'danger',
      icon: 'fa-solid fa-triangle-exclamation'
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
        const batch = writeBatch(db);
        dailySnap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
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
      message: 'Ingin mengisi contoh data analytics untuk preview dashboard? Ini akan menggantikan statistik yang ada saat ini.',
      confirmText: 'Ya, Isi Demo Data',
      cancelText: 'Batal',
      variant: 'info',
      icon: 'fa-solid fa-chart-column'
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

  return (
    <section id="tab-analytics" className="tab-section">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Visitor Analytics &amp; Traffic Insights</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Real-time privacy-preserving portfolio metrics, device distribution, and conversion tracking.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleSeedDemoData}
              disabled={processing}
              title="Populate demo statistics for visualization"
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i> Seed Demo Data
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleReset}
              disabled={processing}
              title="Reset all recorded traffic metrics"
            >
              <i className="fa-solid fa-trash"></i> Reset Analytics
            </button>
          </div>
        </div>

        {/* TOP KPI CARDS */}
        <div className="analytics-kpi-grid">
          <div className="analytics-kpi-card">
            <div className="kpi-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
              <i className="fa-solid fa-eye"></i>
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Total Page Views</span>
              <h3 className="kpi-value">{totalViews.toLocaleString()}</h3>
              <span className="kpi-subtext">All visitor page loads</span>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="kpi-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Unique Visitors</span>
              <h3 className="kpi-value">{uniqueVisitors.toLocaleString()}</h3>
              <span className="kpi-subtext">Deduplicated sessions</span>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="kpi-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <i className="fa-solid fa-file-arrow-down"></i>
            </div>
            <div className="kpi-info">
              <span className="kpi-label">CV Resume Downloads</span>
              <h3 className="kpi-value">{cvDownloads.toLocaleString()}</h3>
              <span className="kpi-subtext">Recruiter conversion rate</span>
            </div>
          </div>

          <div className="analytics-kpi-card">
            <div className="kpi-icon-box" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' }}>
              <i className="fa-solid fa-mobile-screen"></i>
            </div>
            <div className="kpi-info">
              <span className="kpi-label">Mobile Traffic Share</span>
              <h3 className="kpi-value">{mobileSharePct}%</h3>
              <span className="kpi-subtext">{mobileCount.toLocaleString()} mobile visits</span>
            </div>
          </div>
        </div>

        {/* 7-DAY TRAFFIC TREND (Dependency-Free Pure CSS Flex Chart) */}
        <div className="analytics-panel" style={{ marginTop: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-chart-column" style={{ color: 'var(--primary)' }}></i>
              7-Day Traffic Trend
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Pageviews &amp; Unique Visitors
            </span>
          </div>

          {dailyStats.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-chart-area" style={{ fontSize: '2.2rem', marginBottom: '0.75rem', opacity: 0.5 }}></i>
              <p style={{ margin: 0 }}>No daily traffic data recorded yet. Click <strong>Seed Demo Data</strong> to preview chart.</p>
            </div>
          ) : (
            <div className="analytics-bar-chart">
              {dailyStats.map((day) => {
                const heightPct = Math.max(Math.round(((day.views || 0) / maxDailyViews) * 100), 8);
                const dayLabel = day.date ? day.date.substring(5) : 'Day';
                return (
                  <div className="chart-bar-col" key={day.date}>
                    <div className="chart-bar-track">
                      <div
                        className="chart-bar-fill"
                        style={{ height: `${heightPct}%` }}
                        title={`${day.date}: ${day.views} views, ${day.uniques || 0} unique visitors`}
                      >
                        <span className="chart-bar-tooltip">{day.views}</span>
                      </div>
                    </div>
                    <span className="chart-bar-date">{dayLabel}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AUDIENCE BREAKDOWN CARDS */}
        <div className="analytics-breakdown-grid" style={{ marginTop: '1.75rem' }}>
          {/* Device Distribution */}
          <div className="analytics-panel">
            <h3 style={{ fontSize: '1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-laptop-mobile" style={{ color: '#0ea5e9' }}></i>
              Device Breakdown
            </h3>
            <div className="distribution-list">
              {['Desktop', 'Mobile', 'Tablet'].map((dev) => {
                const count = Number(devices[dev] || 0);
                const pct = Math.round((count / totalDeviceViews) * 100);
                return (
                  <div className="distribution-row" key={dev}>
                    <div className="distribution-label">
                      <span>{dev}</span>
                      <span className="distribution-count">{count} ({pct}%)</span>
                    </div>
                    <div className="distribution-bar-track">
                      <div className="distribution-bar-fill" style={{ width: `${pct}%`, background: dev === 'Mobile' ? '#0ea5e9' : dev === 'Tablet' ? '#f59e0b' : '#6366f1' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Browser Distribution */}
          <div className="analytics-panel">
            <h3 style={{ fontSize: '1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-brands fa-chrome" style={{ color: '#10b981' }}></i>
              Browser Distribution
            </h3>
            <div className="distribution-list">
              {['Chrome', 'Safari', 'Firefox', 'Edge'].map((brw) => {
                const count = Number(browsers[brw] || 0);
                const pct = Math.round((count / totalBrowserViews) * 100);
                return (
                  <div className="distribution-row" key={brw}>
                    <div className="distribution-label">
                      <span>{brw}</span>
                      <span className="distribution-count">{count} ({pct}%)</span>
                    </div>
                    <div className="distribution-bar-track">
                      <div className="distribution-bar-fill" style={{ width: `${pct}%`, background: '#10b981' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Operating Systems */}
          <div className="analytics-panel">
            <h3 style={{ fontSize: '1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fa-solid fa-microchip" style={{ color: '#ec4899' }}></i>
              Operating Systems
            </h3>
            <div className="distribution-list">
              {['Windows', 'Android', 'iOS', 'macOS', 'Linux'].map((osName) => {
                const count = Number(osList[osName] || 0);
                const pct = Math.round((count / totalOsViews) * 100);
                return (
                  <div className="distribution-row" key={osName}>
                    <div className="distribution-label">
                      <span>{osName}</span>
                      <span className="distribution-count">{count} ({pct}%)</span>
                    </div>
                    <div className="distribution-bar-track">
                      <div className="distribution-bar-fill" style={{ width: `${pct}%`, background: '#ec4899' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
