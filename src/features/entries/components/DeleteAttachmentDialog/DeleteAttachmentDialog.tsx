import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import type React from 'react';
import { styles } from './DeleteAttachmentDialog.styles';

export interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteAttachmentDialog: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={styles.dialogTitle}>Remove Attachment?</DialogTitle>
      <DialogContent>
        <DialogContentText sx={styles.dialogContentText}>
          Are you sure you want to remove this receipt photo from this entry? This action cannot be
          undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={styles.dialogActions}>
        <Button onClick={onClose} sx={styles.cancelButton}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={isDeleting}
          sx={styles.confirmButton}
        >
          {isDeleting ? 'Removing...' : 'Remove Attachment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAttachmentDialog;
