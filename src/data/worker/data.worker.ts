import { expose } from 'comlink';
import type { ConflictRecord, Entry, Note, Reminder, SyncStatus, Vehicle } from '../client/types';
import { SyncEngine } from './sync/sync-client';

class LocalDbService {
  private syncEngine: SyncEngine;
  private conflicts: ConflictRecord[] = [];

  private vehicles: Vehicle[] = [
    {
      id: 'f85e3426-dbf2-4022-8467-c5bc5367358d',
      name: 'Suzuki SX4',
      make: 'Suzuki',
      model: 'SX4',
      powertrain: 'ice',
      initial_odometer_m: 117321000,
      tanks: [
        { id: 'tank-1', name: 'Petrol Tank', type: 'petrol' },
        { id: 'tank-2', name: 'LPG Tank', type: 'lpg' },
      ],
      fuel_grades: ['ron95', 'lpg'],
      distance_unit: 'km',
      efficiency_unit: 'l100km',
    },
  ];
  private entries: Entry[] = [];
  private notes: Note[] = [];
  private reminders: Reminder[] = [];

  constructor() {
    this.syncEngine = new SyncEngine();

    // Trigger initial sync in background
    setTimeout(() => {
      this.syncNow().catch(() => {});
    }, 1000);
  }

  // --- Vehicles ---
  async getVehicles(): Promise<Vehicle[]> {
    return this.vehicles;
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    return this.vehicles.find((v) => v.id === id);
  }

  async upsertVehicle(vehicle: Vehicle): Promise<void> {
    const idx = this.vehicles.findIndex((v) => v.id === vehicle.id);
    if (idx >= 0) {
      this.vehicles[idx] = vehicle;
    } else {
      this.vehicles.push(vehicle);
    }

    this.syncEngine.queueOp(vehicle.id, 'vehicle', vehicle.id, vehicle);
    this.broadcast(['vehicle']);
    this.syncEngine.push(vehicle.id).catch(() => {});
  }

  async deleteVehicle(id: string): Promise<void> {
    this.vehicles = this.vehicles.filter((v) => v.id !== id);
    this.syncEngine.queueOp(id, 'vehicle', id, {}, true);
    this.broadcast(['vehicle']);
    this.syncEngine.push(id).catch(() => {});
  }

  // --- Entries ---
  async getEntries(vehicleId?: string): Promise<Entry[]> {
    return this.entries;
  }

  async upsertEntry(entry: Entry): Promise<void> {
    const idx = this.entries.findIndex((e) => e.id === entry.id);
    if (idx >= 0) {
      this.entries[idx] = entry;
    } else {
      this.entries.unshift(entry);
    }

    const targetVehicleId = this.vehicles[0]?.id || 'c9aa4040-a7ca-41a0-9b1f-d8cdb7221d13';
    this.syncEngine.queueOp(targetVehicleId, 'entries', entry.id, entry);
    this.broadcast(['entries']);
    this.syncEngine.push(targetVehicleId).catch(() => {});
  }

  async deleteEntry(id: string): Promise<void> {
    this.entries = this.entries.filter((e) => e.id !== id);
    const targetVehicleId = this.vehicles[0]?.id || 'c9aa4040-a7ca-41a0-9b1f-d8cdb7221d13';
    this.syncEngine.queueOp(targetVehicleId, 'entries', id, {}, true);
    this.broadcast(['entries']);
    this.syncEngine.push(targetVehicleId).catch(() => {});
  }

  // --- Notes ---
  async getNotes(subjectType: string, subjectId: string): Promise<Note[]> {
    return this.notes.filter((n) => n.subject_type === subjectType && n.subject_id === subjectId);
  }

  async addNote(note: Note): Promise<void> {
    this.notes.unshift(note);
    const targetVehicleId =
      note.subject_type === 'vehicle'
        ? note.subject_id
        : this.vehicles[0]?.id || 'c9aa4040-a7ca-41a0-9b1f-d8cdb7221d13';
    this.syncEngine.queueOp(targetVehicleId, 'notes', note.id, note);
    this.broadcast(['notes']);
    this.syncEngine.push(targetVehicleId).catch(() => {});
  }

  // --- Reminders ---
  async getReminders(vehicleId?: string): Promise<Reminder[]> {
    return this.reminders;
  }

  async upsertReminder(reminder: Reminder): Promise<void> {
    const idx = this.reminders.findIndex((r) => r.id === reminder.id);
    if (idx >= 0) {
      this.reminders[idx] = reminder;
    } else {
      this.reminders.push(reminder);
    }

    const targetVehicleId = this.vehicles[0]?.id || 'c9aa4040-a7ca-41a0-9b1f-d8cdb7221d13';
    this.syncEngine.queueOp(targetVehicleId, 'reminders', reminder.id, reminder);
    this.broadcast(['reminders']);
    this.syncEngine.push(targetVehicleId).catch(() => {});
  }

  // --- Sync Engine Operations ---
  async getSyncStatus(): Promise<SyncStatus> {
    return this.syncEngine.getStatus();
  }

