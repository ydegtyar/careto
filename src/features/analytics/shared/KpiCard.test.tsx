import { describe, expect, it } from 'vitest';
import { KpiCard } from './KpiCard';

describe('KpiCard', () => {
  it('is exported as a function component', () => {
    expect(KpiCard).toBeDefined();
    expect(typeof KpiCard).toBe('function');
  });

  it('renders static title and submetric labels when loading', () => {
    const element = KpiCard({
      title: 'Total Cost',
      value: null,
      isLoading: true,
      subMetrics: [
        { label: 'Per day', value: null },
        { label: 'Per km', value: null },
      ],
    });

    expect(element).toBeDefined();
    // Verify JSX children hierarchy contains static texts
    const jsonStr = JSON.stringify(element);
    expect(jsonStr).toContain('Total Cost');
    expect(jsonStr).toContain('Per day');
    expect(jsonStr).toContain('Per km');
  });
});
