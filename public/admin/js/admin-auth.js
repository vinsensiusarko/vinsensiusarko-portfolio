/**
 * Admin Authentication Controller
 * Uses Firebase Auth to protect the admin panel with instant state switching
 */

'use strict';

const AdminAuth = {
  currentUser: null,

  init() {
    if (!auth) {
      console.error('Firebase Auth not available');
      this.showUnauthenticated();
      return;
    }

    // Observer for authentication changes with immediate session restoration
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.showAuthenticated(user);
      } else {
        this.showUnauthenticated();
      }
    });

    // Login Form Submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        const loginBtn = document.getElementById('login-btn');

        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value : '';

        if (!email || !password) {
          if (window.AdminMain) AdminMain.showToast('Please enter email and password', 'error');
          return;
        }

        if (loginBtn) {
          loginBtn.disabled = true;
          loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';
        }

        try {
          const userCredential = await auth.signInWithEmailAndPassword(email, password);
          const user = userCredential.user;

          // Transition to dashboard immediately without waiting for anything else
          this.showAuthenticated(user);

          if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = 'Sign In';
          }
          if (passwordInput) {
            passwordInput.value = '';
          }

          if (window.AdminMain) {
            AdminMain.showToast('Successfully signed in!', 'success');
          }
        } catch (error) {
          if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = 'Sign In';
          }
          console.error('Login error:', error);
          if (window.AdminMain) {
            AdminMain.showToast(error.message || 'Login failed', 'error');
          }
        }
      });
    }

    // Logout Button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        // Immediately switch UI to login screen
        this.showUnauthenticated();

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
  },

  /**
   * Instantly switch all DOM states, classes, and styles to Authenticated
   */
  showAuthenticated(user) {
    this.currentUser = user;
    try {
      localStorage.setItem('admin_logged_in', 'true');
    } catch (e) {}

    document.documentElement.classList.add('is-authenticated');
    document.documentElement.classList.remove('is-unauthenticated');

    const splashScreen = document.getElementById('auth-splash-screen');
    const loginOverlay = document.getElementById('login-screen');
    const adminApp = document.getElementById('admin-app');
    const userDisplay = document.getElementById('user-email-display');

    if (splashScreen) {
      splashScreen.style.display = 'none';
      splashScreen.style.opacity = '0';
      splashScreen.style.visibility = 'hidden';
    }
    if (loginOverlay) {
      loginOverlay.style.display = 'none';
    }
    if (adminApp) {
      adminApp.style.display = 'block';
    }
    if (userDisplay && user) {
      userDisplay.textContent = user.email || 'admin';
    }

    // Trigger data loading in dashboard
    if (window.AdminMain && typeof AdminMain.onUserLoggedIn === 'function') {
      AdminMain.onUserLoggedIn();
    }
  },

  /**
   * Instantly switch all DOM states, classes, and styles to Unauthenticated
   */
  showUnauthenticated() {
    this.currentUser = null;
    try {
      localStorage.removeItem('admin_logged_in');
    } catch (e) {}

    document.documentElement.classList.remove('is-authenticated');
    document.documentElement.classList.add('is-unauthenticated');

    const splashScreen = document.getElementById('auth-splash-screen');
    const loginOverlay = document.getElementById('login-screen');
    const adminApp = document.getElementById('admin-app');

    if (splashScreen) {
      splashScreen.style.display = 'none';
      splashScreen.style.opacity = '0';
      splashScreen.style.visibility = 'hidden';
    }
    if (adminApp) {
      adminApp.style.display = 'none';
    }
    if (loginOverlay) {
      loginOverlay.style.display = 'flex';
    }
  }
};

window.AdminAuth = AdminAuth;
