import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type React from 'react';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { styles } from './AnalyticsFilterPillsBar.styles';

export type TimeRangeMode = 'may2025' | 'ytd' | '6months' | 'all' | 'custom';

export interface Props {
  timeRange: TimeRangeMode;
  onTimeRangeChange: (mode: TimeRangeMode) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
}

export const AnalyticsFilterPillsBar: React.FC<Props> = ({
  timeRange,
  onTimeRangeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <Select
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value as TimeRangeMode)}
          size="small"
          startAdornment={<CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />}
          sx={styles.select}
        >
          <MenuItem value="all">All Time</MenuItem>
          <MenuItem value="may2025">May 2025</MenuItem>
          <MenuItem value="ytd">Year to Date (YTD)</MenuItem>
          <MenuItem value="6months">Last 6 Months</MenuItem>
          <MenuItem value="custom">Custom Range...</MenuItem>
        </Select>
      </div>

      {timeRange === 'custom' && (
        <GlassCard style={styles.customRangeCard}>
          <TextField
            label="Start Date"
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={styles.dateInput}
          />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            to
          </Typography>
          <TextField
            label="End Date"
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={styles.dateInput}
          />
        </GlassCard>
      )}
    </div>
  );
};

export default AnalyticsFilterPillsBar;
