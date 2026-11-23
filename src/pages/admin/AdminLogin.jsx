import { useState } from 'react';
import { Link } from 'react-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {
  IconAlertCircle,
  IconArrowLeft,
  IconArrowRight,
  IconLoader2,
  IconMoon,
  IconSun
} from '@tabler/icons-react';
import { auth } from '../../services/firebase';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export function AdminLogin({ showToast, theme, toggleTheme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!auth) {
      const msg = 'Firebase Authentication is not initialized.';
      setErrorMsg(msg);
      showToast?.(msg, 'error');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      showToast?.('Welcome back, Admin!', 'success');
    } catch (error) {
      console.error('Login error:', error);
      let msg = 'Authentication failed. Check email and password.';
      if (error.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Please try again later.';
      }
      setErrorMsg(msg);
      showToast?.(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="login-screen"
      className="relative flex min-h-dvh w-full items-center justify-center bg-background p-4 text-foreground sm:p-6"
    >
      {typeof toggleTheme === 'function' ? (
        <div className="absolute top-4 right-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11"
            onClick={toggleTheme}
            aria-label="Toggle Dark/Light Mode"
          >
            {theme === 'dark' ? (
              <IconSun className="size-4" stroke={1.75} aria-hidden="true" />
            ) : (
              <IconMoon className="size-4" stroke={1.75} aria-hidden="true" />
            )}
          </Button>
        </div>
      ) : null}

      <Card className="w-full max-w-md border-border bg-card shadow-xs">
        <CardHeader className="flex flex-col items-center gap-2 text-center">
          <div className="mb-1 flex size-13 items-center justify-center rounded-xl border border-border bg-muted/60">
            <BrandLogo size={34} />
          </div>
          <CardTitle className="font-display text-2xl font-semibold tracking-tight">
            <h1>Arko Admin Portal</h1>
          </CardTitle>
          <CardDescription className="max-w-xs text-sm leading-relaxed">
            Sign in with your Firebase Administrator credentials to manage portfolio content.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form id="login-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            {errorMsg ? (
              <Alert variant="destructive">
                <IconAlertCircle className="size-4" stroke={1.75} aria-hidden="true" />
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-col gap-2">
              <Label htmlFor="login-email">Email Address</Label>
              <Input
                type="email"
                id="login-email"
                autoComplete="email"
                required
                placeholder="admin@vinsensiusarka.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                type="password"
                id="login-password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              id="login-submit-btn"
              className="mt-2 h-10 w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <IconLoader2
                    className="size-4 animate-spin"
                    stroke={1.75}
                    data-icon="inline-start"
                    aria-hidden="true"
                  />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <IconArrowRight
                    className="size-4"
                    stroke={1.75}
                    data-icon="inline-end"
                    aria-hidden="true"
                  />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-border pt-4">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <IconArrowLeft className="size-4" stroke={1.75} aria-hidden="true" />
            Back to Public Portfolio
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
