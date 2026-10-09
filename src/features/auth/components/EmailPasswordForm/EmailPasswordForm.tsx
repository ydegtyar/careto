import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import KeyIcon from '@mui/icons-material/Key';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { useRouter } from '@tanstack/react-router';
import type React from 'react';
import { useState } from 'react';
import styles from './EmailPasswordForm.module.scss';

export function EmailPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState('dev@careta.app');
  const [password, setPassword] = useState('careta-dev-2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fillDevCredentials = () => {
    setEmail('dev@careta.app');
    setPassword('careta-dev-2026');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Local dev seed / direct auth sign-in check
      if (email === 'dev@careta.app' && password === 'careta-dev-2026') {
        localStorage.setItem(
          'careta_session',
          JSON.stringify({
            userId: 'c5a95d6f-e299-4dff-839d-cdedea1f0f65',
            email: 'dev@careta.app',
            name: 'Dev User',
            rememberMe,
          }),
        );
        router.navigate({ to: '/garage' });
        return;
      }

      const res = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (!res.ok) {
        throw new Error('Invalid email or password. Please verify credentials.');
      }

      router.navigate({ to: '/garage' });
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <div className={styles.fieldGroup}>
        <label htmlFor="signin-email" className={styles.fieldLabel}>
          Email Address
        </label>
        <TextField
          id="signin-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          hiddenLabel
          placeholder="name@example.com"
          className={styles.input}
          sx={{
            '& input': {
              color: '#f0f6fc !important',
              WebkitTextFillColor: '#f0f6fc !important',
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon sx={{ color: '#7dd3fc', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="signin-password" className={styles.fieldLabel}>
          Password
        </label>
        <TextField
          id="signin-password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          hiddenLabel
          placeholder="••••••••••••"
          className={styles.input}
          sx={{
            '& input': {
              color: '#f0f6fc !important',
              WebkitTextFillColor: '#f0f6fc !important',
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon sx={{ color: '#7dd3fc', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    size="small"
                    sx={{ color: '#a0b4c4' }}
                  >
                    {showPassword ? (
                      <VisibilityOffOutlinedIcon sx={{ fontSize: 20 }} />
                    ) : (
                      <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </div>

      <div className={styles.rowBetween}>
        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              size="small"
              slotProps={{ input: { 'aria-label': 'Remember this device' } }}
              sx={{
                color: '#a0b4c4',
                '&.Mui-checked': { color: '#7dd3fc' },
              }}
            />
          }
          label="Remember device"
          sx={{
            '& .MuiTypography-root': {
              fontSize: '0.8125rem',
              color: '#a0b4c4',
            },
          }}
        />

        <button
          type="button"
          className={styles.forgotLink}
          onClick={() => alert('Password reset link sent to your registered email.')}
        >
          Forgot password?
        </button>
      </div>

      <button
        type="button"
        className={styles.devQuickFill}
        onClick={fillDevCredentials}
        aria-label="Fill test credentials"
      >
        <KeyIcon sx={{ fontSize: 14 }} />
        <span>Fill Dev Account (dev@careta.app)</span>
      </button>

      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        fullWidth
        className={styles.submitBtn}
      >
        {loading ? <CircularProgress size={24} sx={{ color: '#001f2e' }} /> : 'Sign In'}
      </Button>
    </form>
  );
}
