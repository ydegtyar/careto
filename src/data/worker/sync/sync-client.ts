import { HLC } from '@/shared/lib/hlc';

export interface SyncOp {
  opId: string;
  vehicleId: string;
  tbl: string;
  id: string;
  hlc: string;
  deleted?: boolean;
  patch: Record<string, any>;
  colHlc?: Record<string, string>;
  attempts?: number;
}

export interface SyncStatus {
  state: 'idle' | 'syncing' | 'error';
  lastSyncedAt?: string;
  pendingOpsCount: number;
  lastError?: string;
  currentSeq: number;
}

export class SyncEngine {
  private hlc: HLC;
  private outbox: SyncOp[] = [];
  private cursors: Record<string, number> = {};
  private status: SyncStatus = {
    state: 'idle',
    pendingOpsCount: 0,
    currentSeq: 0,
  };

  constructor() {
    this.hlc = new HLC();
  }

  public getHlcNow(): string {
    return this.hlc.now();
  }

  public queueOp(
    vehicleId: string,
    tbl: string,
    id: string,
    patch: Record<string, any>,
    deleted = false,
  ): SyncOp {
    const opId = crypto.randomUUID();
    const hlcTime = this.hlc.now();
    const colHlc: Record<string, string> = {};
    for (const k of Object.keys(patch)) {
      colHlc[k] = hlcTime;
    }

    const op: SyncOp = {
      opId,
      vehicleId,
      tbl,
      id,
      hlc: hlcTime,
      deleted,
      patch,
      colHlc,
      attempts: 0,
    };

    this.outbox.push(op);
    this.status.pendingOpsCount = this.outbox.length;
    return op;
  }

  public getStatus(): SyncStatus {
    return { ...this.status, pendingOpsCount: this.outbox.length };
  }

  public async push(vehicleId: string): Promise<boolean> {
    const pending = this.outbox.filter((op) => op.vehicleId === vehicleId);
    if (pending.length === 0) return true;

    try {
      this.status.state = 'syncing';
      const res = await fetch('/api/sync/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Careto': '1',
        },
        body: JSON.stringify({
          vehicleId,
          ops: pending.map((op) => ({
            opId: op.opId,
            tbl: op.tbl,
            id: op.id,
            hlc: op.hlc,
            deleted: op.deleted,
            patch: op.patch,
            colHlc: op.colHlc,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Push failed with status ${res.status}`);
      }

      const data = (await res.json()) as { currentSeq?: number };
      if (data.currentSeq) {
        this.cursors[vehicleId] = data.currentSeq;
        this.status.currentSeq = data.currentSeq;
      }

      // Remove successfully pushed ops
      const pushedIds = new Set(pending.map((o) => o.opId));
      this.outbox = this.outbox.filter((op) => !pushedIds.has(op.opId));
      this.status.pendingOpsCount = this.outbox.length;
      this.status.state = 'idle';
      this.status.lastSyncedAt = new Date().toISOString();
      return true;
    } catch (err: unknown) {
      const errorObj = err as Error;
      console.warn('Sync push error:', err);
      this.status.state = 'error';
      this.status.lastError = errorObj.message;
      return false;
    }
  }

  public async pull(
    vehicleId: string,
  ): Promise<{ records: Record<string, any>[]; currentSeq: number } | null> {
    const since = this.cursors[vehicleId] || 0;
    try {
      this.status.state = 'syncing';
      const res = await fetch(
        `/api/sync/pull?vehicle_id=${encodeURIComponent(vehicleId)}&since=${since}`,
        {
          headers: { 'X-Careto': '1' },
        },
      );

      if (!res.ok) {
        throw new Error(`Pull failed with status ${res.status}`);
      }

      const data = (await res.json()) as {
        records: Record<string, any>[];
        currentSeq: number;
      };
      if (data.currentSeq !== undefined) {
        this.cursors[vehicleId] = data.currentSeq;
        this.status.currentSeq = data.currentSeq;
      }

      this.status.state = 'idle';
      this.status.lastSyncedAt = new Date().toISOString();
      return data;
    } catch (err: unknown) {
      const errorObj = err as Error;
      console.warn('Sync pull error:', err);
      this.status.state = 'error';
      this.status.lastError = errorObj.message;
      return null;
    }
  }
}
