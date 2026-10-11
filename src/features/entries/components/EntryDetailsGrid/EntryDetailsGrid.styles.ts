import type { CSSProperties } from 'react';

export const styles = {
  detailsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    width: '100%',
  } satisfies CSSProperties,

  fullWidthSpan: {
    width: '100%',
  } satisfies CSSProperties,

  card: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  } satisfies CSSProperties,

  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } satisfies CSSProperties,

  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  } satisfies CSSProperties,

  fullTankPill: (isFullTank: boolean): CSSProperties => ({
    fontSize: '0.68rem',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 9999,
    backgroundColor: isFullTank ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)',
    color: isFullTank ? '#34d399' : '#fbbf24',
  }),

  fuelStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
    gap: 10,
  } satisfies CSSProperties,

  statBox: {
    padding: '8px 10px',
    borderRadius: 10,
    backgroundColor: 'rgba(17, 24, 40, 0.7)',
  } satisfies CSSProperties,

  statLabel: {
    fontSize: '0.65rem',
    color: 'var(--mui-palette-text-secondary)',
  } satisfies CSSProperties,

  statValue: {
    margin: '2px 0 0 0',
    fontSize: '0.82rem',
    fontWeight: 600,
  } satisfies CSSProperties,

  countBadge: {
    fontSize: '0.68rem',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 9999,
    backgroundColor: 'rgba(32, 44, 66, 0.8)',
    color: '#7dd3fc',
  } satisfies CSSProperties,

  serviceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  } satisfies CSSProperties,

  serviceItemRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: 12,
    backgroundColor: 'rgba(17, 24, 40, 0.75)',
    gap: 12,
  } satisfies CSSProperties,

  serviceItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
    flex: 1,
  } satisfies CSSProperties,

  serviceItemIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(32, 44, 66, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#7dd3fc',
    flexShrink: 0,
  } satisfies CSSProperties,

  serviceItemInfo: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  } satisfies CSSProperties,

  serviceItemTitle: {
    fontSize: '0.78rem',
    fontWeight: 500,
    color: 'var(--mui-palette-text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } satisfies CSSProperties,

  serviceItemPartNum: {
    fontSize: '0.65rem',
    color: 'var(--mui-palette-text-secondary)',
    marginTop: 1,
  } satisfies CSSProperties,

  serviceItemCostWrapper: {
    textAlign: 'right',
    flexShrink: 0,
  } satisfies CSSProperties,

  serviceItemCost: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--mui-palette-text-primary)',
  } satisfies CSSProperties,

  subtotalStrip: {
    paddingTop: 8,
    borderTop: '1px solid rgba(125, 211, 252, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: '0.72rem',
    color: 'var(--mui-palette-text-secondary)',
  } satisfies CSSProperties,

  subtotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } satisfies CSSProperties,

  netTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
    fontWeight: 700,
    fontSize: '0.78rem',
    color: 'var(--mui-palette-text-primary)',
  } satisfies CSSProperties,

  businessBadge: {
    fontSize: '0.65rem',
    fontWeight: 500,
    padding: '2px 8px',
    borderRadius: 9999,
    backgroundColor: 'rgba(26, 58, 78, 0.5)',
    color: '#88b4cc',
  } satisfies CSSProperties,

  vendorBeaconBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(17, 24, 40, 0.7)',
  } satisfies CSSProperties,

  vendorBeaconIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(14, 77, 110, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#7dd3fc',
    flexShrink: 0,
    marginTop: 2,
  } satisfies CSSProperties,

  mapsLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    padding: '9px 12px',
    borderRadius: 12,
    backgroundColor: 'rgba(26, 36, 56, 0.6)',
    color: '#7dd3fc',
    fontSize: '0.75rem',
    fontWeight: 600,
    textDecoration: 'none',
    boxSizing: 'border-box',
    transition: 'background-color 0.2s ease',
  } satisfies CSSProperties,

  memoContainer: {
    padding: '12px 14px',
    borderRadius: 12,
    backgroundColor: 'rgba(17, 24, 40, 0.7)',
  } satisfies CSSProperties,

  memoText: {
    margin: 0,
    fontSize: '0.78rem',
    color: 'var(--mui-palette-text-primary)',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  } satisfies CSSProperties,

  attachmentCardInteractive: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    cursor: 'pointer',
    padding: 12,
    backgroundColor: 'rgba(17, 24, 40, 0.8)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    border: '1px solid rgba(125, 211, 252, 0.1)',
  } satisfies CSSProperties,

  attachmentThumbnailBox: {
    position: 'relative',
    width: 56,
    height: 64,
    borderRadius: 8,
    backgroundColor: 'rgba(32, 44, 66, 0.8)',
    overflow: 'hidden',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies CSSProperties,

  attachmentZoomOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(14, 77, 110, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies CSSProperties,

  attachmentBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: '0.65rem',
    fontWeight: 600,
    color: '#7dd3fc',
    padding: '2px 8px',
    borderRadius: 9999,
    backgroundColor: 'rgba(14, 77, 110, 0.35)',
  } satisfies CSSProperties,

  attachmentRemoveButton: {
    color: 'error.main',
    padding: '4px',
    backgroundColor: 'rgba(61, 20, 20, 0.4)',
    border: '1px solid rgba(255, 107, 107, 0.2)',
    '&:hover': {
      backgroundColor: 'rgba(61, 20, 20, 0.7)',
    },
  },
};
