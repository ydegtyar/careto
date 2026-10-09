import type { CSSProperties } from 'react';

export const styles = {
  card: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  actionsRow: {
    display: 'flex',
    gap: 8,
    marginTop: 4,
  },
  pdfButton: {
    borderRadius: 3,
    height: 44,
    backgroundColor: 'primary.main',
    color: 'primary.contrastText',
    textTransform: 'none',
    fontWeight: 700,
    fontSize: '0.85rem',
  },
  csvButton: {
    borderRadius: 3,
    height: 44,
    borderColor: 'rgba(125, 211, 252, 0.3)',
    color: 'primary.main',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.85rem',
    px: 2,
  },
} as const satisfies Record<string, CSSProperties | Record<string, unknown>>;
