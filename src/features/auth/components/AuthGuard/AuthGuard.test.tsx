import { isValidElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthGuard } from './AuthGuard';

const mockUseSession = vi.fn();
const mockUseRouterState = vi.fn();

vi.mock('@/lib/auth-client', () => ({
  useSession: () => mockUseSession(),
}));

vi.mock('@tanstack/react-router', () => ({
  useRouterState: (opts: { select: (s: any) => any }) =>
    opts ? opts.select(mockUseRouterState()) : mockUseRouterState(),
  Navigate: (props: any) => <div data-testid="navigate-mock" data-props={JSON.stringify(props)} />,
}));

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is exported as a function component', () => {
    expect(AuthGuard).toBeDefined();
    expect(typeof AuthGuard).toBe('function');
  });

  it('renders loading indicator when session is pending', () => {
    mockUseSession.mockReturnValue({ isPending: true, data: null });
    mockUseRouterState.mockReturnValue({ location: { pathname: '/garage', href: '/garage' } });

    const el = AuthGuard({ children: <div>Protected Content</div> });
    expect(isValidElement(el)).toBe(true);

    // Should not render children while loading
    expect(JSON.stringify(el)).not.toContain('Protected Content');
  });

  it('renders Navigate to /sign-in without search when landing on default /garage', () => {
    mockUseSession.mockReturnValue({ isPending: false, data: null });
    mockUseRouterState.mockReturnValue({ location: { pathname: '/garage', href: '/garage' } });

    const el = AuthGuard({ children: <div>Protected Content</div> });
    expect(isValidElement(el)).toBe(true);
    expect(el.props.to).toBe('/sign-in');
    expect(el.props.search).toBeUndefined();
    expect(el.props.replace).toBe(true);
  });

  it('renders Navigate to /sign-in with redirect param when landing on a deep protected route', () => {
    mockUseSession.mockReturnValue({ isPending: false, data: null });
    mockUseRouterState.mockReturnValue({
      location: { pathname: '/analytics', href: '/analytics?tab=services' },
    });

    const el = AuthGuard({ children: <div>Protected Content</div> });
    expect(isValidElement(el)).toBe(true);
    expect(el.props.to).toBe('/sign-in');
    expect(el.props.search).toEqual({ redirect: '/analytics?tab=services' });
    expect(el.props.replace).toBe(true);
  });

  it('renders children when session user is authenticated', () => {
    mockUseSession.mockReturnValue({
      isPending: false,
      data: { user: { id: 'u1', email: 'test@example.com' } },
    });
    mockUseRouterState.mockReturnValue({ location: { pathname: '/garage', href: '/garage' } });

    const el = AuthGuard({ children: <div data-testid="protected">Protected Content</div> });
    expect(isValidElement(el)).toBe(true);
    expect(el.props.children).toBeDefined();
  });
});
