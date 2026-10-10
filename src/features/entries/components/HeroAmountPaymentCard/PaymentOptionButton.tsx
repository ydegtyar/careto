import Typography from '@mui/material/Typography';
import type React from 'react';

export interface Props {
  id: string;
  label: string;
  icon: React.ElementType;
  isSelected: boolean;
  onSelect: (id: string) => void;
  styleFn: (isSelected: boolean) => React.CSSProperties;
}

export const PaymentOptionButton: React.FC<Props> = ({
  id,
  label,
  icon: Icon,
  isSelected,
  onSelect,
  styleFn,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      style={styleFn(isSelected)}
    >
      <Icon sx={{ fontSize: 18 }} />
      <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: isSelected ? 700 : 500 }}>
        {label}
      </Typography>
    </button>
  );
};

export default PaymentOptionButton;
