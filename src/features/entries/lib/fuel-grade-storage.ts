import { useLocalStorage } from 'usehooks-ts';

export const LAST_USED_FUEL_GRADE_KEY = 'careto_last_used_fuel_grade';
export const LAST_PRICES_PER_FUEL_GRADE_KEY = 'careto_last_prices_per_fuel_grade';

export const DEFAULT_PRICES_PER_GRADE: Record<string, string> = {
  ron95: '1.85',
  ron98: '2.05',
  diesel: '1.75',
  premium_diesel: '1.95',
  ev_fast: '0.65',
  ev_ac: '0.45',
};

export function useLastUsedFuelGrade() {
  return useLocalStorage<string>(LAST_USED_FUEL_GRADE_KEY, 'ron95');
}

export function useLastPricesPerFuelGrade() {
  return useLocalStorage<Record<string, string>>(
    LAST_PRICES_PER_FUEL_GRADE_KEY,
    DEFAULT_PRICES_PER_GRADE,
  );
}
