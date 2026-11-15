import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { useTheme } from '../../context/ThemeContext';
import { AdminLogin } from './AdminLogin';
import { AdminDashboardSkeleton, AdminStatsShimmer } from './AdminShimmer';
import { AdminProjectsTab } from './tabs/AdminProjectsTab';
import { AdminSkillsTab } from './tabs/AdminSkillsTab';
import { AdminProfileTab } from './tabs/AdminProfileTab';
import { AdminContactTab } from './tabs/AdminContactTab';
import { AdminPrivacyTab } from './tabs/AdminPrivacyTab';
import { AdminDatabaseTab } from './tabs/AdminDatabaseTab';
import '../../styles/admin.css';

const TABS = [
  { id: 'projects', label: 'Projects', title: 'Projects Management', icon: 'fa-solid fa-layer-group' },
  { id: 'skills', label: 'Skills & Experience', title: 'Skills & Tools Management', icon: 'fa-solid fa-code' },
  { id: 'profile', label: 'Profile & Bio', title: 'Profile, Bio & CV Resume', icon: 'fa-solid fa-id-card' },
  { id: 'contact', label: 'Contact & Socials', title: 'Contact & Social Channels', icon: 'fa-solid fa-address-book' },
  { id: 'privacy', label: 'Privacy Policy', title: 'Privacy Policy Settings', icon: 'fa-solid fa-shield-halved' },
  { id: 'database', label: 'Database Seeder', title: 'Database & Migration Tools', icon: 'fa-solid fa-database' }
];

const ACTIVE_TAB_KEY = 'admin_active_tab';

