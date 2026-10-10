import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
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
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { data } from '@/data/client';
import type { Entry } from '@/data/client/types';
import { convertToUsdMinor, formatAmount } from '@/shared/lib/currencies';
import { styles } from './EntryDetailDialog.styles';

export interface Props {
  entry: Entry | null;
  open: boolean;
  onClose: () => void;
}

export interface ActivityEntryFormValues {
  kind: Entry['kind'];
  amount: string;
  currency: string;
  odometerKm: string;
  occurredOn: string;
}

export function EntryDetailDialog({ entry, open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm({
    defaultValues: {
      kind: entry?.kind ?? 'refuel',
      amount: entry?.amount_minor ? (entry.amount_minor / 100).toString() : '',
      currency: entry?.currency || 'EUR',
      odometerKm: entry?.odometer_m ? (entry.odometer_m / 1000).toString() : '',
      occurredOn: entry?.occurred_on || '',
    } satisfies ActivityEntryFormValues,
    onSubmit: async ({ value }) => {
      if (!entry) return;
      setIsSaving(true);
      try {
        const amountMinor = value.amount ? Math.round(parseFloat(value.amount) * 100) : undefined;
        const odoM = value.odometerKm ? Math.round(parseFloat(value.odometerKm) * 1000) : undefined;
        const usdMinor = amountMinor ? convertToUsdMinor(amountMinor, value.currency) : undefined;

        const updated: Entry = {
          ...entry,
          kind: value.kind,
          amount_minor: amountMinor,
          currency: value.currency,
          usd_minor: usdMinor,
          odometer_m: odoM,
          occurred_on: value.occurredOn,
        };

        await data.upsertEntry(updated);
        await queryClient.invalidateQueries({ queryKey: ['entries'] });
        handleCloseDialog();
      } catch (err) {
        console.error('Failed to update entry', err);
      } finally {
        setIsSaving(false);
      }
    },
  });

  const handleCloseDialog = () => {
    setIsEditing(false);
    setDeleteConfirmOpen(false);
    onClose();
  };

  const handleStartEditing = () => {
    if (entry) {
      form.reset({
        kind: entry.kind,
        amount: entry.amount_minor ? (entry.amount_minor / 100).toString() : '',
        currency: entry.currency || 'EUR',
        odometerKm: entry.odometer_m ? (entry.odometer_m / 1000).toString() : '',
        occurredOn: entry.occurred_on || '',
      });
    }
    setIsEditing(true);
  };

  const handleDelete = async () => {
    if (!entry) return;
    setIsDeleting(true);
    try {
      await data.deleteEntry(entry.id);
      await queryClient.invalidateQueries({ queryKey: ['entries'] });
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to delete entry', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!entry) return null;

  return (
    <>
      <Dialog
        open={open && !deleteConfirmOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: styles.paper,
          },
        }}
      >
        <DialogTitle sx={styles.dialogTitle}>
          <span>{isEditing ? 'Edit Activity Entry' : 'Activity Details'}</span>
          {!isEditing && (
            <div style={styles.headerActions}>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={handleStartEditing}
                sx={styles.editButton}
              >
                Edit
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteConfirmOpen(true)}
                sx={styles.deleteButton}
              >
                Delete
              </Button>
            </div>
          )}
        </DialogTitle>

        <DialogContent dividers sx={styles.dialogContent}>
          {!isEditing ? (
            <div style={styles.detailContainer}>
              <div style={styles.detailRow}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Type
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                  {entry.kind}
                </Typography>
              </div>

              <div style={styles.detailRow}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {entry.occurred_on}
                </Typography>
              </div>

              {entry.odometer_m !== undefined && (
                <div style={styles.detailRow}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Odometer
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {(entry.odometer_m / 1000).toLocaleString()} km
                  </Typography>
                </div>
              )}

              {entry.amount_minor !== undefined && (
                <div style={styles.detailRow}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Total Amount
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {formatAmount(entry)}
                  </Typography>
                </div>
              )}
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              style={styles.form}
            >
              <form.Field name="kind">
                {(field) => (
                  <FormControl fullWidth size="small">
                    <InputLabel id="edit-kind-label">Type</InputLabel>
                    <Select
                      labelId="edit-kind-label"
                      value={field.state.value}
                      label="Type"
                      onChange={(e) => field.handleChange(e.target.value as Entry['kind'])}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="refuel">Refuel / Fuel</MenuItem>
                      <MenuItem value="charge">EV Charge</MenuItem>
                      <MenuItem value="service">Service & Repair</MenuItem>
                      <MenuItem value="expense">Other Expense</MenuItem>
                      <MenuItem value="odometer">Odometer Log</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </form.Field>

              <form.Field name="occurredOn">
                {(field) => (
                  <TextField
                    label="Date"
                    type="date"
                    size="small"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                )}
              </form.Field>

              <div style={styles.formRow}>
                <form.Field name="amount">
                  {(field) => (
                    <TextField
                      label="Amount"
                      type="number"
                      size="small"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  )}
                </form.Field>

                <form.Field name="currency">
                  {(field) => (
                    <FormControl size="small" style={styles.currencyControl}>
                      <InputLabel id="edit-curr-label">Currency</InputLabel>
                      <Select
                        labelId="edit-curr-label"
                        value={field.state.value}
                        label="Currency"
                        onChange={(e) => field.handleChange(e.target.value)}
                      >
                        <MenuItem value="EUR">EUR (€)</MenuItem>
                        <MenuItem value="USD">USD ($)</MenuItem>
                        <MenuItem value="GBP">GBP (£)</MenuItem>
                        <MenuItem value="UAH">UAH (₴)</MenuItem>
                        <MenuItem value="PLN">PLN (zł)</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </form.Field>
              </div>

              <form.Field name="odometerKm">
                {(field) => (
                  <TextField
                    label="Odometer (km)"
                    type="number"
                    size="small"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    fullWidth
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                )}
              </form.Field>
            </form>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          {isEditing ? (
            <>
              <Button
                onClick={() => setIsEditing(false)}
                sx={{ textTransform: 'none', color: 'text.secondary' }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => form.handleSubmit()}
                variant="contained"
                disabled={isSaving}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleCloseDialog}
              sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}
            >
              Close
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        slotProps={{
          paper: {
            sx: styles.deletePaper,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Are you sure you want to delete this activity entry ({entry.kind} on {entry.occurred_on}
            )? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
          >
            {isDeleting ? 'Deleting...' : 'Delete Entry'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default EntryDetailDialog;
