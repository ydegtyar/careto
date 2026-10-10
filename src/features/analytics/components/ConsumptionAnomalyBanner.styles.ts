import type { CSSProperties } from 'react';

export const styles = {
  card: {
    padding: 16,
    border:
      '1px solid color-mix(in srgb, var(--mui-palette-warning-main, #fbbf24) 40%, transparent)',
    backgroundColor: 'color-mix(in srgb, var(--mui-palette-warning-main, #fbbf24) 8%, transparent)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleGroup: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  recBox: {
    backgroundColor: 'color-mix(in srgb, var(--mui-palette-action-hover, #000000) 5%, transparent)',
    padding: '10px 12px',
    borderRadius: 10,
    marginTop: 12,
    border: '1px solid var(--mui-palette-divider, rgba(125, 211, 252, 0.15))',
  },
  actionsRow: {
    display: 'flex',
    gap: 10,
    marginTop: 12,
  },
} as const satisfies Record<string, CSSProperties>;
