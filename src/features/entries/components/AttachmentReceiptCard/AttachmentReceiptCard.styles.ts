import type { SxProps, Theme } from '@mui/material/styles';
import type { CSSProperties } from 'react';

export const styles = {
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
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  } satisfies CSSProperties,
  headerIcon: {
    fontSize: 17,
    color: 'primary.main',
  } satisfies SxProps<Theme>,
  headerTitle: {
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 700,
    color: 'text.primary',
    fontSize: '0.72rem',
  } satisfies SxProps<Theme>,
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  } satisfies CSSProperties,
  deleteIcon: {
    fontSize: 15,
  } satisfies SxProps<Theme>,
  receiptImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.85,
  } satisfies CSSProperties,
  zoomIcon: {
    fontSize: 18,
    color: 'primary.main',
  } satisfies SxProps<Theme>,
  receiptInfoGroup: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    flex: 1,
  } satisfies CSSProperties,
  receiptTitle: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--mui-palette-text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } satisfies CSSProperties,
  receiptSubtitle: {
    fontSize: '0.68rem',
    color: 'var(--mui-palette-text-secondary)',
    marginTop: 2,
  } satisfies CSSProperties,
  viewFullscreenLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: '0.72rem',
    color: 'var(--mui-palette-primary-main)',
    fontWeight: 600,
    marginTop: 6,
  } satisfies CSSProperties,
  linkIcon: {
    fontSize: 12,
  } satisfies SxProps<Theme>,
  lightboxTopBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '8px 12px',
  } satisfies CSSProperties,
  lightboxContent: {
    padding: '0 16px 16px 16px',
    display: 'flex',
    justifyContent: 'center',
  } satisfies CSSProperties,
  lightboxImg: {
    maxWidth: '100%',
    maxHeight: '75vh',
    objectFit: 'contain',
    borderRadius: 8,
  } satisfies CSSProperties,
} as const;
