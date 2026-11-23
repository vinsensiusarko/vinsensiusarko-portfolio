import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { toast } from 'sonner';
import {
  IconAddressBook,
  IconChartLine,
  IconCode,
  IconDatabase,
  IconExternalLink,
  IconFolders,
  IconId,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLogout,
  IconMenu2,
  IconMoon,
  IconShare,
  IconShieldCheck,
  IconSun
} from '@tabler/icons-react';
import { auth, db } from '../../services/firebase';
import { useTheme } from '../../context/ThemeContext';
import { ConfirmProvider, useConfirm } from '../../context/ConfirmContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '../../components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../../components/ui/tooltip';
import { AdminLogin } from './AdminLogin';
import { AdminDashboardSkeleton } from './AdminShimmer';
import { AdminProjectsTab } from './tabs/AdminProjectsTab';
import { AdminSkillsTab } from './tabs/AdminSkillsTab';
import { AdminAnalyticsTab } from './tabs/AdminAnalyticsTab';
import { AdminProfileTab } from './tabs/AdminProfileTab';
import { AdminContactTab } from './tabs/AdminContactTab';
import { AdminPrivacyTab } from './tabs/AdminPrivacyTab';
import { AdminSeoTab } from './tabs/AdminSeoTab';
import { AdminDatabaseTab } from './tabs/AdminDatabaseTab';
import { FALLBACK_SKILLS } from '../../data/fallbackData';

const TAB_GROUPS = [
  {
    label: 'Content',
    items: [
      { id: 'projects', label: 'Projects', title: 'Projects Management', Icon: IconFolders },
      { id: 'skills', label: 'Skills & Experience', title: 'Skills & Tools Management', Icon: IconCode }
    ]
  },
  {
    label: 'Insights',
    items: [
      { id: 'analytics', label: 'Visitor Analytics', title: 'Visitor Analytics & Traffic Insights', Icon: IconChartLine }
    ]
  },
  {
    label: 'Site Settings',
    items: [
      { id: 'profile', label: 'Profile & Bio', title: 'Profile, Bio & CV Resume', Icon: IconId },
      { id: 'contact', label: 'Contact & Socials', title: 'Contact & Social Channels', Icon: IconAddressBook },
      { id: 'privacy', label: 'Privacy Policy', title: 'Privacy Policy Settings', Icon: IconShieldCheck },
      { id: 'seo', label: 'SEO & OpenGraph', title: 'SEO Meta & OpenGraph Card Generator', Icon: IconShare }
    ]
  },
  {
    label: 'System',
    items: [
      { id: 'database', label: 'Backup & Database', title: 'Database Backup & Migration Utility', Icon: IconDatabase }
    ]
  }
];

const ALL_TABS = TAB_GROUPS.flatMap((g) => g.items);
const ACTIVE_TAB_KEY = 'admin_active_tab';
const SIDEBAR_COLLAPSED_KEY = 'admin_sidebar_collapsed';

