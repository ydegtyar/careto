import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';
import { sql } from '../_lib/db.js';

const NEON_AUTH_BASE = process.env.NEON_AUTH_BASE_URL || 'https://ep-old-queen-b2swdkvy.neonauth.c-6.eu-central-1.aws.neon.tech/neondb/auth';

function sanitizeCookie(cookieStr: string): string {
  // Strip Domain=... attribute so the browser attributes cookie to app host
  let cleaned = cookieStr.replace(/;\s*Domain=[^;]*/gi, '');
  if (!/;\s*Path=/i.test(cleaned)) {
    cleaned += '; Path=/';
  }
  if (!/;\s*SameSite=/i.test(cleaned)) {
    cleaned += '; SameSite=Lax';
  }
  return cleaned;
}

async function handleGoogleOneTap(req: VercelRequest, res: VercelResponse) {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const idToken = body.idToken || body.credential || body.token || body.id_token;

    if (!idToken) {
      return res.status(400).json({ error: 'Missing idToken in request body' });
    }

    // Verify Google ID token
    const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!googleRes.ok) {
      const errText = await googleRes.text();
      console.error('Google token verification failed:', errText);
      return res.status(400).json({ error: 'Invalid Google ID token' });
    }

    const payload = await googleRes.json();
    const email = payload.email;
    const name = payload.name || payload.given_name || email?.split('@')[0] || 'User';
    const picture = payload.picture || null;

    if (!email) {
      return res.status(400).json({ error: 'Google ID token missing email' });
    }

    // Check or create user in neon_auth.user
    const userRows = await sql`
      SELECT id, email, name FROM neon_auth."user" WHERE email = ${email} LIMIT 1
    `;

    let userId: string;
    if (userRows.length > 0) {
      userId = userRows[0]!.id;
      // Update name or image if missing or changed
      await sql`
        UPDATE neon_auth."user"
        SET name = COALESCE(NULLIF(${name}, ''), name),
            image = COALESCE(${picture}, image),
            "updatedAt" = now()
        WHERE id = ${userId}
      `;
    } else {
      const newId = crypto.randomUUID();
      await sql`
        INSERT INTO neon_auth."user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt", role)
        VALUES (${newId}, ${name}, ${email}, true, ${picture}, now(), now(), 'user')
      `;
      userId = newId;
    }

    // Create session in neon_auth.session
    const sessionId = crypto.randomUUID();
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await sql`
      INSERT INTO neon_auth.session (id, token, "userId", "expiresAt", "createdAt", "updatedAt")
      VALUES (${sessionId}, ${sessionToken}, ${userId}, ${expiresAt.toISOString()}, now(), now())
    `;

    const cookieOptions = `Path=/; SameSite=Lax; HttpOnly; Expires=${expiresAt.toUTCString()}`;
    res.setHeader('set-cookie', [
      `better-auth.session_token=${sessionToken}; ${cookieOptions}`,
      `__Secure-better-auth.session_token=${sessionToken}; ${cookieOptions}; Secure`,
    ]);

    return res.status(200).json({
      user: { id: userId, email, name, image: picture },
      session: { id: sessionId, token: sessionToken, expiresAt },
    });
  } catch (err: any) {
    console.error('Google One Tap verification error:', err);
    return res.status(500).json({ error: 'Internal server error during One Tap login' });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    let subpath = '';

    if (req.query.__path) {
      subpath = Array.isArray(req.query.__path) ? req.query.__path.join('/') : (req.query.__path as string);
    } else if (req.query.path) {
      subpath = Array.isArray(req.query.path) ? req.query.path.join('/') : (req.query.path as string);
    } else if (req.query.all) {
      subpath = Array.isArray(req.query.all) ? req.query.all.join('/') : (req.query.all as string);
    } else {
      const rawUrl = (req.headers['x-forwarded-uri'] as string) || (req.headers['x-original-url'] as string) || req.url || '';
      subpath = rawUrl.replace(/^\/api\/auth\/?/, '').split('?')[0] || '';
    }

    if (!subpath.startsWith('/')) {
      subpath = '/' + subpath;
    }

    // Intercept one-tap callback endpoints
    if (subpath.includes('one-tap') && req.method === 'POST') {
      return await handleGoogleOneTap(req, res);
    }

    // Build query string, omitting internal routing parameters
    const searchParams = new URLSearchParams();
    if (req.query) {
      for (const [k, v] of Object.entries(req.query)) {
        if (k !== '__path' && k !== 'path' && k !== 'all') {
          if (Array.isArray(v)) {
            for (const item of v) searchParams.append(k, item);
          } else if (v !== undefined) {
            searchParams.append(k, v);
          }
        }
      }
    }
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';

    const targetUrl = `${NEON_AUTH_BASE}${subpath}${queryString}`;

    const reqOrigin = (req.headers['origin'] as string) || (req.headers['referer'] ? new URL(req.headers['referer'] as string).origin : 'https://careto.vercel.app');

    const headers: Record<string, string> = {
      'content-type': req.headers['content-type'] || 'application/json',
      'origin': reqOrigin,
    };

    if (req.headers['cookie']) {
      headers['cookie'] = req.headers['cookie'] as string;
    }
    if (req.headers['authorization']) {
      headers['authorization'] = req.headers['authorization'] as string;
    }

    const init: RequestInit = {
      method: req.method,
      headers,
      redirect: 'manual',
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const upstreamRes = await fetch(targetUrl, init);
    
    // Process set-cookie headers
    const rawCookies = typeof upstreamRes.headers.getSetCookie === 'function'
      ? upstreamRes.headers.getSetCookie()
      : null;

    if (rawCookies && rawCookies.length > 0) {
      const sanitized = rawCookies.map(sanitizeCookie);
      res.setHeader('set-cookie', sanitized);
    }

    // Forward headers except set-cookie, content-encoding, content-length
    upstreamRes.headers.forEach((val, key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'set-cookie') {
        if (!rawCookies) {
          res.setHeader('set-cookie', sanitizeCookie(val));
        }
      } else if (lowerKey !== 'content-encoding' && lowerKey !== 'content-length') {
        res.setHeader(key, val);
      }
    });

    const data = await upstreamRes.arrayBuffer();
    res.status(upstreamRes.status).send(Buffer.from(data));
  } catch (err: any) {
    console.error('Auth proxy error:', err);
    res.status(500).json({ error: 'Auth proxy failed', message: err.message });
  }
}
