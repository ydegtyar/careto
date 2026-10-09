import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import SyncLockOutlinedIcon from '@mui/icons-material/SyncLockOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { EmailPasswordForm } from '@/features/auth/components/EmailPasswordForm/EmailPasswordForm';
import { MagicLinkForm } from '@/features/auth/components/MagicLinkForm/MagicLinkForm';
import { CaretoLogo } from '@/shared/ui/CaretoLogo/CaretoLogo';
import styles from './SignIn.module.scss';

export const Route = createFileRoute('/sign-in/')({
  component: SignInPage,
});

function GoogleLogo() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }}
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function SignInPage() {
  const [tab, setTab] = useState<'password' | 'magic'>('password');

  return (
    <div className={styles.pageWrapper} data-color-scheme="dark">
      {/* Ambient background glows */}
      <div className={styles.ambientGlowTop} aria-hidden="true" />
      <div className={styles.ambientGlowBottom} aria-hidden="true" />

      <div className={styles.container}>
        {/* Brand Header */}
        <header className={styles.header}>
          <div className={styles.emblemWrapper} aria-hidden="true">
            <CaretoLogo size={72} animated={true} />
          </div>

          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              letterSpacing: -0.5,
              color: '#7dd3fc',
              textShadow: '0 0 24px rgba(125, 211, 252, 0.4)',
            }}
          >
            Careto
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#a0b4c4',
              mt: 0.5,
              fontWeight: 400,
            }}
          >
            Auto Expense & Telemetry Manager
          </Typography>

          <div className={styles.badgePill}>
            <SyncLockOutlinedIcon sx={{ fontSize: 13 }} />
            <span>Glacier Edition • Offline Replicas</span>
          </div>
        </header>

        {/* Frosted Glass Login Panel */}
        <div className={styles.card}>
          {/* Mode Segmented Switch */}
          <div className={styles.tabBar} role="tablist" aria-label="Sign in mode">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'password'}
              className={`${styles.tabButton} ${tab === 'password' ? styles.active : ''}`}
              onClick={() => setTab('password')}
            >
              <VpnKeyOutlinedIcon sx={{ fontSize: 17 }} />
              <span>Password</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'magic'}
              className={`${styles.tabButton} ${tab === 'magic' ? styles.active : ''}`}
              onClick={() => setTab('magic')}
            >
              <MarkEmailReadOutlinedIcon sx={{ fontSize: 17 }} />
              <span>Magic Link</span>
            </button>
          </div>

          {/* Tab Panel */}
          <div role="tabpanel">
            {tab === 'password' ? <EmailPasswordForm /> : <MagicLinkForm />}
          </div>

          {/* Social Login Divider */}
          <div className={styles.divider}>
            <span>or continue with</span>
          </div>

          {/* Google Social Login Button */}
          <Button
            variant="outlined"
            fullWidth
            startIcon={<GoogleLogo />}
            onClick={() => {
              window.location.href = '/api/auth/sign-in/social?provider=google';
            }}
            className={styles.googleBtn}
            aria-label="Continue with Google"
          >
            Continue with Google
          </Button>
        </div>

        {/* Footer & Attribution */}
        <footer className={styles.footer}>
          <div className={styles.footerLinks}>
            <a
              href="#terms"
              onClick={(e) => {
                e.preventDefault();
                alert('Terms of Service: Careto is free & open telemetry management software.');
              }}
            >
              Terms of Service
            </a>
            <span>•</span>
            <a
              href="#privacy"
              onClick={(e) => {
                e.preventDefault();
                alert(
                  'Privacy: All vehicle data is stored on-device in OPFS and end-to-end synced.',
                );
              }}
            >
              Privacy Policy
            </a>
          </div>
          <div className={styles.offlineNotice}>
            <SyncLockOutlinedIcon sx={{ fontSize: 13 }} />
            <span>End-to-end encrypted offline SQLite & Neon sync</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
