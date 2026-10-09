import { sql } from '../db/client';

export type Role = 'viewer' | 'editor' | 'owner';

const ROLE_RANKS: Record<Role, number> = {
  viewer: 1,
  editor: 2,
  owner: 3,
};

export async function getUserVehicleRole(userId: string, vehicleId: string): Promise<Role | null> {
  try {
    const rows = await sql`
      SELECT role FROM vehicle_members 
      WHERE vehicle_id = ${vehicleId}::uuid AND user_id = ${userId}::uuid
      LIMIT 1
    `;
    if (rows.length === 0) return null;
    return rows[0]!.role as Role;
  } catch (err) {
    console.error('Error checking user vehicle role:', err);
    return null;
  }
}

export async function hasRole(userId: string, vehicleId: string, minRole: Role): Promise<boolean> {
  const currentRole = await getUserVehicleRole(userId, vehicleId);
  if (!currentRole) return false;
  return (ROLE_RANKS[currentRole] ?? 0) >= (ROLE_RANKS[minRole] ?? 0);
}
