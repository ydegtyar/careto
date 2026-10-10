import type { VehiclePowertrain } from '@/data/client/types';

export interface PredefinedSubItem {
  id: string;
  name: string;
  powertrains?: VehiclePowertrain[];
}

export const PREDEFINED_SUB_ITEMS: PredefinedSubItem[] = [
  // Common Maintenance & Service Items
  { id: 'engine_oil', name: 'Engine Oil & Filter', powertrains: ['ice', 'hybrid', 'phev'] },
  { id: 'cabin_air_filter', name: 'Cabin Air Filter' },
  { id: 'engine_air_filter', name: 'Engine Air Filter', powertrains: ['ice', 'hybrid', 'phev'] },
  { id: 'brake_pads_front', name: 'Front Brake Pads' },
  { id: 'brake_pads_rear', name: 'Rear Brake Pads' },
  { id: 'brake_rotors', name: 'Brake Rotors' },
  { id: 'brake_fluid', name: 'Brake Fluid Flush' },
  { id: 'spark_plugs', name: 'Spark Plugs', powertrains: ['ice', 'hybrid', 'phev'] },
  { id: 'coolant_flush', name: 'Coolant / Radiator Flush' },
  { id: 'transmission_fluid', name: 'Transmission Fluid' },
  { id: 'tire_rotation', name: 'Tire Rotation & Balance' },
  { id: 'wheel_alignment', name: 'Wheel Alignment' },
  { id: 'wiper_blades', name: 'Wiper Blades' },
  { id: '12v_battery', name: '12V Starter Battery' },

  // EV / Hybrid Specific
  {
    id: 'hv_battery_coolant',
    name: 'High-Voltage Battery Coolant',
    powertrains: ['ev', 'phev', 'hybrid'],
  },
  {
    id: 'hv_battery_health_check',
    name: 'High-Voltage Battery Diagnostic',
    powertrains: ['ev', 'phev', 'hybrid'],
  },

  // ICE Specific
  { id: 'timing_belt', name: 'Timing Belt / Chain', powertrains: ['ice'] },
  {
    id: 'serpentine_belt',
    name: 'Serpentine / Drive Belt',
    powertrains: ['ice', 'hybrid', 'phev'],
  },
  { id: 'fuel_filter', name: 'Fuel Filter', powertrains: ['ice', 'hybrid', 'phev'] },

  // General & Labor
  { id: 'labor', name: 'Labor / Service Fee' },
  { id: 'general_inspection', name: 'Multi-Point Inspection' },
];

export function getPredefinedSubItems(
  powertrain?: VehiclePowertrain | string,
): PredefinedSubItem[] {
  if (!powertrain) return PREDEFINED_SUB_ITEMS;

  return PREDEFINED_SUB_ITEMS.filter(
    (item) => !item.powertrains || item.powertrains.includes(powertrain as VehiclePowertrain),
  );
}
