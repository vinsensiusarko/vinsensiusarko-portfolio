import { useState } from 'react';
import { Link } from 'react-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { BrandLogo } from '../../components/common/BrandLogo';

export function AdminLogin({ showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth) {
      showToast('Firebase Authentication is not initialized.', 'error');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      showToast('Welcome back, Admin!', 'success');
    } catch (error) {
      console.error('Login error:', error);
      let msg = 'Authentication failed. Check email and password.';
      if (error.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Please try again later.';
      }
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-screen" className="login-screen">
      <div className="login-card">
        <div className="logo" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
          <BrandLogo size={52} />
        </div>
        <h2>Arko Admin Portal</h2>
        <p>Sign in with your Firebase Administrator credentials to manage portfolio content.</p>

        <form id="login-form" onSubmit={handleSubmit}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" htmlFor="login-email">
              Email Address
            </label>
            <input
              type="email"
              id="login-email"
              className="form-input"
              required
              placeholder="admin@vinsensiusarka.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ textAlign: 'left', marginBottom: '1.75rem' }}>
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <input
              type="password"
              id="login-password"
              className="form-input"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            id="login-submit-btn"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Authenticating...
              </>
            ) : (
              <>
                Sign In <i className="fa-solid fa-arrow-right"></i>
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-arrow-left"></i> Back to Public Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
