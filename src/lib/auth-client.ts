import { oneTapClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL:
    import.meta.env.VITE_AUTH_BASE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : ''),
  sessionOptions: {
    refetchInterval: 300,
    refetchOnWindowFocus: true,
    refetchWhenOffline: false,
  },
  plugins: [
    oneTapClient({
      clientId: '431176330118-2q7kn7l9viaga5r39scsrpbv70eoot2c.apps.googleusercontent.com',
    }),
  ],
});

export const { useSession, signIn, signOut, signUp, oneTap } = authClient;

export const refreshSession = async (options?: { disableCookieCache?: boolean }) => {
  return await authClient.getSession({
    query: {
      disableCookieCache: options?.disableCookieCache ?? true,
    },
  });
};
