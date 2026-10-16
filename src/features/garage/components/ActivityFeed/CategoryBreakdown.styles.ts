import type { CSSProperties } from 'react';

export const getBreakdownSegmentStyle = (percentage: number, color: string): CSSProperties => ({
  width: `${percentage}%`,
  backgroundColor: color,
});

export const getBreakdownDotStyle = (color: string): CSSProperties => ({
  backgroundColor: color,
});
