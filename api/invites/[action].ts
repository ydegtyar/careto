import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleInviteAccept } from '../_lib/invites.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action as string;

  if (action === 'accept') {
    return handleInviteAccept(req, res);
  }

  return res.status(404).json({ error: `Unknown invite action: ${action}` });
}
