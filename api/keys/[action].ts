import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { sql } from '../_lib/db.js';
import { getSession } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const session = await getSession(req.headers);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const action = req.query.action as string;

    if (req.method === 'GET' && action === 'list') {
      const keys = await sql`
        SELECT 
          id,
          name,
          key_prefix as "keyPrefix",
          last_used_at as "lastUsedAt",
          expires_at as "expiresAt",
          created_at as "createdAt"
        FROM api_keys
        WHERE user_id = ${session.user.id}::uuid AND revoked_at IS NULL
        ORDER BY created_at DESC
      `;
      return res.status(200).json({ keys });
    }

    if (req.method === 'POST' && action === 'create') {
      const { name = 'MCP Client Key' } = req.body || {};

      // Ensure table exists safely
      await sql`
        CREATE TABLE IF NOT EXISTS api_keys (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL,
          name text NOT NULL,
          key_hash text UNIQUE NOT NULL,
          key_prefix text NOT NULL,
          last_used_at timestamptz,
          expires_at timestamptz,
          created_at timestamptz DEFAULT now() NOT NULL,
          revoked_at timestamptz
        )
      `;

      const randomBytes = crypto.randomBytes(24).toString('hex');
      const key = `careto_sk_${randomBytes}`;
      const keyPrefix = key.slice(0, 15) + '...';
      const keyHash = crypto.createHash('sha256').update(key).digest('hex');

      const inserted = await sql`
        INSERT INTO api_keys (user_id, name, key_hash, key_prefix)
        VALUES (${session.user.id}::uuid, ${name.trim()}, ${keyHash}, ${keyPrefix})
        RETURNING id, name, key_prefix as "keyPrefix", created_at as "createdAt"
      `;

      return res.status(201).json({
        ok: true,
        key, // Only returned once on creation
        apiKey: inserted[0],
      });
    }

    if ((req.method === 'DELETE' || req.method === 'POST') && action === 'revoke') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Key id required' });

      await sql`
        UPDATE api_keys
        SET revoked_at = now()
        WHERE id = ${id}::uuid AND user_id = ${session.user.id}::uuid
      `;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('API Keys endpoint error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
