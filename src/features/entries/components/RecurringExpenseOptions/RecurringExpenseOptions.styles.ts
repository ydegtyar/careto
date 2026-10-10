import type { CSSProperties } from 'react';

export const styles = {
  card: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  description: {
    color: 'text.secondary',
    display: 'block',
    fontSize: '0.7rem',
  },
  intervalRow: {
    display: 'flex',
    gap: 8,
    paddingTop: 4,
  },
  sinkingFundRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  sinkingFundLabel: {
    color: 'text.primary',
    fontSize: '0.75rem',
  },
} as const satisfies Record<string, CSSProperties>;
