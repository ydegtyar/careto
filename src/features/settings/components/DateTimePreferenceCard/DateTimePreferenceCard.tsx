import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import type React from 'react';

import {
  DATE_FORMAT_OPTIONS,
  formatDatePreference,
  formatTimePreference,
  TIME_FORMAT_OPTIONS,
  useDateFormatPreference,
  useTimeFormatPreference,
} from '@/shared/lib/date-format-preference';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { cardStyle, headerContainerStyle } from './DateTimePreferenceCard.styles';

export const DateTimePreferenceCard: React.FC = () => {
  const [dateFormat, setDateFormat] = useDateFormatPreference();
  const [timeFormat, setTimeFormat] = useTimeFormatPreference();

  const now = new Date();

  return (
    <GlassCard style={cardStyle}>
      <div style={headerContainerStyle}>
        <AccessTimeIcon sx={{ color: 'primary.main', fontSize: 22 }} />
        <div>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Date & Time Format
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Customize display formats across app tables, entries, and dates
          </Typography>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
        {/* Date format selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Date Format
            </Typography>
          </div>
          <Select
            size="small"
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value as typeof dateFormat)}
            fullWidth
            aria-label="Date format preference selection"
            sx={{ borderRadius: 2 }}
          >
            {DATE_FORMAT_OPTIONS.map((opt) => (
              <MenuItem key={opt.id} value={opt.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    gap: 16,
                  }}
                >
                  <span>{opt.label}</span>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {opt.id === 'SYSTEM' ? formatDatePreference(now, 'SYSTEM') : opt.example}
                  </Typography>
                </div>
              </MenuItem>
            ))}
          </Select>
        </div>

        {/* Time format selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Time Format
            </Typography>
          </div>
          <Select
            size="small"
            value={timeFormat}
            onChange={(e) => setTimeFormat(e.target.value as typeof timeFormat)}
            fullWidth
            aria-label="Time format preference selection"
            sx={{ borderRadius: 2 }}
          >
            {TIME_FORMAT_OPTIONS.map((opt) => (
              <MenuItem key={opt.id} value={opt.id}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    gap: 16,
                  }}
                >
                  <span>{opt.label}</span>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {opt.id === 'SYSTEM' ? formatTimePreference(now, 'SYSTEM') : opt.example}
                  </Typography>
                </div>
              </MenuItem>
            ))}
          </Select>
        </div>

        {/* Live Preview */}
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Preview:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
            {formatDatePreference(now, dateFormat)} {formatTimePreference(now, timeFormat)}
          </Typography>
        </div>
      </div>
    </GlassCard>
  );
};

export default DateTimePreferenceCard;
