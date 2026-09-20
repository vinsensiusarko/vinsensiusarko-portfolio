/**
 * Admin Main Controller & Navigation Router
 */

'use strict';

const AdminMain = {
  currentTab: 'projects',

  init() {
    this.initTheme();
    this.initNavigation();
    this.initModals();

    const savedTab = localStorage.getItem('admin_active_tab') || 'projects';
    this.switchTab(savedTab);

    // If pre-authenticated session detected, start loading data immediately
    if (localStorage.getItem('admin_logged_in') === 'true') {
      if (window.AdminProjects) AdminProjects.loadProjects();
      if (window.AdminSkills) AdminSkills.loadSkills();
      if (window.AdminProfile) AdminProfile.loadProfile();
    }

    // Initialize sub-controllers
    if (window.AdminAuth) AdminAuth.init();
    if (window.AdminProjects) AdminProjects.init();
    if (window.AdminSkills) AdminSkills.init();
    if (window.AdminProfile) AdminProfile.init();
  },

  onUserLoggedIn() {
    const savedTab = localStorage.getItem('admin_active_tab') || 'projects';
    this.switchTab(savedTab);
    if (!window.AdminProjects?.projects?.length) {
      AdminProjects.loadProjects();
    }
    if (!window.AdminSkills?.skills?.length) {
      AdminSkills.loadSkills();
    }
    AdminProfile.loadProfile();
  },

  initTheme() {
    const root = document.documentElement;
    const toggle = document.getElementById('theme-toggle-btn');
    const saved = localStorage.getItem('admin-theme') || 'light';

    root.setAttribute('data-theme', saved);
    this.updateThemeIcon(saved);

    if (toggle) {
      toggle.addEventListener('click', () => {
        const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        localStorage.setItem('admin-theme', next);
        this.updateThemeIcon(next);
      });
    }
  },

  updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle-btn i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  },

  initNavigation() {
    // Mobile sidebar toggle & backdrop
    const menuBtn = document.getElementById('menu-toggle-btn');
    const sidebar = document.querySelector('.admin-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    const closeMobileSidebar = () => {
      if (sidebar) sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('show');
    };

    // Sidebar navigation tabs
    document.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.getAttribute('data-tab');
        this.switchTab(tab);
        if (window.innerWidth <= 900) {
          closeMobileSidebar();
        }
      });
    });

    if (menuBtn && sidebar) {
      menuBtn.addEventListener('click', () => {
        const isOpen = sidebar.classList.toggle('open');
        if (backdrop) backdrop.classList.toggle('show', isOpen);
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeMobileSidebar);
    }

    // Ensure public site links point to main domain when running on admin subdomain
    if (window.location.hostname.startsWith('admin.')) {
      document.querySelectorAll('.public-site-link').forEach(link => {
        link.href = 'https://vinsensiusarka.id/';
      });
    }
  },

  switchTab(tabName) {
    this.currentTab = tabName;
    try { localStorage.setItem('admin_active_tab', tabName); } catch (e) {}

    // Update active sidebar link
    document.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-tab') === tabName);
    });

    // Update visible view
    document.querySelectorAll('.tab-view').forEach(view => {
      view.style.display = view.id === `tab-${tabName}` ? 'block' : 'none';
    });

    // Update header title
    const titleEl = document.getElementById('header-view-title');
    if (titleEl) {
      const titles = {
        projects: 'Projects Management',
        skills: 'Skills & Tools Management',
        profile: 'Profile, Bio & CV Resume',
        contact: 'Contact & Social Channels',
        database: 'Database & Migration Tools'
      };
      titleEl.textContent = titles[tabName] || 'Dashboard';
    }
  },

  initModals() {
    // Close modal on close button or backdrop click
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-backdrop');
        if (modal) modal.classList.remove('show');
      });
    });

    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove('show');
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.show').forEach(m => m.classList.remove('show'));
      }
    });
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: 'fa-solid fa-circle-check',
      error: 'fa-solid fa-circle-exclamation',
      info: 'fa-solid fa-circle-info',
      warning: 'fa-solid fa-triangle-exclamation'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="${icons[type] || icons.info}"></i> <span>${message}</span>`;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  updateStats() {
    const projectCount = document.getElementById('stats-project-count');
    const skillCount = document.getElementById('stats-skill-count');

    if (projectCount && window.AdminProjects) {
      projectCount.textContent = AdminProjects.projects.length;
    }
    if (skillCount && window.AdminSkills) {
      skillCount.textContent = AdminSkills.skills.length;
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    AdminMain.init();
  });
} else {
  AdminMain.init();
}

window.AdminMain = AdminMain;
