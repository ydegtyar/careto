import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './db.js';
import { getSession } from './auth.js';

export async function handleExportData(req: VercelRequest, res: VercelResponse) {
  try {
    const session = await getSession(req.headers);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    // Fetch vehicles
    const vehicles = await sql`
      SELECT v.*
      FROM vehicles v
      LEFT JOIN vehicle_members vm ON v.id = vm.vehicle_id
      WHERE v.owner_id = ${session.user.id}::uuid OR vm.user_id = ${session.user.id}::uuid
      GROUP BY v.id
    `;

    const vehicleIds = vehicles.map((v) => v.id);

    // Fetch records
    let records: any[] = [];
    if (vehicleIds.length > 0) {
      records = await sql`
        SELECT r.*
        FROM records r
        WHERE r.vehicle_id = ANY(${vehicleIds})
        ORDER BY r.seq ASC
      `;
    }

    // Fetch notifications & devices
    const devices = await sql`
      SELECT id, endpoint, tz, locale, created_at, last_ok_at
      FROM push_devices
      WHERE user_id = ${session.user.id}::uuid
    `;

    const notifyPreferences = await sql`
      SELECT *
      FROM notify_prefs
      WHERE user_id = ${session.user.id}::uuid
    `;

    const exportPayload = {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
      exportedAt: new Date().toISOString(),
      schemaVersion: 1,
      vehicles,
      records,
      pushDevices: devices,
      notifyPreferences,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="careto-gdpr-export-${session.user.id}.json"`);
    return res.status(200).send(JSON.stringify(exportPayload, null, 2));
  } catch (err: any) {
    console.error('GDPR Export error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

export async function handleDeleteAccount(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession(req.headers);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const userId = session.user.id;

    // 1. Delete owned vehicles (cascades to records, members, backups)
    await sql`DELETE FROM vehicles WHERE owner_id = ${userId}::uuid`;

    // 2. Remove memberships from other shared vehicles
    await sql`DELETE FROM vehicle_members WHERE user_id = ${userId}::uuid`;

    // 3. Remove push devices and notification prefs
    await sql`DELETE FROM push_devices WHERE user_id = ${userId}::uuid`;
    await sql`DELETE FROM notify_prefs WHERE user_id = ${userId}::uuid`;

    // 4. Delete user profile
    try {
      await sql`DELETE FROM neon_auth."user" WHERE id = ${userId}::uuid`;
    } catch (_) {}

    return res.status(200).json({ ok: true, deleted: true });
  } catch (err: any) {
    console.error('Delete account error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
