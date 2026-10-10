import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type React from 'react';
import { useRef, useState } from 'react';
import { type ExpenseParseResult, parseImageWithAi } from '@/features/ai/lib/ai-client';
import {
  ALL_CURRENCIES,
  useFavoriteCurrencies,
  useLastUsedCurrency,
  useLastUsedPaymentMethod,
} from '@/shared/lib/currencies';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { styles } from './HeroAmountPaymentCard.styles';
import { PaymentMethodSelector } from './PaymentMethodSelector';

export interface Props {
  amount: string;
  onAmountChange: (val: string) => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  showCompanyOption?: boolean;
  onAiParsed?: (data: ExpenseParseResult) => void;
}

export const HeroAmountPaymentCard: React.FC<Props> = ({
  amount,
  onAmountChange,
  currency,
  onCurrencyChange,
  paymentMethod,
  onPaymentMethodChange,
  showCompanyOption = true,
  onAiParsed,
}) => {
  const [favoriteCurrencies] = useFavoriteCurrencies();
  const [, setLastUsedCurrency] = useLastUsedCurrency();
  const [, setLastUsedPaymentMethod] = useLastUsedPaymentMethod();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleCurrencySelect = (newCurrency: string) => {
    onCurrencyChange(newCurrency);
    setLastUsedCurrency(newCurrency);
  };

  const handlePaymentSelect = (method: string) => {
    onPaymentMethodChange(method);
    setLastUsedPaymentMethod(method);
  };

  const handleAiFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiLoading(true);
    try {
      const res = await parseImageWithAi('expense', file);
      if (res.success && res.data && onAiParsed) {
        onAiParsed(res.data);
      }
    } catch (err) {
      console.error('Failed to parse receipt image:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const currencySymbol = ALL_CURRENCIES.find((c) => c.code === currency)?.symbol ?? '$';

  return (
    <GlassCard style={styles.card}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleAiFileSelect}
      />
      <div style={styles.header}>
        <Typography
          variant="caption"
          sx={{
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: 'text.secondary',
            fontWeight: 600,
          }}
        >
          Amount Spent
        </Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {onAiParsed && (
            <Tooltip title="AI Autofill from receipt">
              <span>
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={aiLoading}
                  sx={{
                    color: 'primary.main',
                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(56, 189, 248, 0.2)',
                    },
                  }}
                >
                  {aiLoading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <AutoAwesomeIcon fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          )}
          <FormControl size="small" variant="outlined" sx={{ minWidth: 80 }}>
            <Select
              value={currency}
              onChange={(e) => handleCurrencySelect(e.target.value)}
              disableUnderline
            >
              {favoriteCurrencies.map((code) => (
                <MenuItem key={code} value={code}>
                  {code}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      <div style={styles.amountRow}>
        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 300, opacity: 0.8 }}>
          {currencySymbol}
        </Typography>
        <input
          type="number"
          step="0.01"
          min="0.01"
          inputMode="decimal"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0.00"
          style={styles.amountInput}
        />
      </div>

      {/* Payment Method Selector (Button Group with Icons) */}
      <PaymentMethodSelector
        paymentMethod={paymentMethod}
        onPaymentMethodChange={handlePaymentSelect}
        showCompanyOption={showCompanyOption}
      />
    </GlassCard>
  );
};

export default HeroAmountPaymentCard;
