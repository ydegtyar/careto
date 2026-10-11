import Button from '@mui/material/Button';
import type { CSSProperties } from 'react';

export type AnalyticsTab = 'general' | 'refueling' | 'services' | 'expenses';

export interface AnalyticsTabsProps {
  currentTab: AnalyticsTab;
  onChange: (tab: AnalyticsTab) => void;
}

const TABS: Array<{ id: AnalyticsTab; label: string }> = [
  { id: 'general', label: 'General' },
  { id: 'refueling', label: 'Refueling' },
  { id: 'services', label: 'Services' },
  { id: 'expenses', label: 'Expenses' },
];

export function AnalyticsTabs({ currentTab, onChange }: AnalyticsTabsProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    background: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '24px',
    padding: '4px',
    border: '1px solid rgba(125, 211, 252, 0.1)',
    gap: '4px',
    width: '100%',
    overflowX: 'auto',
    scrollbarWidth: 'none',
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
            sx={{
              flex: 1,
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.85rem',
              py: '6px',
              minWidth: '80px',
              backgroundColor: isActive ? '#38bdf8' : 'transparent',
              color: isActive ? '#0f172a' : '#94a3b8',
              boxShadow: isActive ? '0 0 16px rgba(56, 189, 248, 0.4)' : 'none',
              '&:hover': {
                backgroundColor: isActive ? '#7dd3fc' : 'rgba(255, 255, 255, 0.05)',
                color: isActive ? '#0f172a' : '#f8fafc',
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
