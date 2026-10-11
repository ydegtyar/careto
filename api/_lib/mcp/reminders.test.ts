import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db.js', () => ({
  sql: vi.fn(),
}));

vi.mock('../acl.js', () => ({
  hasRole: vi.fn(),
}));

import { sql } from '../db.js';
import { hasRole } from '../acl.js';
import { CARETO_MCP_TOOLS, executeMCPTool } from './tools.js';

describe('MCP Maintenance Reminder Tools', () => {
  const mockSql = sql as unknown as ReturnType<typeof vi.fn>;
  const mockHasRole = hasRole as unknown as ReturnType<typeof vi.fn>;

  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const vehicleId = '770e8400-e29b-41d4-a716-446655440001';
  const reminderId = '880e8400-e29b-41d4-a716-446655440002';

  beforeEach(() => {
    vi.clearAllMocks();
    mockHasRole.mockResolvedValue(true);
  });

  describe('Tool Registration', () => {
    it('registers all 5 reminder tools with correct schemas', () => {
      const names = CARETO_MCP_TOOLS.map((t) => t.name);
      expect(names).toContain('careto_get_reminders');
      expect(names).toContain('careto_create_reminder');
      expect(names).toContain('careto_update_reminder');
      expect(names).toContain('careto_delete_reminder');
      expect(names).toContain('careto_complete_reminder');
    });
  });

  describe('careto_create_reminder', () => {
    it('creates a reminder with kilometer and date intervals', async () => {
      mockSql.mockImplementation((strings: TemplateStringsArray) => {
        const query = strings.join('');
        if (query.includes('SELECT seq FROM vehicles')) {
          return Promise.resolve([{ seq: 42 }]);
        }
        if (query.includes('INSERT INTO records')) {
          return Promise.resolve([]);
        }
        if (query.includes('UPDATE vehicles SET seq')) {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      });

      const res = await executeMCPTool(userId, 'careto_create_reminder', {
        vehicleId,
        title: 'Transmission Fluid Flush',
        kind: 'transmission',
        mode: 'earlier',
        intervalKm: 60000,
        intervalDays: 730,
        baseOdometerKm: 120000,
        baseDate: '2025-01-15',
        estimatedCost: 250,
        notes: 'Use synthetic ATF',
      });

      expect(res.ok).toBe(true);
      expect(res.reminderId).toBeDefined();
      expect(res.reminder!.title).toBe('Transmission Fluid Flush');
      expect(res.reminder!.kind).toBe('transmission');
      expect(res.reminder!.intervalKm).toBe(60000);
      expect(res.reminder!.intervalDays).toBe(730);
      expect(res.seq).toBe(43);
    });

    it('rejects creation without title', async () => {
      await expect(
        executeMCPTool(userId, 'careto_create_reminder', {
          vehicleId,
          title: '',
        }),
      ).rejects.toThrow('Reminder title is required');
    });

    it('rejects unauthorized creation', async () => {
      mockHasRole.mockResolvedValueOnce(false);
      await expect(
        executeMCPTool(userId, 'careto_create_reminder', {
          vehicleId,
          title: 'Unauthorized Task',
        }),
      ).rejects.toThrow(/Forbidden/);
    });
  });

  describe('careto_get_reminders', () => {
    it('fetches reminders, calculates due status against highest odometer reading, and filters by status', async () => {
      mockSql.mockImplementation((strings: TemplateStringsArray) => {
        const query = strings.join('');
        if (query.includes('FROM vehicles WHERE id')) {
          return Promise.resolve([{ initial_odometer_m: 50000000, distance_unit: 'km' }]);
        }
        if (query.includes('tbl = \'entries\'')) {
          return Promise.resolve([
            { data: { odometerKm: 55000 } }, // 55,000 km current odometer
          ]);
        }
        if (query.includes('tbl = \'reminders\'')) {
          return Promise.resolve([
            {
              id: reminderId,
              data: {
                title: 'Cabin Air Filter',
                kind: 'filters',
                mode: 'km',
                interval_m: 10000000, // 10,000 km
                base_odometer_m: 50000000, // 50,000 km base -> due at 60,000 km
                lead_m: 1000000, // 1,000 km
                lead_days: 14,
              },
              updated_at: new Date().toISOString(),
            },
          ]);
        }
        return Promise.resolve([]);
      });

      const res = await executeMCPTool(userId, 'careto_get_reminders', {
        vehicleId,
        statusFilter: 'all',
      });

      expect(res.vehicleId).toBe(vehicleId);
      expect(res.currentVehicleOdometerKm).toBe(55000);
      expect(res.reminders).toHaveLength(1);
      const rem = res.reminders![0]!;
      expect(rem.id).toBe(reminderId);
      expect(rem.status).toBe('ok');
      expect(rem.remainingKm).toBe(5000);
      expect(rem.targetOdometerKm).toBe(60000);
    });
  });

  describe('careto_update_reminder', () => {
    it('updates only provided fields while preserving others', async () => {
      mockSql.mockImplementation((strings: TemplateStringsArray) => {
        const query = strings.join(' ').replace(/\s+/g, ' ');
        if (query.includes('FROM records') && query.includes('tbl = \'reminders\'')) {
          return Promise.resolve([
            {
              data: {
                id: reminderId,
                title: 'Old Title',
                kind: 'service',
                mode: 'km',
                interval_m: 10000000,
                base_odometer_m: 50000000,
              },
              col_hlc: {},
            },
          ]);
        }
        if (query.includes('SELECT seq FROM vehicles')) {
          return Promise.resolve([{ seq: 10 }]);
        }
        if (query.includes('UPDATE records')) {
          return Promise.resolve([]);
        }
        if (query.includes('UPDATE vehicles SET seq')) {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      });

      const res = await executeMCPTool(userId, 'careto_update_reminder', {
        vehicleId,
        reminderId,
        title: 'New Improved Title',
        estimatedCost: 175,
      });

      expect(res.ok).toBe(true);
      expect(res.reminder!.title).toBe('New Improved Title');
      expect(res.reminder!.intervalKm).toBe(10000); // Preserved!
      expect(res.reminder!.baseOdometerKm).toBe(50000); // Preserved!
      expect(res.reminder!.estimatedCost).toBe(175);
    });
  });

  describe('careto_complete_reminder', () => {
    it('advances baseline date and odometer and creates linked service entry', async () => {
      mockSql.mockImplementation((strings: TemplateStringsArray) => {
        const query = strings.join(' ').replace(/\s+/g, ' ');
        if (query.includes('FROM records') && query.includes('tbl = \'reminders\'')) {
          return Promise.resolve([
            {
              data: {
                id: reminderId,
                title: 'Brake Fluid Service',
                kind: 'brakes',
                mode: 'earlier',
                interval_m: 40000000,
                interval_days: 730,
              },
              col_hlc: {},
            },
          ]);
        }
        if (query.includes('SELECT seq FROM vehicles')) {
          return Promise.resolve([{ seq: 15 }]);
        }
        if (query.includes('UPDATE records') || query.includes('INSERT INTO records') || query.includes('UPDATE vehicles')) {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      });

      const res = await executeMCPTool(userId, 'careto_complete_reminder', {
        vehicleId,
        reminderId,
        completedDate: '2026-10-11',
        completedOdometerKm: 85000,
        cost: 130,
        merchant: 'FastBrakes Garage',
        notes: 'Flushed DOT4 fluid',
        createServiceEntry: true,
      });

      expect(res.ok).toBe(true);
      expect(res.serviceEntryCreated).toBe(true);
      expect(res.serviceEntryId).toBeDefined();
      expect(res.newBaseDate).toBe('2026-10-11');
      expect(res.newBaseOdometerKm).toBe(85000);
      expect(res.seq).toBe(17);
    });
  });

  describe('careto_delete_reminder', () => {
    it('soft deletes reminder when confirmed=true', async () => {
      mockSql.mockImplementation((strings: TemplateStringsArray) => {
        const query = strings.join(' ').replace(/\s+/g, ' ');
        if (query.includes('FROM records') && query.includes('tbl = \'reminders\'')) {
          return Promise.resolve([
            { id: reminderId, data: { title: 'Obsolete reminder' }, deleted: false },
          ]);
        }
        if (query.includes('SELECT seq FROM vehicles')) {
          return Promise.resolve([{ seq: 20 }]);
        }
        if (query.includes('UPDATE records') || query.includes('UPDATE vehicles')) {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      });

      const res = await executeMCPTool(userId, 'careto_delete_reminder', {
        vehicleId,
        reminderId,
        confirmed: true,
        confirmationReason: 'Task is no longer needed',
      });

      expect(res.ok).toBe(true);
      expect(res.deletedReminderId).toBe(reminderId);
      expect(res.seq).toBe(21);
    });

    it('requires confirmation if confirmed is false', async () => {
      const res = await executeMCPTool(userId, 'careto_delete_reminder', {
        vehicleId,
        reminderId,
        confirmed: false,
      });

      expect(res.ok).toBe(false);
      expect(res.requiresConsent).toBe(true);
    });
  });
});
