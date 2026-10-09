import AddIcon from '@mui/icons-material/Add';
import Chip from '@mui/material/Chip';
import { useRouter } from '@tanstack/react-router';
import React from 'react';
import type { Vehicle } from '@/data/client/types';
import styles from './VehicleSwitcher.module.scss';

interface Props {
  vehicles: Vehicle[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function VehicleSwitcher({ vehicles, activeId, onSelect }: Props) {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.scrollList}>
        {vehicles.map((v) => {
          const isActive = v.id === activeId;
          return (
            <Chip
              key={v.id}
              label={v.name}
              clickable
              onClick={() => onSelect(v.id)}
              className={`${styles.chip} ${isActive ? styles.active : ''}`}
            />
          );
        })}
        <Chip
          icon={<AddIcon style={{ fontSize: 16 }} />}
          label="Add"
          clickable
          variant="outlined"
          onClick={() => router.navigate({ to: '/garage/vehicles/new' })}
          className={styles.addChip}
        />
      </div>
    </div>
  );
}
