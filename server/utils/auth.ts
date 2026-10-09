import { sql } from '../db/client';

export interface UserSession {
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
  session: {
    id: string;
    token: string;
    expiresAt: Date;
  };
}

export function extractSessionToken(headers: Headers | Record<string, string | string[] | undefined>): string | null {
  const getHeader = (name: string): string | null => {
    if (typeof (headers as any).get === 'function') {
      return (headers as Headers).get(name);
    }
    const val = (headers as Record<string, any>)[name] || (headers as Record<string, any>)[name.toLowerCase()];
    if (Array.isArray(val)) return val[0] || null;
    return val || null;
  };

  // 1. Authorization header
  const authHeader = getHeader('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  // 2. Cookies
  const cookieHeader = getHeader('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith('__Secure-neon-auth.session_token=')) {
        const raw = cookie.slice('__Secure-neon-auth.session_token='.length);
        // Better Auth cookie token is often `token.signature` -> token is before the first dot
        return raw.split('.')[0] || raw;
      }
      if (cookie.startsWith('better-auth.session_token=')) {
        const raw = cookie.slice('better-auth.session_token='.length);
        return raw.split('.')[0] || raw;
      }
      if (cookie.startsWith('careta_token=')) {
        return cookie.slice('careta_token='.length);
      }
    }
  }

  return null;
}

export async function getSession(headers: Headers | Record<string, any>): Promise<UserSession | null> {
  const token = extractSessionToken(headers);

  // Fallback for dev mode
  if (!token) {
    // Check if in development or if custom dev header present
    const devUserId = typeof (headers as any).get === 'function' 
      ? (headers as Headers).get('x-dev-user-id') 
      : (headers as Record<string, any>)['x-dev-user-id'];
      
    if (devUserId) {
      const userRows = await sql`
        SELECT id, email, name FROM neon_auth."user" WHERE id = ${devUserId}::uuid LIMIT 1
      `;
      if (userRows.length > 0) {
        return {
          user: {
            id: userRows[0]!.id,
            email: userRows[0]!.email,
            name: userRows[0]!.name,
          },
          session: {
            id: 'dev-session',
            token: 'dev-token',
            expiresAt: new Date(Date.now() + 86400000),
          },
        };
      }
    }
    return null;
  }

  try {
    const rows = await sql`
      SELECT 
        s.id as session_id,
        s.token as session_token,
        s."expiresAt" as session_expires_at,
        u.id as user_id,
        u.email as user_email,
        u.name as user_name
      FROM neon_auth.session s
      JOIN neon_auth."user" u ON s."userId" = u.id
      WHERE s.token = ${token} AND s."expiresAt" > now()
      LIMIT 1
    `;

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0]!;
    return {
      user: {
        id: row.user_id,
        email: row.user_email,
        name: row.user_name,
      },
      session: {
        id: row.session_id,
        token: row.session_token,
        expiresAt: new Date(row.session_expires_at),
      },
    };
  } catch (err) {
    console.error('Failed to resolve session:', err);
    return null;
  }
}
