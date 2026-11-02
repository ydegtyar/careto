import CircularProgress from '@mui/material/CircularProgress';
import { Navigate, useRouterState } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useSession } from '@/lib/auth-client';

type Props = {
  children: ReactNode;
};

export const AuthGuard = ({ children }: Props) => {
  const { data: session, isPending } = useSession();
  const location = useRouterState({ select: (s) => s.location });

  if (isPending) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          width: '100%',
        }}
      >
        <CircularProgress sx={{ color: 'primary.main' }} />
      </div>
    );
  }

  if (!session?.user) {
    const isDefaultLanding =
      location.pathname === '/' ||
      location.pathname === '/garage' ||
      location.pathname === '/garage/';

    const redirectTarget = isDefaultLanding ? undefined : location.href;

    return (
      <Navigate
        to="/sign-in"
        search={redirectTarget ? { redirect: redirectTarget } : undefined}
        replace
      />
    );
  }

  return <>{children}</>;
};
