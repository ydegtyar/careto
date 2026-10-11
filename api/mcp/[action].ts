import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../_lib/auth.js';
import { CARETO_MCP_TOOLS, executeMCPTool } from '../_lib/mcp/tools.js';
import { handleOAuth } from '../_lib/mcp/oauth.js';
import { handleKeys } from '../_lib/mcp/keys.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Handle CORS preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const action = req.query.action as string;

    // Delegate OAuth requests
    if (action === 'oauth') {
      return await handleOAuth(req, res);
    }

    const session = await getSession(req.headers);

    // Delegate API key management requests
    if (action === 'keys' || ['list', 'create', 'revoke'].includes(action)) {
      return await handleKeys(req, res, session);
    }

    // SSE Transport initiation
    if (req.method === 'GET' && (action === 'sse' || !action)) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');

      const sessionId = session ? session.session.id : crypto.randomUUID();
      const endpointUrl = `/api/mcp/messages?sessionId=${sessionId}`;
      res.write(`event: endpoint\ndata: ${endpointUrl}\n\n`);

      // Keep connection warm
      const interval = setInterval(() => {
        res.write(': keepalive\n\n');
      }, 15000);

      req.on('close', () => {
        clearInterval(interval);
      });
      return;
    }

    // JSON-RPC / Messages Endpoint
    if (req.method === 'POST') {
      const body = req.body || {};
      const { jsonrpc = '2.0', method, params = {}, id = 1 } = body;

      // Allow initialize method publicly
      if (method === 'initialize') {
        return res.status(200).json({
          jsonrpc: '2.0',
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: 'Careto MCP Server',
              version: '1.0.0',
            },
          },
          id,
        });
      }

      if (method === 'notifications/initialized') {
        return res.status(200).end();
      }

      // Check auth for tools/list and tools/call
      if (!session) {
        const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
        const host = req.headers.host || 'careto.vercel.app';
        const baseUrl = `${proto}://${host}`;

        res.setHeader(
          'WWW-Authenticate',
          `Bearer error="invalid_token", error_description="Unauthorized", resource_metadata="${baseUrl}/.well-known/oauth-protected-resource"`,
        );

        return res.status(401).json({
          jsonrpc: '2.0',
          error: { code: -32001, message: 'Unauthorized. Bearer careto_sk_... API key, OAuth token, or valid session required.' },
          id,
        });
      }

      if (method === 'tools/list') {
        return res.status(200).json({
          jsonrpc: '2.0',
          result: {
            tools: CARETO_MCP_TOOLS,
          },
          id,
        });
      }

      if (method === 'tools/call') {
        const { name, arguments: toolArgs = {} } = params;
        try {
          const output = await executeMCPTool(session.user.id, name, toolArgs);
          return res.status(200).json({
            jsonrpc: '2.0',
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(output, null, 2),
                },
              ],
            },
            id,
          });
        } catch (err: any) {
          return res.status(200).json({
            jsonrpc: '2.0',
            result: {
              content: [
                {
                  type: 'text',
                  text: `Error executing tool ${name}: ${err.message}`,
                },
              ],
              isError: true,
            },
            id,
          });
        }
      }

      return res.status(400).json({
        jsonrpc: '2.0',
        error: { code: -32601, message: `Method not found: ${method}` },
        id,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('MCP Endpoint error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