export function AdminPage() {
  const { theme, toggleTheme } = useTheme();
  const [authStatus, setAuthStatus] = useState('checking'); // 'checking' | 'unauthenticated' | 'authenticated'
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_TAB_KEY);
      return TABS.some((t) => t.id === saved) ? saved : 'projects';
    } catch {
      return 'projects';
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const loadProjects = useCallback(async () => {
    if (!db) return;
    try {
      const q = query(collection(db, 'projects'), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      items.sort((a, b) => {
        const orderDiff = (Number(a.order) || 99) - (Number(b.order) || 99);
        if (orderDiff !== 0) return orderDiff;
        return String(a.title || '').localeCompare(String(b.title || ''));
      });

      let needsNormalization = false;
      const batch = writeBatch(db);
      items.forEach((p, idx) => {
        const expectedOrder = idx + 1;
        if (Number(p.order) !== expectedOrder) {
          p.order = expectedOrder;
          batch.update(doc(db, 'projects', p.id), { order: expectedOrder });
          needsNormalization = true;
        }
      });

      if (needsNormalization && items.length > 0) {
        await batch.commit();
      }

      setProjects(items);
    } catch (err) {
      console.error('Error loading projects in Admin:', err);
      showToast('Error loading projects: ' + err.message, 'error');
    }
  }, [showToast]);

  const loadSkills = useCallback(async () => {
    if (!db) return;
    try {
      const q = query(collection(db, 'skills'), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      setSkills(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error loading skills in Admin:', err);
      showToast('Error loading skills: ' + err.message, 'error');
    }
  }, [showToast]);

  const reloadAll = useCallback(async () => {
    setLoadingData(true);
    try {
      await Promise.all([loadProjects(), loadSkills()]);
    } finally {
      setLoadingData(false);
    }
  }, [loadProjects, loadSkills]);

  useEffect(() => {
    document.title = 'Admin Dashboard | Vinsensius Arka Portfolio';
  }, []);

  useEffect(() => {
    if (!auth) {
      setAuthStatus('unauthenticated');
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          setAuthStatus('authenticated');
          reloadAll();
        } else {
          setUser(null);
          setAuthStatus('unauthenticated');
        }
      });
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    } catch {
      setAuthStatus('unauthenticated');
    }
  }, [reloadAll]);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
    try {
      localStorage.setItem(ACTIVE_TAB_KEY, tabId);
    } catch {
      // ignore storage error
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      showToast('Signed out successfully.', 'info');
    } catch (err) {
      console.error('Logout error:', err);
      showToast('Error signing out.', 'error');
    }
  };

  const activeTabMeta = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <div className="admin-shell">
      {authStatus === 'checking' && <AdminDashboardSkeleton />}

      {authStatus === 'unauthenticated' && <AdminLogin showToast={showToast} />}

      {authStatus === 'authenticated' && (
        <div id="admin-app" className="admin-app">
          <div
            id="sidebar-backdrop"
            className={`sidebar-backdrop ${sidebarOpen ? 'show' : ''}`}
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* SIDEBAR */}
          <aside id="admin-sidebar" className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-brand">
              <i className="fa-solid fa-bolt"></i>
              <span>Arka CMS</span>
            </div>

            <ul className="sidebar-menu">
              {TABS.map((tab) => (
                <li key={tab.id}>
                  <button
                    type="button"
                    className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => handleSelectTab(tab.id)}
                  >
                    <i className={tab.icon}></i>
                    <span>{tab.label}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="sidebar-footer">
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Signed in as</div>
                <div
                  id="admin-user-email"
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {user?.email || 'Admin'}
                </div>
              </div>
              <button
                type="button"
                id="logout-btn"
                className="btn-icon"
                title="Sign Out"
                aria-label="Sign Out"
                onClick={handleLogout}
              >
                <i className="fa-solid fa-right-from-bracket"></i>
              </button>
            </div>
          </aside>

          {/* MAIN WORKSPACE */}
          <div className="admin-main">
            {/* TOPBAR */}
            <header className="admin-header">
              <div className="header-left">
                <button
                  type="button"
                  id="sidebar-toggle-btn"
                  className="menu-toggle-btn"
                  aria-label="Toggle Menu"
                  onClick={() => setSidebarOpen((prev) => !prev)}
                >
                  <i className="fa-solid fa-bars"></i>
                </button>
                <h1 id="topbar-title" className="header-title">
                  {activeTabMeta.title}
                </h1>
              </div>

              <div className="header-right">
                <Link
                  to="/"
                  target="_blank"
                  className="btn btn-secondary btn-sm public-site-link"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square"></i>{' '}
                  <span className="btn-text">View Live Site</span>
                </Link>
                <button
                  type="button"
                  id="admin-theme-toggle"
                  className="btn-icon"
                  aria-label="Toggle Dark/Light Mode"
                  onClick={toggleTheme}
                >
                  <i className={theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon'}></i>
                </button>
              </div>
            </header>

            {/* CONTENT */}
            <main className="admin-content">
              {/* Quick Stats */}
              {loadingData ? (
                <AdminStatsShimmer />
              ) : (
                <div className="stats-grid">
                  <div className="stat-box">
                    <div className="stat-icon">
                      <i className="fa-solid fa-folder-open"></i>
                    </div>
                    <div className="stat-info">
                      <h4>Total Projects</h4>
                      <div id="stat-projects-count" className="stat-value">
                        {projects.length}
                      </div>
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-icon">
                      <i className="fa-solid fa-laptop-code"></i>
                    </div>
                    <div className="stat-info">
                      <h4>Active Skills</h4>
                      <div id="stat-skills-count" className="stat-value">
                        {skills.length}
                      </div>
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-icon">
                      <i className="fa-solid fa-cloud-bolt"></i>
                    </div>
                    <div className="stat-info">
                      <h4>Storage Mode</h4>
                      <div className="stat-value" style={{ fontSize: '1.1rem', color: '#10b981' }}>
                        Base64 Direct
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Tab Content */}
              {activeTab === 'projects' && (
                <AdminProjectsTab
                  projects={projects}
                  setProjects={setProjects}
                  reloadProjects={loadProjects}
                  showToast={showToast}
                  loading={loadingData}
                />
              )}
              {activeTab === 'skills' && (
                <AdminSkillsTab
                  skills={skills}
                  reloadSkills={loadSkills}
                  showToast={showToast}
                  loading={loadingData}
                />
              )}
              {activeTab === 'profile' && <AdminProfileTab showToast={showToast} />}
              {activeTab === 'contact' && <AdminContactTab showToast={showToast} />}
              {activeTab === 'privacy' && <AdminPrivacyTab showToast={showToast} />}
              {activeTab === 'database' && (
                <AdminDatabaseTab reloadAll={reloadAll} showToast={showToast} />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Floating Toast Container */}
      <div id="toast-container" className="toast-container">
        {toasts.map((toast) => {
          const iconMap = {
            success: 'fa-solid fa-circle-check',
            error: 'fa-solid fa-circle-exclamation',
            info: 'fa-solid fa-circle-info'
          };
          return (
            <div key={toast.id} className={`toast toast-${toast.type} show`}>
              <i className={iconMap[toast.type] || iconMap.info}></i>
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
