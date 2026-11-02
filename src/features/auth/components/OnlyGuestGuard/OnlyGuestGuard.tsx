import { Navigate, useRouterState } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useSession } from '@/lib/auth-client';

type Props = {
  children: ReactNode;
};

export const OnlyGuestGuard = ({ children }: Props) => {
  const { data: session, isPending } = useSession();
  const search = useRouterState({ select: (s) => s.location.search }) as { redirect?: string };

  const redirectTarget =
    typeof search?.redirect === 'string' &&
    search.redirect.startsWith('/') &&
    !search.redirect.startsWith('//')
      ? search.redirect
      : '/garage';

  if (isPending) {
    return null;
  }

  if (session?.user) {
    return <Navigate to={redirectTarget} replace />;
  }

  return <>{children}</>;
};
