-- Migration: Analytics domain tables, views, and functions
-- Author: Careto Analytics Module

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Fuel Types
CREATE TABLE IF NOT EXISTS fuel_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT
);

-- 2. Gas Stations
CREATE TABLE IF NOT EXISTS stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL
);

-- 3. Refuels
CREATE TABLE IF NOT EXISTS refuels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  odometer_km NUMERIC(12,2) NOT NULL,
  liters NUMERIC(12,2) NOT NULL,
  price_per_liter NUMERIC(12,4) NOT NULL,
  total_cost NUMERIC(12,2) NOT NULL,
  fuel_type_id UUID REFERENCES fuel_types(id),
  station_id UUID REFERENCES stations(id),
  is_full_tank BOOLEAN NOT NULL DEFAULT true,
  tank_no INT NOT NULL DEFAULT 1,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS refuels_vehicle_date_idx ON refuels(vehicle_id, date);

-- 4. Workshops
CREATE TABLE IF NOT EXISTS workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rating NUMERIC(3,1),
  specialization TEXT,
  hourly_rate NUMERIC(12,2),
  guarantee_note TEXT
);

-- 5. Service Events
CREATE TABLE IF NOT EXISTS service_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  odometer_km NUMERIC(12,2) NOT NULL,
  workshop_id UUID REFERENCES workshops(id),
  is_scheduled BOOLEAN NOT NULL DEFAULT true,
  is_breakdown BOOLEAN NOT NULL DEFAULT false,
  labor_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  labor_hours NUMERIC(6,2)
);

CREATE INDEX IF NOT EXISTS service_events_vehicle_date_idx ON service_events(vehicle_id, date);

-- 6. Service Items
CREATE TABLE IF NOT EXISTS service_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_event_id UUID NOT NULL REFERENCES service_events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  part_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  labor_cost NUMERIC(12,2) NOT NULL DEFAULT 0
);

-- 7. Component Rules
CREATE TABLE IF NOT EXISTS component_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  component TEXT NOT NULL,
  interval_km NUMERIC(12,2) NOT NULL,
  interval_days INT NOT NULL,
  seasonal_factor JSONB,
  icon TEXT
);

-- 8. Component Service Log
CREATE TABLE IF NOT EXISTS component_service_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  component TEXT NOT NULL,
  service_event_id UUID REFERENCES service_events(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  odometer_km NUMERIC(12,2) NOT NULL
);

-- 9. Sinking Fund Goals
CREATE TABLE IF NOT EXISTS sinking_fund_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  target_amount NUMERIC(12,2) NOT NULL,
  target_odometer_km NUMERIC(12,2),
  monthly_contribution NUMERIC(12,2)
);

-- 10. Odometer Readings
CREATE TABLE IF NOT EXISTS odometer_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  km NUMERIC(12,2) NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual'
);

CREATE INDEX IF NOT EXISTS odometer_readings_vehicle_date_idx ON odometer_readings(vehicle_id, date);
