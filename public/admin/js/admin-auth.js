/**
 * Admin Authentication Controller
 * Uses Firebase Auth to protect the admin panel
 */

'use strict';

const AdminAuth = {
  currentUser: null,

  init() {
    if (!auth) {
      console.error('Firebase Auth not available');
      return;
    }

    // Ensure persistence is stored locally across tab closes and refreshes
    if (auth.setPersistence && typeof firebase !== 'undefined' && firebase.auth && firebase.auth.Auth) {
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((err) => {
        console.warn('Auth persistence error:', err);
      });
    }

    // Observer for authentication changes
    auth.onAuthStateChanged((user) => {
      this.currentUser = user;
      const loginOverlay = document.getElementById('login-screen');
      const adminApp = document.getElementById('admin-app');
      const userDisplay = document.getElementById('user-email-display');

      if (user) {
        try { localStorage.setItem('admin_logged_in', 'true'); } catch (e) {}
        document.documentElement.classList.add('is-authenticated');

        if (loginOverlay) loginOverlay.style.display = 'none';
        if (adminApp) adminApp.style.display = 'flex';
        if (userDisplay) userDisplay.textContent = user.email;

        // Initialize dashboard modules
        if (window.AdminMain) AdminMain.onUserLoggedIn();
      } else {
        try { localStorage.removeItem('admin_logged_in'); } catch (e) {}
        document.documentElement.classList.remove('is-authenticated');

        if (loginOverlay) loginOverlay.style.display = 'flex';
        if (adminApp) adminApp.style.display = 'none';
      }
    });

    // Login Form Submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const loginBtn = document.getElementById('login-btn');

        if (!email || !password) {
          AdminMain.showToast('Please enter email and password', 'error');
          return;
        }

        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';

        auth.signInWithEmailAndPassword(email, password)
          .then(() => {
            try { localStorage.setItem('admin_logged_in', 'true'); } catch (e) {}
            document.documentElement.classList.add('is-authenticated');
            AdminMain.showToast('Successfully signed in!', 'success');
            loginBtn.disabled = false;
            loginBtn.innerHTML = 'Sign In';
          })
          .catch((error) => {
            loginBtn.disabled = false;
            loginBtn.innerHTML = 'Sign In';
            console.error('Login error:', error);
            AdminMain.showToast(error.message || 'Login failed', 'error');
          });
      });
    }

    // Logout Button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        try { localStorage.removeItem('admin_logged_in'); } catch (e) {}
        document.documentElement.classList.remove('is-authenticated');
        auth.signOut().then(() => {
          AdminMain.showToast('Logged out', 'info');
        });
      });
    }
  }
};

window.AdminAuth = AdminAuth;
