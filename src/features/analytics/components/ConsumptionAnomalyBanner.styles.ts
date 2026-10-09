import type { CSSProperties } from 'react';

export const styles = {
  card: {
    padding: 16,
    border: '1px solid rgba(251, 191, 36, 0.3)',
    backgroundColor: 'rgba(251, 191, 36, 0.04)',
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
    backgroundColor: 'rgba(15, 21, 36, 0.6)',
    padding: '10px 12px',
    borderRadius: 10,
    marginTop: 12,
    border: '1px solid rgba(125, 211, 252, 0.1)',
  },
  actionsRow: {
    display: 'flex',
    gap: 10,
    marginTop: 12,
  },
} as const satisfies Record<string, CSSProperties>;
