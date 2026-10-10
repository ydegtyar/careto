import BuildIcon from '@mui/icons-material/Build';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SpeedIcon from '@mui/icons-material/Speed';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { Entry } from '@/data/client/types';
import styles from './ActivityFeed.module.scss';
import { ActivityItemRow } from './ActivityItemRow';
import { EntryDetailDialog } from './EntryDetailDialog';

interface Props {
  entries: Entry[];
}

export type EntryRecord = Entry;

export function ActivityFeed({ entries }: Props) {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  const getIcon = (kind: string) => {
    switch (kind) {
      case 'refuel':
      case 'charge':
        return <LocalGasStationIcon sx={{ fontSize: 18 }} />;
      case 'service':
        return <BuildIcon sx={{ fontSize: 18 }} />;
      case 'odometer':
        return <SpeedIcon sx={{ fontSize: 18 }} />;
      case 'note':
        return <StickyNote2Icon sx={{ fontSize: 18 }} />;
      default:
        return <ReceiptIcon sx={{ fontSize: 18 }} />;
    }
  };

  const handleOpenDetail = (entry: Entry) => {
    setSelectedEntry(entry);
  };

  const handleClose = () => {
    setSelectedEntry(null);
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
            <ActivityItemRow
              key={entry.id}
              entry={entry}
              onOpen={handleOpenDetail}
              getIcon={getIcon}
            />
          ))
        )}
      </div>

      {/* Entry Detail / Edit Dialog */}
      <EntryDetailDialog
        entry={selectedEntry}
        open={Boolean(selectedEntry)}
        onClose={handleClose}
      />
    </div>
  );
}
