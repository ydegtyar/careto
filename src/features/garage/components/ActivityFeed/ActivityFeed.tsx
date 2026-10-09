import BuildIcon from '@mui/icons-material/Build';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SpeedIcon from '@mui/icons-material/Speed';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { data } from '@/data/client';
import type { Entry } from '@/data/client/types';
import { convertToUsdMinor } from '@/shared/lib/currencies';
import styles from './ActivityFeed.module.scss';

interface Props {
  entries: Entry[];
}

export function ActivityFeed({ entries }: Props) {
  const queryClient = useQueryClient();
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editKind, setEditKind] = useState<Entry['kind']>('refuel');
  const [editAmount, setEditAmount] = useState('');
  const [editCurrency, setEditCurrency] = useState('EUR');
  const [editOdometerKm, setEditOdometerKm] = useState('');
  const [editDate, setEditDate] = useState('');

  const getIcon = (kind: Entry['kind']) => {
    switch (kind) {
      case 'refuel':
      case 'charge':
        return <LocalGasStationIcon sx={{ fontSize: 18 }} />;
      case 'service':
        return <BuildIcon sx={{ fontSize: 18 }} />;
      case 'odometer':
        return <SpeedIcon sx={{ fontSize: 18 }} />;
      default:
        return <ReceiptIcon sx={{ fontSize: 18 }} />;
    }
  };

  const formatAmount = (entry: Entry) => {
    if (!entry.amount_minor || !entry.currency) return null;
    return `${(entry.amount_minor / 100).toFixed(2)} ${entry.currency}`;
  };

  const handleOpenDetail = (entry: Entry) => {
    setSelectedEntry(entry);
    setEditKind(entry.kind);
    setEditAmount(entry.amount_minor ? (entry.amount_minor / 100).toString() : '');
    setEditCurrency(entry.currency || 'EUR');
    setEditOdometerKm(entry.odometer_m ? (entry.odometer_m / 1000).toString() : '');
    setEditDate(entry.occurred_on || '');
    setIsEditing(false);
    setDeleteConfirmOpen(false);
  };

  const handleClose = () => {
    setSelectedEntry(null);
    setIsEditing(false);
    setDeleteConfirmOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedEntry) return;
    setIsSaving(true);
    try {
      const amountMinor = editAmount ? Math.round(parseFloat(editAmount) * 100) : undefined;
      const odoM = editOdometerKm ? Math.round(parseFloat(editOdometerKm) * 1000) : undefined;
      const usdMinor = amountMinor ? convertToUsdMinor(amountMinor, editCurrency) : undefined;

      const updated: Entry = {
        ...selectedEntry,
        kind: editKind,
        amount_minor: amountMinor,
        currency: editCurrency,
        usd_minor: usdMinor,
        odometer_m: odoM,
        occurred_on: editDate,
      };

      await data.upsertEntry(updated);
      await queryClient.invalidateQueries({ queryKey: ['entries'] });
      handleClose();
    } catch (err) {
      console.error('Failed to update entry', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEntry) return;
    setIsDeleting(true);
    try {
      await data.deleteEntry(selectedEntry.id);
      await queryClient.invalidateQueries({ queryKey: ['entries'] });
      handleClose();
    } catch (err) {
      console.error('Failed to delete entry', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          Recent Activity
        </Typography>
      </div>

      <div className={styles.list}>
        {entries.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>
            No recent activity recorded yet.
          </Typography>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className={styles.item} onClick={() => handleOpenDetail(entry)}>
              <div className={`${styles.iconDisc} ${styles[entry.kind]}`}>
                {getIcon(entry.kind)}
              </div>
              <div className={styles.details}>
                <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                  {entry.kind}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {entry.occurred_on}
                  {entry.odometer_m && ` · ${(entry.odometer_m / 1000).toLocaleString()} km`}
                </Typography>
              </div>
              {entry.amount_minor && (
                <div className={styles.amount}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {formatAmount(entry)}
                  </Typography>
                  {entry.usd_minor && entry.currency !== 'USD' && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      ≈ ${(entry.usd_minor / 100).toFixed(2)}
                    </Typography>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Entry Detail / Edit Dialog */}
      <Dialog
        open={Boolean(selectedEntry) && !deleteConfirmOpen}
        onClose={handleClose}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            style: {
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(125, 211, 252, 0.2)',
              borderRadius: 20,
              color: '#f8fafc',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            pb: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{isEditing ? 'Edit Activity Entry' : 'Activity Details'}</span>
          {!isEditing && selectedEntry && (
            <div style={{ display: 'flex', gap: 4 }}>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                sx={{ textTransform: 'none', color: 'primary.main', fontWeight: 600 }}
              >
                Edit
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteConfirmOpen(true)}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Delete
              </Button>
            </div>
          )}
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', py: 2 }}>
          {selectedEntry && !isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Type
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                  {selectedEntry.kind}
                </Typography>
              </div>

              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedEntry.occurred_on}
                </Typography>
              </div>

              {selectedEntry.odometer_m !== undefined && (
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Odometer
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {(selectedEntry.odometer_m / 1000).toLocaleString()} km
                  </Typography>
                </div>
              )}

              {selectedEntry.amount_minor !== undefined && (
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Total Amount
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {formatAmount(selectedEntry)}
                  </Typography>
                </div>
              )}
            </div>
          ) : (
            <form style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="edit-kind-label">Type</InputLabel>
                <Select
                  labelId="edit-kind-label"
                  value={editKind}
                  label="Type"
                  onChange={(e) => setEditKind(e.target.value as Entry['kind'])}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="refuel">Refuel / Fuel</MenuItem>
                  <MenuItem value="charge">EV Charge</MenuItem>
                  <MenuItem value="service">Service & Repair</MenuItem>
                  <MenuItem value="expense">Other Expense</MenuItem>
                  <MenuItem value="odometer">Odometer Log</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Date"
                type="date"
                size="small"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <div style={{ display: 'flex', gap: 12 }}>
                <TextField
                  label="Amount"
                  type="number"
                  size="small"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <FormControl size="small" style={{ width: 210 }}>
                  <InputLabel id="edit-curr-label">Currency</InputLabel>
                  <Select
                    labelId="edit-curr-label"
                    value={editCurrency}
                    label="Currency"
                    onChange={(e) => setEditCurrency(e.target.value)}
                  >
                    <MenuItem value="EUR">EUR (€)</MenuItem>
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="GBP">GBP (£)</MenuItem>
                    <MenuItem value="UAH">UAH (₴)</MenuItem>
                    <MenuItem value="PLN">PLN (zł)</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <TextField
                label="Odometer (km)"
                type="number"
                size="small"
                value={editOdometerKm}
                onChange={(e) => setEditOdometerKm(e.target.value)}
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
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
                onClick={handleSaveEdit}
                variant="contained"
                disabled={isSaving}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleClose}
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
            style: {
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 20,
              color: '#f8fafc',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary' }}>
            Are you sure you want to delete this activity entry ({selectedEntry?.kind} on{' '}
            {selectedEntry?.occurred_on})? This action cannot be undone.
          </DialogContentText>
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
    </div>
  );
}
