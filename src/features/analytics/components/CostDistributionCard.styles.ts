import type { CSSProperties } from 'react';

export const styles = {
  card: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  donutContainer: {
    flex: 1,
  },
  legendList: {
    flex: 1.2,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  legendItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
} as const satisfies Record<string, CSSProperties>;
