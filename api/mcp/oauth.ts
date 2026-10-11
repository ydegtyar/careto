import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { sql } from '../_lib/db.js';
import { getSession } from '../_lib/auth.js';

function base64UrlEncode(str: Buffer): string {
  return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function verifyCodeChallenge(verifier: string, challenge: string, method = 'S256'): boolean {
  if (method === 'plain') {
    return verifier === challenge;
  }
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64UrlEncode(hash) === challenge;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Ensure tables exist safely
  await sql`
    CREATE TABLE IF NOT EXISTS oauth_clients (
      client_id text PRIMARY KEY,
      client_secret text,
      client_name text,
      redirect_uris jsonb NOT NULL,
      grant_types jsonb,
      response_types jsonb,
      token_endpoint_auth_method text DEFAULT 'none',
      created_at timestamptz DEFAULT now() NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS oauth_codes (
      code text PRIMARY KEY,
      client_id text NOT NULL,
      user_id uuid NOT NULL,
      redirect_uri text NOT NULL,
      code_challenge text,
      code_challenge_method text,
      scope text,
      expires_at timestamptz NOT NULL,
      used_at timestamptz,
      created_at timestamptz DEFAULT now() NOT NULL
    )
  `;

  const action = (req.query.action as string) || (req.body?.action as string);

  // 1. Dynamic Client Registration (RFC 7591)
  if (action === 'register' && req.method === 'POST') {
    const {
      client_name = 'Gemini / ChatGPT MCP Client',
      redirect_uris = [],
      grant_types = ['authorization_code', 'refresh_token'],
      response_types = ['code'],
      token_endpoint_auth_method = 'none',
    } = req.body || {};

    if (!Array.isArray(redirect_uris) || redirect_uris.length === 0) {
      return res.status(400).json({ error: 'invalid_redirect_uri', error_description: 'redirect_uris required' });
    }

    const clientId = `careto_client_${crypto.randomBytes(16).toString('hex')}`;
    const clientSecret = crypto.randomBytes(32).toString('hex');

    await sql`
      INSERT INTO oauth_clients (
        client_id, client_secret, client_name, redirect_uris, grant_types, response_types, token_endpoint_auth_method
      ) VALUES (
        ${clientId}, ${clientSecret}, ${client_name},
        ${JSON.stringify(redirect_uris)}::jsonb,
        ${JSON.stringify(grant_types)}::jsonb,
        ${JSON.stringify(response_types)}::jsonb,
        ${token_endpoint_auth_method}
      )
    `;

    return res.status(201).json({
      client_id: clientId,
      client_secret: clientSecret,
      client_name,
      redirect_uris,
      grant_types,
      response_types,
      token_endpoint_auth_method,
    });
  }

  // 2. Authorize Endpoint (GET or POST)
  if (action === 'authorize') {
    const {
      client_id,
      redirect_uri,
      response_type = 'code',
      state = '',
      code_challenge,
      code_challenge_method = 'S256',
      scope = 'careto.read careto.write',
    } = req.method === 'GET' ? req.query : req.body;

    if (!client_id || !redirect_uri) {
      return res.status(400).send('Missing client_id or redirect_uri');
    }

    // Check user session
    const session = await getSession(req.headers);

    // If user is not logged in, redirect them to sign-in with a return URL
    if (!session) {
      const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
      const host = req.headers.host || 'careto.vercel.app';
      const currentFullUrl = `${proto}://${host}${req.url}`;
      return res.redirect(302, `/sign-in?redirect=${encodeURIComponent(currentFullUrl)}`);
    }

    // If user is logged in, generate code and redirect back to client
    const code = `careto_code_${crypto.randomBytes(24).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await sql`
      INSERT INTO oauth_codes (
        code, client_id, user_id, redirect_uri, code_challenge, code_challenge_method, scope, expires_at
      ) VALUES (
        ${code}, ${String(client_id)}, ${session.user.id}::uuid, ${String(redirect_uri)},
        ${code_challenge ? String(code_challenge) : null},
        ${code_challenge_method ? String(code_challenge_method) : 'S256'},
        ${String(scope)}, ${expiresAt.toISOString()}
      )
    `;

    const redirectTarget = new URL(String(redirect_uri));
    redirectTarget.searchParams.set('code', code);
    if (state) redirectTarget.searchParams.set('state', String(state));

    return res.redirect(302, redirectTarget.toString());
  }

  // 3. Token Endpoint (POST)
  if (action === 'token' && req.method === 'POST') {
    const {
      grant_type = 'authorization_code',
      code,
      redirect_uri,
      client_id,
      code_verifier,
    } = req.body || {};

    if (grant_type !== 'authorization_code') {
      return res.status(400).json({ error: 'unsupported_grant_type' });
    }

    if (!code) {
      return res.status(400).json({ error: 'invalid_request', error_description: 'code required' });
    }

    const codeRows = await sql`
      SELECT * FROM oauth_codes 
      WHERE code = ${String(code)} AND used_at IS NULL AND expires_at > now()
      LIMIT 1
    `;

    if (codeRows.length === 0) {
      return res.status(400).json({ error: 'invalid_grant', error_description: 'Code expired or invalid' });
    }

    const authCode = codeRows[0]!;

    // Verify PKCE if challenge exists
    if (authCode.code_challenge) {
      if (!code_verifier || !verifyCodeChallenge(String(code_verifier), authCode.code_challenge, authCode.code_challenge_method || 'S256')) {
        return res.status(400).json({ error: 'invalid_grant', error_description: 'PKCE verification failed' });
      }
    }

    // Mark code as used
    await sql`UPDATE oauth_codes SET used_at = now() WHERE code = ${String(code)}`;

    // Generate OAuth Bearer token
    const tokenSecret = `careto_sk_oauth_${crypto.randomBytes(24).toString('hex')}`;
    const tokenHash = crypto.createHash('sha256').update(tokenSecret).digest('hex');
    const tokenPrefix = tokenSecret.slice(0, 15) + '...';

    // Store as an API key associated with the user
    await sql`
      INSERT INTO api_keys (user_id, name, key_hash, key_prefix)
      VALUES (${authCode.user_id}::uuid, 'OAuth Session (Gemini / ChatGPT)', ${tokenHash}, ${tokenPrefix})
    `;

    return res.status(200).json({
      access_token: tokenSecret,
      token_type: 'Bearer',
      expires_in: 365 * 86400,
      scope: authCode.scope || 'careto.read careto.write',
    });
  }

  return res.status(400).json({ error: 'invalid_request', error_description: `Unknown action: ${action}` });
}
