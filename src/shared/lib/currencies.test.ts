import { describe, expect, it } from 'vitest';
import { ALL_CURRENCIES, convertCurrency, convertToUsdMinor } from './currencies';

describe('currencies module', () => {
  it('includes UAH and ALL in ALL_CURRENCIES', () => {
    const codes = ALL_CURRENCIES.map((c) => c.code);
    expect(codes).toContain('UAH');
    expect(codes).toContain('ALL');
  });

  it('converts amounts to USD minor units correctly', () => {
    // 100 USD minor units = 100
    expect(convertToUsdMinor(10000, 'USD')).toBe(10000);

    // 100 EUR minor units -> EUR rate ~0.925 => 10000 / 0.925 ~ 10811
    expect(convertToUsdMinor(10000, 'EUR')).toBe(10811);

    // UAH: 41500 UAH minor units (415 UAH) -> UAH rate ~41.5 => 41500 / 41.5 = 1000 USD minor ($10.00)
    expect(convertToUsdMinor(41500, 'UAH')).toBe(1000);

    // Custom explicit FX rate parameter
    expect(convertToUsdMinor(10000, 'EUR', 1.1)).toBe(11000);
  });

  it('converts amounts between arbitrary currencies correctly using convertCurrency', () => {
    // Identity conversion
    expect(convertCurrency(50, 'EUR', 'EUR')).toBe(50);

    // USD to EUR: 100 USD -> 100 * 0.925 = 92.5 EUR
    expect(convertCurrency(100, 'USD', 'EUR')).toBeCloseTo(92.5, 2);

    // EUR to USD: 92.5 EUR -> 92.5 / 0.925 = 100 USD
    expect(convertCurrency(92.5, 'EUR', 'USD')).toBeCloseTo(100, 2);

    // EUR to UAH: 1 EUR -> (1 / 0.925) * 41.5 ~ 44.86 UAH
    expect(convertCurrency(1, 'EUR', 'UAH')).toBeCloseTo(44.86, 1);
  });
});
