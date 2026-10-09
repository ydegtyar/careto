import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ALL_ADAPTERS } from '../_lib/ai/adapters/index.js';
import { runWaterfallParse } from '../_lib/ai/waterfall.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action as string;

  if (req.method === 'GET' && action === 'adapters') {
    const list = Object.values(ALL_ADAPTERS).map((ad) => ({
      id: ad.id,
      name: ad.name,
      available: ad.isAvailable(),
    }));
    return res.status(200).json({ success: true, adapters: list });
  }

  if (req.method === 'POST' && action === 'parse') {
    try {
      const { purpose, imageBase64, mimeType, options } = req.body || {};

      if (!purpose || !imageBase64) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters: purpose and imageBase64 are required',
        });
      }

      const result = await runWaterfallParse({
        purpose,
        imageBase64,
        mimeType,
        options,
      });

      return res.status(result.success ? 200 : 500).json(result);
    } catch (err: any) {
      console.error('[API /api/ai/parse] Error:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Internal Server Error',
      });
    }
  }

  return res.status(404).json({ success: false, error: 'Endpoint not found' });
}
