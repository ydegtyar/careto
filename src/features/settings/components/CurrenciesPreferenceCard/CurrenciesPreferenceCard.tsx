import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import PaidIcon from '@mui/icons-material/Paid';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import type React from 'react';
import { CurrencyChip } from '@/features/settings/components/CurrencyChip/CurrencyChip';
import {
  ALL_CURRENCIES,
  DEFAULT_BASE_CURRENCY,
  useBaseCurrency,
  useFavoriteCurrencies,
  useLastUsedCurrency,
} from '@/shared/lib/currencies';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import {
  baseCurrencyHeaderStyle,
  baseCurrencySectionStyle,
  cardStyle,
  chipsContainerStyle,
  headerContainerStyle,
  selectSx,
} from './CurrenciesPreferenceCard.styles';

export interface Props {
  className?: string;
}

export const CurrenciesPreferenceCard: React.FC<Props> = () => {
  const [favoriteCurrencies, setFavoriteCurrencies] = useFavoriteCurrencies();
  const [baseCurrency, setBaseCurrency] = useBaseCurrency();
  const [lastUsedCurrency, setLastUsedCurrency] = useLastUsedCurrency();

  const handleToggleFavoriteCurrency = (code: string) => {
    if (favoriteCurrencies.includes(code)) {
      // Validate favorite currencies so at least one should be selected
      if (favoriteCurrencies.length <= 1) return;

      const updated = favoriteCurrencies.filter((c) => c !== code);
      setFavoriteCurrencies(updated);

      // If currency toggled off is base currency, change base currency to an available favorite
      if (baseCurrency === code && updated.length > 0) {
        setBaseCurrency(updated[0]!);
      }

      // If currency toggled off was lastUsedCurrency, update it too
      if (lastUsedCurrency === code && updated.length > 0) {
        setLastUsedCurrency(updated[0]!);
      }
    } else {
      setFavoriteCurrencies([...favoriteCurrencies, code]);
    }
  };

  // Base currency can be selected only from favorite currencies
  // Fall back to first available favorite or DEFAULT_BASE_CURRENCY if not found
  const effectiveBaseCurrency = favoriteCurrencies.includes(baseCurrency)
    ? baseCurrency
    : favoriteCurrencies[0] || DEFAULT_BASE_CURRENCY;

  return (
    <GlassCard style={cardStyle}>
      <div style={headerContainerStyle}>
        <PaidIcon sx={{ color: 'primary.main', fontSize: 22 }} />
        <div>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Favorite Currencies
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Select currencies available in expense forms (reporting auto-converted)
          </Typography>
        </div>
      </div>

      <div style={chipsContainerStyle}>
        {ALL_CURRENCIES.map((item) => (
          <CurrencyChip
            key={item.code}
            item={item}
            isFav={favoriteCurrencies.includes(item.code)}
            onToggle={handleToggleFavoriteCurrency}
          />
        ))}
      </div>

      {/* Base Currency Selection */}
      <div style={baseCurrencySectionStyle}>
        <div style={baseCurrencyHeaderStyle}>
          <CurrencyExchangeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Base Currency (for conversions & reports)
          </Typography>
        </div>
        <Select
          size="small"
          value={effectiveBaseCurrency}
          onChange={(e) => setBaseCurrency(e.target.value)}
          fullWidth
          aria-label="Base currency selection"
          sx={selectSx}
        >
          {favoriteCurrencies.map((code) => {
            const info = ALL_CURRENCIES.find((c) => c.code === code);
            return (
              <MenuItem key={code} value={code}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    gap: 16,
                  }}
                >
                  <span>
                    {code} ({info?.symbol ?? ''})
                  </span>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {info?.name ?? code}
                  </Typography>
                </div>
              </MenuItem>
            );
          })}
        </Select>
      </div>
    </GlassCard>
  );
};

export default CurrenciesPreferenceCard;
