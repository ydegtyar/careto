import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import SyncLockOutlinedIcon from '@mui/icons-material/SyncLockOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { EmailPasswordForm } from '@/features/auth/components/EmailPasswordForm/EmailPasswordForm';
import { MagicLinkForm } from '@/features/auth/components/MagicLinkForm/MagicLinkForm';
import { CaretoLogo } from '@/shared/ui/CaretoLogo/CaretoLogo';
import styles from './SignIn.module.scss';

export const Route = createFileRoute('/sign-in/')({
  component: SignInPage,
});

import { GoogleLogo } from '@/features/auth/components/GoogleLogo/GoogleLogo';
import { GoogleOneTap } from '@/features/auth/components/GoogleOneTap/GoogleOneTap';

function SignInPage() {
  const [tab, setTab] = useState<'password' | 'magic'>('password');

  return (
    <div className={styles.pageWrapper} data-color-scheme="dark">
      <GoogleOneTap />
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
            onClick={async () => {
              try {
                const { signIn } = await import('@/lib/auth-client');
                await signIn.social({
                  provider: 'google',
                  callbackURL: `${window.location.origin}/garage`,
                });
              } catch {
                window.location.href = `/api/auth/sign-in/social?provider=google&callbackURL=${encodeURIComponent(`${window.location.origin}/garage`)}`;
              }
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
            <Link to="/terms">Terms of Service</Link>
            <span>•</span>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
          <div className={styles.offlineNotice}>
            <SyncLockOutlinedIcon sx={{ fontSize: 13 }} />
            <span>End-to-end encrypted</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
