import type React from 'react';
import type { ReactNode } from 'react';
import styles from './GlassCard.module.scss';

interface Props {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const GlassCard = ({ children, className, style, onClick }: Props) => (
  <div
    className={`${styles.root} ${className ?? ''}`}
    style={style}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
  >
    {children}
  </div>
);
