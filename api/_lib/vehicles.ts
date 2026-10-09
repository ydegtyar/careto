import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { sql } from './db.js';
import { getSession } from './auth.js';
import { hasRole } from './acl.js';

export async function handleVehicleInvites(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const session = await getSession(req.headers);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { vehicleId, email, role = 'editor' } = req.body || {};
    if (!vehicleId || !email) return res.status(400).json({ error: 'vehicleId and email required' });

    const isOwner = await hasRole(session.user.id, vehicleId, 'owner');
    if (!isOwner) return res.status(403).json({ error: 'Forbidden: Only the vehicle owner can invite members' });

    const token = crypto.randomBytes(24).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const inserted = await sql`
      INSERT INTO invites (vehicle_id, email, role, token_hash, expires_at, created_by)
      VALUES (${vehicleId}::uuid, ${email.toLowerCase().trim()}, ${role}, ${tokenHash}, ${expiresAt.toISOString()}, ${session.user.id}::uuid)
      RETURNING id
    `;

    const origin = req.headers.origin || 'https://careto.vercel.app';
    const inviteUrl = `${origin}/invite/${token}`;

    return res.status(200).json({ ok: true, inviteId: inserted[0]!.id, inviteUrl, expiresAt: expiresAt.toISOString() });
  } catch (err: any) {
    console.error('Create invite error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

export async function handleVehicleMembers(req: VercelRequest, res: VercelResponse) {
  try {
    const session = await getSession(req.headers);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'GET') {
      const vehicleId = req.query.vehicle_id as string;
      if (!vehicleId) return res.status(400).json({ error: 'vehicle_id required' });

      const canView = await hasRole(session.user.id, vehicleId, 'viewer');
      if (!canView) return res.status(403).json({ error: 'Forbidden' });

      const members = await sql`
        SELECT vm.user_id as "userId", vm.role, vm.created_at as "joinedAt", u.name, u.email
        FROM vehicle_members vm
        LEFT JOIN neon_auth."user" u ON vm.user_id = u.id
        WHERE vm.vehicle_id = ${vehicleId}::uuid
        ORDER BY vm.role = 'owner' DESC, vm.created_at ASC
      `;

      return res.status(200).json({ members });
    }

    if (req.method === 'DELETE') {
      const { vehicleId, targetUserId } = req.body || {};
      if (!vehicleId || !targetUserId) return res.status(400).json({ error: 'vehicleId and targetUserId required' });

      const isOwner = await hasRole(session.user.id, vehicleId, 'owner');
      if (!isOwner) return res.status(403).json({ error: 'Only owners can remove members' });

      if (session.user.id === targetUserId) return res.status(400).json({ error: 'Owner cannot remove themselves' });

      await sql`DELETE FROM vehicle_members WHERE vehicle_id = ${vehicleId}::uuid AND user_id = ${targetUserId}::uuid`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('Vehicle members error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

export async function handleListVehicles(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const session = await getSession(req.headers);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const vehicleRows = await sql`
      SELECT 
        v.id, 
        v.name, 
        v.make, 
        v.model, 
        v.year, 
        v.powertrain, 
        v.initial_odometer_m, 
        v.distance_unit, 
        v.efficiency_unit, 
        v.tanks, 
        v.fuel_grades, 
        v.seq, 
        vm.role
      FROM vehicle_members vm
      JOIN vehicles v ON vm.vehicle_id = v.id
      WHERE vm.user_id = ${session.user.id}::uuid AND v.archived_at IS NULL
      ORDER BY vm.role = 'owner' DESC, v.created_at ASC
    `;

    return res.status(200).json({ vehicles: vehicleRows });
  } catch (err: any) {
    console.error('List vehicles error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

