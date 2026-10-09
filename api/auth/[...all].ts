import type { VercelRequest, VercelResponse } from '@vercel/node';

const NEON_AUTH_BASE = process.env.NEON_AUTH_BASE_URL || 'https://ep-old-queen-b2swdkvy.neonauth.c-6.eu-central-1.aws.neon.tech/neondb/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const rawUrl = req.url || '';
    // Strip /api/auth prefix to get the path
    const path = rawUrl.replace(/^\/api\/auth/, '');
    const targetUrl = `${NEON_AUTH_BASE}${path}`;

    const headers: Record<string, string> = {
      'content-type': req.headers['content-type'] || 'application/json',
      'origin': 'https://careto.vercel.app',
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
