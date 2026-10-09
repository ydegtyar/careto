-- SQLite schema for local.db (never synced)
CREATE TABLE IF NOT EXISTS sync_cursor (
  vehicle_id TEXT PRIMARY KEY,
  seq INTEGER NOT NULL DEFAULT 0,
  last_pull_at TEXT,
  last_push_at TEXT
);

CREATE TABLE IF NOT EXISTS outbox (
  op_id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL,
  tbl TEXT NOT NULL,
  row_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  patch_json TEXT NOT NULL,
  hlc TEXT NOT NULL,
  base_seq INTEGER,
  attempts INTEGER DEFAULT 0,
  state TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS fx_cache (
  date TEXT NOT NULL,
  currency TEXT NOT NULL,
  rate_per_usd REAL NOT NULL,
  fetched_at TEXT NOT NULL,
  source TEXT DEFAULT 'open.er-api.com',
  PRIMARY KEY(date, currency)
);

CREATE TABLE IF NOT EXISTS rollup_monthly (
  vehicle_id TEXT NOT NULL,
  ym TEXT NOT NULL,
  kind TEXT NOT NULL,
  category_id TEXT,
  usd_minor INTEGER DEFAULT 0,
  distance_m INTEGER DEFAULT 0,
  volume_ml INTEGER DEFAULT 0,
  n INTEGER DEFAULT 0,
  PRIMARY KEY(vehicle_id, ym, kind, category_id)
);

CREATE TABLE IF NOT EXISTS kv (
  key TEXT PRIMARY KEY,
  value TEXT
);
