import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useNavigate } from '@tanstack/react-router';
import type React from 'react';
import { useState } from 'react';
import { data } from '@/data/client';
import type { Entry } from '@/data/client/types';
import styles from './EntryDetailHeader.module.scss';
import { styles as muiStyles } from './EntryDetailHeader.styles';

export interface Props {
  entry: Entry;
}

export const EntryDetailHeader: React.FC<Props> = ({ entry }) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await data.deleteEntry(entry.id);
      navigate({ to: '/garage' });
    } catch (err) {
      console.error('Failed to delete entry:', err);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <div className={styles.topBar}>
        <button
          type="button"
          onClick={() => navigate({ to: '/garage' })}
          className={styles.topNavButton}
        >
          <ArrowBackIcon sx={muiStyles.icon} />
          <span>Garage</span>
        </button>

        <div className={styles.topActions}>
          <button
            type="button"
            onClick={() => navigate({ to: `/entries/${entry.id}/edit` })}
            className={styles.editButton}
          >
            <EditIcon sx={muiStyles.icon} />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className={styles.deleteButton}
            title="Delete entry"
          >
            <DeleteIcon sx={muiStyles.deleteIcon} />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={muiStyles.dialogTitle}>Delete Entry?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={muiStyles.dialogContentText}>
            Are you sure you want to delete this {entry.kind} entry from {entry.occurred_on}? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={muiStyles.dialogActions}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={muiStyles.cancelButton}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            sx={muiStyles.deleteConfirmButton}
          >
            {deleting ? 'Deleting...' : 'Delete Entry'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EntryDetailHeader;
