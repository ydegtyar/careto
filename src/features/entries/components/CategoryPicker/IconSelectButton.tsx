import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import type React from 'react';

interface Props {
  name: string;
  label: string;
  Icon: React.ElementType;
  isSelected: boolean;
  onSelect: (name: string) => void;
}

export function IconSelectButton({ name, label, Icon, isSelected, onSelect }: Props) {
  return (
    <Tooltip title={label}>
      <IconButton
        onClick={() => onSelect(name)}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: isSelected ? 'primary.main' : 'rgba(125, 211, 252, 0.15)',
          backgroundColor: isSelected ? 'rgba(125, 211, 252, 0.2)' : 'rgba(15, 21, 36, 0.4)',
          color: isSelected ? 'primary.main' : 'text.secondary',
          '&:hover': {
            backgroundColor: 'rgba(125, 211, 252, 0.1)',
          },
        }}
      >
        <Icon sx={{ fontSize: 22 }} />
      </IconButton>
    </Tooltip>
  );
}
