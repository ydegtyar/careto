import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const sql = neon(process.env.DATABASE_URL!);
const authBaseUrl = process.env.NEON_AUTH_BASE_URL!;

async function main() {
  console.log('Seeding Neon database...');

  // 1. Create or get test user via Neon Auth Better Auth REST API
  let userId: string;
  try {
    console.log(`Calling ${authBaseUrl}/sign-up/email ...`);
    const res = await fetch(`${authBaseUrl}/sign-up/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Dev User',
        email: 'dev@careto.app',
        password: 'careto-dev-2026',
      }),
    });
    const data = await res.json() as any;
    if (data.user?.id) {
      userId = data.user.id;
      console.log('Created new user:', userId);
    } else {
      console.log('Sign up response:', data);
      const existing = await sql`SELECT id FROM neon_auth."user" WHERE email = 'dev@careto.app' LIMIT 1`;
      userId = existing[0]!.id;
      console.log('Using existing user id:', userId);
    }
  } catch (err) {
    console.warn('Fallback to query user:', err);
    const existing = await sql`SELECT id FROM neon_auth."user" WHERE email = 'dev@careto.app' LIMIT 1`;
    if (existing.length > 0) {
      userId = existing[0]!.id;
    } else {
      // Direct SQL insert fallback
      const inserted = await sql`
        INSERT INTO neon_auth."user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'Dev User', 'dev@careto.app', true, now(), now())
        RETURNING id
      `;
      userId = inserted[0]!.id;
    }
    console.log('User ID resolved:', userId);
  }

  // 2. Insert test vehicle
  const vehicleRows = await sql`
    INSERT INTO vehicles (id, owner_id, name, seq, created_at)
    VALUES (gen_random_uuid(), ${userId}::uuid, 'Tesla Model 3 Performance', 1, now())
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `;
  const vehicleId = vehicleRows.length > 0 ? vehicleRows[0]!.id : (await sql`SELECT id FROM vehicles LIMIT 1`)[0]!.id;
  console.log('Seeded vehicle ID:', vehicleId);

  // 3. Add to vehicle_members
  await sql`
    INSERT INTO vehicle_members (vehicle_id, user_id, role, created_at)
    VALUES (${vehicleId}::uuid, ${userId}::uuid, 'owner', now())
    ON CONFLICT DO NOTHING
  `;

  // 4. Insert records (refuels, services, notes)
  const sampleRecords = [
    {
      tbl: 'entries',
      id: '018f3a12-7000-7000-8000-000000000001',
      data: {
        kind: 'refuel',
        occurred_on: '2026-10-01',
        odometer_m: 42150000,
        amount_minor: 6500,
        currency: 'EUR',
        usd_minor: 7020,
        driver_id: userId,
        business: 0,
      },
    },
    {
      tbl: 'entries',
      id: '018f3a12-7000-7000-8000-000000000002',
      data: {
        kind: 'service',
        occurred_on: '2026-09-15',
        odometer_m: 40500000,
        amount_minor: 25000,
        currency: 'EUR',
        usd_minor: 27000,
        driver_id: userId,
        business: 0,
      },
    },
    {
      tbl: 'notes',
      id: '018f3a12-7000-7000-8000-000000000003',
      data: {
        subject_type: 'vehicle',
        subject_id: vehicleId,
        body: 'Winter tires fitted at 41,000 km.',
        pinned: 1,
        author_user_id: userId,
        created_at: new Date().toISOString(),
      },
    },
  ];

  for (const rec of sampleRecords) {
    await sql`
      INSERT INTO records (vehicle_id, tbl, id, data, col_hlc, deleted, seq, updated_by, updated_at)
      VALUES (
        ${vehicleId}::uuid,
        ${rec.tbl},
        ${rec.id}::uuid,
        ${JSON.stringify(rec.data)}::jsonb,
        '{}'::jsonb,
        false,
        1,
        ${userId}::uuid,
        now()
      )
      ON CONFLICT DO NOTHING
    `;
  }

  // 5. Insert FX rates
  await sql`
    INSERT INTO fx_rates (date, base, rates, source, fetched_at)
    VALUES (
      '2026-10-08',
      'USD',
      ${JSON.stringify({ EUR: 0.925, GBP: 0.787, UAH: 41.5, CAD: 1.36 })}::jsonb,
      'open.er-api.com',
      now()
    )
    ON CONFLICT DO NOTHING
  `;

  // Write IDs locally
  const outPath = path.resolve(process.cwd(), 'scripts/.seed-ids.json');
  fs.writeFileSync(outPath, JSON.stringify({ userId, vehicleId }, null, 2));
  console.log('Saved seed IDs to scripts/.seed-ids.json');
}

main().catch(console.error);
