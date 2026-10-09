import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { sql } from './db.js';
import { getSession } from './auth.js';
import { hasRole } from './acl.js';

function isValidUuid(id: string): boolean {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function toUuid(str: string): string {
  if (isValidUuid(str)) return str;
  const hash = crypto.createHash('md5').update(str).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

interface SyncOp {
  opId: string;
  tbl: string;
  id: string;
  hlc: string;
  deleted?: boolean;
  patch: Record<string, any>;
  colHlc?: Record<string, string>;
}

export async function handlePush(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const session = await getSession(req.headers);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { vehicleId: rawVehicleId, ops } = req.body as { vehicleId: string; ops: SyncOp[] };
    if (!rawVehicleId || !Array.isArray(ops)) {
      return res.status(400).json({ error: 'Invalid payload: vehicleId and ops array required' });
    }

    const vehicleId = isValidUuid(rawVehicleId) ? rawVehicleId : toUuid(rawVehicleId);

    const canEdit = await hasRole(session.user.id, vehicleId, 'editor');
    if (!canEdit) {
      return res.status(403).json({ error: 'Forbidden: Insufficient vehicle permissions' });
    }

    if (ops.length === 0) {
      const v = await sql`SELECT seq FROM vehicles WHERE id = ${vehicleId}::uuid LIMIT 1`;
      return res.status(200).json({ ok: true, currentSeq: v[0]?.seq ?? 0, appliedCount: 0 });
    }

    const vehicleRows = await sql`
      SELECT seq FROM vehicles WHERE id = ${vehicleId}::uuid FOR UPDATE LIMIT 1
    `;
    if (vehicleRows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });

    let currentSeq = Number(vehicleRows[0]!.seq);
    let appliedCount = 0;

    for (const op of ops) {
      const opId = isValidUuid(op.opId) ? op.opId : toUuid(op.opId);
      const recordId = isValidUuid(op.id) ? op.id : toUuid(op.id);

      const existingOp = await sql`
        SELECT 1 FROM applied_ops WHERE vehicle_id = ${vehicleId}::uuid AND op_id = ${opId}::uuid LIMIT 1
      `;
      if (existingOp.length > 0) continue;

      currentSeq += 1;

      const existingRec = await sql`
        SELECT data, col_hlc, deleted, deleted_hlc 
        FROM records 
        WHERE vehicle_id = ${vehicleId}::uuid AND tbl = ${op.tbl} AND id = ${recordId}::uuid 
        LIMIT 1
      `;

      if (existingRec.length === 0) {
        const colHlc = op.colHlc || {};
        if (Object.keys(colHlc).length === 0) {
          for (const k of Object.keys(op.patch)) colHlc[k] = op.hlc;
        }

        await sql`
          INSERT INTO records (
            vehicle_id, tbl, id, data, col_hlc, deleted, deleted_hlc, seq, updated_by, updated_at
          ) VALUES (
            ${vehicleId}::uuid,
            ${op.tbl},
            ${recordId}::uuid,
            ${JSON.stringify(op.patch)}::jsonb,
            ${JSON.stringify(colHlc)}::jsonb,
            ${op.deleted ? true : false},
            ${op.deleted ? op.hlc : null},
            ${currentSeq},
            ${session.user.id}::uuid,
            now()
          )
        `;
      } else {
        const row = existingRec[0]!;
        const currentData = (row.data as Record<string, any>) || {};
        const currentColHlc = (row.col_hlc as Record<string, string>) || {};

        const mergedData = { ...currentData };
        const mergedColHlc = { ...currentColHlc };

        for (const [key, val] of Object.entries(op.patch)) {
          const incomingHlc = op.colHlc?.[key] || op.hlc;
          const currentFieldHlc = currentColHlc[key] || '';

          if (incomingHlc >= currentFieldHlc) {
            mergedData[key] = val;
            mergedColHlc[key] = incomingHlc;
          }
        }

        let isDeleted = row.deleted;
        let deletedHlc = row.deleted_hlc;

        if (op.deleted !== undefined) {
          if (op.deleted && (!deletedHlc || op.hlc >= deletedHlc)) {
            isDeleted = true;
            deletedHlc = op.hlc;
          } else if (!op.deleted && deletedHlc && op.hlc >= deletedHlc) {
            isDeleted = false;
            deletedHlc = null;
          }
        }

        await sql`
          UPDATE records 
          SET 
            data = ${JSON.stringify(mergedData)}::jsonb,
            col_hlc = ${JSON.stringify(mergedColHlc)}::jsonb,
            deleted = ${isDeleted},
            deleted_hlc = ${deletedHlc},
            seq = ${currentSeq},
            updated_by = ${session.user.id}::uuid,
            updated_at = now()
          WHERE vehicle_id = ${vehicleId}::uuid AND tbl = ${op.tbl} AND id = ${recordId}::uuid
        `;
      }

      await sql`
        INSERT INTO applied_ops (vehicle_id, op_id, applied_at)
        VALUES (${vehicleId}::uuid, ${opId}::uuid, now())
        ON CONFLICT DO NOTHING
      `;
      appliedCount++;
    }

    await sql`UPDATE vehicles SET seq = ${currentSeq} WHERE id = ${vehicleId}::uuid`;

    return res.status(200).json({ ok: true, currentSeq, appliedCount });
  } catch (err: any) {
    console.error('Sync push error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

export async function handlePull(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const session = await getSession(req.headers);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const rawVehicleId = req.query.vehicle_id as string;
    const since = Number(req.query.since || 0);
    const limit = Math.min(Number(req.query.limit || 500), 1000);

    if (!rawVehicleId) return res.status(400).json({ error: 'vehicle_id query parameter required' });

    const vehicleId = isValidUuid(rawVehicleId) ? rawVehicleId : toUuid(rawVehicleId);

    const canView = await hasRole(session.user.id, vehicleId, 'viewer');
    if (!canView) return res.status(403).json({ error: 'Forbidden: Insufficient vehicle permissions' });

    const vehicleRows = await sql`
      SELECT seq FROM vehicles WHERE id = ${vehicleId}::uuid LIMIT 1
    `;
    if (vehicleRows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });

    const currentSeq = Number(vehicleRows[0]!.seq);
    const recordRows = await sql`
      SELECT 
        tbl, 
        id, 
        data, 
        col_hlc as "colHlc", 
        deleted, 
        deleted_hlc as "deletedHlc", 
        seq, 
        updated_by as "updatedBy", 
        updated_at as "updatedAt"
      FROM records
      WHERE vehicle_id = ${vehicleId}::uuid AND seq > ${since}
      ORDER BY seq ASC
      LIMIT ${limit}
    `;

    return res.status(200).json({ vehicleId, currentSeq, records: recordRows });
  } catch (err: any) {
    console.error('Sync pull error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

export async function handlePullMany(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const session = await getSession(req.headers);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const { cursors = {}, limitPerVehicle = 200 } = req.body || {};
    const result: Record<string, { currentSeq: number; records: any[] }> = {};

    for (const [rawVehicleId, since] of Object.entries(cursors)) {
      const vehicleId = isValidUuid(rawVehicleId) ? rawVehicleId : toUuid(rawVehicleId);

      const canView = await hasRole(session.user.id, vehicleId, 'viewer');
      if (!canView) continue;

      const vehicleRows = await sql`SELECT seq FROM vehicles WHERE id = ${vehicleId}::uuid LIMIT 1`;
      if (vehicleRows.length === 0) continue;

      const currentSeq = Number(vehicleRows[0]!.seq);
      const recordRows = await sql`
        SELECT tbl, id, data, col_hlc as "colHlc", deleted, deleted_hlc as "deletedHlc", seq, updated_by as "updatedBy", updated_at as "updatedAt"
        FROM records
        WHERE vehicle_id = ${vehicleId}::uuid AND seq > ${Number(since)}
        ORDER BY seq ASC
        LIMIT ${limitPerVehicle}
      `;

      result[vehicleId] = { currentSeq, records: recordRows };
    }

    return res.status(200).json({ vehicles: result });
  } catch (err: any) {
    console.error('Sync pull-many error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}

export async function handleSnapshot(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const session = await getSession(req.headers);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const rawVehicleId = req.query.vehicle_id as string;
    if (!rawVehicleId) return res.status(400).json({ error: 'vehicle_id query parameter required' });

    const vehicleId = isValidUuid(rawVehicleId) ? rawVehicleId : toUuid(rawVehicleId);

    const canView = await hasRole(session.user.id, vehicleId, 'viewer');
    if (!canView) return res.status(403).json({ error: 'Forbidden: Insufficient vehicle permissions' });

    const vehicleRows = await sql`SELECT id, name, seq, created_at FROM vehicles WHERE id = ${vehicleId}::uuid LIMIT 1`;
    if (vehicleRows.length === 0) return res.status(404).json({ error: 'Vehicle not found' });

    const recordRows = await sql`
      SELECT tbl, id, data, col_hlc as "colHlc", seq, updated_by as "updatedBy", updated_at as "updatedAt"
      FROM records
      WHERE vehicle_id = ${vehicleId}::uuid AND deleted = false
      ORDER BY tbl ASC, updated_at ASC
    `;

    return res.status(200).json({
      vehicle: vehicleRows[0],
      currentSeq: Number(vehicleRows[0]!.seq),
      records: recordRows,
    });
  } catch (err: any) {
    console.error('Sync snapshot error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
