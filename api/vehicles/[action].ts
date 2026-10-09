import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleVehicleInvites, handleVehicleMembers, handleListVehicles } from '../_lib/vehicles.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action as string;

  if (action === 'list') {
    return handleListVehicles(req, res);
  }
  if (action === 'invites') {
    return handleVehicleInvites(req, res);
  }
  if (action === 'members') {
    return handleVehicleMembers(req, res);
  }

  return res.status(404).json({ error: `Unknown vehicle action: ${action}` });
}

