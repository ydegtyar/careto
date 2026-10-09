import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleAttachmentInit, handleAttachmentComplete, handleAttachmentGet } from '../_lib/attachments.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action as string;

  if (action === 'init') {
    return handleAttachmentInit(req, res);
  }
  if (action === 'complete') {
    return handleAttachmentComplete(req, res);
  }
  // Otherwise treat as attachment ID lookup
  return handleAttachmentGet(req, res);
}
