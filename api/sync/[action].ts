import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handlePush, handlePull, handlePullMany, handleSnapshot } from '../_lib/sync.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action as string;

  if (action === 'push') {
    return handlePush(req, res);
  }
  if (action === 'pull') {
    return handlePull(req, res);
  }
  if (action === 'pull-many') {
    return handlePullMany(req, res);
  }
  if (action === 'snapshot') {
    return handleSnapshot(req, res);
  }

  return res.status(404).json({ error: `Unknown sync action: ${action}` });
}
