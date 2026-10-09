import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import type { Entry, Note, Reminder, Vehicle } from '../client/types';

export interface ExportData {
  vehicles: Vehicle[];
  entries: Entry[];
  reminders: Reminder[];
  notes: Note[];
  appVersion?: string;
}

export interface ExportManifest {
  version: '0.3.1';
  schemaVersion: number;
  exportedAt: string;
  counts: {
    vehicles: number;
    entries: number;
    reminders: number;
    notes: number;
  };
}

export interface ImportResult {
  manifest: ExportManifest;
  vehicles: Vehicle[];
  entries: Entry[];
  reminders: Reminder[];
  notes: Note[];
  errors: string[];
}

function toNdjson(items: any[]): string {
  return items.map((item) => JSON.stringify(item)).join('\n');
}

function parseNdjson<T>(content: string): T[] {
  if (!content.trim()) return [];
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}

function entriesToCsv(entries: Entry[]): string {
  const header = ['ID', 'Date', 'Time', 'Kind', 'Odometer (km)', 'Amount', 'Currency', 'USD Minor'];
  const rows = entries.map((e) => [
    e.id,
    e.occurred_on,
    e.occurred_time || '',
    e.kind,
    e.odometer_m ? (e.odometer_m / 1000).toFixed(1) : '',
    e.amount_minor !== undefined ? (e.amount_minor / 100).toFixed(2) : '',
    e.currency || 'USD',
    e.usd_minor !== undefined ? (e.usd_minor / 100).toFixed(2) : '',
  ]);

  const csvRows = [header, ...rows].map((row) =>
    row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
  );

  return csvRows.join('\r\n');
}

export function createExportZip(data: ExportData): Uint8Array {
  const now = new Date().toISOString();
  const manifest: ExportManifest = {
    version: '0.3.1',
    schemaVersion: 1,
    exportedAt: now,
    counts: {
      vehicles: data.vehicles.length,
      entries: data.entries.length,
      reminders: data.reminders.length,
      notes: data.notes.length,
    },
  };

  const files: Record<string, Uint8Array> = {
    'manifest.json': strToU8(JSON.stringify(manifest, null, 2)),
    'data/vehicles.ndjson': strToU8(toNdjson(data.vehicles)),
    'data/entries.ndjson': strToU8(toNdjson(data.entries)),
    'data/reminders.ndjson': strToU8(toNdjson(data.reminders)),
    'data/notes.ndjson': strToU8(toNdjson(data.notes)),
    'csv/entries.csv': strToU8(entriesToCsv(data.entries)),
  };

  return zipSync(files, { level: 6 });
}

export function parseImportZip(zipBytes: Uint8Array): ImportResult {
  const errors: string[] = [];
  const unzipped = unzipSync(zipBytes);

  const manifestFile = unzipped['manifest.json'];
  if (!manifestFile) {
    throw new Error('Invalid Careta archive: missing manifest.json');
  }

  let manifest: ExportManifest;
  try {
    manifest = JSON.parse(strFromU8(manifestFile));
  } catch (e: any) {
    throw new Error(`Failed to parse manifest.json: ${e.message}`);
  }

  let vehicles: Vehicle[] = [];
  let entries: Entry[] = [];
  let reminders: Reminder[] = [];
  let notes: Note[] = [];

  if (unzipped['data/vehicles.ndjson']) {
    try {
      vehicles = parseNdjson<Vehicle>(strFromU8(unzipped['data/vehicles.ndjson']!));
    } catch (e: any) {
      errors.push(`Vehicles parse warning: ${e.message}`);
    }
  }

  if (unzipped['data/entries.ndjson']) {
    try {
      entries = parseNdjson<Entry>(strFromU8(unzipped['data/entries.ndjson']!));
    } catch (e: any) {
      errors.push(`Entries parse warning: ${e.message}`);
    }
  }

  if (unzipped['data/reminders.ndjson']) {
    try {
      reminders = parseNdjson<Reminder>(strFromU8(unzipped['data/reminders.ndjson']!));
    } catch (e: any) {
      errors.push(`Reminders parse warning: ${e.message}`);
    }
  }

  if (unzipped['data/notes.ndjson']) {
    try {
      notes = parseNdjson<Note>(strFromU8(unzipped['data/notes.ndjson']!));
    } catch (e: any) {
      errors.push(`Notes parse warning: ${e.message}`);
    }
  }

  return {
    manifest,
    vehicles,
    entries,
    reminders,
    notes,
    errors,
  };
}

export function downloadExportZip(zipBytes: Uint8Array, filename = 'careta-backup.aem.zip') {
  const blob = new Blob([zipBytes.buffer as ArrayBuffer], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
