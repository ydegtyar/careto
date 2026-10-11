import Button from '@mui/material/Button';
import GridView from '@mui/icons-material/GridView';
import LocalGasStation from '@mui/icons-material/LocalGasStation';
import Build from '@mui/icons-material/Build';
import ReceiptLong from '@mui/icons-material/ReceiptLong';
import type React from 'react';
import type { CSSProperties } from 'react';

export type AnalyticsTab = 'general' | 'refueling' | 'services' ;

export interface AnalyticsTabsProps {
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

export function AnalyticsTabs({ currentTab, onChange }: AnalyticsTabsProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '28px',
    padding: '4px',
    border: '1px solid rgba(125, 211, 252, 0.1)',
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
              backgroundColor: isActive ? '#7dd3fc' : 'transparent',
              color: isActive ? '#0f172a' : '#94a3b8',
              boxShadow: isActive ? '0 0 18px rgba(125, 211, 252, 0.35)' : 'none',
              '& .MuiButton-startIcon': {
                mr: '6px',
                color: isActive ? '#0f172a' : '#94a3b8',
              },
              '&:hover': {
                backgroundColor: isActive ? '#bae6fd' : 'rgba(255, 255, 255, 0.06)',
                color: isActive ? '#0f172a' : '#f8fafc',
                '& .MuiButton-startIcon': {
                  color: isActive ? '#0f172a' : '#f8fafc',
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

