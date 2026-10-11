import { pgTable, uuid, text, bigint, boolean, timestamp, jsonb, integer, index, numeric, date } from 'drizzle-orm/pg-core';

// Control-plane tables
export const vehicles = pgTable('vehicles', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull(),
  name: text('name').notNull(),
  make: text('make'),
  model: text('model'),
  year: integer('year'),
  powertrain: text('powertrain').default('ice'),
  initialOdometerM: integer('initial_odometer_m').default(0),
  distanceUnit: text('distance_unit').default('km'),
  efficiencyUnit: text('efficiency_unit').default('l100km'),
  tanks: jsonb('tanks'),
  fuelGrades: jsonb('fuel_grades'),
  seq: bigint('seq', { mode: 'number' }).notNull().default(0),
  driveFolderId: text('drive_folder_id'),
  driveOwnerId: uuid('drive_owner_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
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

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  keyHash: text('key_hash').notNull().unique(),
  keyPrefix: text('key_prefix').notNull(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
});

export const oauthClients = pgTable('oauth_clients', {
  clientId: text('client_id').primaryKey(),
  clientSecret: text('client_secret'),
  clientName: text('client_name'),
  redirectUris: jsonb('redirect_uris').notNull(),
  grantTypes: jsonb('grant_types'),
  responseTypes: jsonb('response_types'),
  tokenEndpointAuthMethod: text('token_endpoint_auth_method').default('none'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const oauthCodes = pgTable('oauth_codes', {
  code: text('code').primaryKey(),
  clientId: text('client_id').notNull(),
  userId: uuid('user_id').notNull(),
  redirectUri: text('redirect_uri').notNull(),
  codeChallenge: text('code_challenge'),
  codeChallengeMethod: text('code_challenge_method'),
  scope: text('scope'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Analytics domain tables
export const fuelTypes = pgTable('fuel_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code'),
});

export const stations = pgTable('stations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
});

export const refuels = pgTable(
  'refuels',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    vehicleId: uuid('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    odometerKm: numeric('odometer_km', { precision: 12, scale: 2 }).notNull(),
    liters: numeric('liters', { precision: 12, scale: 2 }).notNull(),
    pricePerLiter: numeric('price_per_liter', { precision: 12, scale: 4 }).notNull(),
    totalCost: numeric('total_cost', { precision: 12, scale: 2 }).notNull(),
    fuelTypeId: uuid('fuel_type_id').references(() => fuelTypes.id),
    stationId: uuid('station_id').references(() => stations.id),
    isFullTank: boolean('is_full_tank').default(true).notNull(),
    tankNo: integer('tank_no').default(1).notNull(),
    notes: text('notes'),
  },
  (table) => [
    index('refuels_vehicle_date_idx').on(table.vehicleId, table.date),
  ]
);

export const workshops = pgTable('workshops', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  rating: numeric('rating', { precision: 3, scale: 1 }),
  specialization: text('specialization'),
  hourlyRate: numeric('hourly_rate', { precision: 12, scale: 2 }),
  guaranteeNote: text('guarantee_note'),
});

export const serviceEvents = pgTable(
  'service_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    vehicleId: uuid('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    odometerKm: numeric('odometer_km', { precision: 12, scale: 2 }).notNull(),
    workshopId: uuid('workshop_id').references(() => workshops.id),
    isScheduled: boolean('is_scheduled').default(true).notNull(),
    isBreakdown: boolean('is_breakdown').default(false).notNull(),
    laborCost: numeric('labor_cost', { precision: 12, scale: 2 }).default('0').notNull(),
    laborHours: numeric('labor_hours', { precision: 6, scale: 2 }),
  },
  (table) => [
    index('service_events_vehicle_date_idx').on(table.vehicleId, table.date),
  ]
);

export const serviceItems = pgTable('service_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceEventId: uuid('service_event_id').notNull().references(() => serviceEvents.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category'),
  partCost: numeric('part_cost', { precision: 12, scale: 2 }).default('0').notNull(),
  laborCost: numeric('labor_cost', { precision: 12, scale: 2 }).default('0').notNull(),
});

export const componentRules = pgTable('component_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  vehicleId: uuid('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  component: text('component').notNull(),
  intervalKm: numeric('interval_km', { precision: 12, scale: 2 }).notNull(),
  intervalDays: integer('interval_days').notNull(),
  seasonalFactor: jsonb('seasonal_factor'),
  icon: text('icon'),
});

export const componentServiceLog = pgTable('component_service_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  vehicleId: uuid('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  component: text('component').notNull(),
  serviceEventId: uuid('service_event_id').references(() => serviceEvents.id, { onDelete: 'set null' }),
  date: date('date').notNull(),
  odometerKm: numeric('odometer_km', { precision: 12, scale: 2 }).notNull(),
});

export const sinkingFundGoals = pgTable('sinking_fund_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  vehicleId: uuid('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  targetAmount: numeric('target_amount', { precision: 12, scale: 2 }).notNull(),
  targetOdometerKm: numeric('target_odometer_km', { precision: 12, scale: 2 }),
  monthlyContribution: numeric('monthly_contribution', { precision: 12, scale: 2 }),
});

export const odometerReadings = pgTable('odometer_readings', {
  id: uuid('id').primaryKey().defaultRandom(),
  vehicleId: uuid('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  km: numeric('km', { precision: 12, scale: 2 }).notNull(),
  source: text('source').default('manual').notNull(),
});
