import StraightenIcon from '@mui/icons-material/Straighten';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import type React from 'react';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { cardStyle, headerContainerStyle, toggleButtonGroupSx } from './DistanceUnitCard.styles';

interface Props {
  useMiles: boolean;
  onUseMilesChange: (useMiles: boolean) => void;
}

export const DistanceUnitCard: React.FC<Props> = ({ useMiles, onUseMilesChange }) => {
  const value = useMiles ? 'mi' : 'km';

  const handleChange = (_: React.MouseEvent<HTMLElement>, newValue: 'km' | 'mi' | null) => {
    if (!newValue) return;
    onUseMilesChange(newValue === 'mi');
  };

  return (
    <GlassCard style={cardStyle}>
      <div style={headerContainerStyle}>
        <StraightenIcon sx={{ color: 'primary.main', fontSize: 22 }} />
        <div>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Distance Unit
          </Typography>
        </div>
      </div>

      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={handleChange}
        aria-label="Distance unit selection"
        fullWidth
        size="small"
        sx={toggleButtonGroupSx}
      >
        <ToggleButton value="km" aria-label="Kilometers">
          <span>Kilometers (km)</span>
        </ToggleButton>
        <ToggleButton value="mi" aria-label="Miles">
          <span>Miles (mi)</span>
        </ToggleButton>
      </ToggleButtonGroup>
    </GlassCard>
  );
};

export default DistanceUnitCard;
