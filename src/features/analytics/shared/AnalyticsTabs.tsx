import Build from '@mui/icons-material/Build';
import GridView from '@mui/icons-material/GridView';
import LocalGasStation from '@mui/icons-material/LocalGasStation';
import ReceiptLong from '@mui/icons-material/ReceiptLong';
import Button from '@mui/material/Button';
import type React from 'react';
import type { CSSProperties } from 'react';

export type AnalyticsTab = 'general' | 'refueling' | 'services';

export interface Props {
  currentTab: AnalyticsTab;
  onChange: (tab: AnalyticsTab) => void;
}

interface TabDefinition {
  id: AnalyticsTab;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDefinition[] = [
  {
    id: 'general',
    label: 'General',
    icon: <GridView sx={{ fontSize: 18 }} />,
  },
  {
    id: 'refueling',
    label: 'Refueling',
    icon: <LocalGasStation sx={{ fontSize: 18 }} />,
  },
  {
    id: 'services',
    label: 'Services',
    icon: <Build sx={{ fontSize: 18 }} />,
  },
];

export const AnalyticsTabs = ({ currentTab, onChange }: Props) => {
  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    background: 'color-mix(in srgb, var(--mui-palette-background-paper) 60%, transparent)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '28px',
    padding: '4px',
    border: '1px solid color-mix(in srgb, var(--mui-palette-primary-main) 16%, transparent)',
    gap: '6px',
    width: '100%',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={containerStyle}>
      {TABS.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <Button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            variant={isActive ? 'contained' : 'text'}
            size="small"
            startIcon={tab.icon}
            sx={{
              flex: '1 0 auto',
              borderRadius: '24px',
              textTransform: 'none',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.88rem',
              py: '7px',
              px: { xs: '14px', sm: '18px' },
              whiteSpace: 'nowrap',
              backgroundColor: isActive ? 'var(--mui-palette-primary-main)' : 'transparent',
              color: isActive
                ? 'var(--mui-palette-primary-contrastText)'
                : 'var(--mui-palette-text-secondary)',
              boxShadow: isActive
                ? '0 0 16px color-mix(in srgb, var(--mui-palette-primary-main) 35%, transparent)'
                : 'none',
              '& .MuiButton-startIcon': {
                mr: '6px',
                color: isActive
                  ? 'var(--mui-palette-primary-contrastText)'
                  : 'var(--mui-palette-text-secondary)',
              },
              '&:hover': {
                backgroundColor: isActive
                  ? 'color-mix(in srgb, var(--mui-palette-primary-main) 85%, transparent)'
                  : 'color-mix(in srgb, var(--mui-palette-primary-main) 10%, transparent)',
                color: isActive
                  ? 'var(--mui-palette-primary-contrastText)'
                  : 'var(--mui-palette-text-primary)',
                '& .MuiButton-startIcon': {
                  color: isActive
                    ? 'var(--mui-palette-primary-contrastText)'
                    : 'var(--mui-palette-text-primary)',
                },
              },
            }}
          >
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}
