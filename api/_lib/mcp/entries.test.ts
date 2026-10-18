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

describe('MCP Entry Management Tools', () => {
  const mockSql = sql as unknown as ReturnType<typeof vi.fn>;
  const mockHasRole = hasRole as unknown as ReturnType<typeof vi.fn>;

  const userId = '550e8400-e29b-41d4-a716-446655440000';
  const vehicleId = '770e8400-e29b-41d4-a716-446655440001';
  const entryId = '990e8400-e29b-41d4-a716-446655440003';

  beforeEach(() => {
    vi.clearAllMocks();
    mockHasRole.mockResolvedValue(true);
  });

  describe('Tool Registration', () => {
    it('registers careto_update_entry with required schemas', () => {
      const names = CARETO_MCP_TOOLS.map((t) => t.name);
      expect(names).toContain('careto_update_entry');
      expect(names).toContain('careto_add_entry');
      expect(names).toContain('careto_delete_entry');

      const tool = CARETO_MCP_TOOLS.find((t) => t.name === 'careto_update_entry');
      expect(tool).toBeDefined();
      expect(tool?.inputSchema.required).toContain('vehicleId');
      expect(tool?.inputSchema.required).toContain('entryId');
      expect(tool?.inputSchema.properties.amount).toBeDefined();
      expect(tool?.inputSchema.properties.odometerKm).toBeDefined();
      expect(tool?.inputSchema.properties.merchant).toBeDefined();
      expect(tool?.inputSchema.properties.notes).toBeDefined();
      expect(tool?.inputSchema.properties.subItems).toBeDefined();
    });
  });

  describe('careto_update_entry', () => {
    it('selectively updates fields while preserving unmentioned fields', async () => {
      const existingEntry = {
        id: entryId,
        kind: 'refuel',
        occurred_on: '2026-10-01',
        amount_minor: 4500,
        currency: 'USD',
        vendor_name: 'Shell',
        odometer_m: 50000000,
        fuel_volume: 30,
        notes: 'Original note',
      };

      const existingColHlc = {
        occurred_on: '1000-0000-0000',
        amount_minor: '1000-0000-0000',
        vendor_name: '1000-0000-0000',
        notes: '1000-0000-0000',
      };

      mockSql.mockImplementation((strings: TemplateStringsArray) => {
        const query = strings.join('');
        if (query.includes('FROM records') && query.includes('SELECT data, col_hlc')) {
          return Promise.resolve([
            {
              data: existingEntry,
              col_hlc: existingColHlc,
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

      const res = await executeMCPTool(userId, 'careto_update_entry', {
        vehicleId,
        entryId,
        amount: 55.5,
        merchant: 'BP Superstation',
        odometerKm: 51200,
      });

      expect(res.ok).toBe(true);
      expect(res.entryId).toBe(entryId);
      expect(res.seq).toBe(11);
      // Updated fields:
      expect(res.entry!.amount_minor).toBe(5550);
      expect(res.entry!.amount).toBe(55.5);
      expect(res.entry!.vendor_name).toBe('BP Superstation');
      expect(res.entry!.merchant).toBe('BP Superstation');
      expect(res.entry!.odometer_m).toBe(51200000);
      expect(res.entry!.odometerKm).toBe(51200);
      // Preserved unmentioned fields:
      expect(res.entry!.kind).toBe('refuel');
      expect(res.entry!.occurred_on).toBe('2026-10-01');
      expect(res.entry!.fuel_volume).toBe(30);
      expect(res.entry!.notes).toBe('Original note');
    });

    it('updates service entry subItems and business flag', async () => {
      const existingEntry = {
        id: entryId,
        kind: 'service',
        occurred_on: '2026-09-15',
        amount_minor: 12000,
        currency: 'USD',
        vendor_name: 'AutoService',
        sub_items: [{ id: 'sub-1', name: 'Oil Filter', cost: '20' }],
      };

      mockSql.mockImplementation((strings: TemplateStringsArray) => {
        const query = strings.join('');
        if (query.includes('FROM records') && query.includes('SELECT data, col_hlc')) {
          return Promise.resolve([
            {
              data: existingEntry,
              col_hlc: {},
            },
          ]);
        }
        if (query.includes('SELECT seq FROM vehicles')) {
          return Promise.resolve([{ seq: 5 }]);
        }
        return Promise.resolve([]);
      });

      const res = await executeMCPTool(userId, 'careto_update_entry', {
        vehicleId,
        entryId,
        isBusiness: true,
        subItems: [
          { name: 'Synthetic Oil 5W30', cost: 60, partNumber: 'OIL-5W30' },
          { name: 'Oil Filter OEM', cost: 25, partNumber: 'FLT-100' },
          { name: 'Labor', cost: 75 },
        ],
      });

      expect(res.ok).toBe(true);
      expect(res.entry!.business).toBe(1);
      expect(res.entry!.sub_items).toHaveLength(3);
      expect(res.entry!.sub_items[0].name).toBe('Synthetic Oil 5W30');
      expect(res.entry!.sub_items[0].cost).toBe('60');
      expect(res.entry!.sub_items[1].partNumber).toBe('FLT-100');
    });

    it('rejects update without vehicleId or entryId', async () => {
      await expect(
        executeMCPTool(userId, 'careto_update_entry', {
          vehicleId: '',
          entryId,
        }),
      ).rejects.toThrow('vehicleId is required');

      await expect(
        executeMCPTool(userId, 'careto_update_entry', {
          vehicleId,
          entryId: '',
        }),
      ).rejects.toThrow('entryId is required');
    });

    it('rejects update when user does not have editor permission', async () => {
      mockHasRole.mockResolvedValueOnce(false);

      await expect(
        executeMCPTool(userId, 'careto_update_entry', {
          vehicleId,
          entryId,
          amount: 100,
        }),
      ).rejects.toThrow(/Forbidden/);
    });

    it('throws error when entry does not exist', async () => {
      mockSql.mockImplementation((strings: TemplateStringsArray) => {
        const query = strings.join('');
        if (query.includes('FROM records') && query.includes('SELECT data, col_hlc')) {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      });

      await expect(
        executeMCPTool(userId, 'careto_update_entry', {
          vehicleId,
          entryId: 'non-existent-id',
          amount: 50,
        }),
      ).rejects.toThrow(/not found/);
    });
  });
});
