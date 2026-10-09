import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleExportData, handleDeleteAccount } from '../_lib/export.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { action } = req.query;

  switch (action) {
    case 'download':
    case 'gdpr':
    case 'user':
      return handleExportData(req, res);
    case 'delete-account':
      return handleDeleteAccount(req, res);
    default:
      return handleExportData(req, res);
  }
}
