import crypto from 'crypto';
import { sql } from './db.js';

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

  const authHeader = getHeader('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  const cookieHeader = getHeader('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    const cookieKeys = [
      '__Secure-better-auth.session_token=',
      'better-auth.session_token=',
      '__Host-better-auth.session_token=',
      '__Secure-neon-auth.session_token=',
      'neon-auth.session_token=',
      'careto_token=',
    ];

    for (const cookie of cookies) {
      for (const prefix of cookieKeys) {
        if (cookie.startsWith(prefix)) {
          const raw = decodeURIComponent(cookie.slice(prefix.length).trim());
          return raw.split('.')[0] || raw;
        }
      }
    }
  }

  return null;
}

export async function getSession(headers: Headers | Record<string, any>): Promise<UserSession | null> {
  const token = extractSessionToken(headers);

  if (token) {
    if (token.startsWith('careto_sk_')) {
      try {
        const keyHash = crypto.createHash('sha256').update(token).digest('hex');
        const keyRows = await sql`
          SELECT 
            k.id as key_id,
            k.user_id,
            k.expires_at,
            u.email as user_email,
            u.name as user_name
          FROM api_keys k
          JOIN neon_auth."user" u ON k.user_id = u.id
          WHERE k.key_hash = ${keyHash}
            AND k.revoked_at IS NULL
            AND (k.expires_at IS NULL OR k.expires_at > now())
          LIMIT 1
        `;

        if (keyRows.length > 0) {
          const key = keyRows[0]!;
          // Update last_used_at in background
          sql`UPDATE api_keys SET last_used_at = now() WHERE id = ${key.key_id}::uuid`.catch(() => {});

          return {
            user: {
              id: key.user_id,
              email: key.user_email,
              name: key.user_name,
            },
            session: {
              id: key.key_id,
              token,
              expiresAt: key.expires_at ? new Date(key.expires_at) : new Date(Date.now() + 365 * 86400000),
            },
          };
        }
      } catch (err) {
        console.error('Failed to resolve API key session:', err);
      }
    } else {
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

        if (rows.length > 0) {
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
        }
      } catch (err) {
        console.error('Failed to resolve session:', err);
      }
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    const devUserId = typeof (headers as any).get === 'function' 
      ? (headers as Headers).get('x-dev-user-id')
      : (headers as Record<string, any>)['x-dev-user-id'];
      
    if (devUserId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(devUserId)) {
      try {
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
      } catch (err) {
        console.error('Failed dev session resolution:', err);
      }
    }
  }

  return null;
}
