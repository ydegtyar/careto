import { Navigate } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useSession } from '@/lib/auth-client';

type Props = {
  children: ReactNode;
};

export const OnlyGuestGuard = ({ children }: Props) => {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return null;
  }

  if (session?.user) {
    return <Navigate to="/garage" replace />;
  }

  return <>{children}</>;
};
