import { useLocalStorage } from 'usehooks-ts';

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

export const ALL_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
  { code: 'ALL', name: 'Albanian Lek', symbol: 'L' },
];

export const DEFAULT_FAVORITE_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'UAH', 'ALL'];
export const DEFAULT_CURRENCY = 'EUR';

export const FAVORITE_CURRENCIES_KEY = 'careto_favorite_currencies';
export const LAST_USED_CURRENCY_KEY = 'careto_last_used_currency';
export const LAST_USED_PAYMENT_METHOD_KEY = 'careto_last_used_payment_method';

export function useFavoriteCurrencies() {
  return useLocalStorage<string[]>(FAVORITE_CURRENCIES_KEY, DEFAULT_FAVORITE_CURRENCIES, {
    initializeWithValue: false,
  });
}

export function useLastUsedCurrency() {
  return useLocalStorage<string>(LAST_USED_CURRENCY_KEY, DEFAULT_CURRENCY, {
    initializeWithValue: false,
  });
}

export function useLastUsedPaymentMethod() {
  return useLocalStorage<string>(LAST_USED_PAYMENT_METHOD_KEY, 'card', {
    initializeWithValue: false,
  });
}

// Fixed FX rate approximations relative to USD as a fallback for standard conversion calculations.
const USD_FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.925,
  GBP: 0.787,
  CAD: 1.36,
  UAH: 41.5,
  ALL: 91.2,
};

/**
 * Converts minor units in a given currency to USD minor units based on current/fallback exchange rates.
 */
export function convertToUsdMinor(
  amountMinor: number,
  currencyCode: string,
  fxRateToUsd?: number,
): number {
  if (!amountMinor || Number.isNaN(amountMinor)) return 0;
  if (currencyCode === 'USD') return Math.round(amountMinor);

  if (fxRateToUsd && fxRateToUsd > 0) {
    return Math.round(amountMinor * fxRateToUsd);
  }

  const rate = USD_FALLBACK_RATES[currencyCode.toUpperCase()] ?? 1.0;
  // rate is (Foreign Currency / USD). USD = Foreign Amount / rate
  return Math.round(amountMinor / rate);
}

/**
 * Converts a numeric amount from one currency to another using fallback FX rates.
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
): number {
  if (!amount || Number.isNaN(amount)) return 0;
  const fromCode = fromCurrency.toUpperCase();
  const toCode = toCurrency.toUpperCase();
  if (fromCode === toCode) return amount;

  const fromRate = USD_FALLBACK_RATES[fromCode] ?? 1.0;
  const toRate = USD_FALLBACK_RATES[toCode] ?? 1.0;

  // Amount in USD = amount / fromRate
  // Amount in toCurrency = (amount / fromRate) * toRate
  return (amount / fromRate) * toRate;
}

export interface FormattableAmount {
  amount_minor?: number | null;
  currency?: string | null;
}

/**
 * Formats minor currency units into a human-readable string with currency code.
 */
export function formatAmount(entry: FormattableAmount): string {
  if (!entry.amount_minor || !entry.currency) return '';
  return `${(entry.amount_minor / 100).toFixed(2)} ${entry.currency}`;
}