  async syncNow(vehicleId?: string): Promise<{ ok: boolean; status: SyncStatus }> {
    const targetId = vehicleId || this.vehicles[0]?.id || 'f85e3426-dbf2-4022-8467-c5bc5367358d';

    // 1. Push pending local mutations
    await this.syncEngine.push(targetId);

    // 2. Pull server changes
    const pulled = await this.syncEngine.pull(targetId);
    if (pulled && Array.isArray(pulled.records)) {
      const changedTables = new Set<string>();

      for (const rec of pulled.records) {
        if (rec.tbl === 'entries') {
          if (rec.deleted) {
            this.entries = this.entries.filter((e) => e.id !== rec.id);
          } else {
            const idx = this.entries.findIndex((e) => e.id === rec.id);
            if (idx >= 0) {
              this.entries[idx] = { ...this.entries[idx], ...rec.data, id: rec.id };
            } else {
              this.entries.unshift({ id: rec.id, ...rec.data });
            }
          }
          changedTables.add('entries');
        } else if (rec.tbl === 'notes') {
          if (rec.deleted) {
            this.notes = this.notes.filter((n) => n.id !== rec.id);
          } else {
            const idx = this.notes.findIndex((n) => n.id === rec.id);
            if (idx >= 0) {
              this.notes[idx] = { ...this.notes[idx], ...rec.data, id: rec.id };
            } else {
              this.notes.unshift({ id: rec.id, ...rec.data });
            }
          }
          changedTables.add('notes');
        } else if (rec.tbl === 'reminders') {
          if (rec.deleted) {
            this.reminders = this.reminders.filter((r) => r.id !== rec.id);
          } else {
            const idx = this.reminders.findIndex((r) => r.id === rec.id);
            if (idx >= 0) {
              this.reminders[idx] = { ...this.reminders[idx], ...rec.data, id: rec.id };
            } else {
              this.reminders.push({ id: rec.id, ...rec.data });
            }
          }
          changedTables.add('reminders');
        } else if (rec.tbl === 'vehicle') {
          const idx = this.vehicles.findIndex((v) => v.id === rec.id);
          if (idx >= 0) {
            this.vehicles[idx] = { ...this.vehicles[idx], ...rec.data, id: rec.id };
          } else {
            this.vehicles.push({
              id: rec.id,
              name: 'Suzuki SX4',
              powertrain: 'ice',
              initial_odometer_m: 117321000,
              distance_unit: 'km',
              efficiency_unit: 'l100km',
              ...rec.data,
            });
          }
          changedTables.add('vehicle');
        }
      }

      if (changedTables.size > 0) {
        this.broadcast(Array.from(changedTables));
      }
    }

    return {
      ok: true,
      status: this.syncEngine.getStatus(),
    };
  }

  // --- Conflicts ---
  async getConflicts(): Promise<ConflictRecord[]> {
    return this.conflicts;
  }

  async resolveConflict(conflictId: string, _resolution: 'local' | 'remote'): Promise<void> {
    this.conflicts = this.conflicts.filter((c) => c.id !== conflictId);
    this.broadcast(['conflicts']);
  }

  // --- Data Export & Import ---
  async getAllData(): Promise<{
    vehicles: Vehicle[];
    entries: Entry[];
    reminders: Reminder[];
    notes: Note[];
  }> {
    return {
      vehicles: [...this.vehicles],
      entries: [...this.entries],
      reminders: [...this.reminders],
      notes: [...this.notes],
    };
  }

  async importData(data: {
    vehicles?: Vehicle[];
    entries?: Entry[];
    reminders?: Reminder[];
    notes?: Note[];
  }): Promise<{ importedCount: number }> {
    let count = 0;
    if (data.vehicles && data.vehicles.length > 0) {
      for (const v of data.vehicles) {
        const idx = this.vehicles.findIndex((x) => x.id === v.id);
        if (idx >= 0) this.vehicles[idx] = v;
        else this.vehicles.push(v);
        count++;
      }
    }
    if (data.entries && data.entries.length > 0) {
      for (const e of data.entries) {
        const idx = this.entries.findIndex((x) => x.id === e.id);
        if (idx >= 0) this.entries[idx] = e;
        else this.entries.unshift(e);
        count++;
      }
    }
    if (data.reminders && data.reminders.length > 0) {
      for (const r of data.reminders) {
        const idx = this.reminders.findIndex((x) => x.id === r.id);
        if (idx >= 0) this.reminders[idx] = r;
        else this.reminders.push(r);
        count++;
      }
    }
    if (data.notes && data.notes.length > 0) {
      for (const n of data.notes) {
        const idx = this.notes.findIndex((x) => x.id === n.id);
        if (idx >= 0) this.notes[idx] = n;
        else this.notes.unshift(n);
        count++;
      }
    }
    this.broadcast(['vehicle', 'entries', 'reminders', 'notes']);
    return { importedCount: count };
  }

  private broadcast(tables: string[]) {
    try {
      const channel = new BroadcastChannel('careta-db');
      channel.postMessage({ tables, timestamp: Date.now() });
      channel.close();
    } catch {
      // Fallback
    }
  }
}

const service = new LocalDbService();
expose(service);
export type WorkerApi = typeof service;
