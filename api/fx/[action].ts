import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleFxLatest, handleFxOn, handleFxBatch } from '../_lib/fx.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action as string;

  if (action === 'latest') {
    return handleFxLatest(req, res);
  }
  if (action === 'on') {
    return handleFxOn(req, res);
  }
  if (action === 'batch') {
    return handleFxBatch(req, res);
  }

  return res.status(404).json({ error: `Unknown FX action: ${action}` });
}
