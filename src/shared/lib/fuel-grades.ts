import { useLocalStorage } from 'usehooks-ts';

export interface FuelGrade {
  id: string;
  label: string;
  category: 'petrol' | 'diesel' | 'gas' | 'ev' | 'alternative';
  color: string;
  isDefault?: boolean;
}

export const DEFAULT_FUEL_GRADES: FuelGrade[] = [
  // Petrol
  {
    id: 'ron95',
    label: 'Gasoline 95 (E10)',
    category: 'petrol',
    color: '#7dd3fc',
    isDefault: true,
  },
  {
    id: 'ron98',
    label: 'Gasoline 98 Super+',
    category: 'petrol',
    color: '#38bdf8',
    isDefault: true,
  },
  {
    id: 'ron100',
    label: 'Gasoline 100 Racing',
    category: 'petrol',
    color: '#0284c7',
    isDefault: true,
  },
  { id: 'e85', label: 'Ethanol E85', category: 'alternative', color: '#10b981', isDefault: true },
  // Diesel
  { id: 'diesel', label: 'Standard Diesel', category: 'diesel', color: '#c8a0f0', isDefault: true },
  {
    id: 'premium_diesel',
    label: 'Premium Diesel',
    category: 'diesel',
    color: '#a855f7',
    isDefault: true,
  },
  {
    id: 'adblue',
    label: 'AdBlue / DEF',
    category: 'alternative',
    color: '#6366f1',
    isDefault: true,
  },
  // Gas
  { id: 'lpg', label: 'LPG (Autogas)', category: 'gas', color: '#f59e0b', isDefault: true },
  { id: 'cng', label: 'CNG (Natural Gas)', category: 'gas', color: '#d97706', isDefault: true },
  // EV
  { id: 'ev_ac', label: 'AC Charging (Type 2)', category: 'ev', color: '#fbbf24', isDefault: true },
  {
    id: 'ev_fast',
    label: 'DC Fast Charge (CCS/Tesla)',
    category: 'ev',
    color: '#34d399',
    isDefault: true,
  },
  {
    id: 'ev_home',
    label: 'Home Wallbox / Socket',
    category: 'ev',
    color: '#a7f3d0',
    isDefault: true,
  },
  // Hydrogen
  {
    id: 'hydrogen',
    label: 'Hydrogen (H2 700bar)',
    category: 'alternative',
    color: '#38bdf8',
    isDefault: true,
  },
];

export const ACCOUNT_FUEL_GRADES_KEY = 'careto_account_fuel_grades_v1';
export const SELECTED_FUEL_GRADES_KEY = 'careto_selected_fuel_grades_v1';

export function useAccountFuelGrades() {
  const [allGrades, setAllGrades] = useLocalStorage<FuelGrade[]>(
    ACCOUNT_FUEL_GRADES_KEY,
    DEFAULT_FUEL_GRADES,
    { initializeWithValue: false },
  );

  const [enabledIds, setEnabledIds] = useLocalStorage<string[]>(
    SELECTED_FUEL_GRADES_KEY,
    DEFAULT_FUEL_GRADES.map((g) => g.id),
    { initializeWithValue: false },
  );

  const toggleGradeEnabled = (id: string) => {
    if (enabledIds.includes(id)) {
      if (enabledIds.length <= 1) return; // Keep at least one grade enabled
      setEnabledIds(enabledIds.filter((item) => item !== id));
    } else {
      setEnabledIds([...enabledIds, id]);
    }
  };

  const addCustomGrade = (grade: Omit<FuelGrade, 'isDefault'>) => {
    const newGrade: FuelGrade = { ...grade, isDefault: false };
    setAllGrades([...allGrades, newGrade]);
    setEnabledIds([...enabledIds, newGrade.id]);
  };

  const removeCustomGrade = (id: string) => {
    setAllGrades(allGrades.filter((g) => g.id !== id));
    setEnabledIds(enabledIds.filter((i) => i !== id));
  };

  const resetToDefaults = () => {
    setAllGrades(DEFAULT_FUEL_GRADES);
    setEnabledIds(DEFAULT_FUEL_GRADES.map((g) => g.id));
  };

  const activeGrades = allGrades.filter((g) => enabledIds.includes(g.id));

  return {
    allGrades,
    enabledIds,
    activeGrades,
    toggleGradeEnabled,
    addCustomGrade,
    removeCustomGrade,
    resetToDefaults,
  };
}

export function getGradesForPowertrain(
  powertrain: string,
  grades: FuelGrade[] = DEFAULT_FUEL_GRADES,
): FuelGrade[] {
  switch (powertrain) {
    case 'ev':
      return grades.filter((g) => g.category === 'ev');
    case 'phev':
      return grades.filter(
        (g) =>
          g.category === 'ev' ||
          g.category === 'petrol' ||
          g.category === 'diesel' ||
          g.category === 'alternative',
      );
    case 'hybrid':
    case 'ice':
      return grades.filter((g) => g.category !== 'ev');
    case 'hydrogen':
      return grades.filter((g) => g.id === 'hydrogen' || g.category === 'alternative');
    default:
      return grades;
  }
}

export function getDefaultFuelGradesForPowertrain(
  powertrain: string,
  grades: FuelGrade[] = DEFAULT_FUEL_GRADES,
): string[] {
  const relevant = getGradesForPowertrain(powertrain, grades);
  if (relevant.length === 0) return grades.map((g) => g.id);

  switch (powertrain) {
    case 'ev':
      return relevant
        .filter((g) => ['ev_fast', 'ev_ac', 'ev_home'].includes(g.id))
        .map((g) => g.id);
    case 'phev':
      return relevant.filter((g) => ['ron95', 'ev_ac', 'ev_fast'].includes(g.id)).map((g) => g.id);
    case 'hybrid':
    case 'ice':
      return relevant.filter((g) => ['ron95', 'ron98', 'diesel'].includes(g.id)).map((g) => g.id);
    case 'hydrogen':
      return relevant.filter((g) => g.id === 'hydrogen').map((g) => g.id);
    default:
      return relevant.map((g) => g.id);
  }
}
