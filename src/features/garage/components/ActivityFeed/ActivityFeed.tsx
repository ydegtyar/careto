import BuildIcon from '@mui/icons-material/Build';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SpeedIcon from '@mui/icons-material/Speed';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import Typography from '@mui/material/Typography';
import { useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import type { Entry } from '@/data/client/types';
import styles from './ActivityFeed.module.scss';
import { ActivityItemRow } from './ActivityItemRow';

type Props = {
  entries: Entry[];
};

export type EntryRecord = Entry;

export const ActivityFeed = ({ entries }: Props) => {
  const navigate = useNavigate();

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const dateA = a.occurred_on + (a.occurred_time ? `T${a.occurred_time}` : '');
      const dateB = b.occurred_on + (b.occurred_time ? `T${b.occurred_time}` : '');
      return dateB.localeCompare(dateA);
    });
  }, [entries]);

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
    navigate({ to: `/entries/${entry.id}` });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          Recent Activity
        </Typography>
      </div>

      <div className={styles.list}>
        {sortedEntries.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>
            No recent activity recorded yet.
          </Typography>
        ) : (
          sortedEntries.map((entry) => (
            <ActivityItemRow
              key={entry.id}
              entry={entry}
              onOpen={handleOpenDetail}
              getIcon={getIcon}
            />
          ))
        )}
      </div>
    </div>
  );
};
