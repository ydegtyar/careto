import { isValidElement, type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { KindIcon } from './KindIcon';
import { styles } from './KindIcon.styles';

interface IconElementProps {
  sx?: unknown;
}

describe('KindIcon', () => {
  it('is exported as a function component', () => {
    expect(KindIcon).toBeDefined();
    expect(typeof KindIcon).toBe('function');
  });

  it('renders expected icon components based on kind', () => {
    const refuelEl = KindIcon({ kind: 'refuel' });
    expect(isValidElement(refuelEl)).toBe(true);
    if (!isValidElement<IconElementProps>(refuelEl)) return;
    expect(refuelEl.props.sx).toEqual(styles.icon);

    const chargeEl = KindIcon({ kind: 'charge' });
    expect(isValidElement(chargeEl)).toBe(true);
    if (!isValidElement<IconElementProps>(chargeEl)) return;
    expect(chargeEl.type).toBe(refuelEl.type);

    const serviceEl = KindIcon({ kind: 'service' });
    expect(isValidElement(serviceEl)).toBe(true);
    if (!isValidElement<IconElementProps>(serviceEl)) return;
    expect(serviceEl.props.sx).toEqual(styles.icon);

    const odometerEl = KindIcon({ kind: 'odometer' });
    expect(isValidElement(odometerEl)).toBe(true);
    if (!isValidElement<IconElementProps>(odometerEl)) return;
    expect(odometerEl.props.sx).toEqual(styles.icon);

    const noteEl = KindIcon({ kind: 'note' });
    expect(isValidElement(noteEl)).toBe(true);
    if (!isValidElement<IconElementProps>(noteEl)) return;
    expect(noteEl.props.sx).toEqual(styles.icon);

    const expenseEl = KindIcon({ kind: 'expense' });
    expect(isValidElement(expenseEl)).toBe(true);
    if (!isValidElement<IconElementProps>(expenseEl)) return;
    expect(expenseEl.props.sx).toEqual(styles.icon);
  });

  it('exports styles with fontSize 18', () => {
    expect(styles.icon).toBeDefined();
    expect(styles.icon.fontSize).toBe(18);
  });
});
