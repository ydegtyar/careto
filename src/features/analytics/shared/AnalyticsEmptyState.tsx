import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type { CSSProperties, ReactNode } from 'react';
import { styles } from './glacier.styles';

export interface Props {
  icon: ReactNode;
  title: string;
  description: string;
  isAllTime?: boolean;
  onSelectAllPeriod?: () => void;
  accentColor?: string;
}

export const AnalyticsEmptyState = ({
  icon,
  title,
  description,
  isAllTime = false,
  onSelectAllPeriod,
  accentColor = 'var(--mui-palette-primary-main)',
}: Props) => {
  const containerStyle: CSSProperties = {
    ...styles.glassCard,
    padding: '48px 24px',
    alignItems: 'center',
    textAlign: 'center',
    gap: '16px',
    width: '100%',
  };

  const iconBadgeStyle: CSSProperties = {
    width: '64px',
    height: '64px',
    borderRadius: '20px',
    background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
    border: `1px solid color-mix(in srgb, ${accentColor} 24%, transparent)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: accentColor,
    boxShadow: `0 0 24px color-mix(in srgb, ${accentColor} 16%, transparent)`,
    marginBottom: '4px',
  };

  return (
    <div style={containerStyle}>
      <div style={iconBadgeStyle}>{icon}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '440px' }}>
        <Typography
          sx={{
            fontSize: '1.15rem',
            fontWeight: 700,
            letterSpacing: '-0.3px',
            color: 'var(--mui-palette-text-primary)',
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.875rem',
            lineHeight: 1.6,
            color: 'var(--mui-palette-text-secondary)',
          }}
        >
          {description}
        </Typography>
      </div>

      {!isAllTime && onSelectAllPeriod && (
        <Button
          variant="outlined"
          startIcon={<CalendarTodayIcon sx={{ fontSize: 16 }} />}
          onClick={onSelectAllPeriod}
          sx={{
            mt: 1,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            borderColor: `color-mix(in srgb, ${accentColor} 35%, transparent)`,
            color: accentColor,
            '&:hover': {
              borderColor: accentColor,
              background: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
            },
          }}
        >
          View All Time
        </Button>
      )}
    </div>
  );
};
