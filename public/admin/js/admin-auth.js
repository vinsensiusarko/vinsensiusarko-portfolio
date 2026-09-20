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
      const splashScreen = document.getElementById('auth-splash-screen');
      if (splashScreen) splashScreen.style.display = 'none';
      document.documentElement.classList.add('is-unauthenticated');
      const loginOverlay = document.getElementById('login-screen');
      if (loginOverlay) loginOverlay.style.display = 'flex';
      return;
    }

    // Safety fallback: Never allow splash screen to hang for more than 1 second
    setTimeout(() => {
      const splashScreen = document.getElementById('auth-splash-screen');
      if (splashScreen && !document.documentElement.classList.contains('is-authenticated')) {
        splashScreen.style.display = 'none';
        document.documentElement.classList.add('is-unauthenticated');
        const loginOverlay = document.getElementById('login-screen');
        if (loginOverlay) loginOverlay.style.display = 'flex';
      }
    }, 1000);

    // Ensure persistence is stored locally across tab closes and refreshes
    if (auth.setPersistence && typeof firebase !== 'undefined' && firebase.auth && firebase.auth.Auth) {
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((err) => {
        console.warn('Auth persistence error:', err);
      });
    }

    // Observer for authentication changes
    auth.onAuthStateChanged((user) => {
      this.currentUser = user;
      const splashScreen = document.getElementById('auth-splash-screen');
      const loginOverlay = document.getElementById('login-screen');
      const adminApp = document.getElementById('admin-app');
      const userDisplay = document.getElementById('user-email-display');

      // Dismiss the splash screen immediately
      if (splashScreen) {
        splashScreen.style.display = 'none';
      }

      if (user) {
        try { localStorage.setItem('admin_logged_in', 'true'); } catch (e) {}
        document.documentElement.classList.add('is-authenticated');
        document.documentElement.classList.remove('is-unauthenticated');

        if (loginOverlay) loginOverlay.style.display = 'none';
        if (adminApp) adminApp.style.display = 'block';
        if (userDisplay) userDisplay.textContent = user.email;

        // Initialize dashboard modules
        if (window.AdminMain) AdminMain.onUserLoggedIn();
      } else {
        try { localStorage.removeItem('admin_logged_in'); } catch (e) {}
        document.documentElement.classList.remove('is-authenticated');
        document.documentElement.classList.add('is-unauthenticated');

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
            document.documentElement.classList.remove('is-unauthenticated');
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
      logoutBtn.addEventListener('click', async () => {
        try {
          localStorage.removeItem('admin_logged_in');
        } catch (e) {}

        // Immediately update visual state to login screen
        document.documentElement.classList.remove('is-authenticated');
        document.documentElement.classList.add('is-unauthenticated');

        const splashScreen = document.getElementById('auth-splash-screen');
        const loginOverlay = document.getElementById('login-screen');
        const adminApp = document.getElementById('admin-app');

        if (splashScreen) splashScreen.style.display = 'none';
        if (adminApp) adminApp.style.display = 'none';
        if (loginOverlay) loginOverlay.style.display = 'flex';

        if (window.AdminMain) {
          AdminMain.showToast('Logged out successfully', 'info');
        }

        if (auth) {
          try {
            await auth.signOut();
          } catch (err) {
            console.warn('SignOut error:', err);
          }
        }
      });
    }
  }
};

window.AdminAuth = AdminAuth;
