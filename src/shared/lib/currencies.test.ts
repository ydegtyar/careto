import { describe, expect, it } from 'vitest';
import { ALL_CURRENCIES, convertToUsdMinor } from './currencies';

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
});
