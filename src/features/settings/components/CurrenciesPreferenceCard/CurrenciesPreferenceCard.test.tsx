import { describe, expect, it } from 'vitest';
import { CurrenciesPreferenceCard } from './CurrenciesPreferenceCard';
import {
  baseCurrencyHeaderStyle,
  baseCurrencySectionStyle,
  cardStyle,
  chipsContainerStyle,
  headerContainerStyle,
  selectSx,
} from './CurrenciesPreferenceCard.styles';

describe('CurrenciesPreferenceCard component and styles', () => {
  it('is exported as a function component', () => {
    expect(CurrenciesPreferenceCard).toBeDefined();
    expect(typeof CurrenciesPreferenceCard).toBe('function');
  });

  it('exports appropriate card and layout styles', () => {
    expect(cardStyle.display).toBe('flex');
    expect(cardStyle.padding).toBe(16);
    expect(headerContainerStyle.display).toBe('flex');
    expect(chipsContainerStyle.display).toBe('flex');
    expect(baseCurrencySectionStyle.display).toBe('flex');
    expect(baseCurrencyHeaderStyle.display).toBe('flex');
    expect(selectSx).toHaveProperty('borderRadius', 2);
  });
});
