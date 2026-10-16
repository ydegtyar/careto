import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { isValidElement, type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { MonthlyComparisonBadge } from './MonthlyComparisonBadge';
import { styles as iconStyles } from './MonthlyComparisonBadge.styles';

interface BadgeElementProps {
  children: [ReactElement<{ sx: unknown }>, ReactElement<{ children: unknown }>];
  title?: string;
}

describe('MonthlyComparisonBadge', () => {
  it('is exported as a function component', () => {
    expect(MonthlyComparisonBadge).toBeDefined();
    expect(typeof MonthlyComparisonBadge).toBe('function');
  });

  it('renders "No prior data" with TrendingFlatIcon when costDiffPercent is null', () => {
    const el = MonthlyComparisonBadge({ costDiffPercent: null });
    expect(isValidElement(el)).toBe(true);
    if (!isValidElement<BadgeElementProps>(el)) return;
    const [icon, label] = el.props.children;
    expect(icon.type).toBe(TrendingFlatIcon);
    expect(icon.props.sx).toEqual(iconStyles.icon);
    expect(label.props.children).toBe('No prior data');
  });

  it('renders "0% vs last mo" with TrendingFlatIcon when costDiffPercent is 0', () => {
    const el = MonthlyComparisonBadge({ costDiffPercent: 0 });
    expect(isValidElement(el)).toBe(true);
    if (!isValidElement<BadgeElementProps>(el)) return;
    const [icon, label] = el.props.children;
    expect(icon.type).toBe(TrendingFlatIcon);
    expect(icon.props.sx).toEqual(iconStyles.icon);
    expect(label.props.children).toBe('0% vs last mo');
  });

  it('renders positive diff with TrendingUpIcon and plus sign', () => {
    const el = MonthlyComparisonBadge({ costDiffPercent: 15 });
    expect(isValidElement(el)).toBe(true);
    if (!isValidElement<BadgeElementProps>(el)) return;
    const [icon, label] = el.props.children;
    expect(icon.type).toBe(TrendingUpIcon);
    expect(icon.props.sx).toEqual(iconStyles.icon);
    expect(label.props.children).toEqual(['+15%', ' vs last mo']);
    expect(el.props.title).toBe('+15% spend vs previous month');
  });

  it('renders negative diff with TrendingDownIcon', () => {
    const el = MonthlyComparisonBadge({ costDiffPercent: -10 });
    expect(isValidElement(el)).toBe(true);
    if (!isValidElement<BadgeElementProps>(el)) return;
    const [icon, label] = el.props.children;
    expect(icon.type).toBe(TrendingDownIcon);
    expect(icon.props.sx).toEqual(iconStyles.icon);
    expect(label.props.children).toEqual(['-10%', ' vs last mo']);
    expect(el.props.title).toBe('-10% spend vs previous month');
  });

  it('exports styles with fontSize 13', () => {
    expect(iconStyles.icon).toBeDefined();
    expect(iconStyles.icon.fontSize).toBe(13);
  });
});
