import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { useState } from 'react';
import { useAppStore } from '@/app/store';
import { data } from '@/data/client';
import type { Vehicle } from '@/data/client/types';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import { styles } from './DeleteVehicleZone.styles';

export interface Props {
  vehicleId: string;
  vehicleName: string;
  vehicles?: Vehicle[];
}

export const DeleteVehicleZone: React.FC<Props> = ({ vehicleId, vehicleName, vehicles = [] }) => {
  const navigate = useNavigate();
  const { activeVehicleId, setActiveVehicleId } = useAppStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteVehicle = async () => {
    if (!vehicleId) return;
    setDeleting(true);
    try {
      await data.deleteVehicle(vehicleId);
      if (activeVehicleId === vehicleId) {
        const remaining = vehicles.filter((v) => v.id !== vehicleId);
        setActiveVehicleId(remaining[0]?.id ?? null);
      }
      navigate({ to: '/garage' });
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <GlassCard style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <DeleteIcon sx={styles.headerIcon} />
          </div>
          <Typography variant="subtitle2" sx={styles.headerTitle}>
            Delete Vehicle
          </Typography>
        </div>

        <Typography variant="body2" sx={styles.description}>
          Deleting this vehicle will remove all associated fuel logs, service history, and telemetry
          forever. This action cannot be undone.
        </Typography>

        <Button
          variant="contained"
          color="error"
          onClick={() => setDeleteDialogOpen(true)}
          sx={styles.deleteButton}
        >
          Delete Vehicle
        </Button>
      </GlassCard>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={styles.dialogTitle}>
          <WarningAmberIcon color="error" /> Delete Vehicle?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={styles.dialogContentTextPrimary}>
            Are you sure you want to delete <strong>{vehicleName}</strong>?
          </DialogContentText>
          <DialogContentText sx={styles.dialogContentTextSecondary}>
            Everything will be deleted forever and this action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={styles.dialogActions}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
            sx={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteVehicle}
            color="error"
            variant="contained"
            disabled={deleting}
            sx={styles.confirmButton}
          >
            {deleting ? (
              <CircularProgress size={20} sx={{ color: '#fff' }} />
            ) : (
              'Delete Permanently'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteVehicleZone;
