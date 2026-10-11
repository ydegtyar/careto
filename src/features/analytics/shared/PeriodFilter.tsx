import Button from '@mui/material/Button';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import type { CSSProperties } from 'react';
import { formatDatePreference, useDateFormatPreference } from '@/shared/lib/date-format-preference';

export type PeriodPreset = '1M' | '3M' | '6M' | '1Y' | 'all' | 'custom';

export interface PeriodFilterProps {
  currentPreset: PeriodPreset;
  from?: string;
  to?: string;
  onChange: (preset: PeriodPreset, from?: string, to?: string) => void;
}

const PRESETS: Array<{ id: PeriodPreset; label: string }> = [
  { id: '1M', label: '1M' },
  { id: '3M', label: '3M' },
  { id: '6M', label: '6M' },
  { id: '1Y', label: '1Y' },
  { id: 'all', label: 'All Time' },
];
const containerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  flexWrap: 'wrap',
  margin: '8px 0',
};

const pillsStyle: CSSProperties = {
  display: 'flex',
  background: 'rgba(15, 23, 42, 0.45)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: '16px',
  padding: '3px',
  border: '1px solid rgba(125, 211, 252, 0.08)',
  gap: '2px',
};
export function PeriodFilter({ currentPreset, from, to, onChange }: PeriodFilterProps) {
  const [dateFormat] = useDateFormatPreference();

  const handleSelectPreset = (preset: PeriodPreset) => {
    if (preset === 'all') {
      onChange('all', undefined, undefined);
      return;
    }

    const now = new Date();
    const toDate = now.toISOString().slice(0, 10);
    const fromObj = new Date(now);

    if (preset === '1M') fromObj.setMonth(now.getMonth() - 1);
    if (preset === '3M') fromObj.setMonth(now.getMonth() - 3);
    if (preset === '6M') fromObj.setMonth(now.getMonth() - 6);
    if (preset === '1Y') fromObj.setFullYear(now.getFullYear() - 1);

    const fromDate = fromObj.toISOString().slice(0, 10);
    onChange(preset, fromDate, toDate);
  };

  const formattedFrom = from ? formatDatePreference(from, dateFormat) : '';
  const formattedTo = to ? formatDatePreference(to, dateFormat) : '';

  return (
    <div style={containerStyle}>
      <div style={pillsStyle}>
        {PRESETS.map((p) => {
          const isActive = currentPreset === p.id;
          return (
            <Button
              key={p.id}
              onClick={() => handleSelectPreset(p.id)}
              size="small"
              sx={{
                borderRadius: '12px',
                minWidth: '40px',
                px: 1.2,
                py: 0.3,
                fontSize: '0.75rem',
                fontWeight: isActive ? 600 : 500,
                textTransform: 'none',
                backgroundColor: isActive ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: isActive ? '#7dd3fc' : '#94a3b8',
                border: isActive ? '1px solid rgba(125, 211, 252, 0.3)' : '1px solid transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#f8fafc',
                },
              }}
            >
              {p.label}
            </Button>
          );
        })}
      </div>

      {from && to && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.45)',
            padding: '4px 10px',
            borderRadius: '12px',
            border: '1px solid rgba(125, 211, 252, 0.08)',
            fontSize: '0.75rem',
            color: '#94a3b8',
          }}
        >
          <CalendarTodayIcon sx={{ fontSize: 13, color: '#7dd3fc' }} />
          <span>{formattedFrom} — {formattedTo}</span>
        </div>
      )}
    </div>
  );
}
