import type { CSSProperties } from 'react';

export const styles = {
  menuPaper: {
    backgroundColor: '#0f1524',
    backgroundImage: 'none',
    border: '1px solid rgba(125, 211, 252, 0.2)',
    borderRadius: '12px',
    color: '#e0e8f0',
    minWidth: '200px',
  } as CSSProperties,

  userInfoHeader: {
    padding: '10px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  } as CSSProperties,

  userName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#f8fafc',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as CSSProperties,

  userEmail: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as CSSProperties,

  avatar: {
    width: 30,
    height: 30,
    backgroundColor: 'rgba(125, 211, 252, 0.2)',
    color: 'primary.main',
    fontSize: '0.85rem',
    fontWeight: 700,
    border: '1px solid rgba(125, 211, 252, 0.4)',
  } as CSSProperties,
};
