import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { useAppStore } from '@/app/store';
import { vehiclesQueryOptions } from '@/features/garage/queries/vehicles';
import { styles } from './EntryKindSelector.styles';

export type EntryKind = 'refuel' | 'expense' | 'service' | 'note';

interface Props {
  value: EntryKind;
  onChange: (kind: EntryKind) => void;
}

export const EntryKindSelector: React.FC<Props> = ({ value, onChange }) => {
  const { activeVehicleId } = useAppStore();
  const { data: vehicles = [] } = useQuery(vehiclesQueryOptions());

  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);
  const isEv = activeVehicle?.powertrain === 'ev';

  const refuelLabel = isEv ? 'Charge' : activeVehicle?.powertrain ? 'Refuel' : 'Refuel / Charge';

  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_, val: EntryKind | null) => {
        if (val) {
          onChange(val);
        }
      }}
      fullWidth
      sx={styles.toggleGroup}
    >
      <ToggleButton value="refuel">{refuelLabel}</ToggleButton>
      <ToggleButton value="service">Service</ToggleButton>
      <ToggleButton value="expense">Expense</ToggleButton>
      <ToggleButton value="note">Note</ToggleButton>
    </ToggleButtonGroup>
  );
};

export default EntryKindSelector;
