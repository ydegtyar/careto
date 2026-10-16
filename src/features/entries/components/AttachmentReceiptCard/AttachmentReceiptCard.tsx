import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import type React from 'react';
import { useState } from 'react';
import { data } from '@/data/client';
import type { Entry } from '@/data/client/types';
import { DeleteAttachmentDialog } from '@/features/entries/components/DeleteAttachmentDialog/DeleteAttachmentDialog';
import { GlassCard } from '@/shared/ui/GlassCard/GlassCard';
import styles from './AttachmentReceiptCard.module.scss';
import { styles as muiStyles } from './AttachmentReceiptCard.styles';

export interface Props {
  entry: Entry;
}

export const AttachmentReceiptCard: React.FC<Props> = ({ entry }) => {
  const queryClient = useQueryClient();
  const [deleteAttachmentDialogOpen, setDeleteAttachmentDialogOpen] = useState(false);
  const [deletingAttachment, setDeletingAttachment] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  if (!entry.image_data) {
    return null;
  }

  const handleRemoveAttachment = async () => {
    setDeletingAttachment(true);
    try {
      const updatedEntry: Entry = {
        ...entry,
      };
      delete updatedEntry.image_data;
      await data.upsertEntry(updatedEntry);
      await queryClient.invalidateQueries({ queryKey: ['entries'] });
      setImageModalOpen(false);
      setDeleteAttachmentDialogOpen(false);
    } catch (err) {
      console.error('Failed to remove attachment:', err);
    } finally {
      setDeletingAttachment(false);
    }
  };

  return (
    <>
      <GlassCard style={muiStyles.card}>
        <div style={muiStyles.headerRow}>
          <div style={muiStyles.headerTitleGroup}>
            <ReceiptLongIcon sx={muiStyles.headerIcon} />
            <Typography variant="caption" sx={muiStyles.headerTitle}>
              Attached Receipt &amp; Work Order
            </Typography>
          </div>
          <div style={muiStyles.headerActions}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteAttachmentDialogOpen(true);
              }}
              title="Remove attachment"
              className={styles.attachmentDeleteBtn}
            >
              <DeleteIcon sx={muiStyles.deleteIcon} />
            </IconButton>
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => setImageModalOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setImageModalOpen(true);
            }
          }}
          className={styles.receiptCard}
        >
          <div className={styles.receiptThumbWell}>
            <img
              src={entry.image_data}
              alt="Receipt preview"
              style={muiStyles.receiptImg}
            />
            <div className={styles.receiptThumbOverlay}>
              <ZoomInIcon sx={muiStyles.zoomIcon} />
            </div>
          </div>

          <div style={muiStyles.receiptInfoGroup}>
            <span style={muiStyles.receiptTitle}>Receipt Document</span>
            <span style={muiStyles.receiptSubtitle}>WebP Image • Attached Media</span>
            <span style={muiStyles.viewFullscreenLink}>
              View Fullscreen
              <OpenInNewIcon sx={muiStyles.linkIcon} />
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Lightbox Modal for Full Image View */}
      <Dialog
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <div style={muiStyles.lightboxTopBar}>
          <IconButton onClick={() => setImageModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </div>
        <div style={muiStyles.lightboxContent}>
          {entry.image_data && (
            <img
              src={entry.image_data}
              alt="Receipt Full View"
              style={muiStyles.lightboxImg}
            />
          )}
        </div>
      </Dialog>

      {/* Remove Attachment Confirmation Dialog */}
      <DeleteAttachmentDialog
        open={deleteAttachmentDialogOpen}
        onClose={() => setDeleteAttachmentDialogOpen(false)}
        onConfirm={handleRemoveAttachment}
        isDeleting={deletingAttachment}
      />
    </>
  );
};

export default AttachmentReceiptCard;
