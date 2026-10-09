import type { VercelRequest, VercelResponse } from '@vercel/node';

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
