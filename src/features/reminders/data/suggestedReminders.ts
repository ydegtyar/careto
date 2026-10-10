export interface SuggestedReminderPreset {
  id: string;
  title: string;
  kind: string;
  powertrains: ('ice' | 'hybrid' | 'phev' | 'ev' | 'hydrogen')[];
  interval_m?: number;
  interval_days?: number;
  mode: 'km' | 'time' | 'earlier' | 'later';
  est_cost_usd_minor?: number;
  description: string;
}

export const SUGGESTED_REMINDERS_PRESETS: SuggestedReminderPreset[] = [
  // ICE / Engine Specific
  {
    id: 'ice_engine_oil',
    title: 'Engine Oil & Filter Change',
    kind: 'fluids',
    powertrains: ['ice', 'hybrid', 'phev'],
    interval_m: 10_000_000, // 10,000 km
    interval_days: 365,
    mode: 'earlier',
    est_cost_usd_minor: 8000,
    description: 'Recommended every 10,000 km or 1 year to preserve engine life.',
  },
  {
    id: 'ice_spark_plugs',
    title: 'Spark Plugs Replacement',
    kind: 'spark_plugs',
    powertrains: ['ice', 'hybrid', 'phev'],
    interval_m: 60_000_000, // 60,000 km
    interval_days: 730,
    mode: 'earlier',
    est_cost_usd_minor: 12000,
    description: 'Ensures efficient ignition performance and smooth idle.',
  },
  {
    id: 'ice_timing_belt',
    title: 'Timing Belt / Chain Inspection',
    kind: 'timing_belt',
    powertrains: ['ice'],
    interval_m: 100_000_000, // 100,000 km
    interval_days: 1460,
    mode: 'earlier',
    est_cost_usd_minor: 35000,
    description: 'Critical preventive maintenance for internal combustion engines.',
  },

  // EV / Battery Specific
  {
    id: 'ev_battery_coolant',
    title: 'High-Voltage Battery Coolant Check',
    kind: 'service',
    powertrains: ['ev', 'phev', 'hybrid'],
    interval_m: 60_000_000, // 60,000 km
    interval_days: 730,
    mode: 'earlier',
    est_cost_usd_minor: 15000,
    description: 'Maintains optimal battery pack thermal regulation and efficiency.',
  },
  {
    id: 'ev_cabin_air_filter',
    title: 'Cabin Air & HEPA Filter Replacement',
    kind: 'filters',
    powertrains: ['ev', 'ice', 'hybrid', 'phev', 'hydrogen'],
    interval_m: 20_000_000, // 20,000 km
    interval_days: 365,
    mode: 'earlier',
    est_cost_usd_minor: 4500,
    description: 'Keeps interior climate clean and protects HVAC blowers.',
  },

  // Universal Maintenance
  {
    id: 'universal_tire_rotation',
    title: 'Tire Rotation & Alignment Check',
    kind: 'tires',
    powertrains: ['ice', 'ev', 'hybrid', 'phev', 'hydrogen'],
    interval_m: 10_000_000, // 10,000 km
    interval_days: 180,
    mode: 'earlier',
    est_cost_usd_minor: 5000,
    description: 'Promotes even tread wear and improves handling stability.',
  },
  {
    id: 'universal_brake_fluid',
    title: 'Brake Fluid Flush & Inspection',
    kind: 'brakes',
    powertrains: ['ice', 'ev', 'hybrid', 'phev', 'hydrogen'],
    interval_m: 40_000_000, // 40,000 km
    interval_days: 730,
    mode: 'earlier',
    est_cost_usd_minor: 11000,
    description: 'Prevents moisture absorption in hydraulic lines and brake failure.',
  },
  {
    id: 'universal_annual_inspection',
    title: 'Annual Safety & Registration Inspection',
    kind: 'inspection',
    powertrains: ['ice', 'ev', 'hybrid', 'phev', 'hydrogen'],
    interval_days: 365,
    mode: 'time',
    est_cost_usd_minor: 6000,
    description: 'Yearly statutory safety check and vehicle registration deadline.',
  },
];
