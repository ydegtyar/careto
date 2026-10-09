import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  handleVapidPublicKey,
  handleSubscribe,
  handleDeleteDevice,
  handleGetPrefs,
  handleUpdatePrefs,
  handleTestPush,
} from '../_lib/push.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;

  switch (action) {
    case 'vapid-public-key':
      return handleVapidPublicKey(req, res);
    case 'subscribe':
      return handleSubscribe(req, res);
    case 'device':
      return handleDeleteDevice(req, res);
    case 'prefs':
      if (req.method === 'GET') {
        return handleGetPrefs(req, res);
      }
      return handleUpdatePrefs(req, res);
    case 'test':
      return handleTestPush(req, res);
    default:
      return res.status(404).json({ error: `Push action '${action}' not found` });
  }
}
