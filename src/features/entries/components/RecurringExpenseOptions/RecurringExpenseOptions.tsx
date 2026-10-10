import AutorenewIcon from '@mui/icons-material/Autorenew';
import SavingsIcon from '@mui/icons-material/Savings';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import type React from 'react';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { RecurringIntervalButton } from '../RecurringIntervalButton/RecurringIntervalButton';
import { styles } from './RecurringExpenseOptions.styles';

export interface Props {
  isRecurring: boolean;
  onRecurringChange: (val: boolean) => void;
  recurringInterval: string;
  onIntervalChange: (val: string) => void;
  useSinkingFund: boolean;
  onSinkingFundChange: (val: boolean) => void;
}

export const RecurringExpenseOptions: React.FC<Props> = ({
  isRecurring,
  onRecurringChange,
  recurringInterval,
  onIntervalChange,
  useSinkingFund,
  onSinkingFundChange,
}) => {
  return (
    <GlassCard style={styles.card}>
      <div style={styles.headerRow}>
        <div style={styles.labelGroup}>
          <AutorenewIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
          <div>
            <Typography variant="body2" sx={styles.title}>
              Recurring Expense
            </Typography>
            <Typography variant="caption" sx={styles.description}>
              Parking spot rental, dashcam SIM, etc.
            </Typography>
          </div>
        </div>
        <Switch
          checked={isRecurring}
          onChange={(e) => onRecurringChange(e.target.checked)}
          color="primary"
          size="small"
        />
      </div>

      {isRecurring && (
        <div style={styles.intervalRow}>
          {['monthly', 'quarterly', 'annual'].map((inv) => (
            <RecurringIntervalButton
              key={inv}
              inv={inv}
              isSelected={recurringInterval === inv}
              onSelect={onIntervalChange}
            />
          ))}
        </div>
      )}

      <div style={styles.sinkingFundRow}>
        <div style={styles.labelGroup}>
          <SavingsIcon sx={{ color: 'tertiary.main', fontSize: 18 }} />
          <Typography variant="caption" sx={styles.sinkingFundLabel}>
            Fund via Vehicle Sinking Reserve
          </Typography>
        </div>
        <FormControlLabel
          control={
            <Switch
              checked={useSinkingFund}
              onChange={(e) => onSinkingFundChange(e.target.checked)}
              color="primary"
              size="small"
            />
          }
          label=""
          sx={{ margin: 0 }}
        />
      </div>
    </GlassCard>
  );
};

export default RecurringExpenseOptions;
