import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../_lib/auth.js';
import { hasRole } from '../_lib/acl.js';
import { getRefuelingAnalytics, getServicesAnalytics } from '../_lib/analytics/service.js';
import type { AnalyticsFilterParams } from '../_lib/analytics/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const action = req.query.action as string; // 'refueling' | 'services'
  const vehicleId = req.query.vehicleId as string;
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;
  const preset = req.query.preset as any;

  if (!vehicleId) {
    return res.status(400).json({ error: 'Missing required query param: vehicleId' });
  }

  // 1. Authenticate user
  const session = await getSession(req.headers);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
  }

  // 2. Authorize vehicle access
  const canAccess = await hasRole(session.user.id, vehicleId, 'viewer');
  if (!canAccess) {
    return res.status(403).json({ error: 'Forbidden. You do not own or have access to this vehicle.' });
  }

  const params: AnalyticsFilterParams = {
    vehicleId,
    from,
    to,
    preset,
  };

  try {
    if (action === 'refueling') {
      const result = await getRefuelingAnalytics(params);
      return res.status(200).json(result);
    }

    if (action === 'services') {
      const result = await getServicesAnalytics(params);
      return res.status(200).json(result);
    }

    return res.status(404).json({ error: `Unknown analytics action: ${action}. Expected 'refueling' or 'services'.` });
  } catch (err: any) {
    console.error('Analytics handler error:', err);
    return res.status(500).json({ error: 'Failed to compute analytics', details: err?.message });
  }
}
