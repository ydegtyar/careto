import { sql } from '../db.js';
import { runWaterfallParse } from '../ai/waterfall.js';
import { computeDue } from '../../../src/features/reminders/lib/compute-due.js';
import { hasRole } from '../acl.js';

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
    description: 'Calculates and analyzes vehicle spendings, cost per kilometer, fuel expenses, maintenance, and category breakdown from logged entries.',
    inputSchema: {
      type: 'object',
      properties: {
        vehicleId: { type: 'string', description: 'UUID of the vehicle' },
        startDate: { type: 'string', description: 'ISO start date YYYY-MM-DD' },
        endDate: { type: 'string', description: 'ISO end date YYYY-MM-DD' },
        category: { type: 'string', description: 'Filter by category or kind (e.g. fuel, refuel, service, parking, wash, insurance, fine)' },
      },
      required: ['vehicleId'],
    },
  },
  {
    name: 'careto_get_reminders',
    description: 'Fetch active, upcoming, or overdue service and maintenance reminders for a vehicle, including complete recurrence schedules, next due mileage/date, and progress status.',
    inputSchema: {
      type: 'object',
      properties: {
        vehicleId: { type: 'string', description: 'UUID of the vehicle' },
        statusFilter: { 
          type: 'string', 
          enum: ['all', 'due', 'upcoming', 'overdue', 'ok', 'snoozed'], 
          description: 'Filter reminders by status: "all", "due" (due soon or overdue), "upcoming", "overdue", "ok", or "snoozed". Defaults to "all".' 
        },
      },
      required: ['vehicleId'],
    },
  },
  {
    name: 'careto_create_reminder',
    description: 'Create a maintenance reminder for a vehicle, supporting mileage-based, calendar date-based, or dual-interval service schedules.',
    inputSchema: {
      type: 'object',
      properties: {
        vehicleId: { type: 'string', description: 'UUID of the vehicle' },
        title: { type: 'string', description: 'Reminder title / task description (e.g. "Engine Oil & Filter Change", "Brake Pad Inspection")' },
        kind: { 
          type: 'string', 
          description: 'Maintenance category: "service", "fluids", "tires", "brakes", "filters", "transmission", "spark_plugs", "battery", "inspection", "timing_belt", or custom category name. Defaults to "service".' 
        },
        mode: { 
          type: 'string', 
          enum: ['km', 'time', 'earlier', 'later', 'seasonal'], 
          description: 'Trigger mode: "km" (distance only), "time" (calendar only), "earlier" (whichever threshold comes first), "later" (both thresholds must elapse), or "seasonal" (calendar changeover cycle). Defaults to "earlier".' 
        },
        intervalKm: { type: 'number', description: 'Recurring mileage interval in kilometers (e.g. 10000 for every 10,000 km)' },
        intervalDays: { type: 'number', description: 'Recurring calendar interval in days (e.g. 365 for 1 year, 180 for 6 months)' },
        baseOdometerKm: { type: 'number', description: 'Odometer reading in kilometers at last completed service baseline' },
        baseDate: { type: 'string', description: 'ISO date YYYY-MM-DD of last completed service baseline' },
        leadKm: { type: 'number', description: 'Advance warning threshold in kilometers (default 500 km)' },
        leadDays: { type: 'number', description: 'Advance warning threshold in days (default 14 days)' },
        estimatedCost: { type: 'number', description: 'Estimated service cost in currency units (e.g. 120.00)' },
        notes: { type: 'string', description: 'Additional service details, part numbers, or technician notes' },
      },
      required: ['vehicleId', 'title'],
    },
  },
  {
    name: 'careto_update_reminder',
    description: 'Update an existing maintenance reminder by reminderId. Only explicitly provided fields are updated; omitted fields are preserved.',
    inputSchema: {
      type: 'object',
      properties: {
        vehicleId: { type: 'string', description: 'UUID of the vehicle' },
        reminderId: { type: 'string', description: 'UUID of the reminder to update' },
        title: { type: 'string', description: 'Updated title' },
        kind: { type: 'string', description: 'Updated category ("service", "fluids", "brakes", "tires", etc.)' },
        mode: { type: 'string', enum: ['km', 'time', 'earlier', 'later', 'seasonal'], description: 'Updated schedule mode' },
        intervalKm: { type: 'number', description: 'Updated recurring interval in kilometers' },
        intervalDays: { type: 'number', description: 'Updated recurring interval in days' },
        baseOdometerKm: { type: 'number', description: 'Updated base odometer reading in kilometers' },
        baseDate: { type: 'string', description: 'Updated base service date (YYYY-MM-DD)' },
        leadKm: { type: 'number', description: 'Updated advance warning distance in kilometers' },
        leadDays: { type: 'number', description: 'Updated advance warning time in days' },
        estimatedCost: { type: 'number', description: 'Updated estimated cost' },
        snoozedUntil: { type: 'string', description: 'Snooze reminder until ISO date YYYY-MM-DD' },
        notes: { type: 'string', description: 'Updated notes' },
      },
      required: ['vehicleId', 'reminderId'],
    },
  },
  {
    name: 'careto_delete_reminder',
    description: 'Delete or tombstone a maintenance reminder by reminderId with tenant and vehicle permission verification. Requires explicit user intent (confirmed=true).',
    inputSchema: {
      type: 'object',
      properties: {
        vehicleId: { type: 'string', description: 'UUID of the vehicle' },
        reminderId: { type: 'string', description: 'UUID of the reminder to delete' },
        confirmed: { type: 'boolean', description: 'Must be true to execute deletion with implicit user consent.' },
        confirmationReason: { type: 'string', description: 'Reason or prompt confirming deletion intent' },
      },
      required: ['vehicleId', 'reminderId', 'confirmed'],
    },
  },
  {
    name: 'careto_complete_reminder',
    description: 'Mark a maintenance reminder as completed. Resets/advances the baseline date and odometer, and optionally logs an expense/service entry to the vehicle timeline.',
    inputSchema: {
      type: 'object',
      properties: {
        vehicleId: { type: 'string', description: 'UUID of the vehicle' },
        reminderId: { type: 'string', description: 'UUID of the reminder completed' },
        completedDate: { type: 'string', description: 'ISO date of completion YYYY-MM-DD (defaults to today)' },
        completedOdometerKm: { type: 'number', description: 'Odometer reading in kilometers at completion' },
        cost: { type: 'number', description: 'Actual cost of the service' },
        currency: { type: 'string', description: 'Currency code (default USD)' },
        merchant: { type: 'string', description: 'Workshop, dealership, or merchant name' },
        notes: { type: 'string', description: 'Completion notes or service details' },
        createServiceEntry: { type: 'boolean', description: 'Whether to log a service entry in timeline "entries" (defaults to true if cost or merchant provided)' },
      },
      required: ['vehicleId', 'reminderId'],
    },
  },
  {
    name: 'careto_add_entry',
    description: 'Add a new rich record to a vehicle timeline. All costs, fuelings, services, and general expenses are stored as timeline "entries" (kind: expense | refuel | charge | service), while notes and reminders use "notes" and "reminders".',
    inputSchema: {
      type: 'object',
      properties: {
        vehicleId: { type: 'string', description: 'UUID of the vehicle' },
        tbl: { 
          type: 'string', 
          enum: ['entries', 'notes', 'reminders'], 
          description: 'Target table of record: "entries" for all expenses, refuels, charges, and services; "notes" for vehicle notes; "reminders" for maintenance reminders. Defaults to "entries".' 
        },
        kind: {
          type: 'string',
          enum: ['expense', 'refuel', 'charge', 'service'],
          description: 'Entry kind when tbl="entries". Defaults to "refuel" if fuelVolumeL is present, "service" if subItems are present, or "expense".',
        },
        amount: { type: 'number', description: 'Total cost / amount in currency (e.g. 45.50)' },
        currency: { type: 'string', description: 'Currency code (e.g. USD, EUR, UAH). Defaults to vehicle/local currency.' },
        date: { type: 'string', description: 'ISO date string YYYY-MM-DD' },
        category: { type: 'string', description: 'Expense category: fuel, service, wash, parking, fine, insurance, or custom' },
        notes: { type: 'string', description: 'Notes or description of entry / service' },
        odometerKm: { type: 'number', description: 'Odometer reading in kilometers' },
        merchant: { type: 'string', description: 'Vendor, workshop, or gas station name' },
        fuelVolumeL: { type: 'number', description: 'Liters / gallons of fuel or kWh charged' },
        pricePerUnit: { type: 'number', description: 'Price per unit/liter/kWh' },
        fuelGrade: { type: 'string', description: 'Fuel grade name e.g. "Gasoline", "95 Octane", "Diesel"' },
        isBusiness: { type: 'boolean', description: 'Whether this entry is for business mileage / business expense' },
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
    description: 'Use Careto Vision AI to analyze receipt images, fuel pumps, service invoices, dashboard odometers, or tire sidewalls and create a rich entry on the vehicle timeline.',
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
    description: 'Get auto-completion suggestions for entries and refuels (latest odometer reading, recent merchants, common fuel prices).',
    inputSchema: {
      type: 'object',
      properties: {
        vehicleId: { type: 'string', description: 'UUID of the vehicle' },
      },
      required: ['vehicleId'],
    },
  },
  {
    name: 'careto_update_entry',
    description: 'Update an existing entry (expense, refuel, charge, service entry, or note) on a vehicle timeline. Selectively updates provided fields while preserving omitted fields.',
    inputSchema: {
      type: 'object',
      properties: {
        vehicleId: { type: 'string', description: 'UUID of the vehicle' },
        entryId: { type: 'string', description: 'UUID of the entry / record to update' },
        tbl: { 
          type: 'string', 
          enum: ['entries', 'notes'], 
          description: 'Target table of record: "entries" (for all expenses, refuels, charges, and services) or "notes". Defaults to "entries".' 
        },
        kind: {
          type: 'string',
          enum: ['expense', 'refuel', 'charge', 'service'],
          description: 'Updated entry kind (expense, refuel, charge, service)',
        },
        amount: { type: 'number', description: 'Updated total cost / amount in currency (e.g. 52.00)' },
        currency: { type: 'string', description: 'Updated currency code (e.g. USD, EUR, UAH)' },
        date: { type: 'string', description: 'Updated ISO date string YYYY-MM-DD' },
        category: { type: 'string', description: 'Updated expense category: fuel, service, wash, parking, fine, insurance, or custom' },
        notes: { type: 'string', description: 'Updated notes or service description' },
        odometerKm: { type: 'number', description: 'Updated odometer reading in kilometers' },
        merchant: { type: 'string', description: 'Updated vendor, workshop, or gas station name' },
        fuelVolumeL: { type: 'number', description: 'Updated liters / gallons of fuel or kWh charged' },
        pricePerUnit: { type: 'number', description: 'Updated price per unit/liter/kWh' },
        fuelGrade: { type: 'string', description: 'Updated fuel grade name e.g. "Gasoline", "95 Octane", "Diesel"' },
        isBusiness: { type: 'boolean', description: 'Updated business mileage / business expense flag' },
        isFullTank: { type: 'boolean', description: 'Updated full tank indicator for refuels' },
        subItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              cost: { type: 'number' },
              partNumber: { type: 'string' },
              quantity: { type: 'number' },
            },
            required: ['name', 'cost'],
          },
          description: 'Updated itemized breakdown of services or parts',
        },
      },
      required: ['vehicleId', 'entryId'],
    },
  },
  {
    name: 'careto_delete_entry',
    description: 'Delete or tombstone an entry (expense/refuel/service entry, note, or reminder) from a vehicle timeline. Requires implicit user consent: the caller must specify confirmed=true with confirmationReason describing user approval.',
    inputSchema: {
      type: 'object',
      properties: {
        vehicleId: { type: 'string', description: 'UUID of the vehicle' },
        entryId: { type: 'string', description: 'UUID of the entry / record to delete' },
        tbl: { 
          type: 'string', 
          enum: ['entries', 'notes', 'reminders'], 
          description: 'Table / category of the record: "entries" (for all expenses, refuels, services), "notes", or "reminders". Defaults to "entries".' 
        },
        confirmed: { 
          type: 'boolean', 
          description: 'Implicit user consent flag. Must be set to true to execute deletion.' 
        },
        confirmationReason: { 
          type: 'string', 
          description: 'Context or user prompt indicating explicit intent to delete (e.g. "User requested deleting the duplicate Shell fuel expense on Oct 10")' 
        },
      },
      required: ['vehicleId', 'entryId', 'confirmed'],
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
          AND tbl = 'entries' 
          AND deleted = false
      `;

      let items: Array<Record<string, any>> = records.map((r) => ({
        id: r.id,
        ...(r.data as Record<string, any>),
        updatedAt: r.updated_at,
      }));

      if (startDate) items = items.filter((i) => (i.occurred_on || i.date) >= startDate);
      if (endDate) items = items.filter((i) => (i.occurred_on || i.date) <= endDate);
      if (category) {
        const catLower = category.toLowerCase();
        items = items.filter((i) => 
          (i.category || '').toLowerCase() === catLower ||
          (i.category_id || '').toLowerCase() === catLower ||
          (i.kind || '').toLowerCase() === catLower
        );
      }

      const totalCost = items.reduce((sum, item) => {
        const amt = item.amount ?? (item.amount_minor ? item.amount_minor / 100 : item.cost) ?? 0;
        return sum + (Number(amt) || 0);
      }, 0);

      const totalFuelVolume = items
        .filter((i) => i.kind === 'refuel' || i.category === 'fuel' || i.category_id === 'fuel' || i.fuel_volume || i.fuelVolume || i.volume_ml)
        .reduce((sum, item) => {
          const vol = item.fuel_volume ?? item.fuelVolume ?? (item.volume_ml ? item.volume_ml / 1000 : 0);
          return sum + (Number(vol) || 0);
        }, 0);

      const byCategory: Record<string, number> = {};
      for (const item of items) {
        const cat = item.category || item.category_id || item.kind || 'other';
        const cost = item.amount ?? (item.amount_minor ? item.amount_minor / 100 : item.cost) ?? 0;
        byCategory[cat] = (byCategory[cat] || 0) + (Number(cost) || 0);
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

      // Verify access to vehicle
      const canRead = await hasRole(userId, vehicleId, 'viewer');
      if (!canRead) throw new Error('Vehicle not found or unauthorized');

      // Fetch vehicle metadata for current odometer and units
      const vehicleRows = await sql`
        SELECT initial_odometer_m, distance_unit FROM vehicles WHERE id = ${vehicleId}::uuid LIMIT 1
      `;
      const initialOdoM = Number(vehicleRows[0]?.initial_odometer_m) || 0;

      // Find highest odometer reading from vehicle entries
      const entryRows = await sql`
        SELECT data FROM records 
        WHERE vehicle_id = ${vehicleId}::uuid AND tbl = 'entries' AND deleted = false
      `;
      let currentOdometerM = initialOdoM;
      for (const row of entryRows) {
        const d = (row.data as Record<string, any>) || {};
        const odoM = d.odometer_m !== undefined && d.odometer_m !== null
          ? Number(d.odometer_m)
          : (d.odometerKm !== undefined && d.odometerKm !== null ? Number(d.odometerKm) * 1000 : null);
        if (odoM && odoM > currentOdometerM) {
          currentOdometerM = odoM;
        }
      }

      const records = await sql`
        SELECT id, data, updated_at
        FROM records
        WHERE vehicle_id = ${vehicleId}::uuid 
          AND tbl = 'reminders' 
          AND deleted = false
        ORDER BY updated_at DESC
      `;

      const todayIso = new Date().toISOString().slice(0, 10);

      const reminders = records.map((r) => {
        const d = (r.data as Record<string, any>) || {};
        const mode = d.mode || (d.interval_m ? 'km' : (d.interval_days ? 'time' : 'earlier'));
        
        const dueRes = computeDue(
          {
            id: r.id,
            kind: d.kind,
            title: d.title,
            mode,
            interval_m: d.interval_m,
            interval_days: d.interval_days,
            base_odometer_m: d.base_odometer_m,
            base_date: d.base_date,
            lead_m: d.lead_m ?? 500_000,
            lead_days: d.lead_days ?? 14,
            snoozed_until: d.snoozed_until,
          },
          {
            currentOdometerM,
            currentDate: todayIso,
          },
        );

        return {
          id: r.id,
          title: d.title,
          kind: d.kind || 'service',
          mode,
          status: dueRes.status,
          reason: dueRes.reason,
          percent: dueRes.percent,
          // Recurrence configuration
          intervalKm: d.interval_m !== undefined && d.interval_m !== null ? Math.round(d.interval_m / 1000) : null,
          intervalDays: d.interval_days ?? null,
          baseOdometerKm: d.base_odometer_m !== undefined && d.base_odometer_m !== null ? Math.round(d.base_odometer_m / 1000) : null,
          baseDate: d.base_date ?? null,
          leadKm: d.lead_m !== undefined && d.lead_m !== null ? Math.round(d.lead_m / 1000) : 500,
          leadDays: d.lead_days ?? 14,
          estimatedCost: d.est_cost_usd_minor !== undefined && d.est_cost_usd_minor !== null ? d.est_cost_usd_minor / 100 : null,
          snoozedUntil: d.snoozed_until ?? null,
          notes: d.notes ?? null,
          // Calculated targets
          targetOdometerKm: dueRes.targetOdometerM !== null ? Math.round(dueRes.targetOdometerM / 1000) : null,
          remainingKm: dueRes.remainingM !== null ? Math.round(dueRes.remainingM / 1000) : null,
          targetDate: dueRes.targetDate,
          remainingDays: dueRes.remainingDays,
          projectedDueDate: dueRes.projectedDueDate,
          currentVehicleOdometerKm: Math.round(currentOdometerM / 1000),
          updatedAt: r.updated_at,
        };
      });

      let filtered = reminders;
      if (statusFilter === 'due') {
        filtered = reminders.filter((r) => r.status === 'due' || r.status === 'overdue');
      } else if (statusFilter === 'overdue') {
        filtered = reminders.filter((r) => r.status === 'overdue');
      } else if (statusFilter === 'upcoming') {
        filtered = reminders.filter((r) => r.status === 'upcoming');
      } else if (statusFilter === 'ok') {
        filtered = reminders.filter((r) => r.status === 'ok');
      } else if (statusFilter === 'snoozed') {
        filtered = reminders.filter((r) => r.status === 'snoozed');
      }

      return {
        vehicleId,
        currentVehicleOdometerKm: Math.round(currentOdometerM / 1000),
        totalCount: reminders.length,
        filteredCount: filtered.length,
        reminders: filtered,
      };
    }

    case 'careto_create_reminder': {
      const {
        vehicleId,
        title,
        kind = 'service',
        mode = 'earlier',
        intervalKm,
        intervalDays,
        baseOdometerKm,
        baseDate,
        leadKm = 500,
        leadDays = 14,
        estimatedCost,
        notes,
      } = args;

      if (!title || typeof title !== 'string' || !title.trim()) {
        throw new Error('Reminder title is required');
      }

      const canEdit = await hasRole(userId, vehicleId, 'editor');
      if (!canEdit) throw new Error('Forbidden: Editor permission required for vehicle');

      const reminderId = crypto.randomUUID();
      const hlc = `${Date.now()}-0000-0000`;

      const intervalM = intervalKm !== undefined && intervalKm !== null ? Math.round(Number(intervalKm) * 1000) : undefined;
      const intervalDaysNum = intervalDays !== undefined && intervalDays !== null ? Number(intervalDays) : undefined;
      const baseOdoM = baseOdometerKm !== undefined && baseOdometerKm !== null ? Math.round(Number(baseOdometerKm) * 1000) : undefined;
      const leadM = leadKm !== undefined && leadKm !== null ? Math.round(Number(leadKm) * 1000) : 500_000;
      const leadDaysNum = leadDays !== undefined && leadDays !== null ? Number(leadDays) : 14;
      const estCostMinor = estimatedCost !== undefined && estimatedCost !== null ? Math.round(Number(estimatedCost) * 100) : undefined;

      const patch: Record<string, any> = {
        id: reminderId,
        title: title.trim(),
        kind: kind || 'service',
        mode,
        interval_m: intervalM,
        interval_days: intervalDaysNum,
        base_odometer_m: baseOdoM,
        base_date: baseDate || undefined,
        lead_m: leadM,
        lead_days: leadDaysNum,
        est_cost_usd_minor: estCostMinor,
        notes: notes || undefined,
      };

      const colHlc: Record<string, string> = {};
      for (const k of Object.keys(patch)) colHlc[k] = hlc;

      const v = await sql`SELECT seq FROM vehicles WHERE id = ${vehicleId}::uuid FOR UPDATE LIMIT 1`;
      if (v.length === 0) throw new Error('Vehicle not found');
      const nextSeq = (Number(v[0]?.seq) || 0) + 1;

      await sql`
        INSERT INTO records (
          vehicle_id, tbl, id, data, col_hlc, deleted, seq, updated_by, updated_at
        ) VALUES (
          ${vehicleId}::uuid, 'reminders', ${reminderId}::uuid,
          ${JSON.stringify(patch)}::jsonb, ${JSON.stringify(colHlc)}::jsonb,
          false, ${nextSeq}, ${userId}::uuid, now()
        )
      `;

      await sql`UPDATE vehicles SET seq = ${nextSeq} WHERE id = ${vehicleId}::uuid`;

      return {
        ok: true,
        reminderId,
        vehicleId,
        seq: nextSeq,
        reminder: {
          id: reminderId,
          title: patch.title,
          kind: patch.kind,
          mode: patch.mode,
          intervalKm: intervalKm ?? null,
          intervalDays: intervalDaysNum ?? null,
          baseOdometerKm: baseOdometerKm ?? null,
          baseDate: patch.base_date ?? null,
          leadKm,
          leadDays: leadDaysNum,
          estimatedCost: estimatedCost ?? null,
          notes: patch.notes ?? null,
        },
        message: `Maintenance reminder "${title}" created successfully.`,
      };
    }

    case 'careto_update_reminder': {
      const {
        vehicleId,
        reminderId,
        title,
        kind,
        mode,
        intervalKm,
        intervalDays,
        baseOdometerKm,
        baseDate,
        leadKm,
        leadDays,
        estimatedCost,
        snoozedUntil,
        notes,
      } = args;

      if (!reminderId) throw new Error('reminderId is required');

      const canEdit = await hasRole(userId, vehicleId, 'editor');
      if (!canEdit) throw new Error('Forbidden: Editor permission required for vehicle');

      const existing = await sql`
        SELECT data, col_hlc
        FROM records
        WHERE vehicle_id = ${vehicleId}::uuid
          AND id = ${reminderId}::uuid
          AND tbl = 'reminders'
          AND deleted = false
        LIMIT 1
      `;

      if (existing.length === 0) {
        throw new Error(`Reminder ${reminderId} not found for vehicle ${vehicleId}`);
      }

      const currentData = (existing[0]!.data as Record<string, any>) || {};
      const currentColHlc = (existing[0]!.col_hlc as Record<string, string>) || {};
      const hlc = `${Date.now()}-0000-0000`;

      const updatedData = { ...currentData };
      const updatedColHlc = { ...currentColHlc };

      const setField = (field: string, val: any) => {
        if (val !== undefined) {
          updatedData[field] = val;
          updatedColHlc[field] = hlc;
        }
      };

      if (title !== undefined) setField('title', title.trim());
      if (kind !== undefined) setField('kind', kind);
      if (mode !== undefined) setField('mode', mode);
      if (intervalKm !== undefined) setField('interval_m', intervalKm !== null ? Math.round(Number(intervalKm) * 1000) : null);
      if (intervalDays !== undefined) setField('interval_days', intervalDays !== null ? Number(intervalDays) : null);
      if (baseOdometerKm !== undefined) setField('base_odometer_m', baseOdometerKm !== null ? Math.round(Number(baseOdometerKm) * 1000) : null);
      if (baseDate !== undefined) setField('base_date', baseDate);
      if (leadKm !== undefined) setField('lead_m', leadKm !== null ? Math.round(Number(leadKm) * 1000) : null);
      if (leadDays !== undefined) setField('lead_days', leadDays !== null ? Number(leadDays) : null);
      if (estimatedCost !== undefined) setField('est_cost_usd_minor', estimatedCost !== null ? Math.round(Number(estimatedCost) * 100) : null);
      if (snoozedUntil !== undefined) setField('snoozed_until', snoozedUntil);
      if (notes !== undefined) setField('notes', notes);

      const v = await sql`SELECT seq FROM vehicles WHERE id = ${vehicleId}::uuid FOR UPDATE LIMIT 1`;
      const nextSeq = (Number(v[0]?.seq) || 0) + 1;

      await sql`
        UPDATE records
        SET 
          data = ${JSON.stringify(updatedData)}::jsonb,
          col_hlc = ${JSON.stringify(updatedColHlc)}::jsonb,
          seq = ${nextSeq},
          updated_by = ${userId}::uuid,
          updated_at = now()
        WHERE vehicle_id = ${vehicleId}::uuid
          AND id = ${reminderId}::uuid
          AND tbl = 'reminders'
      `;

      await sql`UPDATE vehicles SET seq = ${nextSeq} WHERE id = ${vehicleId}::uuid`;

      return {
        ok: true,
        reminderId,
        vehicleId,
        seq: nextSeq,
        reminder: {
          id: reminderId,
          title: updatedData.title,
          kind: updatedData.kind,
          mode: updatedData.mode,
          intervalKm: updatedData.interval_m !== undefined && updatedData.interval_m !== null ? Math.round(updatedData.interval_m / 1000) : null,
          intervalDays: updatedData.interval_days ?? null,
          baseOdometerKm: updatedData.base_odometer_m !== undefined && updatedData.base_odometer_m !== null ? Math.round(updatedData.base_odometer_m / 1000) : null,
          baseDate: updatedData.base_date ?? null,
          leadKm: updatedData.lead_m !== undefined && updatedData.lead_m !== null ? Math.round(updatedData.lead_m / 1000) : null,
          leadDays: updatedData.lead_days ?? null,
          estimatedCost: updatedData.est_cost_usd_minor !== undefined && updatedData.est_cost_usd_minor !== null ? updatedData.est_cost_usd_minor / 100 : null,
          snoozedUntil: updatedData.snoozed_until ?? null,
          notes: updatedData.notes ?? null,
        },
        message: `Maintenance reminder "${updatedData.title}" updated successfully.`,
      };
    }

    case 'careto_delete_reminder': {
      const { vehicleId, reminderId, confirmed, confirmationReason } = args;

      if (!reminderId) throw new Error('reminderId is required');

      if (!confirmed) {
        return {
          ok: false,
          requiresConsent: true,
          message: 'Reminder deletion requires user confirmation. Specify confirmed=true with confirmationReason.',
        };
      }

      const canEdit = await hasRole(userId, vehicleId, 'editor');
      if (!canEdit) throw new Error('Forbidden: Editor permission required for vehicle');

      const existing = await sql`
        SELECT id, data, deleted
        FROM records
        WHERE vehicle_id = ${vehicleId}::uuid
          AND id = ${reminderId}::uuid
          AND tbl = 'reminders'
        LIMIT 1
      `;

      if (existing.length === 0) {
        return {
          ok: false,
          error: `Reminder ${reminderId} not found for vehicle ${vehicleId}.`,
        };
      }

      if (existing[0]!.deleted) {
        return {
          ok: true,
          message: `Reminder ${reminderId} was already deleted.`,
        };
      }

      const hlc = `${Date.now()}-0000-0000`;
      const v = await sql`SELECT seq FROM vehicles WHERE id = ${vehicleId}::uuid FOR UPDATE LIMIT 1`;
      const nextSeq = (Number(v[0]?.seq) || 0) + 1;

      await sql`
        UPDATE records
        SET 
          deleted = true,
          deleted_hlc = ${hlc},
          seq = ${nextSeq},
          updated_by = ${userId}::uuid,
          updated_at = now()
        WHERE vehicle_id = ${vehicleId}::uuid
          AND id = ${reminderId}::uuid
          AND tbl = 'reminders'
      `;

      await sql`UPDATE vehicles SET seq = ${nextSeq} WHERE id = ${vehicleId}::uuid`;

      return {
        ok: true,
        deletedReminderId: reminderId,
        vehicleId,
        seq: nextSeq,
        confirmationReason: confirmationReason || 'Implicit user consent verified',
        message: `Reminder ${reminderId} successfully deleted. Associated service history was preserved.`,
      };
    }

    case 'careto_complete_reminder': {
      const {
        vehicleId,
        reminderId,
        completedDate = new Date().toISOString().slice(0, 10),
        completedOdometerKm,
        cost,
        currency = 'USD',
        merchant,
        notes,
        createServiceEntry,
      } = args;

      if (!reminderId) throw new Error('reminderId is required');

      const canEdit = await hasRole(userId, vehicleId, 'editor');
      if (!canEdit) throw new Error('Forbidden: Editor permission required for vehicle');

      const existing = await sql`
        SELECT data, col_hlc
        FROM records
        WHERE vehicle_id = ${vehicleId}::uuid
          AND id = ${reminderId}::uuid
          AND tbl = 'reminders'
          AND deleted = false
        LIMIT 1
      `;

      if (existing.length === 0) {
        throw new Error(`Reminder ${reminderId} not found for vehicle ${vehicleId}`);
      }

      const currentData = (existing[0]!.data as Record<string, any>) || {};
      const currentColHlc = (existing[0]!.col_hlc as Record<string, string>) || {};
      const hlc = `${Date.now()}-0000-0000`;

      // 1. Advance the baseline date and odometer
      const updatedReminderData = { ...currentData };
      const updatedColHlc = { ...currentColHlc };

      updatedReminderData.base_date = completedDate;
      updatedColHlc.base_date = hlc;

      if (completedOdometerKm !== undefined && completedOdometerKm !== null) {
        const completedOdoM = Math.round(Number(completedOdometerKm) * 1000);
        updatedReminderData.base_odometer_m = completedOdoM;
        updatedColHlc.base_odometer_m = hlc;
      }

      // Clear any snooze on completion
      if (updatedReminderData.snoozed_until) {
        delete updatedReminderData.snoozed_until;
        updatedColHlc.snoozed_until = hlc;
      }

      const v = await sql`SELECT seq FROM vehicles WHERE id = ${vehicleId}::uuid FOR UPDATE LIMIT 1`;
      let currentSeq = (Number(v[0]?.seq) || 0) + 1;

      // Update reminder record in database
      await sql`
        UPDATE records
        SET 
          data = ${JSON.stringify(updatedReminderData)}::jsonb,
          col_hlc = ${JSON.stringify(updatedColHlc)}::jsonb,
          seq = ${currentSeq},
          updated_by = ${userId}::uuid,
          updated_at = now()
        WHERE vehicle_id = ${vehicleId}::uuid
          AND id = ${reminderId}::uuid
          AND tbl = 'reminders'
      `;

      // 2. Optionally create a linked service history entry in 'entries'
      const shouldCreateEntry = createServiceEntry !== false && (createServiceEntry === true || cost !== undefined || merchant);
      let createdEntryId: string | null = null;

      if (shouldCreateEntry) {
        currentSeq += 1;
        createdEntryId = crypto.randomUUID();
        const costNum = cost !== undefined && cost !== null ? Number(cost) : undefined;
        const amountMinor = costNum !== undefined ? Math.round(costNum * 100) : undefined;
        const odoM = completedOdometerKm !== undefined && completedOdometerKm !== null ? Math.round(Number(completedOdometerKm) * 1000) : undefined;

        const entryPatch = {
          id: createdEntryId,
          kind: 'service',
          occurred_on: completedDate,
          amount_minor: amountMinor,
          currency,
          usd_minor: amountMinor,
          driver_id: userId,
          odometer_m: odoM,
          vendor_name: merchant,
          notes: notes || `Service completed: ${currentData.title || 'Maintenance'}`,
          category: currentData.kind || 'service',
          sub_items: [
            {
              id: crypto.randomUUID(),
              name: currentData.title || 'Scheduled Maintenance',
              cost: costNum !== undefined ? String(costNum) : '0',
            },
          ],
          // Backwards compatibility keys
          amount: costNum,
          cost: costNum,
          date: completedDate,
          merchant,
          odometerKm: completedOdometerKm,
        };

        const entryColHlc: Record<string, string> = {};
        for (const k of Object.keys(entryPatch)) entryColHlc[k] = hlc;

        await sql`
          INSERT INTO records (
            vehicle_id, tbl, id, data, col_hlc, deleted, seq, updated_by, updated_at
          ) VALUES (
            ${vehicleId}::uuid, 'entries', ${createdEntryId}::uuid,
            ${JSON.stringify(entryPatch)}::jsonb, ${JSON.stringify(entryColHlc)}::jsonb,
            false, ${currentSeq}, ${userId}::uuid, now()
          )
        `;
      }

      await sql`UPDATE vehicles SET seq = ${currentSeq} WHERE id = ${vehicleId}::uuid`;

      return {
        ok: true,
        reminderId,
        vehicleId,
        serviceEntryCreated: !!createdEntryId,
        serviceEntryId: createdEntryId,
        newBaseDate: completedDate,
        newBaseOdometerKm: completedOdometerKm ?? null,
        seq: currentSeq,
        message: `Maintenance task "${currentData.title || reminderId}" marked as completed. Schedule baseline advanced${createdEntryId ? ' and service expense logged to vehicle timeline' : ''}.`,
      };
    }


    case 'careto_add_entry': {
      const {
        vehicleId,
        tbl: rawTbl,
        kind: rawKind,
        amount,
        currency = 'USD',
        date = new Date().toISOString().slice(0, 10),
        category,
        notes,
        odometerKm,
        merchant,
        fuelVolumeL,
        pricePerUnit,
        fuelGrade,
        isBusiness,
        subItems,
      } = args;

      // In Careto, all financial, refuel, and service entries live in tbl='entries'
      const tbl = rawTbl === 'expenses' || !rawTbl ? 'entries' : rawTbl;
      const recordId = crypto.randomUUID();
      const hlc = `${Date.now()}-0000-0000`;

      let patch: Record<string, any>;

      if (tbl === 'entries') {
        let inferredKind = rawKind;
        if (!inferredKind) {
          if (fuelVolumeL !== undefined && fuelVolumeL !== null) inferredKind = 'refuel';
          else if (subItems && subItems.length > 0) inferredKind = 'service';
          else inferredKind = 'expense';
        }

        const amountMinor = amount !== undefined && amount !== null ? Math.round(Number(amount) * 100) : undefined;
        const odometerM = odometerKm !== undefined && odometerKm !== null ? Math.round(Number(odometerKm) * 1000) : undefined;

        patch = {
          id: recordId,
          kind: inferredKind,
          occurred_on: date,
          amount_minor: amountMinor,
          currency,
          usd_minor: amountMinor, // fallback 1:1 if no FX converter present
          driver_id: userId,
          odometer_m: odometerM,
          vendor_name: merchant,
          notes,
          business: isBusiness ? 1 : 0,
          category: category || (inferredKind === 'expense' ? 'other' : inferredKind),
          fuel_volume: fuelVolumeL,
          unit_price: pricePerUnit,
          fuel_grade: fuelGrade,
          sub_items: subItems?.map((item: any, idx: number) => ({
            id: crypto.randomUUID(),
            name: item.name,
            cost: String(item.cost),
            partNumber: item.partNumber,
          })),
          // Backwards compatibility keys so callers reading flat amounts can also consume:
          amount: amount !== undefined ? Number(amount) : undefined,
          cost: amount !== undefined ? Number(amount) : undefined,
          date,
          merchant,
          fuelVolume: fuelVolumeL,
          pricePerUnit,
          odometerKm,
        };
      } else {
        patch = {
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
      }

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

      return { ok: true, recordId, tbl, seq: nextSeq, entry: patch };
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
        const tbl = purpose === 'expense' ? 'entries' : 'notes';

        let patch: Record<string, any>;
        if (tbl === 'entries') {
          const rawAmount = extracted.amount || extracted.cost;
          const amountMinor = rawAmount ? Math.round(Number(rawAmount) * 100) : undefined;
          const inferredKind = extracted.fuelVolume ? 'refuel' : (extracted.subItems && extracted.subItems.length > 0 ? 'service' : 'expense');

          patch = {
            id: recordId,
            kind: inferredKind,
            occurred_on: extracted.date || new Date().toISOString().slice(0, 10),
            amount_minor: amountMinor,
            currency: extracted.currency || 'USD',
            usd_minor: amountMinor,
            driver_id: userId,
            vendor_name: extracted.merchant || extracted.vendorName,
            notes: extracted.notes || extracted.rawText,
            category: extracted.category || (inferredKind === 'expense' ? 'other' : inferredKind),
            fuel_volume: extracted.fuelVolume,
            unit_price: extracted.pricePerUnit,
            sub_items: extracted.subItems?.map((item: any) => ({
              id: crypto.randomUUID(),
              name: item.name,
              cost: String(item.cost),
              partNumber: item.partNumber,
            })),
            extractedAi: true,
            // Backwards compatibility keys:
            amount: rawAmount ? Number(rawAmount) : undefined,
            cost: rawAmount ? Number(rawAmount) : undefined,
            date: extracted.date || new Date().toISOString().slice(0, 10),
            merchant: extracted.merchant || extracted.vendorName,
            fuelVolume: extracted.fuelVolume,
            pricePerUnit: extracted.pricePerUnit,
          };
        } else {
          patch = {
            id: recordId,
            notes: extracted.notes || extracted.rawText,
            extractedAi: true,
            createdAt: new Date().toISOString(),
          };
        }

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

        createdRecord = { recordId, tbl, seq: nextSeq };
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
          AND tbl = 'entries' 
          AND deleted = false
        ORDER BY updated_at DESC
        LIMIT 20
      `;

      let maxOdometer = 0;
      const merchants = new Set<string>();
      let lastFuelPrice = null;

      for (const r of records) {
        const d = r.data as any;
        const odoKm = d.odometerKm ?? (d.odometer_m ? d.odometer_m / 1000 : 0);
        if (odoKm && odoKm > maxOdometer) maxOdometer = odoKm;
        const merchantName = d.merchant || d.vendor_name;
        if (merchantName) merchants.add(merchantName);
        const price = d.pricePerUnit ?? d.unit_price ?? (d.price_per_unit_minor ? d.price_per_unit_minor / 100 : null);
        if (!lastFuelPrice && price) lastFuelPrice = price;
      }

      return {
        latestOdometerKm: maxOdometer,
        recentMerchants: Array.from(merchants),
        lastFuelPrice,
      };
    }

    case 'careto_update_entry': {
      const {
        vehicleId,
        entryId,
        tbl: rawTbl,
        kind,
        amount,
        currency,
        date,
        category,
        notes,
        odometerKm,
        merchant,
        fuelVolumeL,
        pricePerUnit,
        fuelGrade,
        isBusiness,
        isFullTank,
        subItems,
      } = args;

      if (!vehicleId) throw new Error('vehicleId is required');
      if (!entryId) throw new Error('entryId is required');

      const tbl = rawTbl === 'expenses' || !rawTbl ? 'entries' : rawTbl;

      const canEdit = await hasRole(userId, vehicleId, 'editor');
      if (!canEdit) throw new Error('Forbidden: Editor permission required for vehicle');

      const existing = await sql`
        SELECT data, col_hlc
        FROM records
        WHERE vehicle_id = ${vehicleId}::uuid
          AND id = ${entryId}::uuid
          AND tbl = ${tbl}
          AND deleted = false
        LIMIT 1
      `;

      if (existing.length === 0) {
        throw new Error(`Entry ${entryId} not found in ${tbl} for vehicle ${vehicleId}`);
      }

      const currentData = (existing[0]!.data as Record<string, any>) || {};
      const currentColHlc = (existing[0]!.col_hlc as Record<string, string>) || {};
      const hlc = `${Date.now()}-0000-0000`;

      const updatedData = { ...currentData };
      const updatedColHlc = { ...currentColHlc };

      const setField = (field: string, val: any) => {
        if (val !== undefined) {
          updatedData[field] = val;
          updatedColHlc[field] = hlc;
        }
      };

      if (tbl === 'entries') {
        if (kind !== undefined) setField('kind', kind);

        if (amount !== undefined) {
          const amountMinor = amount !== null ? Math.round(Number(amount) * 100) : null;
          setField('amount_minor', amountMinor);
          setField('usd_minor', amountMinor);
          setField('amount', amount !== null ? Number(amount) : null);
          setField('cost', amount !== null ? Number(amount) : null);
        }

        if (currency !== undefined) setField('currency', currency);

        if (date !== undefined) {
          setField('occurred_on', date);
          setField('date', date);
        }

        if (category !== undefined) setField('category', category);
        if (notes !== undefined) setField('notes', notes);

        if (odometerKm !== undefined) {
          const odoM = odometerKm !== null ? Math.round(Number(odometerKm) * 1000) : null;
          setField('odometer_m', odoM);
          setField('odometerKm', odometerKm !== null ? Number(odometerKm) : null);
        }

        if (merchant !== undefined) {
          setField('vendor_name', merchant);
          setField('merchant', merchant);
        }

        if (fuelVolumeL !== undefined) {
          setField('fuel_volume', fuelVolumeL !== null ? Number(fuelVolumeL) : null);
          setField('fuelVolume', fuelVolumeL !== null ? Number(fuelVolumeL) : null);
        }

        if (pricePerUnit !== undefined) {
          setField('unit_price', pricePerUnit !== null ? Number(pricePerUnit) : null);
          setField('pricePerUnit', pricePerUnit !== null ? Number(pricePerUnit) : null);
        }

        if (fuelGrade !== undefined) setField('fuel_grade', fuelGrade);

        if (isBusiness !== undefined) {
          setField('business', isBusiness ? 1 : 0);
        }

        if (isFullTank !== undefined) {
          setField('is_full_tank', Boolean(isFullTank));
        }

        if (subItems !== undefined) {
          const mappedSubItems = Array.isArray(subItems)
            ? subItems.map((item: any) => ({
                id: item.id || crypto.randomUUID(),
                name: item.name,
                cost: String(item.cost),
                partNumber: item.partNumber,
                quantity: item.quantity,
              }))
            : [];
          setField('sub_items', mappedSubItems);
          setField('subItems', mappedSubItems);
        }
      } else {
        if (notes !== undefined) {
          setField('notes', notes);
          setField('body', notes);
        }
        if (date !== undefined) {
          setField('date', date);
        }
      }

      const v = await sql`SELECT seq FROM vehicles WHERE id = ${vehicleId}::uuid FOR UPDATE LIMIT 1`;
      if (v.length === 0) throw new Error('Vehicle not found');
      const nextSeq = (Number(v[0]?.seq) || 0) + 1;

      await sql`
        UPDATE records
        SET 
          data = ${JSON.stringify(updatedData)}::jsonb,
          col_hlc = ${JSON.stringify(updatedColHlc)}::jsonb,
          seq = ${nextSeq},
          updated_by = ${userId}::uuid,
          updated_at = now()
        WHERE vehicle_id = ${vehicleId}::uuid
          AND id = ${entryId}::uuid
          AND tbl = ${tbl}
      `;

      await sql`UPDATE vehicles SET seq = ${nextSeq} WHERE id = ${vehicleId}::uuid`;

      return {
        ok: true,
        entryId,
        vehicleId,
        tbl,
        seq: nextSeq,
        entry: updatedData,
        message: `Successfully updated ${tbl} entry ${entryId}.`,
      };
    }

    case 'careto_delete_entry': {
      const { vehicleId, entryId, tbl: rawTbl = 'entries', confirmed, confirmationReason } = args;
      const tbl = rawTbl === 'expenses' ? 'entries' : rawTbl;

      if (!confirmed) {
        return {
          ok: false,
          requiresConsent: true,
          message: 'Deletion requires user consent. Please confirm deletion by setting confirmed=true and specifying confirmationReason.',
        };
      }

      // Verify entry exists in vehicle
      const existing = await sql`
        SELECT id, tbl, data, deleted
        FROM records
        WHERE vehicle_id = ${vehicleId}::uuid
          AND id = ${entryId}::uuid
          AND tbl = ${tbl}
        LIMIT 1
      `;

      if (existing.length === 0) {
        return {
          ok: false,
          error: `Entry ${entryId} not found in ${tbl} for vehicle ${vehicleId}.`,
        };
      }

      const entry = existing[0]!;
      if (entry.deleted) {
        return {
          ok: true,
          message: `Entry ${entryId} was already deleted.`,
        };
      }

      const hlc = `${Date.now()}-0000-0000`;

      // Update vehicle seq
      const v = await sql`SELECT seq FROM vehicles WHERE id = ${vehicleId}::uuid FOR UPDATE LIMIT 1`;
      const nextSeq = (Number(v[0]?.seq) || 0) + 1;

      // Soft delete / tombstone record for CRDT sync propagation
      await sql`
        UPDATE records
        SET 
          deleted = true,
          deleted_hlc = ${hlc},
          seq = ${nextSeq},
          updated_by = ${userId}::uuid,
          updated_at = now()
        WHERE vehicle_id = ${vehicleId}::uuid
          AND id = ${entryId}::uuid
          AND tbl = ${tbl}
      `;

      await sql`UPDATE vehicles SET seq = ${nextSeq} WHERE id = ${vehicleId}::uuid`;

      return {
        ok: true,
        deletedEntryId: entryId,
        tbl,
        seq: nextSeq,
        confirmationReason: confirmationReason || 'Implicit user consent verified',
        message: `Successfully deleted entry ${entryId} from ${tbl}.`,
      };
    }

    default:
      throw new Error(`Unknown MCP tool: ${name}`);
  }
}
