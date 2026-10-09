import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { sql } from './db.js';
import { getSession } from './auth.js';

export async function handleInviteAccept(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const session = await getSession(req.headers);
    if (!session) return res.status(401).json({ error: 'Unauthorized: Sign in required to accept invites' });

    const { token } = req.body || {};
    if (!token) return res.status(400).json({ error: 'token required' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const inviteRows = await sql`
      SELECT id, vehicle_id, role, email, created_by, expires_at, accepted_at
      FROM invites
      WHERE token_hash = ${tokenHash}
      LIMIT 1
    `;

    if (inviteRows.length === 0) return res.status(404).json({ error: 'Invite not found or invalid' });

    const invite = inviteRows[0]!;
    if (invite.accepted_at) return res.status(400).json({ error: 'Invite has already been accepted' });
    if (new Date(invite.expires_at) < new Date()) return res.status(410).json({ error: 'Invite has expired' });

    await sql`
      INSERT INTO vehicle_members (vehicle_id, user_id, role, added_by, created_at)
      VALUES (${invite.vehicle_id}::uuid, ${session.user.id}::uuid, ${invite.role}, ${invite.created_by}::uuid, now())
      ON CONFLICT (vehicle_id, user_id) 
      DO UPDATE SET role = EXCLUDED.role
    `;

    await sql`
      UPDATE invites
      SET accepted_by = ${session.user.id}::uuid, accepted_at = now()
      WHERE id = ${invite.id}::uuid
    `;

    return res.status(200).json({ ok: true, vehicleId: invite.vehicle_id, role: invite.role });
  } catch (err: any) {
    console.error('Accept invite error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
