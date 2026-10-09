import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router';
import { AppHeader } from '@/shared/ui/AppHeader/AppHeader';
import { BottomNav } from '@/shared/ui/BottomNav/BottomNav';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const routerState = useRouterState();
  const isSignIn = routerState.location.pathname.startsWith('/sign-in');

  if (isSignIn) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <main
        style={{
          flex: 1,
          paddingTop: 60,
          paddingBottom: 96,
          width: '100%',
          maxWidth: 1024,
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
