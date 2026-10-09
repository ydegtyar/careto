import type { VercelRequest, VercelResponse } from '@vercel/node';

const NEON_AUTH_BASE = process.env.NEON_AUTH_BASE_URL || 'https://ep-old-queen-b2swdkvy.neonauth.c-6.eu-central-1.aws.neon.tech/neondb/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    let rawUrl = (req.headers['x-forwarded-uri'] as string) || (req.headers['x-original-url'] as string) || req.url || '';
    if (rawUrl.includes('[...all]')) {
      const allParam = req.query.all;
      const subpath = Array.isArray(allParam) ? allParam.join('/') : (allParam || '');
      const queryString = req.url?.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
      rawUrl = `/api/auth/${subpath}${queryString}`;
    }
    const path = rawUrl.replace(/^\/api\/auth/, '');
    const targetUrl = `${NEON_AUTH_BASE}${path}`;

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
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const upstreamRes = await fetch(targetUrl, init);
    
    // Forward headers
    const setCookies = typeof upstreamRes.headers.getSetCookie === 'function'
      ? upstreamRes.headers.getSetCookie()
      : null;

    if (setCookies && setCookies.length > 0) {
      res.setHeader('set-cookie', setCookies);
    }

    upstreamRes.headers.forEach((val, key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'set-cookie') {
        if (!setCookies) {
          res.setHeader('set-cookie', val);
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
