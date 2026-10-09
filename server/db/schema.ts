import { pgTable, uuid, text, bigint, boolean, timestamp, jsonb, integer, index } from 'drizzle-orm/pg-core';

// Control-plane tables
export const vehicles = pgTable('vehicles', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull(),
  name: text('name').notNull(),
  seq: bigint('seq', { mode: 'number' }).notNull().default(0),
  driveFolderId: text('drive_folder_id'),
  driveOwnerId: uuid('drive_owner_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
});

export const vehicleMembers = pgTable(
  'vehicle_members',
  {
    vehicleId: uuid('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull(),
    role: text('role').notNull(), // 'owner' | 'editor' | 'viewer'
    addedBy: uuid('added_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('vehicle_members_veh_user_idx').on(table.vehicleId, table.userId),
  ]
);

export const invites = pgTable('invites', {
  id: uuid('id').primaryKey().defaultRandom(),
  vehicleId: uuid('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role').notNull().default('editor'),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdBy: uuid('created_by').notNull(),
  acceptedBy: uuid('accepted_by'),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
});

// Single JSONB records table for sync (D12)
export const records = pgTable(
  'records',
  {
    vehicleId: uuid('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
    tbl: text('tbl').notNull(),
    id: uuid('id').notNull(),
    data: jsonb('data'),
    colHlc: jsonb('col_hlc'),
    deleted: boolean('deleted').default(false).notNull(),
    deletedHlc: text('deleted_hlc'),
    seq: bigint('seq', { mode: 'number' }),
    updatedBy: uuid('updated_by'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('records_vehicle_seq_idx').on(table.vehicleId, table.seq),
  ]
);

export const appliedOps = pgTable('applied_ops', {
  vehicleId: uuid('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  opId: uuid('op_id').notNull(),
  appliedAt: timestamp('applied_at', { withTimezone: true }).defaultNow().notNull(),
});

export const fxRates = pgTable('fx_rates', {
  date: text('date').notNull(), // YYYY-MM-DD
  base: text('base').notNull().default('USD'),
  rates: jsonb('rates').notNull(),
  source: text('source').default('open.er-api.com'),
  fetchedAt: timestamp('fetched_at', { withTimezone: true }).defaultNow().notNull(),
});

export const pushDevices = pgTable('push_devices', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  endpoint: text('endpoint').notNull().unique(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  tz: text('tz'),
  locale: text('locale'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  lastOkAt: timestamp('last_ok_at', { withTimezone: true }),
});

export const notifyPrefs = pgTable('notify_prefs', {
  userId: uuid('user_id').notNull(),
  vehicleId: uuid('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  enabled: boolean('enabled').default(true).notNull(),
  showDetails: boolean('show_details').default(false).notNull(),
  localTime: text('local_time').default('09:00'),
});

export const pushEvents = pgTable('push_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  vehicleId: uuid('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  reminderId: uuid('reminder_id'),
  kind: text('kind').notNull(),
  fireAt: timestamp('fire_at', { withTimezone: true }).notNull(),
  payload: jsonb('payload').notNull(),
  sentAt: timestamp('sent_at', { withTimezone: true }),
});

export const vehicleBackup = pgTable('vehicle_backup', {
  vehicleId: uuid('vehicle_id').primaryKey().references(() => vehicles.id, { onDelete: 'cascade' }),
  enabled: boolean('enabled').default(false).notNull(),
  frequency: text('frequency').default('weekly').notNull(),
  keep: integer('keep').default(8).notNull(),
  lastRunAt: timestamp('last_run_at', { withTimezone: true }),
  lastStatus: text('last_status'),
  lastFileId: text('last_file_id'),
});

export const backupRuns = pgTable('backup_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  vehicleId: uuid('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  status: text('status').notNull(),
  driveFileId: text('drive_file_id'),
  bytes: bigint('bytes', { mode: 'number' }),
  vehicleSeq: bigint('vehicle_seq', { mode: 'number' }),
  error: text('error'),
});
