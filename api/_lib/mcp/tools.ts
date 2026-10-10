import { sql } from '../db.js';
import { runWaterfallParse } from '../ai/waterfall.js';

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

export const CARETO_MCP_TOOLS: MCPToolDefinition[] = [
  {
    name: 'careto_list_vehicles',
    description: 'Lists all vehicles accessible to the user with quick specifications, powertrain, and units.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'careto_get_vehicle_details',
    description: 'Get detailed vehicle configuration including distance units, efficiency units, active tanks, and custom fuel/charging grades.',
    inputSchema: {
      type: 'object',
      properties: {
        vehicleId: { type: 'string', description: 'UUID of the vehicle' },
      },
      required: ['vehicleId'],
    },
  },
  {
    name: 'careto_analyze_spendings',
    description: 'Calculates and analyzes vehicle spendings, cost per kilometer, fuel expenses, maintenance, and category breakdown.',
    inputSchema: {
      type: 'object',
      properties: {
        vehicleId: { type: 'string', description: 'UUID of the vehicle' },
        startDate: { type: 'string', description: 'ISO start date YYYY-MM-DD' },
        endDate: { type: 'string', description: 'ISO end date YYYY-MM-DD' },
        category: { type: 'string', description: 'Filter by category (e.g. fuel, service, parking, wash, insurance, fine)' },
      },
      required: ['vehicleId'],
    },
  },
  {
    name: 'careto_get_reminders',
    description: 'Fetch active, upcoming, or overdue service and maintenance reminders for a vehicle.',
    inputSchema: {
      type: 'object',
      properties: {
        vehicleId: { type: 'string', description: 'UUID of the vehicle' },
        statusFilter: { type: 'string', enum: ['all', 'due', 'overdue'], description: 'Filter reminders status' },
      },
      required: ['vehicleId'],
    },
  },
  {
    name: 'careto_add_entry',
    description: 'Add a new rich record (expense, fueling, EV charge session, service log, note, or maintenance) to a vehicle.',
    inputSchema: {
      type: 'object',
      properties: {
        vehicleId: { type: 'string', description: 'UUID of the vehicle' },
        tbl: { 
          type: 'string', 
          enum: ['expenses', 'notes', 'reminders'], 
          description: 'Target table/type of record (defaults to expenses)' 
        },
        amount: { type: 'number', description: 'Total cost / amount' },
        date: { type: 'string', description: 'ISO date string YYYY-MM-DD' },
        category: { type: 'string', description: 'Category: fuel, service, wash, parking, fine, insurance, or custom' },
        notes: { type: 'string', description: 'Notes or description of expense / service' },
        odometerKm: { type: 'number', description: 'Odometer reading in kilometers' },
        merchant: { type: 'string', description: 'Vendor, workshop, or gas station name' },
        fuelVolumeL: { type: 'number', description: 'Liters / gallons of fuel or kWh charged' },
        pricePerUnit: { type: 'number', description: 'Price per unit/liter/kWh' },
        subItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              cost: { type: 'number' },
              partNumber: { type: 'string' },
              quantity: { type: 'number' },
            },
            required: ['name', 'cost'],
          },
          description: 'Itemized breakdown of services or parts',
        },
      },
      required: ['vehicleId'],
    },
  },
  {
    name: 'careto_analyze_image_and_create_entry',
    description: 'Use Careto Vision AI to analyze receipt images, fuel pumps, service invoices, dashboard odometers, or tire sidewalls and create a rich entry.',
    inputSchema: {
      type: 'object',
      properties: {
        vehicleId: { type: 'string', description: 'UUID of the vehicle' },
        imageBase64: { type: 'string', description: 'Base64 encoded image string or data URI' },
        purpose: { type: 'string', enum: ['expense', 'note', 'wheels', 'vin'], description: 'Purpose of recognition' },
        autoSave: { type: 'boolean', description: 'Whether to automatically save the record to timeline (default true)' },
      },
      required: ['vehicleId', 'imageBase64'],
    },
  },
  {
    name: 'careto_manage_grades',
    description: 'Add or update custom fuel grades, charging types, or custom service categories for a vehicle.',
    inputSchema: {
      type: 'object',
      properties: {
        vehicleId: { type: 'string', description: 'UUID of the vehicle' },
        fuelGrades: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'List of custom fuel grade names e.g. ["95 Euro", "100 Octane", "LPG", "Diesel Max"]' 
        },
      },
      required: ['vehicleId'],
    },
  },
  {
    name: 'careto_get_filling_helpers',
    description: 'Get auto-completion suggestions for filling expenses (latest odometer, recent merchants, common fuel prices).',
    inputSchema: {
      type: 'object',
      properties: {
        vehicleId: { type: 'string', description: 'UUID of the vehicle' },
      },
      required: ['vehicleId'],
    },
  },
];

