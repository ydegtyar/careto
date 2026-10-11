import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

function parseConnectionString(raw?: string): string {
  if (!raw) return '';
  const match = raw.match(/postgresql:\/\/[^\s"']+/);
  if (match) return match[0];
  return raw.trim().replace(/^["']|["']$/g, '');
}

const connectionString = parseConnectionString(process.env.DATABASE_URL);
const sql = neon(connectionString);

async function seedAnalytics() {
  console.log('Seeding Analytics rich sample data (Stitch screens parity)...');

  // 1. Get or pick vehicle
  const idFilePath = path.resolve(process.cwd(), 'scripts/.seed-ids.json');
  let vehicleId: string;
  let userId: string;

  if (fs.existsSync(idFilePath)) {
    const raw = JSON.parse(fs.readFileSync(idFilePath, 'utf8'));
    vehicleId = raw.vehicleId;
    userId = raw.userId;
  } else {
    const vRows = await sql`SELECT id, owner_id FROM vehicles LIMIT 1`;
    if (vRows.length === 0) {
      throw new Error('No vehicle found. Run pnpm seed first.');
    }
    vehicleId = vRows[0]!.id;
    userId = vRows[0]!.owner_id;
  }

  // Update vehicle to match Stitch: Honda CR-V Touring AWD
  await sql`
    UPDATE vehicles 
    SET 
      name = 'Honda CR-V Touring',
      model = 'CR-V Touring AWD',
      make = 'Honda',
      year = 2024,
      vin = '2HKRW2H87NH60192',
      powertrain = 'ice',
      tank_capacity_l = 53,
      initial_odometer_m = 48000000,
      distance_unit = 'km',
      efficiency_unit = 'l100km'
    WHERE id = ${vehicleId}::uuid
  `;

  // 2. Fuel Types
  const ftGas95 = await sql`
    INSERT INTO fuel_types (name, code)
    VALUES ('Gasoline 95', 'gas95')
    RETURNING id
  `;
  const ftPremium = await sql`
    INSERT INTO fuel_types (name, code)
    VALUES ('Gas Premium', 'gas_prem')
    RETURNING id
  `;

  const gas95Id = ftGas95[0]!.id;
  const gasPremId = ftPremium[0]!.id;

  // 3. Stations
  const stShell = await sql`
    INSERT INTO stations (name, brand)
    VALUES ('Shell Express #104', 'Shell')
    RETURNING id
  `;
  const stBP = await sql`
    INSERT INTO stations (name, brand)
    VALUES ('BP Connect #22', 'BP')
    RETURNING id
  `;
  const stWOG = await sql`
    INSERT INTO stations (name, brand)
    VALUES ('WOG Highway Station', 'WOG')
    RETURNING id
  `;

  const shellId = stShell[0]!.id;
  const bpId = stBP[0]!.id;
  const wogId = stWOG[0]!.id;

  // 4. Workshops
  const ws = await sql`
    INSERT INTO workshops (name, rating, specialization, hourly_rate, guarantee_note)
    VALUES (
      'Ventos Auto Service & Tuning',
      4.9,
      'Authorized Vendor Specialist',
      79.00,
      'Brembo rotors & pads covered under active 24-month guarantee'
    )
    RETURNING id
  `;
  const workshopId = ws[0]!.id;

  // 5. Refuel history
  const sampleRefuels = [
    { date: '2026-05-12', odo: 48500, liters: 46.2, price: 1.45, cost: 66.99, ft: gas95Id, st: shellId, full: true },
    { date: '2026-05-25', odo: 49100, liters: 44.8, price: 1.48, cost: 66.30, ft: gas95Id, st: shellId, full: true },
    { date: '2026-06-08', odo: 49750, liters: 48.1, price: 1.52, cost: 73.11, ft: gasPremId, st: bpId, full: true },
    { date: '2026-06-22', odo: 50380, liters: 45.0, price: 1.54, cost: 69.30, ft: gasPremId, st: bpId, full: true },
    { date: '2026-07-06', odo: 51010, liters: 44.5, price: 1.55, cost: 68.98, ft: gas95Id, st: shellId, full: true },
    { date: '2026-07-20', odo: 51640, liters: 46.0, price: 1.58, cost: 72.68, ft: gas95Id, st: wogId, full: true },
    { date: '2026-08-04', odo: 52290, liters: 47.2, price: 1.62, cost: 76.46, ft: gasPremId, st: bpId, full: true },
    { date: '2026-08-18', odo: 52910, liters: 45.8, price: 1.60, cost: 73.28, ft: gas95Id, st: shellId, full: true },
    { date: '2026-09-01', odo: 53550, liters: 46.5, price: 1.65, cost: 76.73, ft: gasPremId, st: bpId, full: true },
    { date: '2026-09-15', odo: 54190, liters: 45.9, price: 1.64, cost: 75.28, ft: gas95Id, st: shellId, full: true },
    { date: '2026-09-29', odo: 54820, liters: 44.6, price: 1.68, cost: 74.93, ft: gasPremId, st: bpId, full: true },
    { date: '2026-10-09', odo: 55450, liters: 45.1, price: 1.70, cost: 76.67, ft: gasPremId, st: shellId, full: true },
  ];

  for (const r of sampleRefuels) {
    await sql`
      INSERT INTO refuels (
        vehicle_id, date, odometer_km, liters, price_per_liter, total_cost, fuel_type_id, station_id, is_full_tank, tank_no
      )
      VALUES (
        ${vehicleId}::uuid, ${r.date}::date, ${r.odo}, ${r.liters}, ${r.price}, ${r.cost}, ${r.ft}::uuid, ${r.st}::uuid, ${r.full}, 1
      )
    `;
  }

  // 6. Service Events & Items
  const se1 = await sql`
    INSERT INTO service_events (vehicle_id, date, odometer_km, workshop_id, is_scheduled, is_breakdown, labor_cost, labor_hours)
    VALUES (${vehicleId}::uuid, '2026-06-15'::date, 49800, ${workshopId}::uuid, true, false, 250.00, 3.0)
    RETURNING id
  `;
  const se2 = await sql`
    INSERT INTO service_events (vehicle_id, date, odometer_km, workshop_id, is_scheduled, is_breakdown, labor_cost, labor_hours)
    VALUES (${vehicleId}::uuid, '2026-10-02'::date, 55000, ${workshopId}::uuid, true, false, 350.00, 4.0)
    RETURNING id
  `;

  await sql`
    INSERT INTO service_items (service_event_id, name, category, part_cost, labor_cost)
    VALUES 
      (${se1[0]!.id}::uuid, 'Synthetic Oil 5W-30', 'Lubricants', 85.00, 40.00),
      (${se1[0]!.id}::uuid, 'OEM Oil Filter', 'Filters', 25.00, 20.00),
      (${se2[0]!.id}::uuid, 'Brake Fluid Bleed (DOT 4)', 'Brakes', 65.00, 95.00),
      (${se2[0]!.id}::uuid, 'Front Brake Pads (6.5mm)', 'Brakes', 145.00, 80.00),
      (${se2[0]!.id}::uuid, 'Cabin Air Filter', 'HVAC', 35.00, 25.00)
  `;

  // 7. Component Rules
  await sql`
    INSERT INTO component_rules (vehicle_id, component, interval_km, interval_days, seasonal_factor, icon)
    VALUES 
      (${vehicleId}::uuid, 'Engine Oil (0W-20)', 10000, 365, '{"factor": 1.0}'::jsonb, 'oil'),
      (${vehicleId}::uuid, 'Cabin Air Filter', 15000, 180, '{"factor": 0.7, "season": "High pollen season"}'::jsonb, 'air'),
      (${vehicleId}::uuid, 'Front Brake Pads (6.5mm)', 40000, 730, '{"factor": 1.0}'::jsonb, 'disc'),
      (${vehicleId}::uuid, 'Brake Fluid (DOT 4)', 40000, 730, '{"factor": 1.0}'::jsonb, 'drop')
  `;

  // 8. Sinking Fund Goal
  await sql`
    INSERT INTO sinking_fund_goals (vehicle_id, label, target_amount, target_odometer_km, monthly_contribution)
    VALUES (${vehicleId}::uuid, '80k km Major Inspection', 4800.00, 80000, 150.00)
  `;

  // 9. Odometer readings
  const sampleOdo = [
    { date: '2026-05-01', km: 48000 },
    { date: '2026-06-15', km: 49800 },
    { date: '2026-08-01', km: 52000 },
    { date: '2026-09-15', km: 54190 },
    { date: '2026-10-09', km: 55450 },
  ];
  for (const o of sampleOdo) {
    await sql`
      INSERT INTO odometer_readings (vehicle_id, date, km, source)
      VALUES (${vehicleId}::uuid, ${o.date}::date, ${o.km}, 'obd2')
    `;
  }

  console.log('Analytics seed complete for vehicle:', vehicleId);
}

seedAnalytics().catch(console.error);
