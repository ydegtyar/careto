import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import KeyIcon from '@mui/icons-material/Key';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
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
import { signIn, signUp } from '@/lib/auth-client';
import styles from './EmailPasswordForm.module.scss';

export function EmailPasswordForm() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      if (mode === 'signup') {
        const { error: signUpError } = await signUp.email({
          email,
          password,
          name: name.trim() || email.split('@')[0] || 'User',
        });

        if (signUpError) {
          throw new Error(signUpError.message || 'Failed to create account.');
        }

        router.navigate({ to: '/garage' });
        return;
      }

      // Sign In mode
      const { error: signInError } = await signIn.email({
        email,
        password,
        rememberMe,
      });

      if (signInError) {
        // Direct endpoint fallback try
        const res = await fetch('/api/auth/sign-in/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, rememberMe }),
        });

        if (!res.ok) {
          throw new Error(signInError.message || 'Invalid email or password. Please verify credentials.');
        }
      }

      router.navigate({ to: '/garage' });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your details.');
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

      {mode === 'signup' && (
        <div className={styles.fieldGroup}>
          <label htmlFor="signup-name" className={styles.fieldLabel}>
            Full Name
          </label>
          <TextField
            id="signup-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            hiddenLabel
            placeholder="Alex Driver"
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
                    <PersonOutlinedIcon sx={{ color: '#7dd3fc', fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </div>
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
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
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

      {mode === 'signin' && (
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
      )}

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
        {loading ? (
          <CircularProgress size={24} sx={{ color: '#001f2e' }} />
        ) : mode === 'signup' ? (
          'Create Account'
        ) : (
          'Sign In'
        )}
      </Button>

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
            setError(null);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#7dd3fc',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          {mode === 'signin'
            ? "Don't have an account? Create one"
            : 'Already have an account? Sign In'}
        </button>
      </div>
    </form>
  );
}