function SidebarNavContent({
  activeTab,
  collapsed,
  counts,
  userEmail,
  idPrefix = '',
  onSelectTab,
  onLogout
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-between">
      <nav aria-label="Admin navigation" className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
        {TAB_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            {!collapsed ? (
              <div className="px-2.5 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                {group.label}
              </div>
            ) : (
              <Separator className="my-1" />
            )}

            <ul className="flex flex-col gap-0.5">
              {group.items.map((tab) => {
                const TabIcon = tab.Icon;
                const isActive = activeTab === tab.id;
                const count = counts[tab.id];

                const buttonEl = (
                  <button
                    type="button"
                    onClick={() => onSelectTab(tab.id)}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={collapsed ? tab.label : undefined}
                    className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      collapsed ? 'justify-center px-0' : 'justify-between'
                    } ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <TabIcon className="size-[18px] shrink-0" stroke={1.75} aria-hidden="true" />
                      {!collapsed ? <span className="truncate">{tab.label}</span> : null}
                    </span>
                    {!collapsed && typeof count === 'number' ? (
                      <Badge
                        variant={isActive ? 'secondary' : 'outline'}
                        className={`h-5 min-w-6 justify-center px-1.5 font-mono text-[11px] tabular-nums ${
                          isActive
                            ? 'border-transparent bg-primary-foreground/15 text-primary-foreground'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {count}
                      </Badge>
                    ) : null}
                  </button>
                );

                return (
                  <li key={tab.id}>
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>{buttonEl}</TooltipTrigger>
                        <TooltipContent side="right" className="flex items-center gap-2">
                          <span>{tab.label}</span>
                          {typeof count === 'number' ? (
                            <span className="font-mono text-xs opacity-75">({count})</span>
                          ) : null}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      buttonEl
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div
          className={`flex items-center gap-2 rounded-lg bg-muted/50 p-2 ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {!collapsed ? (
            <div className="min-w-0 flex-1 px-1">
              <div className="text-[11px] text-muted-foreground">Signed in as</div>
              <div
                id={`${idPrefix}admin-user-email`}
                className="truncate text-xs font-semibold text-foreground"
                title={userEmail}
              >
                {userEmail}
              </div>
            </div>
          ) : null}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                id={`${idPrefix}logout-btn`}
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive-text"
                aria-label="Sign Out"
                onClick={onLogout}
              >
                <IconLogout className="size-4" stroke={1.75} aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={collapsed ? 'right' : 'top'}>Sign Out</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

function AdminDashboardContent() {
  const { theme, toggleTheme } = useTheme();
  const confirm = useConfirm();
  const [authStatus, setAuthStatus] = useState('checking'); // 'checking' | 'unauthenticated' | 'authenticated'
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_TAB_KEY);
      return ALL_TABS.some((t) => t.id === saved) ? saved : 'projects';
    } catch {
      return 'projects';
    }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem('portfolio_skills_cache');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch {
      // ignore
    }
    return FALLBACK_SKILLS;
  });
  const [loadingData, setLoadingData] = useState(true);

  const showToast = useCallback((message, type = 'success') => {
    if (type === 'error') {
      toast.error(message);
    } else if (type === 'warning') {
      toast.warning(message);
    } else if (type === 'info') {
      toast.info(message);
    } else {
      toast.success(message);
    }
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
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setSkills(items);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('portfolio_skills_cache', JSON.stringify(items));
        }
      } catch {
        // ignore
      }
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
    setMobileMenuOpen(false);
    try {
      localStorage.setItem(ACTIVE_TAB_KEY, tabId);
    } catch {
      // ignore storage error
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    setMobileMenuOpen(false);
    const ok = await confirm({
      title: 'Sign Out?',
      message: 'Are you sure you want to sign out of Arko CMS?',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      variant: 'warning'
    });
    if (!ok) return;

    try {
      await signOut(auth);
      showToast('Signed out successfully.', 'info');
    } catch (err) {
      console.error('Logout error:', err);
      showToast('Error signing out.', 'error');
    }
  };

  const activeTabMeta = ALL_TABS.find((t) => t.id === activeTab) || ALL_TABS[0];
  const sidebarCounts = {
    projects: projects.length,
    skills: skills.length
  };
  const userEmail = user?.email || 'Admin';

  return (
    <TooltipProvider delayDuration={200}>
      <div data-admin="true" className="min-h-dvh bg-background text-foreground">
        {authStatus === 'checking' && <AdminDashboardSkeleton />}

        {authStatus === 'unauthenticated' && (
          <AdminLogin showToast={showToast} theme={theme} toggleTheme={toggleTheme} />
        )}

        {authStatus === 'authenticated' && (
          <div id="admin-app" className="flex min-h-dvh w-full">
            {/* DESKTOP COLLAPSIBLE SIDEBAR */}
            <aside
              id="admin-sidebar"
              data-collapsed={sidebarCollapsed ? 'true' : 'false'}
              className={`sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 lg:flex ${
                sidebarCollapsed ? 'w-[68px]' : 'w-64'
              }`}
            >
              <div
                className={`flex h-14 items-center border-b border-border px-3 ${
                  sidebarCollapsed ? 'justify-center' : 'justify-between'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5 overflow-hidden px-1">
                  <BrandLogo size={26} />
                  {!sidebarCollapsed ? (
                    <div className="flex min-w-0 flex-col">
                      <span className="font-display truncate text-sm font-semibold tracking-tight text-foreground">
                        Arko CMS
                      </span>
                      <span className="truncate font-mono text-[10px] text-muted-foreground">
                        Studio Console
                      </span>
                    </div>
                  ) : null}
                </div>

                {!sidebarCollapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={toggleSidebarCollapse}
                        aria-label="Toggle Collapse Sidebar"
                      >
                        <IconLayoutSidebarLeftCollapse
                          className="size-4"
                          stroke={1.75}
                          aria-hidden="true"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Collapse Sidebar</TooltipContent>
                  </Tooltip>
                ) : null}
              </div>

              {sidebarCollapsed ? (
                <div className="flex justify-center border-b border-border py-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-foreground"
                        onClick={toggleSidebarCollapse}
                        aria-label="Toggle Collapse Sidebar"
                      >
                        <IconLayoutSidebarLeftExpand
                          className="size-4"
                          stroke={1.75}
                          aria-hidden="true"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Expand Sidebar</TooltipContent>
                  </Tooltip>
                </div>
              ) : null}

              <SidebarNavContent
                activeTab={activeTab}
                collapsed={sidebarCollapsed}
                counts={sidebarCounts}
                userEmail={userEmail}
                onSelectTab={handleSelectTab}
                onLogout={handleLogout}
              />
            </aside>

            {/* MOBILE DRAWER SHEET */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetContent side="left" className="flex w-72 flex-col gap-0 p-0">
                <SheetHeader className="flex h-14 flex-row items-center gap-2.5 border-b border-border px-4 py-0 text-left">
                  <BrandLogo size={26} />
                  <div className="flex flex-col">
                    <SheetTitle className="font-display text-sm font-semibold">
                      Arko CMS
                    </SheetTitle>
                    <SheetDescription className="font-mono text-[10px]">
                      Studio Console
                    </SheetDescription>
                  </div>
                </SheetHeader>
                <SidebarNavContent
                  activeTab={activeTab}
                  collapsed={false}
                  counts={sidebarCounts}
                  userEmail={userEmail}
                  idPrefix="mobile-"
                  onSelectTab={handleSelectTab}
                  onLogout={handleLogout}
                />
              </SheetContent>
            </Sheet>

            {/* MAIN WORKSPACE */}
            <div className="flex min-w-0 flex-1 flex-col">
              <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Button
                    type="button"
                    id="sidebar-toggle-btn"
                    variant="outline"
                    size="icon"
                    className="size-10 shrink-0 lg:hidden"
                    aria-label="Toggle Menu"
                    onClick={() => setMobileMenuOpen(true)}
                  >
                    <IconMenu2 className="size-5" stroke={1.75} aria-hidden="true" />
                  </Button>
                  <h1
                    id="topbar-title"
                    className="font-display truncate text-base font-semibold tracking-tight text-foreground sm:text-lg"
                  >
                    {activeTabMeta.title}
                  </h1>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="h-9">
                    <a
                      href="https://vinsensiusarka.id"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconExternalLink
                        className="size-4"
                        stroke={1.75}
                        data-icon="inline-start"
                        aria-hidden="true"
                      />
                      <span className="sr-only sm:not-sr-only">View Live Site</span>
                    </a>
                  </Button>

                  <Button
                    type="button"
                    id="admin-theme-toggle"
                    variant="outline"
                    size="icon"
                    className="size-9"
                    aria-label="Toggle Dark/Light Mode"
                    onClick={toggleTheme}
                  >
                    {theme === 'dark' ? (
                      <IconSun className="size-4" stroke={1.75} aria-hidden="true" />
                    ) : (
                      <IconMoon className="size-4" stroke={1.75} aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </header>

              <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 sm:p-6">
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
                    setSkills={setSkills}
                    reloadSkills={loadSkills}
                    showToast={showToast}
                    loading={loadingData}
                  />
                )}
                {activeTab === 'analytics' && <AdminAnalyticsTab showToast={showToast} />}
                {activeTab === 'profile' && <AdminProfileTab showToast={showToast} />}
                {activeTab === 'contact' && <AdminContactTab showToast={showToast} />}
                {activeTab === 'privacy' && <AdminPrivacyTab showToast={showToast} />}
                {activeTab === 'seo' && <AdminSeoTab showToast={showToast} />}
                {activeTab === 'database' && (
                  <AdminDatabaseTab reloadAll={reloadAll} showToast={showToast} />
                )}
              </main>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

export function AdminPage() {
  return (
    <ConfirmProvider>
      <AdminDashboardContent />
    </ConfirmProvider>
  );
}
