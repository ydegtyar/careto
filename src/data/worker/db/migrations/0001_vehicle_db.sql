-- SQLite schema for vehicle-<id>.db replica
CREATE TABLE IF NOT EXISTS vehicle (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  make TEXT,
  model TEXT,
  year INTEGER,
  trim TEXT,
  plate TEXT,
  vin TEXT,
  color TEXT,
  powertrain TEXT NOT NULL DEFAULT 'ice',
  purchase_on TEXT,
  purchase_amount_minor INTEGER,
  purchase_currency TEXT,
  purchase_usd_minor INTEGER,
  initial_odometer_m INTEGER DEFAULT 0,
  tank_ml INTEGER,
  battery_wh INTEGER,
  distance_unit TEXT DEFAULT 'km',
  efficiency_unit TEXT DEFAULT 'l100km',
  photo_attachment_id TEXT,
  archived INTEGER DEFAULT 0,
  hlc TEXT NOT NULL,
  seq INTEGER,
  deleted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK(kind IN ('refuel','charge','expense','income','service','route','odometer')),
  occurred_on TEXT NOT NULL,
  occurred_time TEXT,
  odometer_m INTEGER,
  amount_minor INTEGER,
  currency TEXT,
  usd_minor INTEGER,
  fx_rate REAL,
  fx_date TEXT,
  fx_source TEXT,
  driver_id TEXT,
  category_id TEXT,
  place_id TEXT,
  payment_id TEXT,
  business INTEGER DEFAULT 0,
  reminder_id TEXT,
  vendor_name TEXT,
  lat REAL,
  lon REAL,
  hlc TEXT NOT NULL,
  seq INTEGER,
  deleted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS service_items (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL,
  name TEXT NOT NULL,
  cost_minor INTEGER NOT NULL,
  part_number TEXT,
  quantity INTEGER DEFAULT 1,
  hlc TEXT NOT NULL,
  seq INTEGER,
  deleted INTEGER NOT NULL DEFAULT 0
);


CREATE TABLE IF NOT EXISTS refuel_details (
  id TEXT PRIMARY KEY,
  fuel_id TEXT,
  volume_ml INTEGER,
  unit_price_milli INTEGER,
  full_tank INTEGER DEFAULT 1,
  station_id TEXT,
  missed_prior INTEGER DEFAULT 0,
  hlc TEXT NOT NULL,
  seq INTEGER,
  deleted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'km',
  interval_m INTEGER,
  interval_days INTEGER,
  lead_m INTEGER DEFAULT 500000,
  lead_days INTEGER DEFAULT 14,
  est_cost_usd_minor INTEGER,
  snoozed_until TEXT,
  hlc TEXT NOT NULL,
  seq INTEGER,
  deleted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  subject_type TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  body TEXT NOT NULL,
  pinned INTEGER DEFAULT 0,
  author_user_id TEXT,
  created_at TEXT NOT NULL,
  hlc TEXT NOT NULL,
  seq INTEGER,
  deleted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dict_items (
  id TEXT PRIMARY KEY,
  dict TEXT NOT NULL,
  name TEXT NOT NULL,
  meta_json TEXT,
  sort INTEGER DEFAULT 0,
  archived INTEGER DEFAULT 0,
  hlc TEXT NOT NULL,
  seq INTEGER,
  deleted INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS members (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'editor',
  driver_id TEXT
);
