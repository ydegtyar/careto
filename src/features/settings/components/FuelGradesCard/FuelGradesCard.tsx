import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type React from 'react';
import { useState } from 'react';
import { type FuelGrade, useAccountFuelGrades } from '@/shared/lib/fuel-grades';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';

export const FuelGradesCard: React.FC = () => {
  const {
    allGrades,
    enabledIds,
    toggleGradeEnabled,
    addCustomGrade,
    removeCustomGrade,
    resetToDefaults,
  } = useAccountFuelGrades();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newCategory, setNewCategory] = useState<FuelGrade['category']>('petrol');
  const [newColor, setNewColor] = useState('#7dd3fc');

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    const id = `custom_${Date.now()}`;
    addCustomGrade({
      id,
      label: newLabel.trim(),
      category: newCategory,
      color: newColor,
    });
    setNewLabel('');
    setDialogOpen(false);
  };

  return (
    <GlassCard style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LocalGasStationIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          <div>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Fuel & Charge Grades
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Select active grades or add custom fuel/energy types for your account
            </Typography>
          </div>
        </div>
        <Button
          size="small"
          variant="text"
          startIcon={<RestartAltIcon />}
          onClick={resetToDefaults}
          sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.75rem' }}
        >
          Reset
        </Button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
        {allGrades.map((grade) => {
          const isSelected = enabledIds.includes(grade.id);
          return (
            <Chip
              key={grade.id}
              label={grade.label}
              onClick={() => toggleGradeEnabled(grade.id)}
              onDelete={
                !grade.isDefault
                  ? (e) => {
                      e.stopPropagation();
                      removeCustomGrade(grade.id);
                    }
                  : undefined
              }
              deleteIcon={!grade.isDefault ? <DeleteIcon sx={{ fontSize: 16 }} /> : undefined}
              variant={isSelected ? 'filled' : 'outlined'}
              sx={{
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 30,
                backgroundColor: isSelected ? 'rgba(125, 211, 252, 0.2)' : 'transparent',
                borderColor: isSelected ? 'primary.main' : 'rgba(125, 211, 252, 0.15)',
                color: isSelected ? 'primary.main' : 'text.secondary',
              }}
            />
          );
        })}

        <Chip
          icon={<AddIcon sx={{ fontSize: 16 }} />}
          label="Add Custom Grade"
          onClick={() => setDialogOpen(true)}
          variant="outlined"
          sx={{
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 30,
            borderStyle: 'dashed',
            borderColor: 'primary.main',
            color: 'primary.main',
          }}
        />
      </div>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
          Add Custom Fuel Grade
        </DialogTitle>
        <DialogContent
          style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 12 }}
        >
          <TextField
            label="Grade Name"
            placeholder="e.g. HVO100 Renewable Diesel"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            fullWidth
            autoFocus
          />

          <FormControl fullWidth>
            <InputLabel id="grade-category-label">Category</InputLabel>
            <Select
              labelId="grade-category-label"
              value={newCategory}
              label="Category"
              onChange={(e) => setNewCategory(e.target.value as FuelGrade['category'])}
            >
              <MenuItem value="petrol">Petrol / Gasoline</MenuItem>
              <MenuItem value="diesel">Diesel</MenuItem>
              <MenuItem value="gas">LPG / CNG Gas</MenuItem>
              <MenuItem value="ev">Electric / EV Charge</MenuItem>
              <MenuItem value="alternative">Alternative (Bio/H2/DEF)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            variant="contained"
            disabled={!newLabel.trim()}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Add Grade
          </Button>
        </DialogActions>
      </Dialog>
    </GlassCard>
  );
};
