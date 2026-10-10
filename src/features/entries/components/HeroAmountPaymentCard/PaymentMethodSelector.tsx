import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaymentsIcon from '@mui/icons-material/Payments';
import type React from 'react';
import { getPaymentOptionButtonStyle, styles } from './PaymentMethodSelector.styles';
import { PaymentOptionButton } from './PaymentOptionButton';

export interface Props {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
}

const PAYMENT_OPTIONS = [
  { id: 'card', label: 'Card', icon: CreditCardIcon },
  { id: 'cash', label: 'Cash', icon: PaymentsIcon },
  { id: 'company', label: 'Company', icon: BusinessCenterIcon },
] as const;

export const PaymentMethodSelector: React.FC<Props> = ({
  paymentMethod,
  onPaymentMethodChange,
}) => {
  return (
    <div style={styles.paymentSection}>
      <div style={styles.paymentButtonGroup}>
        {PAYMENT_OPTIONS.map(({ id, label, icon }) => (
          <PaymentOptionButton
            key={id}
            id={id}
            label={label}
            icon={icon}
            isSelected={paymentMethod === id}
            onSelect={onPaymentMethodChange}
            styleFn={getPaymentOptionButtonStyle}
          />
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
