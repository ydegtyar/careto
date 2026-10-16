import BuildIcon from '@mui/icons-material/Build';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SpeedIcon from '@mui/icons-material/Speed';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import type React from 'react';
import { styles } from './KindIcon.styles';

export interface Props {
  kind: string;
}

export const KindIcon: React.FC<Props> = ({ kind }) => {
  switch (kind) {
    case 'refuel':
    case 'charge':
      return <LocalGasStationIcon sx={styles.icon} />;
    case 'service':
      return <BuildIcon sx={styles.icon} />;
    case 'odometer':
      return <SpeedIcon sx={styles.icon} />;
    case 'note':
      return <StickyNote2Icon sx={styles.icon} />;
    default:
      return <ReceiptIcon sx={styles.icon} />;
  }
};

export default KindIcon;
