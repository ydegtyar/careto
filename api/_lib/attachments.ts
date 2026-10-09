import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './db.js';
import { getSession } from './auth.js';
import { hasRole } from './acl.js';

export async function handleAttachmentInit(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const session = await getSession(req.headers);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { vehicleId, entryId, fileName, mimeType, byteSize, sha256 } = req.body || {};
    if (!vehicleId || !fileName || !sha256) {
      return res.status(400).json({ error: 'vehicleId, fileName, sha256 required' });
    }

    const canEdit = await hasRole(session.user.id, vehicleId, 'editor');
    if (!canEdit) return res.status(403).json({ error: 'Forbidden: Insufficient vehicle permissions' });

    const existingRows = await sql`
      SELECT id, data FROM records 
      WHERE vehicle_id = ${vehicleId}::uuid AND tbl = 'attachments' AND data->>'sha256' = ${sha256} AND deleted = false
      LIMIT 1
    `;

    if (existingRows.length > 0) {
      return res.status(200).json({
        ok: true,
        attachmentId: existingRows[0]!.id,
        deduplicated: true,
        data: existingRows[0]!.data,
      });
    }

    const attachmentId = crypto.randomUUID();
    const attachmentData = {
      id: attachmentId,
      entry_id: entryId || null,
      file_name: fileName,
      mime_type: mimeType || 'image/jpeg',
      byte_size: byteSize || 0,
      sha256,
      state: 'pending',
      created_at: new Date().toISOString(),
      created_by: session.user.id,
    };

    const vehicleRows = await sql`SELECT seq FROM vehicles WHERE id = ${vehicleId}::uuid FOR UPDATE LIMIT 1`;
    const nextSeq = Number(vehicleRows[0]?.seq ?? 0) + 1;

    await sql`
      INSERT INTO records (
        vehicle_id, tbl, id, data, col_hlc, deleted, seq, updated_by, updated_at
      ) VALUES (
        ${vehicleId}::uuid, 'attachments', ${attachmentId}::uuid, ${JSON.stringify(attachmentData)}::jsonb, '{}'::jsonb, false, ${nextSeq}, ${session.user.id}::uuid, now()
      )
    `;

    await sql`UPDATE vehicles SET seq = ${nextSeq} WHERE id = ${vehicleId}::uuid`;

    return res.status(200).json({ ok: true, attachmentId, deduplicated: false, data: attachmentData });
  } catch (err: any) {
    console.error('Attachment init error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

export async function handleAttachmentComplete(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const session = await getSession(req.headers);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { vehicleId, attachmentId, driveFileId, lqip } = req.body || {};
    if (!vehicleId || !attachmentId) {
      return res.status(400).json({ error: 'vehicleId and attachmentId required' });
    }

    const canEdit = await hasRole(session.user.id, vehicleId, 'editor');
    if (!canEdit) return res.status(403).json({ error: 'Forbidden: Insufficient vehicle permissions' });

    const existingRows = await sql`
      SELECT data FROM records 
      WHERE vehicle_id = ${vehicleId}::uuid AND tbl = 'attachments' AND id = ${attachmentId}::uuid
      LIMIT 1
    `;

    if (existingRows.length === 0) return res.status(404).json({ error: 'Attachment record not found' });

    const currentData = (existingRows[0]!.data as Record<string, any>) || {};
    const updatedData = {
      ...currentData,
      drive_file_id: driveFileId || currentData.drive_file_id,
      lqip: lqip || currentData.lqip,
      state: 'ready',
      completed_at: new Date().toISOString(),
    };

    const vehicleRows = await sql`SELECT seq FROM vehicles WHERE id = ${vehicleId}::uuid FOR UPDATE LIMIT 1`;
    const nextSeq = Number(vehicleRows[0]?.seq ?? 0) + 1;

    await sql`
      UPDATE records 
      SET data = ${JSON.stringify(updatedData)}::jsonb, seq = ${nextSeq}, updated_by = ${session.user.id}::uuid, updated_at = now()
      WHERE vehicle_id = ${vehicleId}::uuid AND tbl = 'attachments' AND id = ${attachmentId}::uuid
    `;

    await sql`UPDATE vehicles SET seq = ${nextSeq} WHERE id = ${vehicleId}::uuid`;

    return res.status(200).json({ ok: true, attachmentId, data: updatedData });
  } catch (err: any) {
    console.error('Attachment complete error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

export async function handleAttachmentGet(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const session = await getSession(req.headers);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const action = req.query.action as string;
    const vehicleId = req.query.vehicle_id as string;
    if (!action || !vehicleId) return res.status(400).json({ error: 'id and vehicle_id required' });

    const canView = await hasRole(session.user.id, vehicleId, 'viewer');
    if (!canView) return res.status(403).json({ error: 'Forbidden' });

    const rows = await sql`
      SELECT id, data, seq, updated_at
      FROM records
      WHERE vehicle_id = ${vehicleId}::uuid AND tbl = 'attachments' AND id = ${action}::uuid AND deleted = false
      LIMIT 1
    `;

    if (rows.length === 0) return res.status(404).json({ error: 'Attachment not found' });

    return res.status(200).json({ attachment: rows[0] });
  } catch (err: any) {
    console.error('Attachment get error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
