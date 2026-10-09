import type { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';
import { sql } from './db.js';
import { getSession } from './auth.js';

// Setup VAPID details if configured
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || 'BPKTb_7Uh-098R76GoNEi6qzcd7zOV0279rNUvjAhEvEBAtUe7kZC0r1c8xdRmDlMcIEK40kLtDHDK0Ybj4vMSs';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || 'JUzNRjo2jZSQfCgHOY3hNdU3M_CS1RfDS7z6sILKI6Q';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:notifications@careta.app';

try {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} catch (e) {
  console.warn('VAPID initialization notice:', e);
}

export async function handleVapidPublicKey(_req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ publicKey: vapidPublicKey });
}

export async function handleSubscribe(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const session = await getSession(req.headers);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { endpoint, keys, tz, locale } = req.body || {};
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ error: 'Missing endpoint or subscription keys' });
    }

    const clientTz = tz || 'UTC';
    const clientLocale = locale || 'en';

    await sql`
      INSERT INTO push_devices (user_id, endpoint, p256dh, auth, tz, locale, last_ok_at)
      VALUES (${session.user.id}::uuid, ${endpoint}, ${keys.p256dh}, ${keys.auth}, ${clientTz}, ${clientLocale}, NOW())
      ON CONFLICT (endpoint)
      DO UPDATE SET
        user_id = EXCLUDED.user_id,
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        tz = EXCLUDED.tz,
        locale = EXCLUDED.locale,
        last_ok_at = NOW()
    `;

    return res.status(200).json({ ok: true, subscribed: true });
  } catch (err: any) {
    console.error('Push subscribe error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

export async function handleDeleteDevice(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession(req.headers);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { endpoint } = req.body || {};
    if (!endpoint) return res.status(400).json({ error: 'endpoint required' });

    await sql`
      DELETE FROM push_devices
      WHERE endpoint = ${endpoint} AND user_id = ${session.user.id}::uuid
    `;

    return res.status(200).json({ ok: true, removed: true });
  } catch (err: any) {
    console.error('Delete device error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

export async function handleGetPrefs(req: VercelRequest, res: VercelResponse) {
  try {
    const session = await getSession(req.headers);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const vehicleId = req.query.vehicle_id as string;
    if (!vehicleId) return res.status(400).json({ error: 'vehicle_id query required' });

    const rows = await sql`
      SELECT enabled, show_details as "showDetails", local_time as "localTime"
      FROM notify_prefs
      WHERE user_id = ${session.user.id}::uuid AND vehicle_id = ${vehicleId}::uuid
      LIMIT 1
    `;

    if (rows.length === 0) {
      return res.status(200).json({
        enabled: true,
        showDetails: false,
        localTime: '09:00',
      });
    }

    return res.status(200).json(rows[0]);
  } catch (err: any) {
    console.error('Get prefs error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

export async function handleUpdatePrefs(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession(req.headers);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { vehicleId, enabled = true, showDetails = false, localTime = '09:00' } = req.body || {};
    if (!vehicleId) return res.status(400).json({ error: 'vehicleId required' });

    await sql`
      INSERT INTO notify_prefs (user_id, vehicle_id, enabled, show_details, local_time)
      VALUES (${session.user.id}::uuid, ${vehicleId}::uuid, ${Boolean(enabled)}, ${Boolean(showDetails)}, ${localTime})
      ON CONFLICT (user_id, vehicle_id)
      DO UPDATE SET
        enabled = EXCLUDED.enabled,
        show_details = EXCLUDED.show_details,
        local_time = EXCLUDED.local_time
    `;

    return res.status(200).json({ ok: true, updated: true });
  } catch (err: any) {
    console.error('Update prefs error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

export async function handleTestPush(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const session = await getSession(req.headers);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { title = 'Careta Reminder', body = 'Scheduled maintenance is upcoming', url = '/reminders' } = req.body || {};

    const devices = await sql`
      SELECT endpoint, p256dh, auth
      FROM push_devices
      WHERE user_id = ${session.user.id}::uuid
    `;

    if (devices.length === 0) {
      return res.status(200).json({ ok: true, sent: 0, message: 'No registered push devices found for user' });
    }

    const payload = JSON.stringify({
      title,
      body,
      url,
      tag: 'careta-reminder',
      badge: '/icons/icon-192.png',
      icon: '/icons/icon-192.png',
    });

    let sent = 0;
    for (const dev of devices) {
      try {
        await webpush.sendNotification(
          {
            endpoint: dev.endpoint,
            keys: {
              p256dh: dev.p256dh,
              auth: dev.auth,
            },
          },
          payload
        );
        sent++;
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Dead subscription - purge
          await sql`DELETE FROM push_devices WHERE endpoint = ${dev.endpoint}`;
        } else {
          console.error('Failed to send push to device:', err);
        }
      }
    }

    return res.status(200).json({ ok: true, sent, total: devices.length });
  } catch (err: any) {
    console.error('Test push error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