export async function executeMCPTool(userId: string, name: string, args: Record<string, any>) {
  switch (name) {
    case 'careto_list_vehicles': {
      const vehicles = await sql`
        SELECT 
          v.id, v.name, v.make, v.model, v.year, v.powertrain,
          v.initial_odometer_m, v.distance_unit, v.efficiency_unit, vm.role
        FROM vehicle_members vm
        JOIN vehicles v ON vm.vehicle_id = v.id
        WHERE vm.user_id = ${userId}::uuid AND v.archived_at IS NULL
        ORDER BY vm.role = 'owner' DESC, v.created_at ASC
      `;
      return { vehicles };
    }

    case 'careto_get_vehicle_details': {
      const { vehicleId } = args;
      const rows = await sql`
        SELECT v.*, vm.role
        FROM vehicles v
        JOIN vehicle_members vm ON v.id = vm.vehicle_id
        WHERE v.id = ${vehicleId}::uuid AND vm.user_id = ${userId}::uuid
        LIMIT 1
      `;
      if (rows.length === 0) throw new Error('Vehicle not found or unauthorized');
      return { vehicle: rows[0] };
    }

    case 'careto_analyze_spendings': {
      const { vehicleId, startDate, endDate, category } = args;

      const records = await sql`
        SELECT id, data, updated_at
        FROM records
        WHERE vehicle_id = ${vehicleId}::uuid 
          AND tbl = 'expenses' 
          AND deleted = false
      `;

      let items: Array<Record<string, any>> = records.map((r) => ({
        id: r.id,
        ...(r.data as Record<string, any>),
        updatedAt: r.updated_at,
      }));

      if (startDate) items = items.filter((i) => i.date >= startDate);
      if (endDate) items = items.filter((i) => i.date <= endDate);
      if (category) items = items.filter((i) => (i.category || '').toLowerCase() === category.toLowerCase());

      const totalCost = items.reduce((sum, item) => sum + (Number(item.amount) || Number(item.cost) || 0), 0);
      const totalFuelVolume = items
        .filter((i) => i.category === 'fuel' || i.fuelVolume)
        .reduce((sum, item) => sum + (Number(item.fuelVolume) || Number(item.volume) || 0), 0);

      const byCategory: Record<string, number> = {};
      for (const item of items) {
        const cat = item.category || 'other';
        const cost = Number(item.amount) || Number(item.cost) || 0;
        byCategory[cat] = (byCategory[cat] || 0) + cost;
      }

      return {
        summary: {
          totalCost: Math.round(totalCost * 100) / 100,
          totalEntries: items.length,
          totalFuelVolume: Math.round(totalFuelVolume * 100) / 100,
          byCategory,
        },
        recentEntries: items.slice(0, 15),
      };
    }

    case 'careto_get_reminders': {
      const { vehicleId, statusFilter = 'all' } = args;
      const records = await sql`
        SELECT id, data
        FROM records
        WHERE vehicle_id = ${vehicleId}::uuid 
          AND tbl = 'reminders' 
          AND deleted = false
      `;

      const reminders: Array<Record<string, any>> = records.map((r) => ({ id: r.id, ...(r.data as Record<string, any>) }));
      
      const nowIso = new Date().toISOString().slice(0, 10);
      const analyzed = reminders.map((rem) => {
        let isOverdue = false;
        let isDue = false;

        if (rem.dueDate && rem.dueDate < nowIso) isOverdue = true;
        else if (rem.dueDate && rem.dueDate <= new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)) isDue = true;

        return {
          ...rem,
          status: isOverdue ? 'overdue' : isDue ? 'due' : 'active',
        };
      });

      let filtered = analyzed;
      if (statusFilter === 'due') filtered = analyzed.filter((r) => r.status === 'due' || r.status === 'overdue');
      if (statusFilter === 'overdue') filtered = analyzed.filter((r) => r.status === 'overdue');

      return { reminders: filtered };
    }

    case 'careto_add_entry': {
      const { vehicleId, tbl = 'expenses', amount, date = new Date().toISOString().slice(0, 10), category = 'other', notes, odometerKm, merchant, fuelVolumeL, pricePerUnit, subItems } = args;

      const recordId = crypto.randomUUID();
      const hlc = `${Date.now()}-0000-0000`;

      const patch = {
        id: recordId,
        amount,
        cost: amount,
        date,
        category,
        notes,
        odometerKm,
        merchant,
        fuelVolume: fuelVolumeL,
        pricePerUnit,
        subItems,
        createdAt: new Date().toISOString(),
      };

      const colHlc: Record<string, string> = {};
      for (const k of Object.keys(patch)) colHlc[k] = hlc;

      // Update vehicle seq
      const v = await sql`SELECT seq FROM vehicles WHERE id = ${vehicleId}::uuid FOR UPDATE LIMIT 1`;
      const nextSeq = (Number(v[0]?.seq) || 0) + 1;

      await sql`
        INSERT INTO records (vehicle_id, tbl, id, data, col_hlc, seq, updated_by, updated_at)
        VALUES (
          ${vehicleId}::uuid, ${tbl}, ${recordId}::uuid,
          ${JSON.stringify(patch)}::jsonb, ${JSON.stringify(colHlc)}::jsonb,
          ${nextSeq}, ${userId}::uuid, now()
        )
      `;

      await sql`UPDATE vehicles SET seq = ${nextSeq} WHERE id = ${vehicleId}::uuid`;

      return { ok: true, recordId, seq: nextSeq, entry: patch };
    }

    case 'careto_analyze_image_and_create_entry': {
      const { vehicleId, imageBase64, purpose = 'expense', autoSave = true } = args;

      let cleanBase64 = imageBase64;
      if (imageBase64.includes(';base64,')) {
        cleanBase64 = imageBase64.split(';base64,')[1];
      }

      const parseRes = await runWaterfallParse({
        purpose: purpose as 'expense' | 'note' | 'wheels' | 'vin',
        imageBase64: cleanBase64,
      });

      const extracted = parseRes.success ? (parseRes.data as Record<string, any>) : null;

      let createdRecord = null;
      if (autoSave && extracted) {
        const recordId = crypto.randomUUID();
        const hlc = `${Date.now()}-0000-0000`;
        const tbl = purpose === 'expense' ? 'expenses' : 'notes';

        const patch = {
          id: recordId,
          amount: extracted.amount || extracted.cost,
          cost: extracted.amount || extracted.cost,
          date: extracted.date || new Date().toISOString().slice(0, 10),
          category: extracted.category || (purpose === 'expense' ? 'service' : 'general'),
          merchant: extracted.merchant || extracted.vendorName,
          notes: extracted.notes || extracted.rawText,
          fuelVolume: extracted.fuelVolume,
          pricePerUnit: extracted.pricePerUnit,
          subItems: extracted.subItems,
          extractedAi: true,
          createdAt: new Date().toISOString(),
        };

        const colHlc: Record<string, string> = {};
        for (const k of Object.keys(patch)) colHlc[k] = hlc;

        const v = await sql`SELECT seq FROM vehicles WHERE id = ${vehicleId}::uuid FOR UPDATE LIMIT 1`;
        const nextSeq = (Number(v[0]?.seq) || 0) + 1;

        await sql`
          INSERT INTO records (vehicle_id, tbl, id, data, col_hlc, seq, updated_by, updated_at)
          VALUES (
            ${vehicleId}::uuid, ${tbl}, ${recordId}::uuid,
            ${JSON.stringify(patch)}::jsonb, ${JSON.stringify(colHlc)}::jsonb,
            ${nextSeq}, ${userId}::uuid, now()
          )
        `;
        await sql`UPDATE vehicles SET seq = ${nextSeq} WHERE id = ${vehicleId}::uuid`;

        createdRecord = { recordId, seq: nextSeq };
      }

      return {
        extracted,
        createdRecord,
      };
    }

    case 'careto_manage_grades': {
      const { vehicleId, fuelGrades } = args;
      await sql`
        UPDATE vehicles
        SET fuel_grades = ${JSON.stringify(fuelGrades)}::jsonb, updated_at = now()
        WHERE id = ${vehicleId}::uuid
      `;
      return { ok: true, fuelGrades };
    }

    case 'careto_get_filling_helpers': {
      const { vehicleId } = args;
      const records = await sql`
        SELECT data
        FROM records
        WHERE vehicle_id = ${vehicleId}::uuid 
          AND tbl = 'expenses' 
          AND deleted = false
        ORDER BY updated_at DESC
        LIMIT 20
      `;

      let maxOdometer = 0;
      const merchants = new Set<string>();
      let lastFuelPrice = null;

      for (const r of records) {
        const d = r.data as any;
        if (d.odometerKm && d.odometerKm > maxOdometer) maxOdometer = d.odometerKm;
        if (d.merchant) merchants.add(d.merchant);
        if (!lastFuelPrice && d.pricePerUnit) lastFuelPrice = d.pricePerUnit;
      }

      return {
        latestOdometerKm: maxOdometer,
        recentMerchants: Array.from(merchants),
        lastFuelPrice,
      };
    }

    default:
      throw new Error(`Unknown MCP tool: ${name}`);
  }
}
