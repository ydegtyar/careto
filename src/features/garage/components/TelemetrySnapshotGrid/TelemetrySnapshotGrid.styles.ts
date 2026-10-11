import type { CSSProperties } from 'react';

export const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 12,
  },
} as const satisfies Record<string, CSSProperties>;
