import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./db.js', () => ({
  sql: vi.fn(),
}));

import { sql } from './db.js';
import { getUserVehicleRole, hasRole } from './acl.js';
import { handleVehicleMembers } from './vehicles.js';

vi.mock('./auth.js', () => ({
  getSession: vi.fn(),
}));

import { getSession } from './auth.js';

describe('Authority Resolution & Vehicle Members ACL', () => {
  const mockSql = sql as unknown as ReturnType<typeof vi.fn>;
  const mockGetSession = getSession as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserVehicleRole', () => {
    it('returns role from vehicle_members if user is a member', async () => {
      mockSql.mockResolvedValueOnce([{ role: 'editor' }]);

      const role = await getUserVehicleRole('user-1', 'vehicle-1');
      expect(role).toBe('editor');
    });

    it('falls back to vehicle owner check if user is not in vehicle_members', async () => {
      // First call for vehicle_members returns empty
      mockSql.mockResolvedValueOnce([]);
      // Second call for vehicles table returns owner match
      mockSql.mockResolvedValueOnce([{ owner_id: 'user-1' }]);

      const role = await getUserVehicleRole('user-1', 'vehicle-1');
      expect(role).toBe('owner');
    });

    it('returns null if user is neither in vehicle_members nor direct owner', async () => {
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([{ owner_id: 'other-user' }]);

      const role = await getUserVehicleRole('user-1', 'vehicle-1');
      expect(role).toBeNull();
    });
  });

  describe('hasRole hierarchy', () => {
    it('grants viewer role to editor and owner', async () => {
      mockSql.mockResolvedValueOnce([{ role: 'editor' }]);
      expect(await hasRole('user-1', 'vehicle-1', 'viewer')).toBe(true);
    });

    it('denies editor role to viewer', async () => {
      mockSql.mockResolvedValueOnce([{ role: 'viewer' }]);
      expect(await hasRole('user-1', 'vehicle-1', 'editor')).toBe(false);
    });

    it('denies access when user has no role', async () => {
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);
      expect(await hasRole('user-1', 'vehicle-1', 'viewer')).toBe(false);
    });
  });

  describe('handleVehicleMembers GET /api/vehicles/members?vehicle_id={id}', () => {
    it('returns 401 when unauthorized / no session', async () => {
      mockGetSession.mockResolvedValueOnce(null);
      const req: any = { method: 'GET', query: { vehicle_id: 'vehicle-1' }, headers: {} };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await handleVehicleMembers(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('returns 400 when vehicle_id is missing', async () => {
      mockGetSession.mockResolvedValueOnce({ user: { id: 'user-1' } });
      const req: any = { method: 'GET', query: {}, headers: {} };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await handleVehicleMembers(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('returns 403 when user does not have at least viewer role', async () => {
      mockGetSession.mockResolvedValueOnce({ user: { id: 'user-1' } });
      // vehicle_members check
      mockSql.mockResolvedValueOnce([]);
      // vehicles owner check
      mockSql.mockResolvedValueOnce([]);

      const req: any = { method: 'GET', query: { vehicle_id: 'vehicle-1' }, headers: {} };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await handleVehicleMembers(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('returns 200 and member list when user has valid authority', async () => {
      mockGetSession.mockResolvedValueOnce({ user: { id: 'user-1' } });
      // hasRole check: vehicle_members call
      mockSql.mockResolvedValueOnce([{ role: 'owner' }]);
      // members fetch call
      const expectedMembers = [
        { userId: 'user-1', role: 'owner', joinedAt: '2026-01-01', name: 'Alice', email: 'alice@example.com' },
      ];
      mockSql.mockResolvedValueOnce(expectedMembers);

      const req: any = { method: 'GET', query: { vehicle_id: 'vehicle-1' }, headers: {} };
      const res: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await handleVehicleMembers(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ members: expectedMembers });
    });
  });
});
