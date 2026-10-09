import { describe, expect, it } from 'vitest';
import type { Entry, Note, Reminder, Vehicle } from '../client/types';
import { createExportZip, parseImportZip } from './export-import';

describe('export-import pipeline', () => {
  const mockVehicles: Vehicle[] = [
    {
      id: 'v-1',
      name: 'Tesla Model 3',
      powertrain: 'ev',
      initial_odometer_m: 40000000,
      distance_unit: 'km',
      efficiency_unit: 'kwh_100km',
    },
  ];

  const mockEntries: Entry[] = [
    {
      id: 'e-1',
      kind: 'charge',
      occurred_on: '2026-10-01',
      odometer_m: 41200000,
      amount_minor: 2500,
      currency: 'USD',
      usd_minor: 2500,
    },
    {
      id: 'e-2',
      kind: 'service',
      occurred_on: '2026-10-05',
      odometer_m: 41500000,
      amount_minor: 12000,
      currency: 'EUR',
      usd_minor: 13000,
    },
  ];

  const mockReminders: Reminder[] = [
    {
      id: 'r-1',
      kind: 'maintenance',
      title: 'Tire Rotation',
      mode: 'km',
      interval_m: 10000000,
      lead_m: 500000,
      lead_days: 14,
    },
  ];

  const mockNotes: Note[] = [
    {
      id: 'n-1',
      subject_type: 'vehicle',
      subject_id: 'v-1',
      body: 'Winter tires installed on 18-inch Aero wheels',
      pinned: 1,
      created_at: '2026-10-01T12:00:00Z',
    },
  ];

  it('exports to a valid zip archive and parses back all entities identically', () => {
    const zipBytes = createExportZip({
      vehicles: mockVehicles,
      entries: mockEntries,
      reminders: mockReminders,
      notes: mockNotes,
    });

    expect(zipBytes).toBeInstanceOf(Uint8Array);
    expect(zipBytes.byteLength).toBeGreaterThan(100);

    const imported = parseImportZip(zipBytes);

    expect(imported.manifest.version).toBe('0.3.1');
    expect(imported.manifest.schemaVersion).toBe(1);
    expect(imported.manifest.counts).toEqual({
      vehicles: 1,
      entries: 2,
      reminders: 1,
      notes: 1,
    });

    expect(imported.vehicles).toEqual(mockVehicles);
    expect(imported.entries).toEqual(mockEntries);
    expect(imported.reminders).toEqual(mockReminders);
    expect(imported.notes).toEqual(mockNotes);
    expect(imported.errors).toHaveLength(0);
  });

  it('throws an error if zip is missing manifest.json', () => {
    // Empty valid zip or invalid structure
    const invalidZip = new Uint8Array([
      0x50, 0x4b, 0x05, 0x06, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    expect(() => parseImportZip(invalidZip)).toThrow(/missing manifest.json/);
  });
});
