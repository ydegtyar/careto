import { oneTapClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL:
    import.meta.env.VITE_AUTH_BASE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : ''),
  plugins: [
    oneTapClient({
      clientId: '431176330118-2q7kn7l9viaga5r39scsrpbv70eoot2c.apps.googleusercontent.com',
    }),
  ],
});

export const { useSession, signIn, signOut, signUp, oneTap } = authClient;
