import AddIcon from '@mui/icons-material/Add';
import BuildIcon from '@mui/icons-material/Build';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import EvStationIcon from '@mui/icons-material/EvStation';
import CarWashIcon from '@mui/icons-material/LocalCarWash';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PaidIcon from '@mui/icons-material/Paid';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SavingsIcon from '@mui/icons-material/Savings';
import ShieldIcon from '@mui/icons-material/Shield';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SpeedIcon from '@mui/icons-material/Speed';
import StarIcon from '@mui/icons-material/Star';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type React from 'react';
import { useState } from 'react';
import { useExpenseCategories } from '@/features/entries/lib/useExpenseCategories';
import { getChipSx, styles } from './CategoryPicker.styles';

export const AVAILABLE_ICONS = [
  { name: 'Shield', label: 'Shield', Icon: ShieldIcon },
  { name: 'LocalParking', label: 'Parking', Icon: LocalParkingIcon },
  { name: 'CarWash', label: 'Car Wash', Icon: CarWashIcon },
  { name: 'ConfirmationNumber', label: 'Ticket / Fine', Icon: ConfirmationNumberIcon },
  { name: 'Paid', label: 'Payment', Icon: PaidIcon },
  { name: 'ShoppingBag', label: 'Shopping', Icon: ShoppingBagIcon },
  { name: 'Build', label: 'Service', Icon: BuildIcon },
  { name: 'Receipt', label: 'Receipt', Icon: ReceiptIcon },
  { name: 'Savings', label: 'Savings', Icon: SavingsIcon },
  { name: 'DirectionsCar', label: 'Car', Icon: DirectionsCarIcon },
  { name: 'ElectricCar', label: 'EV', Icon: ElectricCarIcon },
  { name: 'LocalGasStation', label: 'Fuel', Icon: LocalGasStationIcon },
  { name: 'EvStation', label: 'Charging', Icon: EvStationIcon },
  { name: 'Speed', label: 'Speed', Icon: SpeedIcon },
  { name: 'Star', label: 'Star', Icon: StarIcon },
  { name: 'MoreHoriz', label: 'Other', Icon: MoreHorizIcon },
];

export function renderCategoryIcon(iconName: string) {
  const found = AVAILABLE_ICONS.find((item) => item.name === iconName);
  const IconComponent = found ? found.Icon : MoreHorizIcon;
  return <IconComponent sx={{ fontSize: 18 }} />;
}

export interface Props {
  category: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryPicker: React.FC<Props> = ({ category, onSelectCategory }) => {
  const { categories, addCategory, removeCategory } = useExpenseCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [selectedIconName, setSelectedIconName] = useState('ShoppingBag');

  const handleOpenDialog = () => {
    setNewLabel('');
    setSelectedIconName('ShoppingBag');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleAddCategory = () => {
    if (!newLabel.trim()) return;
    const newId = addCategory(newLabel.trim(), selectedIconName);
    onSelectCategory(newId);
    handleCloseDialog();
  };

  const handleRemoveCategory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeCategory(id);
    if (category === id) {
      onSelectCategory('other');
    }
  };

  return (
    <div style={styles.container}>
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          fontWeight: 600,
          display: 'block',
          mb: 1,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        Category
      </Typography>
      <div style={styles.chipGroup}>
        {categories.map((cat) => {
          const isSelected = category === cat.id;
          return (
            <Chip
              key={cat.id}
              icon={renderCategoryIcon(cat.iconName)}
              label={cat.label}
              onClick={() => onSelectCategory(cat.id)}
              onDelete={!cat.isDefault ? (e) => handleRemoveCategory(e, cat.id) : undefined}
              deleteIcon={!cat.isDefault ? <DeleteIcon sx={{ fontSize: 16 }} /> : undefined}
              variant={isSelected ? 'filled' : 'outlined'}
              sx={getChipSx(isSelected)}
            />
          );
        })}

        <Chip
          icon={<AddIcon sx={{ fontSize: 18 }} />}
          label="Add Custom"
          onClick={handleOpenDialog}
          variant="outlined"
          sx={{
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '0.78rem',
            height: 32,
            backgroundColor: 'rgba(125, 211, 252, 0.05)',
            borderColor: 'rgba(125, 211, 252, 0.3)',
            borderStyle: 'dashed',
            color: 'primary.main',
            '& .MuiChip-icon': {
              color: 'primary.main',
            },
          }}
        />
      </div>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              backgroundColor: '#0f1524',
              backgroundImage: 'none',
              borderRadius: 4,
              border: '1px solid rgba(125, 211, 252, 0.2)',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Add Custom Category</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            autoFocus
            label="Category Name"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            fullWidth
            placeholder="e.g. Detailing, Track Day"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'rgba(15, 21, 36, 0.6)',
              },
            }}
          />

          <div>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}
            >
              Choose Icon
            </Typography>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {AVAILABLE_ICONS.map(({ name, label, Icon }) => {
                const isSelected = selectedIconName === name;
                return (
                  <Tooltip title={label} key={name}>
                    <IconButton
                      onClick={() => setSelectedIconName(name)}
                      sx={{
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: isSelected ? 'primary.main' : 'rgba(125, 211, 252, 0.15)',
                        backgroundColor: isSelected
                          ? 'rgba(125, 211, 252, 0.2)'
                          : 'rgba(15, 21, 36, 0.4)',
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
              })}
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddCategory}
            disabled={!newLabel.trim()}
            variant="contained"
            sx={{
              borderRadius: 3,
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              fontWeight: 700,
              textTransform: 'none',
            }}
          >
            Add Category
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CategoryPicker;
