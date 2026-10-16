import { describe, expect, it, vi } from 'vitest';
import { AnalyticsEmptyState } from './AnalyticsEmptyState';

describe('AnalyticsEmptyState', () => {
  it('is exported as a function component', () => {
    expect(AnalyticsEmptyState).toBeDefined();
    expect(typeof AnalyticsEmptyState).toBe('function');
  });

  it('renders title, description and button when not all-time', () => {
    const onSelectAllPeriod = vi.fn();
    const element = AnalyticsEmptyState({
      icon: <span>icon</span>,
      title: 'No refueling records in this period',
      description: 'Switch to All Time to view history.',
      isAllTime: false,
      onSelectAllPeriod,
    });

    const jsonStr = JSON.stringify(element);
    expect(jsonStr).toContain('No refueling records in this period');
    expect(jsonStr).toContain('Switch to All Time to view history.');
    expect(jsonStr).toContain('View All Time');
  });

  it('does not render View All Time button when isAllTime is true', () => {
    const element = AnalyticsEmptyState({
      icon: <span>icon</span>,
      title: 'No historical refueling records',
      description: 'No entries have been logged yet.',
      isAllTime: true,
    });

    const jsonStr = JSON.stringify(element);
    expect(jsonStr).toContain('No historical refueling records');
    expect(jsonStr).toContain('No entries have been logged yet.');
    expect(jsonStr).not.toContain('View All Time');
  });
});
