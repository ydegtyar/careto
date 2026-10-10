import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import type React from 'react';
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
}

export const HeroAmountPaymentCard: React.FC<Props> = ({
  amount,
  onAmountChange,
  currency,
  onCurrencyChange,
  paymentMethod,
  onPaymentMethodChange,
}) => {
  const [favoriteCurrencies] = useFavoriteCurrencies();
  const [, setLastUsedCurrency] = useLastUsedCurrency();
  const [, setLastUsedPaymentMethod] = useLastUsedPaymentMethod();

  const handleCurrencySelect = (newCurrency: string) => {
    onCurrencyChange(newCurrency);
    setLastUsedCurrency(newCurrency);
  };

  const handlePaymentSelect = (method: string) => {
    onPaymentMethodChange(method);
    setLastUsedPaymentMethod(method);
  };

  const currencySymbol = ALL_CURRENCIES.find((c) => c.code === currency)?.symbol ?? '$';

  return (
    <GlassCard style={styles.card}>
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
        <FormControl size="small" variant="standard" sx={{ minWidth: 80 }}>
          <Select
            value={currency}
            onChange={(e) => handleCurrencySelect(e.target.value)}
            disableUnderline
            sx={styles.currencySelect}
          >
            {favoriteCurrencies.map((code) => (
              <MenuItem key={code} value={code}>
                {code}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
      />
    </GlassCard>
  );
};

export default HeroAmountPaymentCard;
