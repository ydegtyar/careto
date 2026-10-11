import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS for public discovery
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const host = req.headers.host || 'careto.vercel.app';
  const baseUrl = `${proto}://${host}`;

  const type = req.query.type as string;

  if (type === 'protected-resource') {
    // RFC 9728: OAuth 2.0 Protected Resource Metadata
    return res.status(200).json({
      resource: baseUrl,
      authorization_servers: [baseUrl],
      scopes_supported: ['careto.read', 'careto.write'],
      bearer_methods_supported: ['header'],
    });
  }

  if (type === 'authorization-server' || type === 'openid-configuration') {
    // RFC 8414: OAuth 2.0 Authorization Server Metadata
    return res.status(200).json({
      issuer: baseUrl,
      authorization_endpoint: `${baseUrl}/api/mcp/oauth?action=authorize`,
      token_endpoint: `${baseUrl}/api/mcp/oauth?action=token`,
      registration_endpoint: `${baseUrl}/api/mcp/oauth?action=register`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      code_challenge_methods_supported: ['S256', 'plain'],
      token_endpoint_auth_methods_supported: ['none', 'client_secret_post', 'client_secret_basic'],
      scopes_supported: ['careto.read', 'careto.write', 'openid', 'profile', 'email'],
    });
  }

  return res.status(404).json({ error: 'Metadata not found' });
}
