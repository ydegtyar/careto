export interface VehicleTank {
  id: string;
  name: string;
  type: 'petrol' | 'diesel' | 'lpg' | 'cng' | 'ev' | 'hydrogen' | 'other';
  capacity_ml_or_wh?: number;
  primary_fuel_grade?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  make?: string;
  model?: string;
  year?: number;
  trim?: string;
  plate?: string;
  vin?: string;
  color?: string;
  powertrain: 'ice' | 'hybrid' | 'phev' | 'ev' | 'hydrogen';
  initial_odometer_m: number;
  tank_ml?: number;
  battery_wh?: number;
  tanks?: VehicleTank[];
  fuel_grades?: string[];
  custom_reminder_types?: string[];
  dismissed_suggested_reminders?: string[];
  distance_unit: string;
  efficiency_unit: string;
}

export interface Entry {
  id: string;
  kind: 'refuel' | 'charge' | 'expense' | 'income' | 'service' | 'route' | 'odometer';
  occurred_on: string;
  occurred_time?: string;
  odometer_m?: number;
  amount_minor?: number;
  currency?: string;
  usd_minor?: number;
  driver_id?: string;
  category_id?: string;
  business?: number;
  vendor_name?: string;
  lat?: number;
  lon?: number;
}

export interface ServiceItem {
  id: string;
  entry_id: string;
  name: string;
  cost_minor: number;
  part_number?: string;
  quantity?: number;
}

export interface Note {
  id: string;
  subject_type: string;
  subject_id: string;
  body: string;
  pinned: number;
  author_user_id?: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  kind: string;
  title: string;
  mode: 'km' | 'time' | 'earlier' | 'later';
  interval_m?: number;
  interval_days?: number;
  base_odometer_m?: number;
  base_date?: string;
  snoozed_until?: string;
  lead_m: number;
  lead_days: number;
  est_cost_usd_minor?: number;
}

export interface SyncStatus {
  state: 'idle' | 'syncing' | 'error';
  lastSyncedAt?: string;
  pendingOpsCount: number;
  lastError?: string;
  currentSeq: number;
}

export interface ConflictRecord {
  id: string;
  tbl: string;
  rowId: string;
  localData: Record<string, unknown>;
  remoteData: Record<string, unknown>;
  conflictedAt: string;
}
